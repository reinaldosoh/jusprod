<template>
  <div v-if="show" class="modal-overlay" @click="handleClickOutside">
    <div class="modal-container">
      <!-- Tarja azul -->
      <div class="header-bar">
        <div class="close-button-placeholder"></div>
        <h2 class="modal-title">{{ props.compromissoEdicao ? 'Editar compromisso' : 'Marcar na agenda' }}</h2>
        <button class="close-button close-button-right" @click="fecharModal">×</button>
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
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.5 1.70215V4.80005C10.5 5.22009 10.5 5.43011 10.5817 5.59055C10.6537 5.73167 10.7684 5.8464 10.9095 5.91831C11.0699 6.00005 11.28 6.00005 11.7 6.00005H14.7979M10.5 12.75H6M12 9.75H6M15 7.49117V12.9C15 14.1601 15 14.7902 14.7548 15.2715C14.539 15.6948 14.1948 16.039 13.7715 16.2548C13.2902 16.5 12.6601 16.5 11.4 16.5H6.6C5.33988 16.5 4.70982 16.5 4.22852 16.2548C3.80516 16.039 3.46095 15.6948 3.24524 15.2715C3 14.7902 3 14.1601 3 12.9V5.1C3 3.83988 3 3.20982 3.24524 2.72852C3.46095 2.30516 3.80516 1.96095 4.22852 1.74524C4.70982 1.5 5.33988 1.5 6.6 1.5H9.00883C9.55916 1.5 9.83432 1.5 10.0933 1.56217C10.3229 1.61729 10.5423 1.7082 10.7436 1.83156C10.9707 1.9707 11.1653 2.16527 11.5544 2.55442L13.9456 4.94558C14.3347 5.33473 14.5293 5.5293 14.6684 5.75636C14.7918 5.95767 14.8827 6.17715 14.9378 6.40673C15 6.66568 15 6.94084 15 7.49117Z" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
              <div class="field-wrapper category-field" style="position: relative; z-index: 1005;">
                <div style="position: relative; z-index: 1005;">
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
                  <img 
                    src="/images/calendario.svg" 
                    alt="Calendário" 
                    class="email-icon"
                  />
                </div>
                <Input
                  :model-value="dataFormatadaBrasil"
                  :disabled="true"
                  placeholder="Selecione a data do agendamento"
                  class="input-with-padding"
                />
              </div>
            </div>

            <!-- Horários -->
            <div class="time-row">
              <!-- Hora de início -->
              <div class="field-wrapper" style="position: relative; z-index: 1004;">
                <Dropdown 
                  :options="horasInicioOptions"
                  @option-selected="onHoraInicioSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar o início"
                  icon-type="relogio"
                />
              </div>

              <!-- Hora de fim -->
              <div class="field-wrapper" style="position: relative; z-index: 1003;">
                <Dropdown 
                  :options="horasFimOptions"
                  @option-selected="onHoraFimSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar o fim"
                  icon-type="relogio"
                />
              </div>
            </div>

            <!-- Linha com Cliente e Processo -->
            <div class="fields-row">
              <!-- Campo Cliente -->
              <div class="field-wrapper" style="position: relative; z-index: 1002;">
                <Dropdown 
                  :options="clientesOptions"
                  @option-selected="onClienteSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar Cliente (opcional)"
                  icon-type="user"
                />
              </div>

              <!-- Campo Processo -->
              <div class="field-wrapper" style="position: relative; z-index: 1001;">
                <Dropdown 
                  :options="opcoesProcessos"
                  @option-selected="onProcessoSelected"
                  :show-placeholder-icon="true"
                  placeholder-text="Selecionar Processo (opcional)"
                  icon-type="balanca"
                  :disabled="!clienteSelecionado"
                />
              </div>
            </div>

            <!-- Campo para adicionar emails personalizados -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <img 
                    src="/images/envelope.svg" 
                    alt="Email" 
                    class="email-icon"
                  />
                </div>
                <Input
                  v-model="emailsPersonalizados"
                  placeholder="E-mails adicionais (separados por vírgula)"
                  class="input-with-padding"
                />
              </div>
              <div class="input-help-text" style="margin-top: 8px;">
                Adicione e-mails separados por vírgula para receber notificações
              </div>
            </div>

            <!-- Lista de emails que receberão notificação -->
            <div v-if="emailsCompletos.length > 0" class="emails-section" style="background-color: #fcfcfc; padding: 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e2e8f0;">
              <div style="font-weight: bold; color: #0468FA; font-size: 13px; margin-bottom: 8px;">E-mails que receberão notificação:</div>
              
              <div>
                <div v-for="(email, index) in emailsCompletos" :key="index" style="padding: 6px 0; display: flex; align-items: center;">
                  <div style="font-size: 12px;">{{ email }}</div>
                  <div style="margin-left: 8px;">
                    <span 
                      v-if="email === emailUsuario"
                      style="display: inline-block; font-size: 10px; padding: 1px 4px; background-color: #e3efff; color: #0468FA; border-radius: 4px;"
                    >
                      Você
                    </span>
                    <span 
                      v-else
                      style="display: inline-block; font-size: 10px; padding: 1px 4px; background-color: #eaeaea; color: #666; border-radius: 4px;"
                    >
                      Cliente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Link da reunião -->
            <div class="field-wrapper">
              <div class="input-with-icon">
                <div class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_15_32835)">
                      <path d="M7.50015 9.74997C7.82224 10.1806 8.23317 10.5369 8.70506 10.7947C9.17696 11.0525 9.69878 11.2058 10.2351 11.2442C10.7715 11.2826 11.3098 11.2052 11.8137 11.0173C12.3175 10.8294 12.775 10.5353 13.1552 10.155L15.4052 7.90497C16.0882 7.19772 16.4662 6.25046 16.4577 5.26722C16.4491 4.28398 16.0548 3.34343 15.3595 2.64815C14.6642 1.95287 13.7236 1.55849 12.7404 1.54995C11.7572 1.5414 10.8099 1.91938 10.1026 2.60247L8.81265 3.88497M10.5001 8.24997C10.1781 7.81938 9.76713 7.46309 9.29524 7.20527C8.82334 6.94745 8.30152 6.79414 7.76516 6.75572C7.2288 6.71731 6.69046 6.7947 6.18664 6.98264C5.68282 7.17058 5.22531 7.46467 4.84515 7.84497L2.59515 10.095C1.91206 10.8022 1.53408 11.7495 1.54262 12.7327C1.55117 13.716 1.94555 14.6565 2.64083 15.3518C3.33611 16.0471 4.27666 16.4415 5.2599 16.45C6.24313 16.4585 7.19039 16.0806 7.89765 15.3975L9.18015 14.115" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_15_32835">
                        <rect width="18" height="18" fill="white"/>
                      </clipPath>
                    </defs>
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
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9 16.5C12 13.5 15 10.8137 15 7.5C15 4.18629 12.3137 1.5 9 1.5C5.68629 1.5 3 4.18629 3 7.5C3 10.8137 6 13.5 9 16.5Z" stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
                @click="salvarAgenda"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Alertas -->
  <AlertaSucesso 
    v-if="mostrarSucesso"
    :mensagem="mensagemSucesso"
    @fechar="fecharAlertaSucesso"
  />
  
  <AlertaErro 
    v-if="mostrarErro"
    titulo="Erro ao salvar"
    :mensagem="mensagemErro"
    @fechar="fecharAlertaErro"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Input from '../../components/UI/Input.vue'
