<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- Botão de fechar (X) -->
      <button class="btn-close" @click="$emit('close')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <!-- Ícone superior -->
      <div class="icone-superior">
        <img src="/images/pastas.svg" alt="Ícone pastas" width="56" height="56">
      </div>

      <!-- Título -->
      <h2 class="titulo">Mover relatório</h2>

      <!-- Subtítulo -->
      <p class="subtitulo">Selecione a pasta de destino para "{{ relatorio?.nome }}"</p>

      <!-- Dropdown para seleção da pasta -->
      <div class="dropdown-container">
        <Dropdown
          :options="opcoesPastas"
          :defaultSelected="0"
          :showPlaceholderIcon="true"
          iconType="pasta"
          placeholderText="Selecione uma pasta"
          @option-selected="selecionarPasta"
        />
      </div>

      <!-- Mensagem de erro -->
      <div v-if="mostrarErro" class="erro-mensagem">
        Erro ao carregar pastas. Tente novamente.
      </div>

      <!-- Botões -->
      <div class="botoes-container">
        <Button 
          label="Cancelar" 
          type="outline" 
          button-type="button"
          @click="$emit('close')"
        />
        <Button 
          label="Mover" 
          type="primary" 
          button-type="button"
          :disabled="loading || !pastaSelecionada"
          @click="moverRelatorio"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/UI/Button.vue'
import Dropdown from '../../components/UI/Dropdown.vue'

const props = defineProps({
  relatorio: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'relatorio-movido'])

const { user } = useAuthStore()
const opcoesPastas = ref([])
const pastaSelecionada = ref(null)
const loading = ref(false)
const mostrarErro = ref(false)

// Função para carregar todas as pastas do usuário (exceto a atual)
async function carregarPastas() {
  try {
    if (!user.value?.id) {
      console.error('Usuário não autenticado')
      return
    }

    const { data, error } = await supabase
      .from('pasta_relatorios')
      .select('id, titulo')
      .eq('uuid', user.value.id)
      .neq('id', props.relatorio.pasta_id) // Excluir pasta atual
      .order('titulo', { ascending: true })

    if (error) {
      throw error
    }

    // Formatar dados para o dropdown
    opcoesPastas.value = data.map(pasta => ({
      id: pasta.id,
      label: pasta.titulo,
      icon: '/images/iconPasta.svg'
    }))

  } catch (error) {
    console.error('Erro ao carregar pastas:', error)
    mostrarErro.value = true
    opcoesPastas.value = []
  }
}

// Função chamada quando uma pasta é selecionada no dropdown
const selecionarPasta = (opcao) => {
  pastaSelecionada.value = opcao
  console.log('Pasta selecionada:', opcao)
}

// Função para mover o relatório para a pasta selecionada
async function moverRelatorio() {
  if (!pastaSelecionada.value) return
  
  loading.value = true
  mostrarErro.value = false
  
  try {
    // Verificar se usuário está autenticado
    if (!user.value?.id) {
      alert('Usuário não autenticado. Faça login novamente.')
      return
    }
    
    // Atualizar relatório com nova pasta_id
    const { error } = await supabase
      .from('relatorios')
      .update({ pasta_id: pastaSelecionada.value.id })
      .eq('id', props.relatorio.id)
    
    if (error) {
      throw error
    }
    
    // Sucesso - emitir evento e fechar modal
    emit('relatorio-movido', {
      relatorio: props.relatorio,
      pastaDestino: pastaSelecionada.value
    })
    emit('close')
    
  } catch (error) {
    console.error('Erro ao mover relatório:', error)
    alert('Erro ao mover o relatório. Tente novamente.')
  } finally {
    loading.value = false
  }
}

// Carregar pastas quando componente é montado
onMounted(() => {
  carregarPastas()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.btn-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-close:hover {
  background-color: #f3f4f6;
}

.icone-superior {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  margin-top: 8px;
}

.titulo {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  text-align: left;
  margin: 0 0 8px 0;
}

.subtitulo {
  font-size: 14px;
  font-weight: 400;
  color: #6b7280;
  text-align: left;
  margin: 0 0 20px 0;
}

.dropdown-container {
  margin-bottom: 8px;
}

.erro-mensagem {
  color: #DC2626;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: left;
}

.botoes-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px;
    margin: 16px;
  }
  
  .botoes-container {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style> 