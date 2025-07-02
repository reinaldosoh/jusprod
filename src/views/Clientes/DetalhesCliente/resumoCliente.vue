<template>
  <div class="resumo-cliente-container">
    <!-- Coluna da Esquerda - Dados do Cliente -->
    <div class="dados-cliente">
      <!-- Avatar e Nome -->
      <div class="cliente-header">
        <div class="avatar" :class="getStatusClass">
          {{ iniciais }}
        </div>
        <h2 class="cliente-nome">{{ cliente.nome || 'Nome não informado' }}</h2>
        <p class="cliente-desde">Cliente desde {{ dataFormatada || 'Data não disponível' }}</p>
      </div>

      <!-- Informações Pessoais -->
      <div class="informacoes-pessoais">
        <div class="info-item">
          <span class="info-label">Nome:</span>
          <span class="info-value">{{ cliente.nome || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">CPF:</span>
          <span class="info-value">{{ formatarCPF(cliente.cpf) || cliente.cpf || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">CNPJ:</span>
          <span class="info-value">{{ formatarCNPJ(cliente.cnpj) || cliente.cnpj || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">RG:</span>
          <span class="info-value">{{ cliente.rg || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">PIS/PASEP:</span>
          <span class="info-value">{{ cliente.pis_pasep || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">CTPS:</span>
          <span class="info-value">{{ cliente.ctps || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">INSS:</span>
          <span class="info-value">{{ cliente.inss || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Nascimento:</span>
          <span class="info-value">{{ formatarData(cliente.nascimento) || cliente.nascimento || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Sexo:</span>
          <span class="info-value">{{ cliente.sexo || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Nacionalidade:</span>
          <span class="info-value">{{ cliente.nacionalidade || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Estado civil:</span>
          <span class="info-value">{{ cliente.estado_civil || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Profissão:</span>
          <span class="info-value">{{ cliente.profissao || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Nome da mãe:</span>
          <span class="info-value">{{ cliente.nome_mae || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Nome do pai:</span>
          <span class="info-value">{{ cliente.nome_pai || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Endereço:</span>
          <span class="info-value">{{ formatarEndereco(cliente) || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Telefone:</span>
          <span class="info-value">{{ cliente.telefone || '-' }}</span>
        </div>
        
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ cliente.email || '-' }}</span>
        </div>
      </div>

      <!-- Observações -->
      <div class="observacoes-section">
        <h3 class="section-title">Observações:</h3>
        <p class="observacoes-text">{{ cliente.observacoes || 'Nenhuma observação cadastrada para este cliente.' }}</p>
      </div>
    </div>

    <!-- Coluna da Direita - Lista de Processos -->
    <div class="processos-section">
      <div class="processos-header">
        <h3 class="processos-title">Processos</h3>
        <button class="novo-processo-btn" @click="abrirNovoProcesso">
          <div class="plus-icon-container">
            <svg class="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span class="button-text">Novo processo</span>
        </button>
      </div>

      <!-- Lista de Processos -->
      <div class="processos-lista">
        <div 
          v-for="processo in processos" 
          :key="processo.id"
          class="processo-item"
        >
          <div class="processo-info">
            <div class="processo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div class="processo-dados">
              <h4 class="processo-nome">{{ processo.nome || 'Insira o nome' }}</h4>
              <p class="processo-cnj">{{ formatarCNJ(processo.cnpj) }}</p>
            </div>
          </div>
          
          <button class="editar-processo-btn" @click="editarProcesso(processo)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="1.5">
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Novo Processo -->
    <NovoProcesso 
      :visible="showNovoProcesso"
      @fechar="fecharNovoProcesso"
      @buscar="buscarNovoProcesso"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../../lib/supabase'
import NovoProcesso from '../../../components/UI/novo_processo.vue'

const props = defineProps({
  cliente: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['novo-processo', 'editar-processo'])

// Estados
const processos = ref([])
const showNovoProcesso = ref(false)
const loading = ref(false)

// Computed - Iniciais do nome do cliente
const iniciais = computed(() => {
  if (!props.cliente || !props.cliente.nome) return ''
  
  const nome = props.cliente.nome || ''
  const partes = nome.split(' ')
  
  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase()
  }
  
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
})

// Computed - Data formatada de criação do cliente
const dataFormatada = computed(() => {
  if (!props.cliente || !props.cliente.created_at) {
    console.log('⚠️ Dados de data não disponíveis:', {
      cliente: !!props.cliente,
      created_at: props.cliente?.created_at
    })
    return ''
  }
  
  try {
    const data = new Date(props.cliente.created_at)
    if (isNaN(data.getTime())) {
      console.log('⚠️ Data inválida:', props.cliente.created_at)
      return ''
    }
    
    const dia = data.getDate().toString().padStart(2, '0')
    const mes = (data.getMonth() + 1).toString().padStart(2, '0')
    const ano = data.getFullYear()
    
    return `${dia}/${mes}/${ano}`
  } catch (error) {
    console.error('❌ Erro ao formatar data:', error)
    return ''
  }
})

// Computed - Classe de status do avatar
const getStatusClass = computed(() => {
  if (!props.cliente) return ''
  if (props.cliente.cliente_novo) return 'status-novo'
  if (props.cliente.cliente_andamento) return 'status-andamento'
  if (props.cliente.cliente_finalizado) return 'status-finalizado'
  return ''
})

// Funções de formatação
const formatarCPF = (cpf) => {
  if (!cpf) return ''
  const numeros = cpf.replace(/\D/g, '')
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const formatarData = (data) => {
  if (!data) return ''
  const dataObj = new Date(data)
  return dataObj.toLocaleDateString('pt-BR')
}

const formatarCNJ = (cnj) => {
  if (!cnj) return ''
  // Aplicar máscara do CNJ: 0000000-00.0000.0.00.0000
  const numeros = cnj.replace(/\D/g, '')
  if (numeros.length === 20) {
    return numeros.replace(/(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/, '$1-$2.$3.$4.$5.$6')
  }
  return cnj
}

const formatarCNPJ = (cnpj) => {
  if (!cnpj) return ''
  const numeros = cnpj.replace(/\D/g, '')
  if (numeros.length === 14) {
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return cnpj
}

const formatarEndereco = (cliente) => {
  if (!cliente) return ''
  
  const partes = []
  if (cliente.endereco) partes.push(cliente.endereco)
  if (cliente.numero) partes.push(cliente.numero)
  if (cliente.bairro) partes.push(cliente.bairro)
  if (cliente.cidade) partes.push(cliente.cidade)
  if (cliente.estado) partes.push(cliente.estado)
  if (cliente.cep) partes.push(cliente.cep)
  
  return partes.join(', ')
}

// Funções de ação
const abrirNovoProcesso = () => {
  showNovoProcesso.value = true
}

const fecharNovoProcesso = () => {
  showNovoProcesso.value = false
}

const buscarNovoProcesso = (numeroProcesso) => {
  console.log('Buscando novo processo:', numeroProcesso)
  emit('novo-processo', numeroProcesso)
  fecharNovoProcesso()
}

const editarProcesso = (processo) => {
  console.log('Editando processo:', processo)
  emit('editar-processo', processo)
}

// Carregar processos do cliente
const carregarProcessos = async () => {
  if (!props.cliente || !props.cliente.id) {
    console.warn('Cliente não disponível para carregar processos')
    return
  }

  loading.value = true
  
  try {
    // Obter usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Erro ao obter usuário autenticado:', authError)
      return
    }

    // Buscar processos vinculados ao cliente
    const { data: processosVinculados, error: processosError } = await supabase
      .from('processo_cliente')
      .select(`
        processo_id,
        processos (
          id,
          cnpj,
          nome,
          autor,
          reu,
          created_at
        )
      `)
      .eq('cliente_id', props.cliente.id)
    
    if (processosError) {
      console.error('Erro ao carregar processos:', processosError)
      return
    }
    
    // Mapear os dados dos processos
    processos.value = processosVinculados?.map(vinculo => vinculo.processos) || []
    console.log('Processos carregados:', processos.value.length)
    
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
  } finally {
    loading.value = false
  }
}

// Carregar dados ao montar o componente e quando cliente mudar
onMounted(() => {
  console.log('🔍 ResumoCliente mounted - dados do cliente:', props.cliente)
  if (props.cliente && props.cliente.id) {
    carregarProcessos()
  }
})

// Observar mudanças no cliente para recarregar processos
watch(() => props.cliente, (newCliente) => {
  console.log('🔄 Cliente mudou:', newCliente)
  if (newCliente && newCliente.id) {
    carregarProcessos()
  }
}, { immediate: false })
</script>

<style scoped>
.resumo-cliente-container {
  width: 855px;
  height: 509px;
  background: #FFFFFF;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  margin: 0;
}

/* Coluna da Esquerda - Dados do Cliente */
.dados-cliente {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  border-right: 1px solid #e5e7eb;
}

.cliente-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 12px;
}

.status-novo {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-andamento {
  background-color: #fef3c7;
  color: #92400e;
}

.status-finalizado {
  background-color: #dcfce7;
  color: #166534;
}

.cliente-nome {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.cliente-desde {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.informacoes-pessoais {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
}

.info-value {
  font-size: 14px;
  color: #111827;
  text-align: right;
  flex: 1;
}

.observacoes-section {
  margin-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.observacoes-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
}

/* Coluna da Direita - Processos */
.processos-section {
  width: 320px;
  padding: 24px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.processos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.processos-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.novo-processo-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.novo-processo-btn:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.plus-icon-container {
  width: 16px;
  height: 16px;
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plus-icon {
  width: 10px;
  height: 10px;
  stroke-width: 2.5;
  color: #3b82f6;
}

.button-text {
  font-size: 12px;
  font-weight: 500;
  color: #3b82f6;
}

.processos-lista {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.processo-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.processo-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.processo-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.processo-icon {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.processo-icon svg {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.processo-dados {
  flex: 1;
  min-width: 0;
}

.processo-nome {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.processo-cnj {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editar-processo-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.editar-processo-btn:hover {
  background-color: #f3f4f6;
}

/* Responsivo */
@media (max-width: 900px) {
  .resumo-cliente-container {
    width: 100%;
    height: auto;
    min-height: 509px;
    flex-direction: column;
    margin: 0;
  }
  
  .dados-cliente {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .processos-section {
    width: 100%;
    max-height: 300px;
  }
}

@media (max-width: 640px) {
  .resumo-cliente-container {
    width: 100%;
    max-width: 855px;
    height: auto;
    min-height: 509px;
    border-radius: 0;
    margin: 0;
  }
  
  .dados-cliente,
  .processos-section {
    padding: 16px;
  }
  
  .cliente-header {
    margin-bottom: 20px;
  }
  
  .avatar {
    width: 64px;
    height: 64px;
    font-size: 20px;
  }
  
  .processos-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .novo-processo-btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 