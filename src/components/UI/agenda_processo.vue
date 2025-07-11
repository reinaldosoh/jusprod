<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Input from './Input.vue';
import Button from './Button.vue';
import Dropdown from './Dropdown.vue';
import { supabase } from '../../lib/supabase';

const props = defineProps({
  processoId: {
    type: [Number, String],
    required: true
  },
  cnj: {
    type: String,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  intimacao: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'agenda-criada']);

// Estados do componente
const titulo = ref('');
const categoriaId = ref('');
const categoriaSelecionada = ref(null);
const dataSelecionada = ref('');
const horaInicio = ref('');
const horaFim = ref('');
const clienteId = ref('');
const linkReuniao = ref('');
const endereco = ref('');
const notas = ref('');
const loading = ref(false);
const error = ref('');
const emailsClienteSelecionado = ref([]);

// Dados carregados do banco
const categorias = ref([]);
const categoriasDropdown = ref([]);
const clientesVinculados = ref([]);
const processoDetalhes = ref({});
const emailUsuario = ref('');

// Estados do calendário
const dataAtual = new Date();
const mesSelecionado = ref(dataAtual.getMonth());
const anoSelecionado = ref(dataAtual.getFullYear());

// Computed para horários
const horariosInicio = computed(() => {
  const horarios = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      horarios.push(horario);
    }
  }
  return horarios;
});

const horariosFim = computed(() => {
  if (!horaInicio.value) return [];
  
  const horarios = [];
  const [horaInicioH, horaInicioM] = horaInicio.value.split(':').map(Number);
  const inicioMinutos = horaInicioH * 60 + horaInicioM;
  
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const totalMinutos = h * 60 + m;
      if (totalMinutos > inicioMinutos) {
        const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        horarios.push(horario);
      }
    }
  }
  return horarios;
});

// Computed para emails completos (clientes + usuário)
const emailsCompletos = computed(() => {
  const emails = [...emailsClienteSelecionado.value];
  
  // Incluir email do usuário se existir e não estiver na lista
  if (emailUsuario.value && !emails.includes(emailUsuario.value)) {
    emails.push(emailUsuario.value);
  }
  
  return emails;
});

// Computed para validação do formulário
const formularioValido = computed(() => {
  return titulo.value.trim() && 
         categoriaSelecionada.value && 
         dataSelecionada.value && 
         horaInicio.value && 
         horaFim.value && 
         clienteId.value;
});

// Computed para calendário
const nomeMes = computed(() => {
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return nomes[mesSelecionado.value];
});

const diasCalendario = computed(() => {
  const primeiroDia = new Date(anoSelecionado.value, mesSelecionado.value, 1);
  const ultimoDia = new Date(anoSelecionado.value, mesSelecionado.value + 1, 0);
  const diasMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  
  const dias = [];
  
  // Adicionar dias vazios do início
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null);
  }
  
  // Adicionar dias do mês
  for (let dia = 1; dia <= diasMes; dia++) {
    dias.push(dia);
  }
  
  return dias;
});

// Funções do calendário
const navegarMes = (direcao) => {
  if (direcao === 'anterior') {
    if (mesSelecionado.value === 0) {
      mesSelecionado.value = 11;
      anoSelecionado.value--;
    } else {
      mesSelecionado.value--;
    }
  } else {
    if (mesSelecionado.value === 11) {
      mesSelecionado.value = 0;
      anoSelecionado.value++;
    } else {
      mesSelecionado.value++;
    }
  }
};

const selecionarDia = (dia) => {
  if (!dia) return;
  
  const ano = anoSelecionado.value;
  const mes = (mesSelecionado.value + 1).toString().padStart(2, '0');
  const diaFormatado = dia.toString().padStart(2, '0');
  
  dataSelecionada.value = `${ano}-${mes}-${diaFormatado}`;
};

const isDiaAtual = (dia) => {
  if (!dia) return false;
  const hoje = new Date();
  return dia === hoje.getDate() && 
         mesSelecionado.value === hoje.getMonth() && 
         anoSelecionado.value === hoje.getFullYear();
};

