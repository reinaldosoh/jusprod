<template>
  <div v-if="isVisible" class="editar-usuario-overlay" @click="handleOverlayClick">
    <div class="editar-usuario-modal" @click.stop>
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">Editar dados pessoais</h2>
        <button class="close-button" @click="fechar">
          <img src="/images/x-close.svg" alt="Fechar" class="close-icon" />
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="modal-content">
        <!-- Título da seção -->
        <h3 class="section-title">Informações pessoais</h3>

        <!-- Nome completo -->
        <div class="field-group">
          <label class="field-label">Nome completo<span class="required">*</span></label>
          <input 
            type="text" 
            placeholder="Nome completo"
            class="field-input"
            v-model="formData.nome"
          />
        </div>

        <!-- CPF -->
        <div class="field-group">
          <label class="field-label">CPF<span class="required">*</span></label>
          <input 
            type="text" 
            placeholder="000.000.000-00"
            class="field-input"
            v-model="formData.cpf"
            maxlength="14"
            @input="formatarCPF"
          />
        </div>

        <!-- Data de nascimento -->
        <div class="field-group">
          <label class="field-label">Data de nascimento<span class="required">*</span></label>
          <input 
            type="date" 
            class="field-input"
            v-model="formData.data_nascimento"
          />
        </div>

        <!-- WhatsApp -->
        <div class="field-group">
          <label class="field-label">WhatsApp<span class="required">*</span></label>
          <input 
            type="tel" 
            placeholder="(00) 00000-0000"
            class="field-input"
            v-model="formData.whatsapp"
            maxlength="15"
            @input="formatarTelefone"
          />
        </div>

        <!-- Botões -->
        <div class="modal-buttons">
          <button class="cancel-btn" @click="cancelar">
            Cancelar
          </button>
          <button 
            class="save-btn" 
            @click="salvar"
            :disabled="!podeSubmeter || salvando"
          >
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'

// Props e emits
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  dadosIniciais: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['fechar', 'atualizado'])

// Estado do componente
const formData = ref({
  nome: '',
  cpf: '',
  data_nascimento: '',
  whatsapp: ''
})

const salvando = ref(false)
const userId = ref(null)

// Carregar dados iniciais quando o modal for aberto
watch(() => props.isVisible, (newValue) => {
  if (newValue && props.dadosIniciais) {
    formData.value = { 
      ...formData.value, 
      ...props.dadosIniciais,
      data_nascimento: props.dadosIniciais.data_nascimento ? formatarDataParaInput(props.dadosIniciais.data_nascimento) : ''
    }
  }
})

// Carregar o ID do usuário atual
onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (data && data.user) {
    userId.value = data.user.id
  }
})

// Verificar se o formulário está pronto para submeter
const podeSubmeter = computed(() => {
  return formData.value.nome.trim() && 
         formData.value.cpf.trim() && 
         formData.value.data_nascimento && 
         formData.value.whatsapp.trim() &&
         validarCPF(formData.value.cpf) &&
         validarTelefone(formData.value.whatsapp)
})

// Funções de formatação
const formatarCPF = (event) => {
  let cpf = event.target.value.replace(/\D/g, '')
  
  if (cpf.length > 11) {
    cpf = cpf.substring(0, 11)
  }
  
  if (cpf.length > 9) {
    formData.value.cpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9)}`
  } else if (cpf.length > 6) {
    formData.value.cpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6)}`
  } else if (cpf.length > 3) {
    formData.value.cpf = `${cpf.substring(0, 3)}.${cpf.substring(3)}`
  } else {
    formData.value.cpf = cpf
  }
}

const formatarTelefone = (event) => {
  let telefone = event.target.value.replace(/\D/g, '')
  
  if (telefone.length > 11) {
    telefone = telefone.substring(0, 11)
  }
  
  if (telefone.length > 10) {
    formData.value.whatsapp = `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`
  } else if (telefone.length > 6) {
    formData.value.whatsapp = `(${telefone.substring(0, 2)}) ${telefone.substring(2, 6)}-${telefone.substring(6)}`
  } else if (telefone.length > 2) {
    formData.value.whatsapp = `(${telefone.substring(0, 2)}) ${telefone.substring(2)}`
  } else {
    formData.value.whatsapp = telefone
  }
}

const formatarDataParaInput = (dataString) => {
  if (!dataString) return ''
  
  // Transforma formato ISO para o formato do input (YYYY-MM-DD)
  const data = new Date(dataString)
  return data.toISOString().split('T')[0]
}

// Validadores
const validarCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '')
  return cpf.length === 11
}

const validarTelefone = (telefone) => {
  telefone = telefone.replace(/\D/g, '')
  return telefone.length >= 10
}

// Controles do modal
const fechar = () => {
  limparFormulario()
  emit('fechar')
}

const handleOverlayClick = () => {
  fechar()
}

const cancelar = () => {
  fechar()
}

const limparFormulario = () => {
  formData.value = {
    nome: '',
    cpf: '',
    data_nascimento: '',
    whatsapp: ''
  }
}

// Salvar dados
const salvar = async () => {
  if (!podeSubmeter.value || salvando.value) return
  
  salvando.value = true
  
  try {
    const dadosAtualizados = {
      nome: formData.value.nome.trim(),
      cpf: formData.value.cpf.replace(/\D/g, ''),
      data_nascimento: formData.value.data_nascimento,
      whatsapp: formData.value.whatsapp.replace(/\D/g, '')
    }
    
    const { error } = await supabase
      .from('usuario')
      .update(dadosAtualizados)
      .eq('uuid', userId.value)
    
    if (error) throw error
    
    emit('atualizado', { ...dadosAtualizados, whatsapp: formData.value.whatsapp })
    fechar()
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error)
    alert('Ocorreu um erro ao salvar os dados. Por favor, tente novamente.')
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.editar-usuario-overlay {
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
}

.editar-usuario-modal {
  background: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 25px rgba(0, 0, 0, 0.15);
  font-family: 'Inter', sans-serif;
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  width: 16px;
  height: 16px;
}

.modal-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  flex: 1;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #101828;
  margin: 0 0 1rem 0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.required {
  color: #EF4444;
  margin-left: 2px;
}

.field-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  font-size: 14px;
  color: #101828;
  background: white;
  transition: border-color 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.field-input:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 4px rgba(4, 104, 250, 0.1);
}

.field-input::placeholder {
  color: #667085;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  margin-top: auto;
}

.cancel-btn {
  background: #FFFFFF;
  color: #0468FA;
  border: 1px solid #0468FA;
  border-radius: 8px;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;
  width: 100px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background: #F0F7FF;
}

.save-btn {
  background: #0468FA;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  width: 100px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn:hover:not(:disabled) {
  background: #0356D6;
}

.save-btn:disabled {
  background: #D0D5DD;
  cursor: not-allowed;
}

/* Responsivo */
@media (max-width: 768px) {
  .editar-usuario-modal {
    width: 95vw;
    height: auto;
    max-height: 95vh;
  }
  
  .modal-content {
    padding: 1rem;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .editar-usuario-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .modal-header {
    border-radius: 0;
  }
}
</style>
