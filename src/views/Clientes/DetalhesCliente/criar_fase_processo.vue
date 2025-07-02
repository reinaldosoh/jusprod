<template>
  <teleport to="body">
    <!-- Modal completo -->
    <div class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container">
        <!-- Cabeçalho azul -->
        <div class="header-bar">
          <h2 class="modal-title">{{ modoEdicao ? 'Editar fases do projeto' : 'Criar fases do projeto' }}</h2>
          <button class="close-button" @click="fecharModal">×</button>
        </div>

        <!-- Conteúdo do formulário -->
        <div class="form-content">
          <h2 class="form-title">{{ modoEdicao ? 'Edite as fases do projeto' : 'Organize as fases do projeto' }}</h2>

          <!-- Lista de fases -->
          <div v-for="(fase, index) in fases" :key="index" class="fase-container">
            <div class="fase-header">
              <span class="fase-numero">Fase {{ fase.numeroFase }}</span>
              <button 
                v-if="fases.length > 1" 
                class="remover-fase" 
                @click="removerFase(index)"
                type="button"
              >
                ×
              </button>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label :for="'titulo-'+index">Digite a nova fase<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  :id="'titulo-'+index"
                  v-model="fase.titulo" 
                  class="input-field" 
                  placeholder="Digite o nome da fase"
                  required
                />
              </div>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label :for="'data-inicio-'+index">Data início</label>
                <input 
                  type="date" 
                  :id="'data-inicio-'+index"
                  v-model="fase.dataInicio" 
                  class="input-field"
                />
              </div>

              <div class="campo-formulario">
                <label :for="'data-final-'+index">Data final</label>
                <input 
                  type="date" 
                  :id="'data-final-'+index"
                  v-model="fase.dataFinal" 
                  class="input-field"
                />
              </div>
            </div>

            <div class="campo-formulario full-width">
              <label :for="'descricao-'+index">O que será feito nessa fase?</label>
              <textarea 
                :id="'descricao-'+index"
                v-model="fase.descricao" 
                class="textarea-field" 
                placeholder="Descreva as atividades desta fase"
                rows="3"
              ></textarea>
            </div>

            <!-- Separador entre fases -->
            <div v-if="index < fases.length - 1" class="fase-separador"></div>
          </div>

          <!-- Botão para adicionar nova fase -->
          <div class="add-fase" @click="adicionarNovaFase">
            <div class="add-icon">+</div>
            <span>Nova fase</span>
          </div>

          <!-- Exibir mensagens de erro -->
          <div class="error-message" v-if="mensagensErro">
            {{ mensagensErro }}
          </div>

          <!-- Botões de ação -->
          <div class="buttons-container">
            <Button 
              @click="fecharModal" 
              label="Cancelar"
              type="secondary"
              buttonType="button"
              class="action-button"
            />
            <Button 
              @click="salvarFases" 
              label="Salvar"
              type="primary"
              buttonType="button"
              class="action-button"
            />
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { supabase } from '../../../lib/supabase'
import Button from '../../../components/UI/Button.vue'

// Props e emits
const props = defineProps({
  processoId: {
    type: Number,
    required: true
  },
  show: {
    type: Boolean,
    default: false
  },
  fasesExistentes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'fasesSalvas'])

// Estados do formulário
const fases = ref([])
const mensagensErro = ref('')
const proximoNumeroFase = ref(1)

// Computed para detectar se estamos editando fases existentes
const modoEdicao = computed(() => {
  return props.fasesExistentes && props.fasesExistentes.length > 0
})

// Inicializar com a primeira fase
const criarNovaFase = (numeroFase) => ({
  numeroFase: numeroFase,
  titulo: '',
  dataInicio: '',
  dataFinal: '',
  descricao: ''
})