const isDiaSelecionado = (dia) => {
  if (!dia || !dataSelecionada.value) return false;
  const [ano, mes, diaStr] = dataSelecionada.value.split('-');
  return parseInt(diaStr) === dia && 
         parseInt(mes) - 1 === mesSelecionado.value && 
         parseInt(ano) === anoSelecionado.value;
};

// Funções de carregamento de dados
const carregarCategorias = async () => {
  try {
    const { data, error } = await supabase
      .from('categoria_agenda')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    categorias.value = data || [];
    
    // Preparar dados para o dropdown
    categoriasDropdown.value = [
      { id: null, label: 'Selecione uma categoria', placeholder: true },
      ...(data || []).map(categoria => ({
        id: categoria.id,
        label: categoria.nome,
        icon: categoria.iconeColorido,
        iconeBranco: categoria.iconeBranco,
        cor: categoria.cor,
        categoria: categoria,
        placeholder: false
      }))
    ];
    
    console.log('📋 Categorias preparadas para dropdown:', categoriasDropdown.value);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};

const carregarClientesVinculados = async () => {
  try {
    // Validar se processoId é válido
    if (!props.processoId || props.processoId === 'null' || props.processoId === null) {
      console.warn('⚠️ ProcessoId inválido:', props.processoId);
      clientesVinculados.value = [];
      return;
    }

    const { data, error } = await supabase
      .from('processo_cliente')
      .select(`
        cliente_id,
        cliente:cliente_id (
          id,
          nome,
          lista_emails
        )
      `)
      .eq('processo_id', parseInt(props.processoId));
    
    if (error) throw error;
    
    clientesVinculados.value = (data || []).map(item => ({
      id: item.cliente.id,
      nome: item.cliente.nome,
      lista_emails: item.cliente.lista_emails || []
    }));
    
    console.log('👥 Clientes vinculados:', clientesVinculados.value);
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
    clientesVinculados.value = [];
  }
};

const carregarProcessoDetalhes = async () => {
  try {
    // Validar se processoId é válido
    if (!props.processoId || props.processoId === 'null' || props.processoId === null) {
      console.warn('⚠️ ProcessoId inválido para carregar detalhes:', props.processoId);
      processoDetalhes.value = {};
      return;
    }

    const { data, error } = await supabase
      .from('processos')
      .select('autor, reu')
      .eq('id', parseInt(props.processoId))
      .single();
    
    if (error) throw error;
    processoDetalhes.value = data || {};
  } catch (error) {
    console.error('Erro ao carregar detalhes do processo:', error);
    processoDetalhes.value = {};
  }
};

// Função para resetar campos
const resetarCampos = () => {
  titulo.value = '';
  categoriaId.value = '';
  categoriaSelecionada.value = null;
  dataSelecionada.value = '';
  horaInicio.value = '';
  horaFim.value = '';
  clienteId.value = '';
  linkReuniao.value = '';
  endereco.value = '';
  notas.value = '';
  error.value = '';
};

// Função para lidar com seleção de categoria
const onCategoriaSelected = (categoria) => {
  console.log('📦 Categoria selecionada no agenda_processo:', categoria);
  categoriaSelecionada.value = categoria;
  if (categoria && categoria.id) {
    categoriaId.value = categoria.id;
  } else {
    categoriaId.value = '';
  }
  console.log('📊 Estado atualizado:', { categoriaSelecionada: categoriaSelecionada.value, categoriaId: categoriaId.value });
};

// Opções para os dropdowns
const horasInicioOptions = computed(() => [
  { id: null, label: 'Selecionar o início', placeholder: true },
  ...horariosInicio.value.map(horario => ({
    id: horario,
    label: horario,
    icon: '/icons/clock.svg',
    placeholder: false
  }))
]);

const horasFimOptions = computed(() => [
  { id: null, label: 'Selecionar o fim', placeholder: true },
  ...horariosFim.value.map(horario => ({
    id: horario,
    label: horario,
    icon: '/icons/clock.svg',
    placeholder: false
  }))
]);

const clientesOptions = computed(() => [
  { id: null, label: 'Selecionar Cliente', placeholder: true },
  ...clientesVinculados.value.map(cliente => ({
    id: cliente.id,
    label: cliente.nome,
    icon: null,
    placeholder: false
  }))
]);

// Handlers para os dropdowns
const onHoraInicioSelected = (option) => {
  horaInicio.value = option.id || '';
  if (!option.id) {
    horaFim.value = ''; // Reset hora fim quando hora início é limpa
  }
};

const onHoraFimSelected = (option) => {
  horaFim.value = option.id || '';
};

const onClienteSelected = (option) => {
  clienteId.value = option.id || '';
  
  // Carregar emails do cliente selecionado
  if (option.id) {
    const clienteSelecionado = clientesVinculados.value.find(c => c.id === parseInt(option.id));
    emailsClienteSelecionado.value = clienteSelecionado?.lista_emails || [];
    console.log('📧 Emails do cliente selecionado:', emailsClienteSelecionado.value);
  } else {
    emailsClienteSelecionado.value = [];
  }
};

// Função principal de criação da agenda
const criarAgenda = async () => {
  if (!formularioValido.value) {
    error.value = 'Preencha todos os campos obrigatórios';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // 1. Obter sessão do usuário
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      throw new Error('Usuário não autenticado');
    }

    // 2. Obter dados do usuário (incluindo email)
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('id, email')
      .eq('uuid', session.user.id)
      .single();

    if (userError) throw userError;

    console.log('👤 Dados do usuário obtidos:', {
      id: userData.id,
      email: userData.email,
      hasEmail: !!userData.email
    });

    // 3. Preparar dados da agenda
    const dataInicioCompleta = `${dataSelecionada.value}T${horaInicio.value}:00`;
    const dataFimCompleta = `${dataSelecionada.value}T${horaFim.value}:00`;
    
    const clienteSelecionado = clientesVinculados.value.find(c => c.id === parseInt(clienteId.value));
    const categoriaEscolhida = categoriaSelecionada.value?.categoria || categorias.value.find(c => c.id === parseInt(categoriaId.value));

    const dadosAgenda = {
      titulo: titulo.value.trim(),
      descricao: notas.value.trim() || null,
      inicio: dataInicioCompleta,
      fim: dataFimCompleta,
      cor: categoriaEscolhida?.cor || '#0468FA',
      dia_inteiro: false,
      icon_color: categoriaEscolhida?.cor || '#0468FA',
      tipo: 'processo',
      recorrente: false,
      link_reuniao: linkReuniao.value.trim() || null,
      endereco: endereco.value.trim() || null,
      processo_cnj: props.cnj,
      processo_id: parseInt(props.processoId),
      nome_cliente: clienteSelecionado?.nome || null,
      cliente_id: parseInt(clienteId.value),
      categoria_id: parseInt(categoriaId.value),
      usuario_id: userData.id,
      uuid: session.user.id
    };

    // 4. Inserir na tabela agenda
    const { data: agendaData, error: agendaError } = await supabase
      .from('agenda')
      .insert(dadosAgenda)
      .select()
      .single();

    if (agendaError) throw agendaError;

    console.log('✅ Agenda criada no banco:', agendaData);

    // 5. Preparar dados para o webhook N8N - um objeto para cada email
    const baseData = {
      titulo: titulo.value.trim(),
      categoria: categoriaEscolhida?.nome || '',
      processo: props.cnj,
      autor: processoDetalhes.value.autor || '',
      reu: processoDetalhes.value.reu || '',
      data_compromisso: dataSelecionada.value,
      hora_inicio: horaInicio.value,
      hora_fim: horaFim.value,
      link_reuniao: linkReuniao.value.trim() || '',
      mensagem: notas.value.trim() || '',
      cliente_nome: clienteSelecionado?.nome || '',
      endereco: endereco.value.trim() || '',
      userId: session.user.id,
      userUuid: session.user.id,
      timestamp: new Date().toISOString()
    };

    // Adicionar campos específicos da intimação se existir
    if (props.intimacao) {
      baseData.snippet = props.intimacao.snippet || '';
      baseData.secao = props.intimacao.secao || '';
      baseData.tipo = props.intimacao.tipo || '';
      baseData.tribunal = props.intimacao.tribunal || '';
      baseData.autor_intimacao = props.intimacao.autor || '';
      baseData.reu_intimacao = props.intimacao.reu || '';
      
      // Formatar conteúdo removendo tags HTML
      let conteudoFormatado = '';
      if (props.intimacao.conteudo) {
        // Remover tags HTML e converter entidades
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = props.intimacao.conteudo;
        conteudoFormatado = tempDiv.textContent || tempDiv.innerText || '';
      }
      baseData.conteudo = conteudoFormatado;
      
      console.log('📋 Dados específicos da intimação adicionados:', {
        snippet: baseData.snippet,
        secao: baseData.secao,
        tipo: baseData.tipo,
        tribunal: baseData.tribunal,
        autor_intimacao: baseData.autor_intimacao,
        reu_intimacao: baseData.reu_intimacao,
        conteudo: baseData.conteudo?.substring(0, 100) + '...'
      });
    }

    // Usar lista completa de emails (clientes + usuário autenticado) do computed
    const emailsParaNotificacao = emailsCompletos.value.length > 0 
      ? emailsCompletos.value 
      : (userData.email ? [userData.email] : []);
    
    console.log('📧 Lista completa de emails para notificação:', {
      emailsClientes: emailsClienteSelecionado.value,
      emailUsuario: userData.email,
      emailsCompletos: emailsParaNotificacao,
      totalEmails: emailsParaNotificacao.length
    });

    // Criar um objeto para cada email (clientes + usuário)
    const webhookData = emailsParaNotificacao.length > 0 
      ? emailsParaNotificacao.map(email => ({
          ...baseData,
          cliente_email: email,
          is_user_email: email === userData.email // Flag para identificar se é o email do usuário
        }))
      : [{ ...baseData, cliente_email: userData.email || '', is_user_email: true }]; // Fallback se não tiver emails

    // 6. Enviar para webhook N8N
    const webhookUrl = props.intimacao 
      ? 'https://n8nwebhook.estruturadeapi.com/webhook/19b16195-f5b9-422b-bc8c-5ce6ba55bd87'
      : 'https://n8nwebhook.estruturadeapi.com/webhook/285b2ce0-a61a-4cba-b813-6dcd62f4b1ac';
    
    console.log('📤 Enviando para webhook N8N...', {
      tipo: props.intimacao ? 'intimacao' : 'processo',
      url: webhookUrl,
      cliente: clienteSelecionado?.nome,
      total_emails_clientes: emailsClienteSelecionado.value.length,
      total_emails_completos: emailsParaNotificacao.length,
      emails_clientes: emailsClienteSelecionado.value,
      email_usuario: userData.email,
      emails_para_notificacao: emailsParaNotificacao,
      payload_array_count: webhookData.length
    });

    // 🔐 Usar autenticação JWT do usuário
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(webhookData),
    });

          console.log('🔐 Webhook enviado com autenticação JWT:', {
        hasAuth: !!session.access_token,
        authPrefix: session.access_token?.substring(0, 20) + '...',
        isIntimacao: !!props.intimacao,
        dadosIntimacao: props.intimacao ? {
          snippet: props.intimacao.snippet,
          secao: props.intimacao.secao,
          tipo: props.intimacao.tipo,
          tribunal: props.intimacao.tribunal,
          temConteudo: !!props.intimacao.conteudo
        } : null
    });

    if (!response.ok) {
      console.error('❌ Erro na resposta do webhook:', response.status, response.statusText);
      throw new Error(`Erro no servidor: ${response.status}`);
    }

    // Tratar resposta do webhook (pode ser JSON ou texto simples)
    let resultado;
    try {
      const responseText = await response.text();
      console.log('📥 Resposta bruta do webhook:', responseText);
      
      try {
        resultado = JSON.parse(responseText);
      } catch {
        resultado = { message: responseText };
      }
    } catch (error) {
      console.warn('⚠️ Erro ao processar resposta do webhook:', error);
      resultado = { message: 'Resposta processada com sucesso' };
    }
    
    console.log('✅ Resultado do webhook:', resultado);

    // 7. Emitir eventos antes de resetar campos
    emit('agenda-criada', {
      titulo: titulo.value,
      data: dataSelecionada.value,
      mensagem: 'Compromisso marcado na agenda com sucesso!'
    });
    
    // 8. Resetar campos e fechar modal
    resetarCampos();
    emit('close');
    
  } catch (error) {
    console.error('❌ Erro ao criar agenda:', error);
    error.value = error.message || 'Erro ao marcar na agenda. Tente novamente.';
  } finally {
    loading.value = false;
  }
};

