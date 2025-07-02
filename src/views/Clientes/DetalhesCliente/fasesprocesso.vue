<template>
  <div class="fases-processo-wrapper">
    <h3 class="titulo-secao">Fases do processo</h3>
    
    <!-- Lista de Fases Existentes -->
    <div v-if="fases.length > 0" class="fases-lista-card">
      <div class="fases-lista">
        <div 
          v-for="(fase, index) in fasesOrdenadas" 
          :key="fase.id"
          class="fase-item"
          :class="{ 'fase-ativa': fase.numero_fase === 1 }"
        >
          <!-- Ícone de Check -->
          <div class="fase-check">
            <img 
              :src="fase.numero_fase === 1 ? '/images/fase01.svg' : '/images/novafase.svg'" 
              alt="Check" 
              width="32" 
              height="32"
            >
          </div>
          

          
          <!-- Conteúdo da Fase -->
          <div class="fase-conteudo">
            <div class="fase-header">
              <div class="fase-titulo-linha">
                <span class="fase-numero">Fase {{ fase.numero_fase }} - {{ fase.titulo }}</span>
                <span v-if="fase.data_inicio && fase.data_final" class="fase-datas">
                  - Início: {{ formatarData(fase.data_inicio) }} - Final: {{ formatarData(fase.data_final) }}
                </span>
              </div>
              <div class="fase-acoes">
                <button class="btn-acao" @click="editarFase(fase)" title="Editar">
                  <img src="/images/editfase.svg" alt="Editar" width="20" height="20">
                </button>
                <button class="btn-acao" @click="compartilharFase(fase)" title="Compartilhar">
                  <img src="/images/enviarfase.svg" alt="Compartilhar" width="20" height="20">
                </button>
              </div>
            </div>
            <p class="fase-descricao" v-if="fase.descricao">{{ fase.descricao }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card Vazio (quando não há fases) -->
    <div v-else class="fases-processo-card">
      <div class="conteudo-centro">
        <div class="icone-check">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <div class="linha-vertical"></div>
        
        <p class="descricao">
          Organize esse processo em fases para facilitar a visualização. Você pode compartilhar essas fases com o(a) cliente.
        </p>
        
        <button 
          class="btn-organizar" 
          @click="abrirModalFases"
          :disabled="!processoSelecionado"
        >
          {{ fases.length > 0 ? 'Editar fases' : 'Organizar em fases' }}
        </button>
      </div>
    </div>

    <!-- Modal de criar fases -->
    <CriarFaseProcesso
      v-if="showModalFases"
      :processo-id="processoSelecionado"
      :fases-existentes="fases"
      @close="fecharModalFases"
      @fases-salvas="handleFasesSalvas"
    />

    <!-- Modal de enviar fase -->
    <EnviarFase
      v-if="showModalEnviarFase"
      :show="showModalEnviarFase"
      :fase-atual="faseParaEnviar"
      :todas-fases="fases"
      :cliente-id="clienteId"
      :processo-id="processoSelecionado"
      @close="fecharModalEnviarFase"
      @fase-enviada="handleFaseEnviada"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { supabase } from '../../../lib/supabase'
import CriarFaseProcesso from './criar_fase_processo.vue'
import EnviarFase from './enviarFase.vue'

// Props
const props = defineProps({
  processoId: {
    type: Number,
    default: null
  },
  clienteId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['organizar-fases', 'fases-criadas'])

// Estados do componente
const showModalFases = ref(false)
const showModalEnviarFase = ref(false)
const processoSelecionado = ref(props.processoId)
const fases = ref([])
const loading = ref(false)
const faseParaEnviar = ref(null)

// Computed para ordenar fases (ordem decrescente do número da fase)
const fasesOrdenadas = computed(() => {
  return [...fases.value].sort((a, b) => b.numero_fase - a.numero_fase)
})

// Carregar fases do processo
const carregarFases = async () => {
  if (!processoSelecionado.value) {
    fases.value = []
    return
  }

  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('fases_processo')
      .select('*')
      .eq('processo_id', processoSelecionado.value)
      .order('numero_fase', { ascending: true })
    
    if (error) {
      console.error('Erro ao carregar fases:', error)
      fases.value = []
      return
    }
    
    fases.value = data || []
    console.log('Fases carregadas:', fases.value.length)
    
  } catch (error) {
    console.error('Erro ao carregar fases:', error)
    fases.value = []
  } finally {
    loading.value = false
  }
}

// Observar mudanças no processoId
watch(() => props.processoId, (newProcessoId) => {
  processoSelecionado.value = newProcessoId
  carregarFases()
})

// Carregar fases no mount se já tiver processo selecionado
onMounted(() => {
  if (processoSelecionado.value) {
    carregarFases()
  }
})

// Funções para controlar o modal
const abrirModalFases = () => {
  if (!processoSelecionado.value) {
    alert('Por favor, selecione um processo primeiro.')
    return
  }
  showModalFases.value = true
}

const fecharModalFases = () => {
  showModalFases.value = false
}

const handleFasesSalvas = (dadosFases) => {
  console.log('Fases salvas:', dadosFases)
  
  // Recarregar lista de fases
  carregarFases()
  
  // Emitir evento para o componente pai
  emit('fases-criadas', dadosFases)
  
  // Fechar modal
  fecharModalFases()
}

// Função para formatar datas
const formatarData = (data) => {
  if (!data) return ''
  try {
    return new Date(data).toLocaleDateString('pt-BR')
  } catch (error) {
    return ''
  }
}

// Funções para ações das fases
const editarFase = (fase) => {
  console.log('Editar fase:', fase)
  // Abrir modal com todas as fases para edição
  abrirModalFases()
}

const compartilharFase = (fase) => {
  console.log('Compartilhar fase:', fase)
  faseParaEnviar.value = fase
  showModalEnviarFase.value = true
}

// Controle do modal de enviar fase
const fecharModalEnviarFase = () => {
  showModalEnviarFase.value = false
  faseParaEnviar.value = null
}

const handleFaseEnviada = (dadosFase) => {
  console.log('Fase enviada:', dadosFase)
  
  // Mostrar feedback de sucesso
  const totalEmails = dadosFase.totalEmails || 1
  console.log(`✅ Fase "${dadosFase.fase?.titulo}" enviada com sucesso para ${totalEmails} email(s)`)
  
  fecharModalEnviarFase()
}
</script>

<style scoped>
.fases-processo-wrapper {
  width: 380px;
  margin-top: 24px;
}

.titulo-secao {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
  text-align: left;
}

.fases-processo-card {
  min-height: 270px;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  padding: 24px 20px 32px 20px;
  display: flex;
  flex-direction: column;
}

.conteudo-centro {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 10px 0;
}

.icone-check {
  width: 48px;
  height: 48px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.linha-vertical {
  width: 4px;
  height: 30px;
  background: #2563eb;
  border-radius: 2px;
}

.descricao {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  text-align: center;
  max-width: 320px;
}

.btn-organizar {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}

.btn-organizar:hover {
  background: #1d4ed8;
}

.btn-organizar:active {
  background: #1e40af;
}

.btn-organizar:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-organizar:disabled:hover {
  background: #9CA3AF;
}

/* Lista de Fases */
.fases-lista-card {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
  padding: 20px;
}



.fases-lista {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.fase-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
}

.fase-item:last-child {
  padding-bottom: 0;
}

.fase-check {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16px;
  position: relative;
  z-index: 2;
}



.fase-conteudo {
  flex: 1;
  min-width: 0;
}

.fase-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.fase-titulo-linha {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  line-height: 1.4;
}

.fase-numero {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.fase-item.fase-ativa .fase-numero {
  color: #2563eb;
}

.fase-datas {
  font-size: 12px;
  font-weight: 400;
  color: #6B7280;
}

.fase-descricao {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
}

.fase-acoes {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.btn-acao {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-acao:hover {
  background: #F3F4F6;
}

.btn-acao:active {
  background: #E5E7EB;
}

/* Responsividade para telas menores */
@media (max-width: 480px) {
  .fase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  

  
  .fase-datas {
    display: block;
    margin-left: 0;
    margin-top: 2px;
  }
}

</style> 