import Button from '../../components/UI/Button.vue'
import Dropdown from '../../components/UI/Dropdown.vue'
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue'
import AlertaErro from '../../components/UI/AlertaErro.vue'
import { supabase } from '../../lib/supabase.js'
import { alertaService } from '../../services/alertaService.js'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  dataInicial: {
    type: String,
    default: ''
  },
  compromissoEdicao: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'agenda-criada'])

// Estados do componente
const titulo = ref('')
const categoriaId = ref('')
const categoriaSelecionada = ref(null)
const dataSelecionada = ref('')
const horaInicio = ref('')
const horaFim = ref('')
const clienteId = ref('')
const clienteSelecionado = ref(null)
const processoSelecionado = ref(null)
const linkReuniao = ref('')
const endereco = ref('')
const notas = ref('')
const emailsPersonalizados = ref('')
const loading = ref(false)
const error = ref('')
const emailsClienteSelecionado = ref([])

// Estados dos alertas
const mostrarSucesso = ref(false)
const mostrarErro = ref(false)
const mensagemSucesso = ref('')
const mensagemErro = ref('')

// Dados carregados do banco
const categorias = ref([])
const categoriasDropdown = ref([])
const clientesVinculados = ref([])
const processos = ref([])
const carregandoClientes = ref(false)
const carregandoProcessos = ref(false)
const emailUsuario = ref('')

// Estados do calendário
const dataAtual = new Date()
const mesSelecionado = ref(dataAtual.getMonth())
const anoSelecionado = ref(dataAtual.getFullYear())

// Computed para horários
const horariosInicio = computed(() => {
  const horarios = []
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      horarios.push(horario)
    }
  }
  return horarios
})

const horariosFim = computed(() => {
  if (!horaInicio.value) return []
  
  const horarios = []
  const [horaInicioH, horaInicioM] = horaInicio.value.split(':').map(Number)
  const inicioMinutos = horaInicioH * 60 + horaInicioM
  
  for (let h = 6; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const totalMinutos = h * 60 + m
      if (totalMinutos > inicioMinutos) {
        const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        horarios.push(horario)
      }
    }
  }
  return horarios
})

// Computed para emails completos (clientes + usuário + personalizados)
const emailsCompletos = computed(() => {
  const emails = [...emailsClienteSelecionado.value]
  
  // Incluir email do usuário se existir e não estiver na lista
  if (emailUsuario.value && !emails.includes(emailUsuario.value)) {
    emails.push(emailUsuario.value)
  }
  
  // Incluir emails personalizados (separados por vírgula)
  if (emailsPersonalizados.value.trim()) {
    const emailsAdicionais = emailsPersonalizados.value
      .split(',')
      .map(email => email.trim())
      .filter(email => email && email.includes('@') && !emails.includes(email))
    
    emails.push(...emailsAdicionais)
  }
  
  return emails
})