const fecharModal = () => {
  resetarCampos();
  emit('close');
};

const handleClickOutside = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal();
  }
};

// Função para carregar email do usuário
const carregarEmailUsuario = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.warn('⚠️ Sessão não encontrada para carregar email do usuário');
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('email')
      .eq('uuid', session.user.id)
      .single();

    if (userError) {
      console.error('❌ Erro ao carregar email do usuário:', userError);
      return;
    }

    emailUsuario.value = userData.email || '';
    console.log('📧 Email do usuário carregado:', emailUsuario.value);
  } catch (error) {
    console.error('❌ Erro ao carregar email do usuário:', error);
  }
};

// Função para inicializar dados quando modal abrir
const inicializarDados = async () => {
  console.log('🚀 Inicializando dados da agenda...');
  
  // Carregar dados apenas quando necessário
  await Promise.all([
    carregarCategorias(),
    carregarClientesVinculados(),
    carregarProcessoDetalhes(),
    carregarEmailUsuario()
  ]);
  
  // Definir data atual como padrão
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
  const dia = hoje.getDate().toString().padStart(2, '0');
  dataSelecionada.value = `${ano}-${mes}-${dia}`;
  
  console.log('✅ Dados da agenda carregados completamente');
};

// Lifecycle - apenas setup básico
onMounted(() => {
  console.log('🚀 agenda_processo.vue montado! (sem carregar dados ainda)');
});

