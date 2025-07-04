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
        <img src="/images/pastas.svg" alt="Ícone pasta" width="56" height="56">
      </div>

      <!-- Título -->
      <h2 class="titulo">Editar nome da pasta</h2>

      <!-- Subtítulo -->
      <p class="subtitulo">Dê um novo nome a esta pasta de relatórios</p>

      <!-- Input com ícone -->
      <div class="input-container">
        <img src="/images/iconPasta.svg" alt="Pasta" width="18" height="18" class="input-icon">
        <input 
          v-model="nomePasta" 
          type="text" 
          placeholder="Nome da pasta"
          class="input-nome"
          @keyup.enter="salvarPasta"
          maxlength="100"
        >
      </div>

      <!-- Mensagem de erro -->
      <div v-if="mostrarErro" class="erro-mensagem">
        Esse nome está em uso. Dê outro nome a pasta.
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
          label="Salvar" 
          type="primary" 
          button-type="button"
          :disabled="loading || !nomePasta.trim() || nomePasta.trim() === nomeOriginal"
          @click="salvarPasta"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth'
import Button from '../../components/UI/Button.vue'

const props = defineProps({
  pastaId: {
    type: [Number, String],
    required: true
  },
  nomeAtual: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'pasta-editada-sucesso'])

const { user } = useAuthStore()
const nomePasta = ref('')
const nomeOriginal = ref('')
const loading = ref(false)
const mostrarErro = ref(false)

// Inicializar com nome atual
watch(() => props.nomeAtual, (novoNome) => {
  nomePasta.value = novoNome
  nomeOriginal.value = novoNome
}, { immediate: true })

// Função para verificar se nome já existe (exceto a própria pasta)
async function verificarNomeExistente(nome) {
  try {
    if (!user.value?.id) {
      console.error('Usuário não autenticado')
      return false
    }

    const { data, error } = await supabase
      .from('pasta_relatorios')
      .select('id')
      .eq('uuid', user.value.id)
      .eq('titulo', nome.trim())
      .neq('id', props.pastaId) // Excluir a própria pasta
      .limit(1)

    if (error) {
      console.error('Erro ao verificar nome:', error)
      return false
    }

    return data && data.length > 0
  } catch (error) {
    console.error('Erro ao verificar nome:', error)
    return false
  }
}

// Função para salvar a pasta
async function salvarPasta() {
  if (!nomePasta.value.trim()) return
  if (nomePasta.value.trim() === nomeOriginal.value) return
  
  loading.value = true
  mostrarErro.value = false
  
  try {
    // Verificar se nome já existe
    const nomeExiste = await verificarNomeExistente(nomePasta.value)
    
    if (nomeExiste) {
      mostrarErro.value = true
      loading.value = false
      return
    }
    
    // Verificar se usuário está autenticado
    if (!user.value?.id) {
      alert('Usuário não autenticado. Faça login novamente.')
      return
    }
    
    // Atualizar pasta de relatórios
    const { error } = await supabase
      .from('pasta_relatorios')
      .update({ titulo: nomePasta.value.trim() })
      .eq('id', props.pastaId)
      .eq('uuid', user.value.id)
    
    if (error) {
      console.error('Erro ao editar pasta de relatórios:', error)
      alert('Erro ao editar a pasta de relatórios. Tente novamente.')
      return
    }
    
    console.log('✅ Pasta de relatórios editada com sucesso')
    
    // Sucesso - emitir evento com o nome atualizado e fechar modal
    emit('pasta-editada-sucesso', {
      id: props.pastaId,
      novoNome: nomePasta.value.trim()
    })
    emit('close')
    
  } catch (error) {
    console.error('Erro ao salvar pasta de relatórios:', error)
    alert('Erro ao salvar a pasta de relatórios. Tente novamente.')
  } finally {
    loading.value = false
  }
}
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

.input-container {
  position: relative;
  margin-bottom: 8px;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  pointer-events: none;
}

.input-nome {
  width: 100%;
  height: 44px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 0 16px 0 48px;
  font-size: 16px;
  color: #111827;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.input-nome:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-nome::placeholder {
  color: #9CA3AF;
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