// Computed para verificar se está em modo de edição
const modoEdicao = computed(() => {
  return props.compromissoEdicao !== null
})

// Computed para validação do formulário
const formularioValido = computed(() => {
  return titulo.value.trim() && 
         categoriaSelecionada.value && 
         dataSelecionada.value && 
         horaInicio.value && 
         horaFim.value
})

// Computed para formatar data no padrão brasileiro
const dataFormatadaBrasil = computed(() => {
  if (!dataSelecionada.value) return ''
  
  const [ano, mes, dia] = dataSelecionada.value.split('-')
  return `${dia}/${mes}/${ano}`
})

// Computed para calendário
const nomeMes = computed(() => {
  const nomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return nomes[mesSelecionado.value]
})

const diasCalendario = computed(() => {
  const primeiroDia = new Date(anoSelecionado.value, mesSelecionado.value, 1)
  const ultimoDia = new Date(anoSelecionado.value, mesSelecionado.value + 1, 0)
  const diasMes = ultimoDia.getDate()
  const diaSemanaInicio = primeiroDia.getDay()
  
  const dias = []
  
  // Adicionar dias vazios do início
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null)
  }
  
  // Adicionar dias do mês
  for (let dia = 1; dia <= diasMes; dia++) {
    dias.push(dia)
  }
  
  return dias
})

// Funções do calendário
const navegarMes = (direcao) => {
  if (direcao === 'anterior') {
    if (mesSelecionado.value === 0) {
      mesSelecionado.value = 11
      anoSelecionado.value--
    } else {
      mesSelecionado.value--
    }
  } else {
    if (mesSelecionado.value === 11) {
      mesSelecionado.value = 0
      anoSelecionado.value++
    } else {
      mesSelecionado.value++
    }
  }
}

const selecionarDia = (dia) => {
  if (!dia) return
  
  const ano = anoSelecionado.value
  const mes = (mesSelecionado.value + 1).toString().padStart(2, '0')
  const diaFormatado = dia.toString().padStart(2, '0')
  
  dataSelecionada.value = `${ano}-${mes}-${diaFormatado}`
}

const isDiaAtual = (dia) => {
  if (!dia) return false
  const hoje = new Date()
  return dia === hoje.getDate() && 
         mesSelecionado.value === hoje.getMonth() && 
         anoSelecionado.value === hoje.getFullYear()
}

const isDiaSelecionado = (dia) => {
  if (!dia || !dataSelecionada.value) return false
  const [ano, mes, diaStr] = dataSelecionada.value.split('-')
  return parseInt(diaStr) === dia && 
         parseInt(mes) - 1 === mesSelecionado.value && 
         parseInt(ano) === anoSelecionado.value
}

// Função alternativa para carregar categorias sem verificação de auth
const carregarCategoriasSemAuth = async () => {
  try {
    console.log('🔄 Carregando categorias sem verificação de auth...')
    
    const { data, error } = await supabase
      .from('categoria_agenda')
      .select('*')
      .order('nome')
    
    if (error) {
      console.error('❌ Erro na query de categorias:', error)
      return false
    }
    
    console.log('📊 Categorias carregadas:', data)
    
    categorias.value = data || []
    
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
    ]
    
    console.log(`✅ ${data?.length || 0} categorias carregadas com sucesso`)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao carregar categorias sem auth:', error)
    return false
  }
}

// Função alternativa para carregar clientes sem verificação de auth
const carregarClientesSemAuth = async () => {
  try {
    console.log('🔄 Carregando clientes sem verificação de auth...')
    
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nome, nome_fantasia, lista_emails')
      .order('nome')
    
    if (error) {
      console.error('❌ Erro na query de clientes:', error)
      return false
    }
    
    console.log('📊 Clientes carregados:', data)
    
    clientesVinculados.value = (data || []).map(cliente => ({
      ...cliente,
      nome_razao_social: cliente.nome || cliente.nome_fantasia || 'Cliente sem nome',
      lista_emails: cliente.lista_emails || []
    }))
    
    console.log(`✅ ${data?.length || 0} clientes carregados com sucesso`)
    return true
    
  } catch (error) {
    console.error('❌ Erro ao carregar clientes sem auth:', error)
    return false
  }
}

// Função para resetar campos
const resetarCampos = () => {
  titulo.value = ''
  categoriaId.value = ''
  categoriaSelecionada.value = null
  dataSelecionada.value = ''
  horaInicio.value = ''
  horaFim.value = ''
  clienteId.value = ''
  clienteSelecionado.value = null
  processoSelecionado.value = null
  linkReuniao.value = ''
  endereco.value = ''
  notas.value = ''
  emailsPersonalizados.value = ''
  error.value = ''
  emailsClienteSelecionado.value = []
}

// Função para lidar com seleção de categoria
const onCategoriaSelected = (categoria) => {
  console.log('📦 Categoria selecionada no marcar_agenda:', categoria)
  categoriaSelecionada.value = categoria
  if (categoria && categoria.id) {
    categoriaId.value = categoria.id
  } else {
    categoriaId.value = ''
  }
  console.log('📊 Estado atualizado:', { categoriaSelecionada: categoriaSelecionada.value, categoriaId: categoriaId.value })
}

