<template>
  <div class="tabs-container">
    <!-- Seletor de Processo -->
    <div class="processo-selector">
      <div class="processo-header">
        <h2 class="processo-title">Trabalhando no processo:</h2>
        <div class="dropdown-processo">
          <button class="dropdown-button" @click="toggleDropdown">
          <Scale class="processo-icon" size="18" />
          <span class="processo-nome">{{ processoSelecionado ? (processoSelecionado.nome || processoSelecionado.cnpj) : 'Selecione o processo' }}</span>
          <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="#0468FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="dropdown-menu" v-if="dropdownAberto">
          <div class="dropdown-header">Selecione o processo</div>
          <div
            v-for="processo in processos"
            :key="processo.id"
            class="dropdown-item"
            :class="{ 'dropdown-item--active': processo.id === processoSelecionado?.id }"
            :style="{
              backgroundColor: processo.id === processoSelecionado?.id ? '#0468FA' : '',
              color: processo.id === processoSelecionado?.id ? 'white' : '#101828'
            }"
            @click="selecionarProcesso(processo)"
          >
            <Scale 
              class="processo-icon" 
              size="18" 
              :color="processo.id === processoSelecionado?.id ? 'white' : 'currentColor'" 
            />
            <span 
              class="processo-nome"
              :style="{ color: processo.id === processoSelecionado?.id ? 'white' : '#101828' }"
            >{{ processo.nome || processo.cnpj }}</span>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <a 
        href="javascript:void(0)" 
        class="tab-link" 
        :class="{ active: tabAtiva === 'intimacoes' }"
        @click.prevent="tabAtiva = 'intimacoes'"
      >
        Intimações
        <span v-if="contadorIntimacoes > 0" class="contador">{{ contadorIntimacoes }}</span>
      </a>
      
      <a 
        href="javascript:void(0)" 
        class="tab-link" 
        :class="{ active: tabAtiva === 'documentos' }"
        @click.prevent="tabAtiva = 'documentos'"
      >
        Documentos
      </a>
      
      <a 
        href="javascript:void(0)" 
        class="tab-link" 
        :class="{ active: tabAtiva === 'lembretes' }"
        @click.prevent="tabAtiva = 'lembretes'"
      >
        Lembretes
      </a>
      
      <a 
        href="javascript:void(0)" 
        class="tab-link" 
        :class="{ active: tabAtiva === 'contratos' }"
        @click.prevent="tabAtiva = 'contratos'"
      >
        Contratos
      </a>
      
      <a 
        href="javascript:void(0)" 
        class="tab-link" 
        :class="{ active: tabAtiva === 'relatorios' }"
        @click.prevent="tabAtiva = 'relatorios'"
      >
        Relatórios
      </a>
    </div>

    <!-- Conteúdo das Tabs -->
    <div class="tab-content">
      <div v-if="tabAtiva === 'intimacoes'" class="tab-panel">
        <ListaIntimacoes :clienteId="clienteId" :processoId="processoSelecionado?.id" />
      </div>
      
      <div v-if="tabAtiva === 'documentos'" class="tab-panel">
        <ListaDocumentosCliente :clienteId="clienteId" :processoId="processoSelecionado?.id" />
      </div>
      
      <div v-if="tabAtiva === 'lembretes'" class="tab-panel">
        <div class="empty-state">
          Lembretes em breve.
        </div>
      </div>
      
      <div v-if="tabAtiva === 'contratos'" class="tab-panel">
        <div class="empty-state">
          Contratos em breve.
        </div>
      </div>
      
      <div v-if="tabAtiva === 'relatorios'" class="tab-panel">
        <div class="empty-state">
          Relatórios em breve.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../../../lib/supabase'
import { Scale } from 'lucide-vue-next'
import ListaIntimacoes from '../../Intimacoes/listaintimacoes.vue'
import ListaDocumentosCliente from '../../Documentos/listaDocumentosCliente.vue'

const props = defineProps({
  cliente: Object
})

const emit = defineEmits(['processo-selecionado'])

const route = useRoute()
const clienteId = computed(() => route.params.id)

const processos = ref([])
const processoSelecionado = ref(null)
const dropdownAberto = ref(false)
const tabAtiva = ref('intimacoes')
const intimacoes = ref([])
const loadingIntimacoes = ref(false)
const intimacoesExpandidas = ref([])

// Contador de intimações para o processo selecionado
const contadorIntimacoes = computed(() => {
  return intimacoes.value.length
})

// Carregar processos do cliente usando a tabela processo_cliente
const carregarProcessos = async () => {
  try {
    // Busca os IDs de processos vinculados ao cliente na tabela de relacionamento
    const { data: relacionamentos, error: erroRelacionamentos } = await supabase
      .from('processo_cliente')
      .select('processo_id')
      .eq('cliente_id', clienteId.value)
    
    if (erroRelacionamentos) throw erroRelacionamentos
    
    if (relacionamentos && relacionamentos.length > 0) {
      // Extrai os IDs de processos do resultado
      const processosIds = relacionamentos.map(rel => rel.processo_id)
      
      // Busca os detalhes dos processos usando os IDs encontrados
      const { data: dadosProcessos, error: erroProcessos } = await supabase
        .from('processos')
        .select('*')
        .in('id', processosIds)
        .order('created_at', { ascending: false })
      
      if (erroProcessos) throw erroProcessos
      
      processos.value = dadosProcessos || []
    } else {
      processos.value = []
    }
    
    // Selecionar o primeiro processo por padrão se existir algum
    if (processos.value.length > 0) {
      processoSelecionado.value = processos.value[0]
      carregarIntimacoes()
      // Emitir evento para o componente pai
      emit('processo-selecionado', processos.value[0])
    }
  } catch (error) {
    console.error('Erro ao carregar processos:', error)
  }
}

