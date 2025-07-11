<template>
  <div class="ultimas-intimacoes-container">
    <div class="header-section">
      <h2 class="titulo-secao">Últimas intimações</h2>
    </div>

    <!-- Lista de intimações -->
    <div class="intimacoes-container">
      <div v-if="carregando" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Carregando intimações...</span>
      </div>

      <div v-else-if="intimacoes.length === 0" class="empty-state">
        <img src="/images/empty_agenda.png" alt="Nenhuma intimação encontrada" class="empty-image" />
        <p class="empty-text">Nenhuma intimação encontrada</p>
      </div>

      <div v-else class="intimacoes-list">
        <div 
          v-for="intimacao in intimacoes" 
          :key="intimacao.id"
          :class="['intimacao-card', {'visualizado': intimacao.visualizado, 'nao-visualizado': !intimacao.visualizado}]"
          @click="verIntimacao(intimacao.cnj)"
        >
          <!-- Barra lateral que indica status de visualização -->
          <div class="status-bar"></div>
          
          <div class="card-content">
            <div class="processo-header">
              <h3 class="processo-titulo">Processo: {{ formatarCNJ(intimacao.cnj) }}</h3>
            </div>
            
            <div class="processo-details">
              <div class="detail-row">
                <span class="detail-label">Reclamante:</span>
                <span class="detail-value">{{ truncateText(intimacao.autor, 25) }}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Reclamado:</span>
                <span class="detail-value">{{ truncateText(intimacao.reu, 25) }}</span>
              </div>
              
              <div class="detail-row data-row">
                <span class="detail-label">Data:</span>
                <span class="detail-value">{{ formatarData(intimacao.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'

// Router
const router = useRouter()

// Estados
const intimacoes = ref([])
const carregando = ref(true)

// Funções utilitárias
const truncateText = (text, maxLength) => {
  if (!text) return 'Não informado'
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Formatar número CNJ para exibição mais legível
const formatarCNJ = (cnj) => {
  if (!cnj) return 'CNJ não informado'
  
  // Se o CNJ já estiver formatado com hífens e pontos, retorne-o como está
  if (cnj.includes('-') || cnj.includes('.')) {
    return cnj
  }
  
  // Tenta formatar seguindo o padrão NNNNNNN-DD.AAAA.J.TR.OOOO
  try {
    // Remove qualquer formatação existente
    const cnjLimpo = cnj.replace(/[^0-9]/g, '')
    
    if (cnjLimpo.length !== 20) return cnj // Se não tem 20 dígitos, retorna original
    
    // Formatação padrão
    return `${cnjLimpo.substring(0, 7)}-${cnjLimpo.substring(7, 9)}.${cnjLimpo.substring(9, 13)}.${cnjLimpo.substring(13, 14)}.${cnjLimpo.substring(14, 16)}.${cnjLimpo.substring(16)}`
  } catch (error) {
    return cnj // Em caso de erro, retorna o original
  }
}

const formatarData = (dataString) => {
  if (!dataString) return 'Data não informada'
  
  try {
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Data inválida'
  }
}

// Função para navegar para lista de intimações filtrada por CNJ
const verIntimacao = (cnj) => {
  if (!cnj) return
  
  // Navegar para lista de intimações com filtro por CNJ
  router.push({
    name: 'intimacoes',
    query: { cnj: cnj }
  })
}

// Função para carregar as últimas intimações
const carregarUltimasIntimacoes = async () => {
  try {
    carregando.value = true
    
    // Obter usuário atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.error('Usuário não autenticado')
      return
    }

    console.log('🔍 Buscando últimas intimações...')

    // Buscar as últimas 4 intimações do usuário
    const { data: intimacoesData, error } = await supabase
      .from('intimacoes')
      .select(`
        id,
        cnj,
        autor,
        reu,
        created_at,
        lido,
        visualizado
      `)
      .eq('uuid', session.user.id)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error('Erro ao carregar intimações:', error)
      return
    }

    console.log('✅ Intimações carregadas:', intimacoesData)
    intimacoes.value = intimacoesData || []

  } catch (error) {
    console.error('Erro ao carregar intimações:', error)
  } finally {
    carregando.value = false
  }
}

// Lifecycle
onMounted(() => {
  carregarUltimasIntimacoes()
})
</script>

<style scoped>
.ultimas-intimacoes-container {
  width: calc(100% + 16px);
  overflow-x: auto;
  padding-top: 12px;
}

.header-section {
  margin-bottom: 20px;
}

.titulo-secao {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.intimacoes-container {
  min-height: 200px;
  overflow-x: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6B7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-image {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-text {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

/* Lista de intimações */
.intimacoes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 238px);
  gap: 22px;
  overflow-x: auto;
  min-width: fit-content;
  padding-bottom: 8px;
  justify-content: start;
}

.intimacao-card {
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: white;
  display: flex;
  box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 130px;
  width: 238px;
  border: 1px solid #E5E7EB;
}

.intimacao-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Barra lateral colorida que indica status */
.status-bar {
  width: 4px;
  height: 100%;
  flex-shrink: 0;
}

/* Cor da barra lateral baseada no status */
.visualizado .status-bar {
  background-color: #D1D5DB; /* Cinza para visualizado */
}

.nao-visualizado .status-bar {
  background-color: #EF4444; /* Vermelho para não visualizado */
}

/* Container principal do conteúdo do card */
.card-content {
  padding: 12px 12px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  overflow: hidden;
  justify-content: space-between;
}

/* Estilo do cabeçalho com número do processo */
.processo-header {
  margin-bottom: 16px;
}

.processo-titulo {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Container dos detalhes do processo */
.processo-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.3;
  margin-bottom: 4px;
}

.detail-label {
  font-weight: 500;
  color: #6B7280;
  margin-right: 4px;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-value {
  color: #1F2937;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  word-break: break-word;
}

.data-row {
  margin-top: 4px;
}

/* Mobile Layout */
@media (max-width: 768px) {
  .ultimas-intimacoes-container {
    padding: 16px;
  }
  
  .intimacoes-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
  }
  
  .intimacao-card {
    height: auto;
    min-height: 120px;
    width: 100%;
    max-width: 100%;
  }
  
  .card-content {
    padding: 10px;
  }
  
  .processo-titulo {
    font-size: 13px;
    margin-bottom: 8px;
  }
  
  .processo-header {
    margin-bottom: 10px;
  }
  
  .processo-details {
    gap: 4px;
  }
  
  .detail-row {
    font-size: 12px;
  }
  
  .detail-label {
    min-width: 70px;
  }
}

/* Tablet Layout */
@media (min-width: 769px) and (max-width: 1024px) {
  .ultimas-intimacoes-container {
    padding: 18px;
  }
  
  .intimacoes-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .intimacao-card {
    height: 140px;
    width: 100%;
  }
  
  .processo-titulo {
    font-size: 13px;
  }
  
  .detail-label {
    min-width: 75px;
  }
  
  .detail-row {
    font-size: 12px;
  }
}
</style> 