// Opções para os dropdowns
const horasInicioOptions = computed(() => [
  { id: null, label: 'Selecionar o início', placeholder: true },
  ...horariosInicio.value.map(horario => ({
    id: horario,
    label: horario,
    placeholder: false
  }))
])

const horasFimOptions = computed(() => [
  { id: null, label: 'Selecionar o fim', placeholder: true },
  ...horariosFim.value.map(horario => ({
    id: horario,
    label: horario,
    placeholder: false
  }))
])

const clientesOptions = computed(() => [
  { id: null, label: 'Selecionar Cliente (opcional)', placeholder: true },
  ...clientesVinculados.value.map(cliente => ({
    id: cliente.id,
    label: cliente.nome_razao_social,
    placeholder: false
  }))
])

// Opções para processos usando a mesma lógica do formsRecebiveis.vue
const opcoesProcessos = computed(() => {
  if (!clienteSelecionado.value) {
    return [{ id: null, label: 'Selecione um processo (opcional)', placeholder: true }]
  }
  
  if (carregandoProcessos.value) {
    return [{ id: null, label: 'Carregando processos...', placeholder: true }]
  }
  
  const opcoes = [
    { id: null, label: 'Selecione um processo (opcional)', placeholder: true }
  ]
  
  processos.value.forEach(processo => {
    // Priorizar nome, se não tiver usar cnj
    const displayName = (processo.nome && processo.nome.trim() !== '') ? processo.nome : (processo.cnj || `Processo ${processo.id}`)
    opcoes.push({
      id: processo.id,
      label: displayName,
      placeholder: false
    })
  })
  
  // Se não há processos além do placeholder, mostrar mensagem
  if (opcoes.length === 1) {
    return [{ id: null, label: 'Nenhum processo encontrado', placeholder: true }]
  }
  
  return opcoes
})

// Função para carregar processos do cliente selecionado
const carregarProcessos = async (clienteId) => {
  if (!clienteId) {
    processos.value = []
    processoSelecionado.value = null
    return
  }
  
  try {
    carregandoProcessos.value = true
    console.log('🔄 Carregando processos do cliente:', clienteId)
    
    // Usar a mesma lógica do formsRecebiveis.vue
    const { data: processosCliente, error } = await supabase
      .from('processo_cliente')
      .select(`
        processo_id,
        processos!inner(id, cnpj, autor, reu, nome)
      `)
      .eq('cliente_id', clienteId)
    
    if (error) {
      console.error('❌ Erro ao carregar processos:', error)
      processos.value = []
      return
    }
    
    if (!processosCliente || processosCliente.length === 0) {
      console.log('⚠️ Nenhum processo encontrado para o cliente')
      processos.value = []
      return
    }
    
    // Mapear os processos para o formato esperado
    processos.value = processosCliente.map(pc => {
      const processo = pc.processos
      return {
        id: processo.id,
        nome: processo.nome,
        cnj: processo.cnpj,
        ...processo
      }
    })
    
    console.log(`✅ ${processos.value.length} processos carregados para o cliente`)
    
  } catch (error) {
    console.error('❌ Erro ao carregar processos:', error)
    processos.value = []
  } finally {
    carregandoProcessos.value = false
  }
}

const onProcessoSelected = (option) => {
  processoSelecionado.value = option.id ? processos.value.find(p => p.id === parseInt(option.id)) : null
}

// Handlers para os dropdowns
const onHoraInicioSelected = (option) => {
  horaInicio.value = option.id || ''
  if (!option.id) {
    horaFim.value = '' // Reset hora fim quando hora início é limpa
  }
}

const onHoraFimSelected = (option) => {
  horaFim.value = option.id || ''
}

const onClienteSelected = (option) => {
  const clienteAnterior = clienteSelecionado.value
  clienteSelecionado.value = option.id ? clientesVinculados.value.find(c => c.id === parseInt(option.id)) : null
  clienteId.value = option.id || ''
  
  // Carregar emails do cliente selecionado
  if (option.id) {
    const clienteSelecionadoObj = clientesVinculados.value.find(c => c.id === parseInt(option.id))
    emailsClienteSelecionado.value = clienteSelecionadoObj?.lista_emails || []
    console.log('📧 Emails do cliente selecionado:', emailsClienteSelecionado.value)
    
    // Carregar processos se cliente mudou
    if (!clienteAnterior || clienteAnterior.id !== parseInt(option.id)) {
      carregarProcessos(option.id)
    }
  } else {
    emailsClienteSelecionado.value = []
    processos.value = []
    processoSelecionado.value = null
  }
}