// Watcher para debug da categoria
watch(() => categoriaSelecionada.value, (newCat, oldCat) => {
  console.log('👁️ Categoria mudou:', { 
    anterior: oldCat, 
    atual: newCat,
    temId: newCat?.id,
    temIconeBranco: newCat?.iconeBranco
  });
}, { deep: true });

// Watcher principal - carrega dados quando modal abre
watch(() => props.show, async (newShow, oldShow) => {
  console.log('👁️ Modal show mudou:', { anterior: oldShow, atual: newShow });
  
  if (newShow && !oldShow) {
    console.log('🎯 Modal da agenda aberto! Carregando dados...');
    await inicializarDados();
  }
  
  if (!newShow && oldShow) {
    console.log('🔒 Modal da agenda fechado');
  }
});
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <div class="close-button-placeholder"></div>
        <h2 class="modal-title">
          {{ props.intimacao ? 'Marcar na agenda relacionado à intimação' : 'Marcar na agenda vinculado ao processo' }}
        </h2>
        <button class="close-button close-button-right" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
        <!-- Informações da Intimação (se aplicável) -->
        <div v-if="props.intimacao" class="intimacao-info-section">
          <h3 class="intimacao-info-title">📋 Detalhes da Intimação</h3>
          <div class="intimacao-info-grid">
            <div class="intimacao-info-item">
              <span class="info-label">Tipo:</span>
              <span class="info-value">{{ props.intimacao.tipo || 'N/A' }}</span>
            </div>
            <div class="intimacao-info-item">
              <span class="info-label">Tribunal:</span>
              <span class="info-value">{{ props.intimacao.tribunal || 'N/A' }}</span>
            </div>
            <div class="intimacao-info-item">
              <span class="info-label">Seção:</span>
              <span class="info-value">{{ props.intimacao.secao || 'N/A' }}</span>
            </div>
            <div v-if="props.intimacao.snippet" class="intimacao-info-item span-full">
              <span class="info-label">Resumo:</span>
              <span class="info-value">{{ props.intimacao.snippet }}</span>
            </div>
          </div>
        </div>

        <div class="content-layout">
          <!-- Calendário lateral -->
          <div class="calendar-section">
            <div class="calendar-header">
              <button class="nav-button" @click="navegarMes('anterior')">‹</button>
              <h3 class="month-title">{{ nomeMes }} {{ anoSelecionado }}</h3>
              <button class="nav-button" @click="navegarMes('proximo')">›</button>
            </div>
            
            <div class="calendar-grid">
              <div class="weekdays">
                <div class="weekday">Dom</div>
                <div class="weekday">Seg</div>
                <div class="weekday">Ter</div>
                <div class="weekday">Qua</div>
                <div class="weekday">Qui</div>
                <div class="weekday">Sex</div>
                <div class="weekday">Sáb</div>
              </div>
              
              <div class="days-grid">
                <div 
                  v-for="(dia, index) in diasCalendario" 
                  :key="index"
                  class="day"
                  :class="{
                    'empty': !dia,
                    'today': isDiaAtual(dia),
                    'selected': isDiaSelecionado(dia)
                  }"
                  @click="selecionarDia(dia)"
                >
                  {{ dia }}
                </div>
              </div>
            </div>
          </div>

          <!-- Formulário -->
          <div class="form-section">
            <h2 class="content-title">Organize sua agenda de maneira rápida</h2>

            <!-- Linha com Título e Categoria -->
            <div class="title-category-row">
              <!-- Campo Título -->
              <div class="field-wrapper title-field">
                <div class="input-with-icon">
                  <div class="input-icon">
                    <!-- Ícone papel.svg para título -->
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 13H8" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M16 17H8" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 9H9H8" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <Input
                    v-model="titulo"
                    placeholder="Título do compromisso"
                    class="input-with-padding"
                  />
                </div>
              </div>

              <!-- Campo Categoria -->
              <div class="field-wrapper category-field" style="position: relative; z-index: 1000;">
                <div style="position: relative; z-index: 1000;">
                  <Dropdown
                    :options="categoriasDropdown"
                    @option-selected="onCategoriaSelected"
                    placeholder-text="Selecione uma categoria"
                    :show-placeholder-icon="true"
                    icon-type="categorias"
                  />
                </div>
              </div>
            </div>

            <!-- Marcar na minha agenda -->
            <h4 class="section-title">Marcar na minha agenda</h4>

            <!-- Data selecionada (readonly) -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <!-- Ícone calendarioMarcado.svg para marcar na agenda -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#6B7280" stroke-width="2" fill="none"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="2" fill="#6B7280"/>
                  </svg>
                </div>
                <Input
                  :model-value="dataSelecionada"
                  :disabled="true"
                  placeholder="Selecione a data do agendamento"
                  class="input-with-padding"
                />
              </div>
            </div>

            <!-- Horários -->
            <div class="time-row">
              <!-- Hora de início -->
              <div class="field-wrapper">
                <Dropdown 
                  :options="horasInicioOptions"
                  @option-selected="onHoraInicioSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar o início"
                  icon-type="relogio"
                />
              </div>

              <!-- Hora de fim -->
              <div class="field-wrapper">
                <Dropdown 
                  :options="horasFimOptions"
                  @option-selected="onHoraFimSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar o fim"
                  icon-type="relogio"
                />
              </div>
            </div>

            <!-- Linha com Cliente e CNJ -->
            <div class="fields-row">
              <!-- Campo Cliente -->
              <div class="field-wrapper">
                <Dropdown 
                  :options="clientesOptions"
                  @option-selected="onClienteSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecione cliente"
                  icon-type="user"
                />
              </div>

              <!-- Campo CNJ fixo -->
              <div class="field-wrapper">
                <div class="input-with-icon">
                  <div class="input-icon">
                    <img src="/images/balanca.svg" alt="Processo" width="18" height="18" />
                  </div>
                  <Input
                    :model-value="cnj"
                    :disabled="true"
                    placeholder="CNJ"
                    class="input-with-padding"
                  />
                </div>
              </div>
            </div>

            <!-- Lista de emails que receberão notificação -->
            <div v-if="emailsCompletos.length > 0" class="emails-section">
              <label class="emails-label">📧 E-mails que receberão notificação:</label>
              <div class="emails-list">
                <div v-for="(email, index) in emailsCompletos" :key="index" class="email-item">
                  <!-- Ícone envelope.svg para emails -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 6L12 13L2 6" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="email-text">{{ email }}</span>
                  <span 
                    class="email-badge"
                    :class="{
                      'badge-user': email === emailUsuario,
                      'badge-client': email !== emailUsuario
                    }"
                  >
                    {{ email === emailUsuario ? 'Você' : 'Cliente' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Link da reunião -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <!-- Ícone link.svg para link da reunião -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95095 12.3934 9.60712C11.7643 9.26329 11.0685 9.05892 10.3533 9.00770C9.63819 8.95649 8.92037 9.05973 8.24860 9.31026C7.57682 9.56079 6.96687 9.95295 6.46 10.46L3.46 13.46C2.54918 14.403 2.04520 15.6661 2.0566 16.9770C2.06799 18.288 2.59383 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <Input
                  v-model="linkReuniao"
                  placeholder="Link da reunião"
                  class="input-with-padding"
                />
              </div>
            </div>

            <!-- Endereço -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <!-- Ícone localizacao.svg para endereço -->
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <Input
                  v-model="endereco"
                  placeholder="Endereço"
                  class="input-with-padding"
                />
              </div>
            </div>

            <!-- Notas -->
            <div class="field-wrapper">
              <textarea
                v-model="notas"
                placeholder="Notas adicionais"
                class="textarea-field"
                rows="3"
              ></textarea>
            </div>

            <!-- Mensagem de erro -->
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <!-- Botões de ação -->
            <div class="actions-section">
              <Button
                label="Cancelar"
                type="secondary"
                @click="fecharModal"
              />
              <Button
                label="Salvar"
                type="primary"
                :disabled="loading || !formularioValido"
                @click="criarAgenda"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Garantir que dropdowns dentro do modal tenham z-index alto */
.modal-overlay .dropdown-with-icon :deep(.dropdown-options) {
  z-index: 1002 !important;
}

.modal-container {
  width: 900px;
  max-width: 95vw;
  background: white;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.header-bar {
  height: 35px;
  background-color: #0468FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  position: relative;
}

.modal-title {
  color: white;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  margin: 0;
  text-align: center;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button-right {
  position: absolute;
  right: 10px;
}

.close-button-placeholder {
  width: 20px;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.modal-content {
  padding: 20px;
}

.content-layout {
  display: flex;
  gap: 20px;
}

/* Calendário lateral */
.calendar-section {
  flex-shrink: 0;
  width: 250px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-button {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  color: #6b7280;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-button:hover {
  background-color: #e2e8f0;
  color: #374151;
}

.month-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.calendar-grid {
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  padding: 4px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.day:not(.empty):hover {
  background-color: #e2e8f0;
}

.day.empty {
  cursor: default;
}

.day.today {
  background-color: #0468FA;
  color: white;
  font-weight: 600;
}

.day.selected {
  background-color: #1d4ed8;
  color: white;
  font-weight: 600;
}

/* Formulário */
.form-section {
  flex: 1;
  min-width: 0;
  background: white;
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  font-family: 'Inter', sans-serif;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 20px 0 12px 0;
}

.field-wrapper {
  margin-bottom: 16px;
  background: white;
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.fields-row .field-wrapper {
  flex: 1;
  margin-bottom: 0;
}

.title-category-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.title-category-row .title-field {
  flex: 1;
  margin-bottom: 0;
}

.title-category-row .category-field {
  flex: 1;
  margin-bottom: 0;
}

.time-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.time-row .field-wrapper {
  flex: 1;
  margin-bottom: 0;
}

/* Estilos para input com ícone */
.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.select-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  width: 16px;
  height: 44px;
}

.input-with-icon :deep(.icon-container) {
  display: none;
}

.input-with-icon :deep(.input-field) {
  padding-left: 40px;
  padding-right: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  height: 44px;
  line-height: 1;
}

.input-with-icon :deep(.input-wrapper) {
  border-radius: 8px;
  height: 44px;
  align-items: center;
}

.input-with-icon :deep(.input-container) {
  width: 100%;
  margin-bottom: 0;
}

/* Select */
.select-field {
  width: 100%;
  height: 44px;
  padding-left: 40px;
  padding-right: 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  background: white;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
}

.select-field:focus {
  border-color: #0468FA;
}

.select-field:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

/* Dropdown com ícone à esquerda */
.dropdown-with-icon {
  position: relative;
}

.dropdown-with-padding {
  width: 100%;
}

.dropdown-with-padding :deep(.dropdown-container) {
  width: 100%;
  margin-bottom: 0;
}

.dropdown-with-padding :deep(.dropdown-header) {
  padding-left: 40px !important;
  padding-right: 16px !important;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  height: 44px;
  background-color: white !important;
  border: 1px solid #D0D5DD !important;
  border-radius: 8px;
}

.dropdown-with-padding :deep(.dropdown-options) {
  z-index: 1001 !important;
}

/* Garantir que o ícone à esquerda seja visível */
.dropdown-with-icon .input-icon {
  z-index: 10;
}

/* Estilos adicionais para garantir fundo branco */
.field-wrapper .dropdown-with-icon :deep(.dropdown-header) {
  background: white !important;
  opacity: 1 !important;
}

.field-wrapper .dropdown-with-icon :deep(.dropdown-options) {
  background: white !important;
  opacity: 1 !important;
  border: 1px solid #0468FA !important;
  border-top: none !important;
  z-index: 1001 !important;
  position: absolute !important;
}

.field-wrapper .dropdown-with-icon :deep(.dropdown-option) {
  background: white !important;
  opacity: 1 !important;
}

/* Textarea */
.textarea-field {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #101828;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
}

.textarea-field:focus {
  border-color: #0468FA;
}

.textarea-field::placeholder {
  color: #667085;
}

.error-message {
  background-color: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.actions-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.actions-section :deep(.button) {
  width: 176px;
  height: 44px;
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
    max-height: 95vh;
  }
  
  .header-bar {
    height: auto;
    min-height: 45px;
    padding: 8px 15px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-title {
    font-size: 13px;
    width: auto;
    white-space: normal;
    line-height: 1.2;
  }
  
  .content-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .calendar-section {
    width: 100%;
  }
  
  .title-category-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .fields-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .time-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .actions-section :deep(.button) {
    width: 100%;
  }
}

/* FORÇA ABSOLUTA - CSS ULTRA ESPECÍFICO PARA DROPDOWN CATEGORIA */
.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option {
  background-color: white !important;
  color: #101828 !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option span {
  color: #101828 !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option:hover {
  background-color: #f5f5f5 !important;
  color: #101828 !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option:hover span {
  color: #101828 !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option--active {
  background-color: #0468FA !important;
  color: white !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-container) .dropdown-options .dropdown-option--active span {
  color: white !important;
}

/* Header selecionado com força máxima */
.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-header--selected) {
  background-color: #0468FA !important;
  color: white !important;
  border-color: #0468FA !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-header--selected) .dropdown-header-content {
  color: white !important;
}

.modal-overlay .form-section .field-wrapper .dropdown-with-icon .dropdown-with-padding:deep(.dropdown-header--selected) .dropdown-header-content span {
  color: white !important;
}

/* Estilos para seção de emails do cliente */
.emails-section {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.emails-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
}

.emails-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.email-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
}

.email-icon {
  flex-shrink: 0;
}

.email-text {
  font-size: 14px;
  color: #374151;
  word-break: break-all;
}

/* Responsivo para emails */
@media (max-width: 768px) {
  .email-item {
    padding: 6px 10px;
  }
  
  .email-text {
    font-size: 13px;
  }
}

/* Removidos todos os estilos personalizados de z-index */

/* Estilos para seção de informações da intimação */
.intimacao-info-section {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.intimacao-info-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  font-family: 'Inter', sans-serif;
}

.intimacao-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.intimacao-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intimacao-info-item.span-full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif;
}

.info-value {
  font-size: 14px;
  color: #374151;
  font-family: 'Inter', sans-serif;
  word-break: break-word;
}

/* Responsivo para seção de intimação */
@media (max-width: 768px) {
  .intimacao-info-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .intimacao-info-section {
    padding: 12px;
    margin-bottom: 16px;
  }
  
  .intimacao-info-title {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .info-label {
    font-size: 11px;
  }
  
  .info-value {
    font-size: 13px;
  }
}
/* Estilos para badges de email */
.email-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.badge-user {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.badge-client {
  background-color: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}
</style> 