// Buscar o próximo número de fase disponível
const buscarProximoNumeroFase = async () => {
  try {
    const { data, error } = await supabase
      .from('fases_processo')
      .select('numero_fase')
      .eq('processo_id', props.processoId)
      .order('numero_fase', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Erro ao buscar fases:', error)
      proximoNumeroFase.value = 1
      return
    }

    if (data && data.length > 0) {
      proximoNumeroFase.value = data[0].numero_fase + 1
    } else {
      proximoNumeroFase.value = 1
    }

    console.log('Próximo número de fase:', proximoNumeroFase.value)
  } catch (error) {
    console.error('Erro ao buscar próximo número de fase:', error)
    proximoNumeroFase.value = 1
  }
}

// Adicionar nova fase
const adicionarNovaFase = () => {
  const novoNumero = proximoNumeroFase.value + fases.value.length
  fases.value.push(criarNovaFase(novoNumero))
}

// Remover fase
const removerFase = (index) => {
  if (fases.value.length > 1) {
    fases.value.splice(index, 1)
    // Reorganizar números das fases
    fases.value.forEach((fase, idx) => {
      fase.numeroFase = proximoNumeroFase.value + idx
    })
  }
}

// Inicializar componente
onMounted(async () => {
  await buscarProximoNumeroFase()
  
  // Se temos fases existentes, carregá-las para edição
  if (props.fasesExistentes && props.fasesExistentes.length > 0) {
    fases.value = props.fasesExistentes.map(fase => ({
      id: fase.id, // Adicionar ID para identificar fases existentes
      numeroFase: fase.numero_fase,
      titulo: fase.titulo,
      dataInicio: fase.data_inicio || '',
      dataFinal: fase.data_final || '',
      descricao: fase.descricao || ''
    }))
  } else {
    // Inicializar com a primeira fase nova
    fases.value = [criarNovaFase(proximoNumeroFase.value)]
  }
})

// Limpar mensagens de erro
const limparMensagensErro = () => {
  mensagensErro.value = ''
}

// Validar formulário
const validarFormulario = () => {
  limparMensagensErro()

  for (let i = 0; i < fases.value.length; i++) {
    const fase = fases.value[i]
    
    if (!fase.titulo || fase.titulo.trim() === '') {
      mensagensErro.value = `Por favor, preencha o título da Fase ${fase.numeroFase}.`
      return false
    }

    // Validar se data final é posterior à data início (se ambas estiverem preenchidas)
    if (fase.dataInicio && fase.dataFinal && fase.dataFinal < fase.dataInicio) {
      mensagensErro.value = `A data final da Fase ${fase.numeroFase} deve ser posterior à data de início.`
      return false
    }
  }

  return true
}

// Fechar modal
const fecharModal = () => {
  // Resetar formulário
  fases.value = []
  mensagensErro.value = ''
  emit('close')
}