// Função principal de criação/edição da agenda
const salvarAgenda = async () => {
  if (!formularioValido.value) {
    error.value = 'Preencha todos os campos obrigatórios'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 1. Obter sessão do usuário
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      throw new Error('Usuário não autenticado')
    }

    // 2. Obter dados do usuário (incluindo email)
    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('id, email')
      .eq('uuid', session.user.id)
      .single()

    if (userError) throw userError

    console.log('👤 Dados do usuário obtidos:', {
      id: userData.id,
      email: userData.email,
      hasEmail: !!userData.email
    })

    // 3. Preparar dados da agenda
    const dataInicioCompleta = `${dataSelecionada.value}T${horaInicio.value}:00`
    const dataFimCompleta = `${dataSelecionada.value}T${horaFim.value}:00`
    
    const categoriaEscolhida = categoriaSelecionada.value?.categoria || categorias.value.find(c => c.id === parseInt(categoriaId.value))

    const dadosAgenda = {
      titulo: titulo.value.trim(),
      descricao: notas.value.trim() || null,
      inicio: dataInicioCompleta,
      fim: dataFimCompleta,
      cor: categoriaEscolhida?.cor || '#0468FA',
      dia_inteiro: false,
      icon_color: categoriaEscolhida?.cor || '#0468FA',
      tipo: 'agenda',
      recorrente: false,
      link_reuniao: linkReuniao.value.trim() || null,
      endereco: endereco.value.trim() || null,
      processo_cnj: processoSelecionado.value?.cnj || null,
      processo_id: processoSelecionado.value?.id || null,
      nome_cliente: clienteSelecionado.value?.nome_razao_social || null,
      cliente_id: clienteSelecionado.value?.id || null,
      categoria_id: parseInt(categoriaId.value),
      usuario_id: userData.id,
      uuid: session.user.id,
      emails: emailsCompletos.value
    }

    let agendaData

    if (modoEdicao.value) {
      // 4a. Atualizar compromisso existente
      const { data: updateData, error: updateError } = await supabase
        .from('agenda')
        .update(dadosAgenda)
        .eq('id', props.compromissoEdicao.id)
        .select()
        .single()

      if (updateError) throw updateError
      agendaData = updateData

      console.log('✅ Agenda atualizada no banco:', agendaData)
    } else {
      // 4b. Inserir novo compromisso
      const { data: insertData, error: insertError } = await supabase
        .from('agenda')
        .insert(dadosAgenda)
        .select()
        .single()

      if (insertError) throw insertError
      agendaData = insertData

      console.log('✅ Agenda criada no banco:', agendaData)
      
      // 4c. Criar alerta automático para nova agenda
      try {
        console.log('📅 Criando alerta para a nova agenda...')
        
        await alertaService.criarAlertaAgenda(
          agendaData, 
          { uuid: session.user.id, id: userData.id }, 
          categoriaEscolhida
        )
        
        console.log('✅ Alerta criado com sucesso para a agenda')
      } catch (alertaError) {
        console.error('❌ Erro ao criar alerta para agenda:', alertaError)
        // Não bloquear o salvamento se houver erro no alerta
      }
    }

    // 5. Emitir eventos antes de resetar campos
    emit('agenda-criada', {
      titulo: titulo.value,
      data: dataSelecionada.value,
      mensagem: modoEdicao.value ? 'Compromisso atualizado com sucesso!' : 'Compromisso marcado na agenda com sucesso!'
    })
    
    // 6. Resetar campos após sucesso
    resetarCampos()
    
    // 7. Mostrar sucesso e fechar
    mostrarAlertaSucesso(modoEdicao.value ? 'Compromisso atualizado com sucesso!' : 'Compromisso criado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao salvar agenda:', error)
    mostrarAlertaErro(error.message || (modoEdicao.value ? 'Erro ao atualizar compromisso. Tente novamente.' : 'Erro ao marcar na agenda. Tente novamente.'))
  } finally {
    loading.value = false
  }
}

const fecharModal = () => {
  resetarCampos()
  emit('close')
}

const handleClickOutside = (event) => {
  if (event.target.classList.contains('modal-overlay')) {
    fecharModal()
  }
}

// Função para carregar email do usuário
const carregarEmailUsuario = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.warn('⚠️ Sessão não encontrada para carregar email do usuário')
      return
    }

    const { data: userData, error: userError } = await supabase
      .from('usuario')
      .select('email')
      .eq('uuid', session.user.id)
      .single()

    if (userError) {
      console.error('❌ Erro ao carregar email do usuário:', userError)
      return
    }

    emailUsuario.value = userData.email || ''
    console.log('📧 Email do usuário carregado:', emailUsuario.value)
  } catch (error) {
    console.error('❌ Erro ao carregar email do usuário:', error)
  }
}

