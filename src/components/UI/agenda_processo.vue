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
    icon: null,
    placeholder: false
  }))
]);

const horasFimOptions = computed(() => [
  { id: null, label: 'Selecionar o fim', placeholder: true },
  ...horariosFim.value.map(horario => ({
    id: horario,
    label: horario,
    icon: null,
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

    // 2. Obter dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('id')
      .eq('uuid', session.user.id)
      .single();

    if (userError) throw userError;

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

    // Criar um objeto para cada email do cliente
    const webhookData = emailsClienteSelecionado.value.length > 0 
      ? emailsClienteSelecionado.value.map(email => ({
          ...baseData,
          cliente_email: email
        }))
      : [{ ...baseData, cliente_email: '' }]; // Se não tiver emails, envia um objeto vazio

    // 6. Enviar para webhook N8N
    const webhookUrl = 'https://n8nwebhook.estruturadeapi.com/webhook/285b2ce0-a61a-4cba-b813-6dcd62f4b1ac';
    console.log('📤 Enviando para webhook N8N...', {
      cliente: clienteSelecionado?.nome,
      total_emails: emailsClienteSelecionado.value.length,
      emails_individuais: emailsClienteSelecionado.value,
      payload_array: webhookData
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(webhookData),
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

// Função para inicializar dados quando modal abrir
const inicializarDados = async () => {
  console.log('🚀 Inicializando dados da agenda...');
  
  // Carregar dados apenas quando necessário
  await Promise.all([
    carregarCategorias(),
    carregarClientesVinculados(),
    carregarProcessoDetalhes()
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
        <h2 class="modal-title">Marcar na agenda vinculado ao processo</h2>
        <button class="close-button" @click="fecharModal">×</button>
      </div>

      <!-- Conteúdo do modal -->
      <div class="modal-content">
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
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
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
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="#6B7280" stroke-width="1.33"/>
                      <path d="M15 4L8 9L1 4" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
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
              <div class="field-wrapper category-field">
                <Dropdown
                  :options="categoriasDropdown"
                  @option-selected="onCategoriaSelected"
                  placeholder-text="Selecione uma categoria"
                  :show-placeholder-icon="true"
                />
              </div>
            </div>

            <!-- Marcar na minha agenda -->
            <h4 class="section-title">Marcar na minha agenda</h4>

            <!-- Data selecionada (readonly) -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="3" width="12" height="10" rx="1" stroke="#6B7280" stroke-width="1.33"/>
                    <path d="M6 1V4M10 1V4M2 7H14" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round"/>
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
                <div class="dropdown-with-icon">
                  <div class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="#6B7280" stroke-width="1.33"/>
                      <path d="M8 4V8L10.5 10.5" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="dropdown-with-padding">
                    <Dropdown 
                      :options="horasInicioOptions"
                      @option-selected="onHoraInicioSelected"
                    />
                  </div>
                </div>
              </div>

              <!-- Hora de fim -->
              <div class="field-wrapper">
                <div class="dropdown-with-icon">
                  <div class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="#6B7280" stroke-width="1.33"/>
                      <path d="M8 4V8L10.5 10.5" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="dropdown-with-padding">
                    <Dropdown 
                      :options="horasFimOptions"
                      @option-selected="onHoraFimSelected"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Linha com Cliente e CNJ -->
            <div class="fields-row">
              <!-- Campo Cliente -->
              <div class="field-wrapper">
                <div class="dropdown-with-icon">
                  <div class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="5" r="3" stroke="#6B7280" stroke-width="1.33"/>
                      <path d="M2 13C2 10.79 4.686 9 8 9S14 10.79 14 13" stroke="#6B7280" stroke-width="1.33"/>
                    </svg>
                  </div>
                  <div class="dropdown-with-padding">
                    <Dropdown 
                      :options="clientesOptions"
                      @option-selected="onClienteSelected"
                    />
                  </div>
                </div>
              </div>

              <!-- Campo CNJ fixo -->
              <div class="field-wrapper">
                <div class="input-with-icon">
                  <div class="input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <!-- Poste central -->
                      <line x1="8" y1="2" x2="8" y2="14" stroke="#6B7280" stroke-width="1"/>
                      <!-- Braço da balança -->
                      <line x1="3" y1="6" x2="13" y2="6" stroke="#6B7280" stroke-width="1"/>
                      <!-- Prato esquerdo -->
                      <path d="M1 8 L5 8 L4 10 L2 10 Z" fill="#6B7280"/>
                      <line x1="3" y1="6" x2="3" y2="8" stroke="#6B7280" stroke-width="1"/>
                      <!-- Prato direito -->
                      <path d="M11 8 L15 8 L14 10 L12 10 Z" fill="#6B7280"/>
                      <line x1="13" y1="6" x2="13" y2="8" stroke="#6B7280" stroke-width="1"/>
                      <!-- Base -->
                      <line x1="6" y1="14" x2="10" y2="14" stroke="#6B7280" stroke-width="1.5"/>
                    </svg>
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

            <!-- Lista de emails do cliente selecionado -->
            <div v-if="emailsClienteSelecionado.length > 0" class="emails-section">
              <label class="emails-label">E-mails do cliente:</label>
              <div class="emails-list">
                <div v-for="(email, index) in emailsClienteSelecionado" :key="index" class="email-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="email-icon">
                    <path d="M2 4L8 8L14 4M2 4V12C2 12.5523 2.44772 13 3 13H13C13.5523 13 14 12.5523 14 12V4M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="email-text">{{ email }}</span>
                </div>
              </div>
            </div>

            <!-- Link da reunião -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6.5 9.5L9.5 6.5M9 3H10C12.2091 3 14 4.79086 14 7V9C14 11.2091 12.2091 13 10 13H9M7 13H6C3.79086 13 2 11.2091 2 9V7C2 4.79086 3.79086 3 6 3H7" stroke="#6B7280" stroke-width="1.33" stroke-linecap="round"/>
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" stroke="#6B7280" stroke-width="1.33"/>
                    <path d="M8 1C5.79086 1 4 2.79086 4 5C4 8.5 8 15 8 15C8 15 12 8.5 12 5C12 2.79086 10.2091 1 8 1Z" stroke="#6B7280" stroke-width="1.33"/>
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
  border-radius: 8px;
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
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
  width: 240px;
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
  
  .content-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  .calendar-section {
    width: 100%;
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
</style> 