// Carregar intimações do processo selecionado
const carregarIntimacoes = async () => {
  if (!processoSelecionado.value) return
  
  loadingIntimacoes.value = true
  
  try {
    const { data, error } = await supabase
      .from('intimacoes')
      .select('*')
      .eq('processo_id', processoSelecionado.value.id)
      .order('data', { ascending: false })
    
    if (error) throw error
    
    intimacoes.value = data || []
  } catch (error) {
    console.error('Erro ao carregar intimações:', error)
  } finally {
    loadingIntimacoes.value = false
  }
}

// Alternar dropdown
const toggleDropdown = () => {
  dropdownAberto.value = !dropdownAberto.value
}

// Selecionar processo
const selecionarProcesso = (processo) => {
  processoSelecionado.value = processo
  dropdownAberto.value = false
  carregarIntimacoes()
  // Emitir evento para o componente pai
  emit('processo-selecionado', processo)
}

// Fechar dropdown ao clicar fora
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.dropdown-processo')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownAberto.value = false
  }
}

// Função para formatar datas
const formatarData = (data) => {
  if (!data) return 'N/A';
  try {
    return new Date(data).toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

// Função para expandir/recolher detalhes da intimação
const toggleExpandir = (intimacaoId) => {
  const index = intimacoesExpandidas.value.indexOf(intimacaoId);
  if (index === -1) {
    intimacoesExpandidas.value.push(intimacaoId);
  } else {
    intimacoesExpandidas.value.splice(index, 1);
  }
}

// Função para marcar intimação como visualizada
const marcarComoVisualizada = async (intimacaoId) => {
  try {
    const { error } = await supabase
      .from('intimacoes')
      .update({ visualizado: true })
      .eq('id', intimacaoId);
      
    if (error) throw error;
    
    // Atualiza a lista localmente
    const intimacao = intimacoes.value.find(i => i.id === intimacaoId);
    if (intimacao) {
      intimacao.visualizado = true;
    }
    
  } catch (error) {
    console.error('Erro ao marcar intimação como visualizada:', error);
  }
}

// Observar mudanças na tab ativa
watch(tabAtiva, (novaTab) => {
  if (novaTab === 'intimacoes' && processoSelecionado.value) {
    carregarIntimacoes()
  }
})

onMounted(() => {
  carregarProcessos()
  document.addEventListener('click', handleClickOutside)
})

// Remover event listener ao destruir o componente
onMounted(() => {
  return () => {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.tabs-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

/* Seletor de Processo */
.processo-selector {
  margin-bottom: 24px;
}

.processo-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.processo-title {
  font-size: 24px;
  font-weight: 600;
  color: #0468FA;
  margin: 0;
  white-space: nowrap;
}

.dropdown-processo {
  position: relative;
  width: 100%;
  flex: 1;
}

.dropdown-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s;
}

.dropdown-button:hover {
  border-color: #0468FA;
}

.processo-icon {
  margin-right: 8px;
  color: #0468FA;
  display: flex;
  align-items: center;
}

.processo-nome {
  font-weight: 500;
  margin-right: 4px;
}

.processo-numero {
  color: #64748b;
}

.dropdown-arrow {
  margin-left: auto;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-header {
  padding: 12px 16px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover:not(.dropdown-item--active) {
  background-color: #0468FA;
  color: white;
}

.dropdown-item:hover:not(.dropdown-item--active) .processo-nome,
.dropdown-item:hover:not(.dropdown-item--active) .processo-icon {
  color: white;
}

.dropdown-item--active {
  background-color: #0468FA;
  color: white;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background-color: #FFFFFF;
  border-radius: 8px 8px 0 0;
  margin-bottom: 16px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
}

.tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tab-link {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-link.active {
  color: #0468FA;
  border-bottom-color: #0468FA;
  font-weight: 600;
}

.contador {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

/* Conteúdo das Tabs */
.tab-content {
  padding: 16px 0;
}

.tab-panel {
  min-height: 200px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64748b;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64748b;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 8px;
}

/* Estilos para a lista de intimações */
.intimacoes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.intimacao-card {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.intimacao-card:hover {
  border-color: #0468FA;
  box-shadow: 0 2px 6px rgba(4, 104, 250, 0.15);
}

.intimacao-card.expanded {
  box-shadow: 0 4px 8px rgba(4, 104, 250, 0.15);
  border-color: #0468FA;
}

.intimacao-icon {
  width: 42px;
  height: 42px;
  border-radius: 6px;
  background-color: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mail-icon {
  width: 24px;
  height: 24px;
  stroke-width: 1.5;
}

.intimacao-info {
  flex: 1;
  min-width: 0;
}

.intimacao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.intimacao-processo {
  font-size: 16px;
  font-weight: 600;
  color: #1E293B;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intimacao-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #E2E8F0;
  color: #64748B;
}

.intimacao-status.nova {
  background-color: #FEE2E2;
  color: #EF4444;
}

.intimacao-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #475569;
}

.intimacao-details p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #64748B;
}

.intimacao-snippet {
  margin-top: 8px;
  font-size: 14px;
  color: #475569;
  line-height: 1.4;
}

.intimacao-detalhes-expandidos {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detalhes-linha {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #475569;
}

.detalhes-conteudo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.conteudo-html {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  max-height: 300px;
  overflow-y: auto;
}

.intimacao-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-icon:hover {
  background-color: #0468FA;
  border-color: #0468FA;
  color: white;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .tabs {
    padding-bottom: 4px;
  }
  
  .tab-button {
    padding: 10px 12px;
    font-size: 14px;
  }
}
</style>