// Função para inicializar dados quando modal abrir
const inicializarDados = async () => {
  console.log('🚀 Inicializando dados da agenda...')
  
  try {
    // Teste de conexão primeiro
    await testarConexao()
    
    // Teste de autenticação
    console.log('🔍 Testando autenticação...')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError)
    } else if (!session?.user) {
      console.warn('⚠️ Usuário não autenticado')
    } else {
      console.log('✅ Usuário autenticado:', {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      })
    }
    
    // Teste direto das tabelas
    console.log('🔍 Testando acesso direto às tabelas...')
    
    // Teste categoria_agenda
    const { data: testeCategorias, error: erroCategorias } = await supabase
      .from('categoria_agenda')
      .select('id, nome')
      .limit(1)
    
    if (erroCategorias) {
      console.error('❌ Erro ao acessar categoria_agenda:', erroCategorias)
    } else {
      console.log('✅ Tabela categoria_agenda acessível, amostra:', testeCategorias)
    }
    
    // Teste clientes
    const { data: testeClientes, error: erroClientes } = await supabase
      .from('clientes')
      .select('id, nome')
      .limit(1)
    
    if (erroClientes) {
      console.error('❌ Erro ao acessar clientes:', erroClientes)
    } else {
      console.log('✅ Tabela clientes acessível, amostra:', testeClientes)
    }
    
    // Carregar dados apenas quando necessário
    console.log('⏳ Carregando dados em paralelo...')
    
    // Carregar categorias diretamente
    try {
      console.log('🔄 Carregando categorias...')
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categoria_agenda')
        .select('*')
        .order('nome')
      
      if (categoriasError) {
        console.error('❌ Erro ao carregar categorias:', categoriasError)
      } else {
        console.log('📊 Categorias carregadas:', categoriasData)
        categorias.value = categoriasData || []
        
        // Preparar dados para o dropdown
        categoriasDropdown.value = [
          { id: null, label: 'Selecione uma categoria', placeholder: true },
          ...(categoriasData || []).map(categoria => ({
            id: categoria.id,
            label: categoria.nome,
            icon: categoria.iconeColorido,
            iconeBranco: categoria.iconeBranco,
            cor: categoria.cor,
            categoria: categoria,
            placeholder: false
          }))
        ]
        
        console.log(`✅ ${categoriasData?.length || 0} categorias carregadas`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error)
    }
    
    // Carregar clientes diretamente
    try {
      console.log('🔄 Carregando clientes...')
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome, nome_fantasia, lista_emails')
        .order('nome')
      
      if (clientesError) {
        console.error('❌ Erro ao carregar clientes:', clientesError)
      } else {
        console.log('📊 Clientes carregados:', clientesData)
        clientesVinculados.value = (clientesData || []).map(cliente => ({
          ...cliente,
          nome_razao_social: cliente.nome || cliente.nome_fantasia || 'Cliente sem nome',
          lista_emails: cliente.lista_emails || []
        }))
        
        console.log(`✅ ${clientesData?.length || 0} clientes carregados`)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error)
    }
    
    // Carregar email do usuário
    await carregarEmailUsuario()
    
    // Definir data inicial se fornecida, senão usar data atual
    if (props.dataInicial) {
      dataSelecionada.value = props.dataInicial
      console.log('📅 Data inicial definida via props:', props.dataInicial)
    } else {
      const hoje = new Date()
      const ano = hoje.getFullYear()
      const mes = (hoje.getMonth() + 1).toString().padStart(2, '0')
      const dia = hoje.getDate().toString().padStart(2, '0')
      dataSelecionada.value = `${ano}-${mes}-${dia}`
      console.log('📅 Data inicial definida como hoje:', dataSelecionada.value)
    }
    
    console.log('✅ Dados da agenda carregados completamente')
    console.log('📋 Estado final das categorias:', categorias.value.length)
    console.log('👥 Estado final dos clientes:', clientesVinculados.value.length)
    
    // Se estiver em modo de edição, preencher formulário
    if (props.compromissoEdicao) {
      await preencherFormularioEdicao()
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar dados da agenda:', error)
    error.value = 'Erro ao carregar dados. Tente novamente.'
  }
}

// Função para preencher formulário com dados do compromisso em edição
const preencherFormularioEdicao = async () => {
  const compromisso = props.compromissoEdicao
  console.log('📝 Preenchendo formulário para edição:', compromisso)
  
  try {
    // Preencher campos básicos
    titulo.value = compromisso.titulo || ''
    linkReuniao.value = compromisso.link_reuniao || ''
    endereco.value = compromisso.endereco || ''
    notas.value = compromisso.notas || ''
    
    // Preencher data
    if (compromisso.inicio) {
      const dataInicio = new Date(compromisso.inicio)
      const ano = dataInicio.getFullYear()
      const mes = (dataInicio.getMonth() + 1).toString().padStart(2, '0')
      const dia = dataInicio.getDate().toString().padStart(2, '0')
      dataSelecionada.value = `${ano}-${mes}-${dia}`
      
      // Atualizar calendário para mostrar o mês correto
      mesSelecionado.value = dataInicio.getMonth()
      anoSelecionado.value = dataInicio.getFullYear()
    }
    
    // Preencher horários
    if (compromisso.inicio && !compromisso.dia_inteiro) {
      const dataInicio = new Date(compromisso.inicio)
      const horaInicioStr = dataInicio.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
      horaInicio.value = horaInicioStr
      
      if (compromisso.fim) {
        const dataFim = new Date(compromisso.fim)
        const horaFimStr = dataFim.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        horaFim.value = horaFimStr
      }
    }
    
    // Preencher categoria
    if (compromisso.categoria_id) {
      const categoria = categorias.value.find(cat => cat.id === compromisso.categoria_id)
      if (categoria) {
        categoriaSelecionada.value = categoria
        categoriaId.value = categoria.id
      }
    }
    
    // Preencher cliente
    if (compromisso.cliente_id) {
      const cliente = clientesVinculados.value.find(cli => cli.id === compromisso.cliente_id)
      if (cliente) {
        clienteSelecionado.value = cliente
        clienteId.value = cliente.id
        
        // Carregar emails do cliente
        await carregarEmailsCliente(cliente.id)
        
        // Carregar processos do cliente
        await carregarProcessosCliente(cliente.id)
        
        // Selecionar processo se existir
        if (compromisso.processo_id) {
          const processo = processos.value.find(proc => proc.id === compromisso.processo_id)
          if (processo) {
            processoSelecionado.value = processo
          }
        }
      }
    }
    
    // Preencher emails personalizados
    if (compromisso.emails && Array.isArray(compromisso.emails)) {
      // Filtrar emails que não são do cliente ou usuário
      const emailsDoCliente = emailsClienteSelecionado.value
      const emailsPersonalizadosArray = compromisso.emails.filter(email => 
        email !== emailUsuario.value && !emailsDoCliente.includes(email)
      )
      emailsPersonalizados.value = emailsPersonalizadosArray.join(', ')
    }
    
    console.log('✅ Formulário preenchido para edição')
    
  } catch (error) {
    console.error('❌ Erro ao preencher formulário:', error)
  }
}