// Salvar fases
const salvarFases = async () => {
  if (!validarFormulario()) {
    return
  }

  try {
    // Verificar se temos um processoId válido
    if (!props.processoId) {
      mensagensErro.value = 'ID do processo não foi fornecido.'
      return
    }

    console.log('ProcessoId recebido:', props.processoId)

    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      mensagensErro.value = 'Você precisa estar autenticado para salvar fases.'
      return
    }

    console.log('Usuário autenticado:', session.user.id)

    // Separar fases existentes (para atualizar) das novas (para inserir)
    const fasesParaAtualizar = []
    const fasesParaInserir = []

    fases.value.forEach(fase => {
      const dadosFase = {
        processo_id: props.processoId,
        numero_fase: fase.numeroFase,
        titulo: fase.titulo.trim(),
        data_inicio: fase.dataInicio || null,
        data_final: fase.dataFinal || null,
        descricao: fase.descricao ? fase.descricao.trim() : null,
        uuid: session.user.id
      }

      if (fase.id) {
        // Fase existente - incluir ID para atualização
        fasesParaAtualizar.push({ id: fase.id, ...dadosFase })
      } else {
        // Fase nova - inserir
        fasesParaInserir.push(dadosFase)
      }
    })

    console.log('Fases para atualizar:', fasesParaAtualizar)
    console.log('Fases para inserir:', fasesParaInserir)

    let dadosResultado = []

    // Atualizar fases existentes
    if (fasesParaAtualizar.length > 0) {
      for (const fase of fasesParaAtualizar) {
        const { id, ...dadosAtualizacao } = fase
        const { data: dataUpdate, error: errorUpdate } = await supabase
          .from('fases_processo')
          .update(dadosAtualizacao)
          .eq('id', id)
          .select()

        if (errorUpdate) {
          console.error('Erro ao atualizar fase:', errorUpdate)
          throw errorUpdate
        }
        dadosResultado.push(...(dataUpdate || []))
      }
    }

    // Inserir novas fases
    if (fasesParaInserir.length > 0) {
      const { data: dataInsert, error: errorInsert } = await supabase
        .from('fases_processo')
        .insert(fasesParaInserir)
        .select()

      if (errorInsert) {
        console.error('Erro ao inserir novas fases:', errorInsert)
        throw errorInsert
      }
      dadosResultado.push(...(dataInsert || []))
    }

    const data = dadosResultado
    const error = null

    if (error) {
      console.error('Erro detalhado do Supabase:', error)
      throw error
    }

    console.log('Fases salvas com sucesso:', data)

    // Emitir evento para o componente pai
    emit('fasesSalvas', {
      fases: data,
      mensagem: `${fases.value.length} fase(s) criada(s) com sucesso!`
    })

    // Fechar modal
    fecharModal()

  } catch (error) {
    console.error('Erro ao salvar fases:', error)
    console.error('Tipo do erro:', typeof error)
    console.error('Propriedades do erro:', Object.keys(error))
    
    if (error.code) {
      console.error('Código do erro:', error.code)
    }
    
    if (error.details) {
      console.error('Detalhes do erro:', error.details)
    }
    
    if (error.hint) {
      console.error('Dica do erro:', error.hint)
    }
    
    mensagensErro.value = `Erro ao salvar fases: ${error.message || error.code || 'Erro desconhecido'}`
  }
}
</script>

<style scoped>
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
  z-index: 9999 !important;
}

.modal-container {
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
  z-index: 10000 !important;
  position: relative;
}

/* Cabeçalho */
.header-bar {
  background-color: #0468FA;
  color: white;
  height: 35px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  flex: 1;
  line-height: 35px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

/* Conteúdo do formulário */
.form-content {
  padding: 24px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
}

/* Container de fase */
.fase-container {
  margin-bottom: 24px;
}

.fase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fase-numero {
  font-size: 16px;
  font-weight: 600;
  color: #0468FA;
}

.remover-fase {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remover-fase:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.fase-separador {
  height: 1px;
  background-color: #E5E7EB;
  margin: 24px 0;
}

/* Campos do formulário */
.campo-formulario {
  margin-bottom: 16px;
  flex: 1;
}

.full-width {
  width: 100%;
}

.campo-formulario label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 6px;
}

.campo-obrigatorio {
  color: #EF4444;
  margin-left: 2px;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background-color: white;
  transition: border-color 0.2s;
}

.input-field:focus, 
.textarea-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 1px rgba(4, 104, 250, 0.2);
}

.textarea-field {
  min-height: 80px;
  resize: vertical;
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

/* Campos de data */
/* Os inputs type="date" já possuem ícones nativos do navegador */

/* Adicionar nova fase */
.add-fase {
  display: flex;
  align-items: center;
  color: #0468FA;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
  padding: 12px 0;
  border: 2px dashed #0468FA;
  border-radius: 8px;
  justify-content: center;
  transition: background-color 0.2s;
}

.add-fase:hover {
  background-color: rgba(4, 104, 250, 0.05);
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #0468FA;
  color: white;
  border-radius: 50%;
  font-size: 16px;
  margin-right: 8px;
  line-height: 1;
}

/* Botões de ação */
.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.action-button {
  width: 176px !important;
}

/* Mensagens de erro */
.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  border-left: 3px solid #EF4444;
  padding: 12px 16px;
  margin: 16px 0;
  font-size: 14px;
  border-radius: 4px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsivo */
@media (max-width: 640px) {
  .fields-row {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 90%;
    margin: 0 auto;
  }
  
  .campo-formulario {
    width: 100%;
  }
}
</style> 