// Função de teste simples
const testarConexao = async () => {
  console.log('🔧 Testando conexão com Supabase...')
  
  try {
    // Teste básico - pegar dados da tabela usuario
    const { data: testeUsuario, error: erroUsuario } = await supabase
      .from('usuario')
      .select('id, email')
      .limit(1)
    
    if (erroUsuario) {
      console.error('❌ Erro ao acessar tabela usuario:', erroUsuario)
    } else {
      console.log('✅ Tabela usuario acessível:', testeUsuario)
    }
    
    // Teste categoria_agenda sem filtros
    const { data: testeCat, error: erroCat } = await supabase
      .from('categoria_agenda')
      .select('*')
      .limit(5)
    
    if (erroCat) {
      console.error('❌ Erro categoria_agenda:', erroCat)
    } else {
      console.log('✅ Categorias encontradas:', testeCat)
    }
    
    // Teste clientes sem filtros
    const { data: testeCli, error: erroCli } = await supabase
      .from('clientes')
      .select('*')
      .limit(5)
    
    if (erroCli) {
      console.error('❌ Erro clientes:', erroCli)
    } else {
      console.log('✅ Clientes encontrados:', testeCli)
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Funções dos alertas
const mostrarAlertaSucesso = (mensagem) => {
  mensagemSucesso.value = mensagem
  mostrarSucesso.value = true
}

const mostrarAlertaErro = (mensagem) => {
  mensagemErro.value = mensagem
  mostrarErro.value = true
}

const fecharAlertaSucesso = () => {
  mostrarSucesso.value = false
  mensagemSucesso.value = ''
  // Fechar modal após sucesso
  emit('close')
}

const fecharAlertaErro = () => {
  mostrarErro.value = false
  mensagemErro.value = ''
}

// Lifecycle - apenas setup básico
onMounted(() => {
  console.log('🚀 marcar_agenda.vue montado! (sem carregar dados ainda)')
  console.log('🔧 Verificando configuração do Supabase:', {
    supabaseUrl: supabase.supabaseUrl,
    supabaseKey: supabase.supabaseKey ? 'Presente' : 'Ausente'
  })
})

// Watcher para debug da categoria
watch(() => categoriaSelecionada.value, (newCat, oldCat) => {
  console.log('👁️ Categoria mudou:', { 
    anterior: oldCat, 
    atual: newCat,
    temId: newCat?.id,
    temIconeBranco: newCat?.iconeBranco
  })
}, { deep: true })

// Watcher principal - carrega dados quando modal abre
watch(() => props.show, async (newShow, oldShow) => {
  console.log('👁️ Modal show mudou:', { anterior: oldShow, atual: newShow })
  
  if (newShow && !oldShow) {
    console.log('🎯 Modal da agenda aberto! Carregando dados...')
    await inicializarDados()
  }
  
  if (!newShow && oldShow) {
    console.log('�� Modal da agenda fechado')
  }
})
</script>

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
  z-index: 1010 !important;
}

.modal-overlay :deep(.dropdown-options) {
  z-index: 1010 !important;
}

.modal-overlay :deep(.dropdown-container) {
  z-index: 1005 !important;
}

/* Z-index específico para cada dropdown por ordem de prioridade */
.field-wrapper[style*="z-index: 1005"] :deep(.dropdown-options) {
  z-index: 1015 !important;
}

.field-wrapper[style*="z-index: 1004"] :deep(.dropdown-options) {
  z-index: 1014 !important;
}

.field-wrapper[style*="z-index: 1003"] :deep(.dropdown-options) {
  z-index: 1013 !important;
}

.field-wrapper[style*="z-index: 1002"] :deep(.dropdown-options) {
  z-index: 1012 !important;
}

.field-wrapper[style*="z-index: 1001"] :deep(.dropdown-options) {
  z-index: 1011 !important;
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
  flex: 1;
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
  z-index: 1010 !important;
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
  z-index: 1010 !important;
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

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 768px) {
  .modal-container {
    width: calc(100% - 20px);
    margin: 10px;
    max-height: 95vh;
    border-radius: 16px;
  }
  
  .header-bar {
    height: auto;
    min-height: 40px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .modal-title {
    font-size: 13px;
    line-height: 1.3;
    text-align: center;
    flex: 1;
  }
  
  .close-button {
    font-size: 18px;
    position: absolute;
    right: 12px;
  }
  
  .close-button-placeholder {
    display: none;
  }
  
  .modal-content {
    padding: 16px;
  }
  
  .content-layout {
    flex-direction: column;
    gap: 16px;
  }
  
  /* Calendário mobile */
  .calendar-section {
    width: 100%;
    order: 2;
    background: #f8fafc;
    border-radius: 12px;
    padding: 12px;
  }
  
  .calendar-header {
    margin-bottom: 12px;
  }
  
  .month-title {
    font-size: 13px;
  }
  
  .nav-button {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }
  
  .weekday {
    font-size: 11px;
    padding: 3px;
  }
  
  .day {
    height: 24px;
    font-size: 11px;
  }
  
  /* Formulário mobile */
  .form-section {
    order: 1;
  }
  
  .content-title {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 13px;
    margin: 16px 0 8px 0;
  }
  
  .field-wrapper {
    margin-bottom: 12px;
  }
  
  .title-category-row {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .fields-row {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .time-row {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  /* Inputs e dropdowns mobile */
  .input-icon {
    left: 10px;
    width: 14px;
    height: 40px;
  }
  
  .input-with-icon :deep(.input-field) {
    padding-left: 36px;
    padding-right: 12px;
    height: 40px;
    font-size: 13px;
  }
  
  .dropdown-with-padding :deep(.dropdown-header) {
    padding-left: 36px !important;
    padding-right: 12px !important;
    height: 40px;
    font-size: 13px;
  }
  
  .select-field {
    height: 40px;
    padding-left: 36px;
    font-size: 13px;
  }
  
  .textarea-field {
    min-height: 70px;
    padding: 10px 12px;
    font-size: 13px;
  }
  
  /* Seção de emails mobile */
  .emails-section {
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 8px;
    background-color: #f5f5f5;
  }
  
  .emails-section .emails-label {
    font-size: 13px;
    margin-bottom: 8px;
    font-weight: bold !important;
    color: #0468FA !important;
  }
  
  .email-item {
    padding: 6px 8px;
    font-size: 12px;
  }
  
  .email-text {
    font-size: 12px;
  }
  
  .email-badge {
    font-size: 10px;
    padding: 1px 4px;
  }
  
  .badge-user {
    margin-right: 12px;
  }
  
  /* Ações mobile */
  .actions-section {
    flex-direction: column;
    gap: 8px;
    margin-top: 20px;
  }
  
  .actions-section :deep(.button) {
    width: 100%;
    height: 44px;
    font-size: 14px;
    font-weight: 600;
  }
  
  /* Mensagem de erro mobile */
  .error-message {
    padding: 10px;
    font-size: 13px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
  
  /* Help text mobile */
  .input-help-text {
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.3;
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .modal-container {
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 12px;
  }
  
  .header-bar {
    padding: 6px 12px;
    min-height: 36px;
  }
  
  .modal-title {
    font-size: 12px;
  }
  
  .close-button {
    font-size: 16px;
    right: 8px;
  }
  
  .modal-content {
    padding: 12px;
  }
  
  .content-title {
    font-size: 15px;
    margin-bottom: 10px;
  }
  
  .calendar-section {
    padding: 10px;
  }
  
  .month-title {
    font-size: 12px;
  }
  
  .nav-button {
    width: 18px;
    height: 18px;
    font-size: 14px;
  }
  
  .weekday {
    font-size: 10px;
    padding: 2px;
  }
  
  .day {
    height: 22px;
    font-size: 10px;
  }
  
  .input-with-icon :deep(.input-field) {
    height: 36px;
    font-size: 12px;
    padding-left: 32px;
  }
  
  .dropdown-with-padding :deep(.dropdown-header) {
    height: 36px;
    font-size: 12px;
    padding-left: 32px !important;
  }
  
  .input-icon {
    left: 8px;
    width: 12px;
    height: 36px;
  }
  
  .select-field {
    height: 36px;
    padding-left: 32px;
    font-size: 12px;
  }
  
  .textarea-field {
    min-height: 60px;
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .actions-section :deep(.button) {
    height: 40px;
    font-size: 13px;
  }
  
  .email-item {
    padding: 5px 6px;
    font-size: 11px;
  }
  
  .email-text {
    font-size: 11px;
  }
}

/* Mobile landscape */
@media (max-width: 768px) and (orientation: landscape) and (max-height: 500px) {
  .modal-container {
    max-height: 98vh;
    width: calc(100% - 32px);
    margin: 1vh 16px;
  }
  
  .content-layout {
    flex-direction: row;
    gap: 16px;
  }
  
  .calendar-section {
    width: 280px;
    order: 1;
    flex-shrink: 0;
  }
  
  .form-section {
    order: 2;
    flex: 1;
  }
  
  .actions-section {
    flex-direction: row;
    gap: 12px;
  }
  
  .actions-section :deep(.button) {
    width: auto;
    flex: 1;
    height: 40px;
  }
  
  .title-category-row {
    flex-direction: row;
    gap: 12px;
  }
  
  .fields-row {
    flex-direction: row;
    gap: 12px;
  }
  
  .time-row {
    flex-direction: row;
    gap: 12px;
  }
}
</style> 