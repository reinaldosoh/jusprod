<template>
    <teleport to="body">
      <!-- Modal completo -->
      <div class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container">
        <!-- Cabeçalho azul -->
        <div class="header-bar">
          <h2 class="modal-title">{{ modoEdicao ? 'Editar cliente' : 'Novo cliente' }}</h2>
          <button class="close-button" @click="fecharModal">×</button>
        </div>

        <!-- Conteúdo do formulário -->
        <div class="form-content">
          <h2 class="form-title">{{ modoEdicao ? 'Editar dados da pessoa física' : 'Insira os dados do cliente' }}</h2>

          <!-- Seletor de tipo de cliente - Oculto em modo de edição -->
          <div v-if="!modoEdicao" class="tipo-cliente-selector">
            <div class="radio-group">
              <label class="radio-container">
                <input 
                  type="radio" 
                  name="tipoCliente" 
                  value="pf" 
                  v-model="tipoCliente"
                >
                <span class="radio-dot"></span>
                <span class="radio-text">Pessoa física</span>
              </label>
              <label class="radio-container">
                <input 
                  type="radio" 
                  name="tipoCliente" 
                  value="pj" 
                  v-model="tipoCliente"
                >
                <span class="radio-dot"></span>
                <span class="radio-text">Pessoa jurídica</span>
              </label>
              <label class="radio-container">
                <input 
                  type="radio" 
                  name="tipoCliente" 
                  value="lote" 
                  v-model="tipoCliente"
                >
                <span class="radio-dot"></span>
                <span class="radio-text">Em lote</span>
              </label>
            </div>
          </div>

          <!-- Etapa 1 - Dados pessoais -->
          <div v-if="etapaAtual === 1">
            <h3 class="section-title">Dados pessoais</h3>

            <div class="campo-formulario full-width">
              <label for="nome">Nome completo<span class="campo-obrigatorio">*</span></label>
              <input 
                type="text" 
                id="nome" 
                v-model="cliente.nome" 
                class="input-field" 
                placeholder="Insira o nome completo do cliente"
                required
              />
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="cpf">CPF<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="cpf" 
                  v-model="cliente.cpf" 
                  @input="formatarCPF"
                  class="input-field" 
                  placeholder="Ex: 123.456.789-10"
                  maxlength="14"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="rg">RG<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="rg" 
                  v-model="cliente.rg" 
                  @input="formatarRG"
                  class="input-field" 
                  placeholder="Ex: 12.345.678-9"
                  maxlength="12"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="orgao_emissor">Órgão emissor<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="orgao_emissor" 
                  v-model="cliente.orgao_emissor" 
                  class="input-field" 
                  placeholder="Insira o emissor"
                  required
                />
              </div>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="pis_pasep">PIS/PASEP</label>
                <input 
                  type="text" 
                  id="pis_pasep" 
                  v-model="cliente.pasep" 
                  class="input-field" 
                  placeholder="Insira"
                />
              </div>

              <div class="campo-formulario">
                <label for="data_nascimento">Data de nascimento<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="data_nascimento" 
                  v-model="cliente.datanascimento" 
                  @input="formatarData"
                  class="input-field" 
                  placeholder="dd/mm/aaaa"
                  maxlength="10"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="sexo">Sexo</label>
                <Dropdown 
                  :options="opcoesGenero" 
                  @option-selected="handleGeneroSelected"
                  placeholder-text="Selecione"
                />
              </div>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="nacionalidade">Nacionalidade<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="nacionalidade" 
                  v-model="cliente.nacionalidade" 
                  class="input-field" 
                  placeholder="Insira"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="estado_civil">Estado civil<span class="campo-obrigatorio">*</span></label>
                <Dropdown 
                  :options="opcoesEstadoCivil" 
                  @option-selected="handleEstadoCivilSelected"
                  placeholder-text="Selecione"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="profissao">Profissão<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="profissao" 
                  v-model="cliente.profissao" 
                  class="input-field" 
                  placeholder="Insira a profissão"
                  required
                />
              </div>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="nome_mae">Nome da mãe</label>
                <input 
                  type="text" 
                  id="nome_mae" 
                  v-model="cliente.nome_mae" 
                  class="input-field" 
                  placeholder="Insira"
                />
              </div>

              <div class="campo-formulario">
                <label for="nome_pai">Nome do pai</label>
                <input 
                  type="text" 
                  id="nome_pai" 
                  v-model="cliente.nome_pai" 
                  class="input-field" 
                  placeholder="Insira"
                />
              </div>
            </div>

            <div class="campo-formulario full-width">
              <label for="observacoes">Observações</label>
              <textarea 
                id="observacoes" 
                v-model="cliente.observacoes" 
                class="textarea-field" 
                placeholder="Escreva a mensagem"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Etapa 2 - Contato -->
          <div v-if="etapaAtual === 2">
            <h3 class="section-title">Contato</h3>
            
            <div v-for="(telefone, index) in cliente.telefones" :key="'tel-'+index" class="contato-row">
              <div class="contato-item">
                <label for="telefone">Whatsapp</label>
                <input 
                  type="text" 
                  :id="'telefone-'+index" 
                  v-model="telefone.numero" 
                  @input="formatarTelefone(telefone, index)"
                  class="input-field" 
                  placeholder="(00) 00000-0000"
                  maxlength="15"
                />
              </div>
              <div class="remover-contato" @click="removerTelefone(index)" v-if="cliente.telefones.length > 1">
                <span>Remover</span>
              </div>
            </div>

            <div class="add-contato" @click="adicionarTelefone">
              <div class="add-icon">+</div>
              <span>Novo Whatsapp</span>
            </div>

            <div v-for="(email, index) in cliente.emails" :key="'email-'+index" class="contato-row">
              <div class="contato-item">
                <label for="email">e-mail</label>
                <input 
                  type="email" 
                  :id="'email-'+index" 
                  v-model="email.endereco" 
                  class="input-field" 
                  placeholder="exemplo@email.com"
                />
              </div>
              <div class="remover-contato" @click="removerEmail(index)" v-if="cliente.emails.length > 1">
                <span>Remover</span>
              </div>
            </div>

            <div class="add-contato" @click="adicionarEmail">
              <div class="add-icon">+</div>
              <span>Novo e-mail</span>
            </div>
          </div>

          <!-- Etapa 3 - Endereço -->
          <div v-if="etapaAtual === 3">
            <h3 class="section-title">Endereço</h3>
            
            <div class="campo-formulario full-width">
              <label for="cep">CEP</label>
              <div class="cep-container">
                <input
                  type="text"
                  id="cep"
                  v-model="cliente.cep"
                  @input="formatarCEP"
                  class="input-field cep-input"
                  placeholder="Ex: 12345-678"
                  maxlength="9"
                />
                <button class="buscar-cep-button" @click="buscarCEP">
                  <span class="buscar-icon">⚲</span>
                  Bucar CEP
                </button>
              </div>
            </div>
            
            <div class="campo-formulario full-width">
              <label for="logradouro">Logradouro</label>
              <input 
                type="text" 
                id="logradouro" 
                v-model="cliente.rua" 
                class="input-field" 
                placeholder="Insira o nome do logradouro"
              />
            </div>
            
            <div class="row-fields">
              <div class="campo-formulario">
                <label for="numero">Número</label>
                <input 
                  type="text" 
                  id="numero" 
                  v-model="cliente.numero" 
                  class="input-field" 
                  placeholder="Insira o número"
                />
              </div>
            </div>
            
            <div class="campo-formulario full-width">
              <label for="complemento">Complemento</label>
              <input 
                type="text" 
                id="complemento" 
                v-model="cliente.complemento" 
                class="input-field" 
                placeholder="Insira o nome do logradouro"
              />
            </div>
            
            <div class="row-fields">
              <div class="campo-formulario">
                <label for="bairro">Bairro<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="bairro" 
                  v-model="cliente.bairro" 
                  class="input-field" 
                  placeholder="Insira"
                  required
                />
              </div>
              <div class="campo-formulario">
                <label for="cidade">Cidade<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="cidade" 
                  v-model="cliente.cidade" 
                  class="input-field" 
                  placeholder="Insira"
                  required
                />
              </div>
              <div class="campo-formulario">
                <label for="estado">Estado<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="estado" 
                  v-model="cliente.estado" 
                  class="input-field" 
                  placeholder="Insira"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Exibir mensagens de erro -->
          <div class="error-message" v-if="mensagensErro">
            {{ mensagensErro }}
          </div>

          <!-- Indicador de progresso -->
          <div class="progress-indicator">
            <div class="etapa-label">
              Etapa {{ etapaAtual }}/3
            </div>
            <div class="progress-dots">
              <div class="dot" :class="{ active: etapaAtual >= 1 }"></div>
              <div class="dot-divider"></div>
              <div class="dot" :class="{ active: etapaAtual >= 2 }"></div>
              <div class="dot-divider"></div>
              <div class="dot" :class="{ active: etapaAtual >= 3 }"></div>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="buttons-container">
            <Button 
              v-if="etapaAtual === 1" 
              @click="fecharModal" 
              label="Cancelar"
              type="secondary"
              buttonType="button"
              class="action-button"
            />
            <Button 
              v-if="etapaAtual > 1" 
              @click="voltarEtapa" 
              label="Voltar"
              type="secondary"
              buttonType="button"
              class="action-button"
            />
            <Button 
              v-if="etapaAtual < 3" 
              @click="proximaEtapa" 
              label="Próximo"
              type="primary"
              buttonType="button"
              class="action-button"
            />
            <Button 
              v-else 
              @click="salvarCliente" 
              :label="modoEdicao ? 'Atualizar' : 'Salvar'"
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
import { ref, reactive, watch, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import Button from '../../components/UI/Button.vue'
import Dropdown from '../../components/UI/Dropdown.vue'
// Props e emits
const props = defineProps({
  clienteParaEdicao: {
    type: Object,
    default: null
  },
  modoEdicao: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'clienteSalvo', 'switchToPJ', 'switchToLote'])

// Estados do formulário
const tipoCliente = ref('pf') // pf, pj, lote
const etapaAtual = ref(1) // Começando na etapa 1 (Dados pessoais)

// Opções para os dropdowns
const opcoesGenero = [
  { id: '', label: 'Selecione' },
  { id: 'M', label: 'Masculino' },
  { id: 'F', label: 'Feminino' },
  { id: 'O', label: 'Outro' }
]

const opcoesEstadoCivil = [
  { id: '', label: 'Selecione' },
  { id: 'solteiro', label: 'Solteiro(a)' },
  { id: 'casado', label: 'Casado(a)' },
  { id: 'divorciado', label: 'Divorciado(a)' },
  { id: 'viuvo', label: 'Viúvo(a)' },
  { id: 'separado', label: 'Separado(a)' }
]

// Dados do cliente
const cliente = reactive({
  nome: '',
  cpf: '',
  rg: '',
  orgao_emissor: '',
  pasep: '',
  datanascimento: '',
  sexo: '',
  nacionalidade: '',
  estado_civil: '',
  profissao: '',
  nome_mae: '',
  nome_pai: '',
  observacoes: '',
  telefones: [
    { numero: '' }
  ],
  emails: [
    { endereco: '' }
  ],
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  ativo: true
})

// Função para carregar dados do cliente em modo de edição
const carregarDadosCliente = () => {
  if (props.modoEdicao && props.clienteParaEdicao) {
    const c = props.clienteParaEdicao
    console.log('Carregando dados do cliente para edição:', c)
    
    // Dados pessoais
    cliente.nome = c.nome || ''
    cliente.cpf = formatarCPFParaExibicao(c.cpf || '')
    cliente.rg = formatarRGParaExibicao(c.rg || '')
    cliente.orgao_emissor = c.orgao_emissor || ''
    cliente.pasep = c.pasep || ''
    cliente.datanascimento = formatarDataParaExibicao(c.datanascimento || '')
    cliente.sexo = c.sexo || ''
    cliente.nacionalidade = c.nacionalidade || ''
    cliente.estado_civil = c.estado_civil || ''
    cliente.profissao = c.profissao || ''
    cliente.nome_mae = c.nome_mae || ''
    cliente.nome_pai = c.nome_pai || ''
    cliente.observacoes = c.observacoes || ''
    
    // Telefones - usar lista_whatsapp se disponível, senão usar telefone
    if (c.lista_whatsapp && c.lista_whatsapp.length > 0) {
      cliente.telefones = c.lista_whatsapp.map(tel => ({ numero: formatarTelefoneParaExibicao(tel) }))
    } else if (c.telefone) {
      cliente.telefones = [{ numero: formatarTelefoneParaExibicao(c.telefone) }]
    }
    
    // Emails - usar lista_emails se disponível, senão usar email
    if (c.lista_emails && c.lista_emails.length > 0) {
      cliente.emails = c.lista_emails.map(email => ({ endereco: email }))
    } else if (c.email) {
      cliente.emails = [{ endereco: c.email }]
    }
    
    // Endereço
    cliente.cep = formatarCEPParaExibicao(c.cep || '')
    cliente.rua = c.rua || ''
    cliente.numero = c.numero || ''
    cliente.complemento = c.complemento || ''
    cliente.bairro = c.bairro || ''
    cliente.cidade = c.cidade || ''
    cliente.estado = c.estado || ''
    cliente.ativo = c.ativo !== false
  }
}

// Funções auxiliares para formatação de dados para exibição
const formatarCPFParaExibicao = (cpf) => {
  if (!cpf) return ''
  const apenasNumeros = cpf.replace(/\D/g, '')
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpf
}

const formatarRGParaExibicao = (rg) => {
  if (!rg) return ''
  const apenasNumeros = rg.replace(/\D/g, '')
  if (apenasNumeros.length === 9) {
    return apenasNumeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
  }
  return rg
}

const formatarDataParaExibicao = (data) => {
  if (!data) return ''
  // Se a data está no formato YYYY-MM-DD, converter para DD/MM/YYYY
  if (data.includes('-') && data.length === 10) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }
  return data
}

const formatarCEPParaExibicao = (cep) => {
  if (!cep) return ''
  const apenasNumeros = cep.replace(/\D/g, '')
  if (apenasNumeros.length === 8) {
    return apenasNumeros.replace(/^(\d{5})(\d{3})/, '$1-$2')
  }
  return cep
}

const formatarTelefoneParaExibicao = (telefone) => {
  if (!telefone) return ''
  const apenasNumeros = telefone.replace(/\D/g, '')
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (apenasNumeros.length === 10) {
    return apenasNumeros.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return telefone
}

// Funções para adicionar/remover telefones
const adicionarTelefone = () => {
  cliente.telefones.push({ numero: '' })
}

const removerTelefone = (index) => {
  if (cliente.telefones.length > 1) {
    cliente.telefones.splice(index, 1)
  }
}

// Funções para adicionar/remover emails
const adicionarEmail = () => {
  cliente.emails.push({ endereco: '' })
}

const removerEmail = (index) => {
  if (cliente.emails.length > 1) {
    cliente.emails.splice(index, 1)
  }
}

// Mensagens de erro para validação
const mensagensErro = ref('')

// Carregar dados quando o componente montar ou quando props mudarem
onMounted(() => {
  carregarDadosCliente()
})

// Watcher para carregar dados quando as props mudarem
watch(() => props.clienteParaEdicao, () => {
  carregarDadosCliente()
}, { deep: true })

// Função para lidar com mudança de tipo de cliente
const handleTipoClienteChange = () => {
  // Não executar em modo de edição
  if (props.modoEdicao) return
  
  console.log('🔥 handleTipoClienteChange chamada! tipoCliente.value:', tipoCliente.value)
  if (tipoCliente.value === 'pj') {
    console.log('🔄 Trocando para FormularioPJ...')
    // Emitir evento para trocar para FormularioPJ
    emit('switchToPJ')
  } else if (tipoCliente.value === 'lote') {
    console.log('📁 Trocando para FormularioLote...')
    // Emitir evento para trocar para FormularioLote
    console.log('🔥 EMITINDO switchToLote...')
    emit('switchToLote')
    console.log('✅ switchToLote EMITIDO!')
  }
}

// Watcher para detectar mudança para Pessoa Jurídica ou Em lote (backup)
watch(tipoCliente, (newValue, oldValue) => {
  // Não executar em modo de edição
  if (props.modoEdicao) return
  
  console.log('👁️ PF Watcher tipoCliente mudou de', oldValue, 'para', newValue)
  if (newValue === 'pj') {
    console.log('👁️ Watcher detectou mudança para PJ')
    // Emitir evento para trocar para FormularioPJ
    emit('switchToPJ')
  } else if (newValue === 'lote') {
    console.log('👁️ Watcher detectou mudança para Lote')
    // Emitir evento para trocar para FormularioLote
    console.log('👁️ WATCHER EMITINDO switchToLote...')
    emit('switchToLote')
    console.log('👁️ WATCHER switchToLote EMITIDO!')
  }
})

// Limpar mensagens de erro
const limparMensagensErro = () => {
  mensagensErro.value = ''
}

// Funções de navegação entre etapas com validação
const proximaEtapa = () => {
  limparMensagensErro()

  // Validar etapa atual antes de avançar
  if (etapaAtual.value === 1) {
    // Validação da etapa 1 (Dados Pessoais)
    if (!cliente.nome) {
      mensagensErro.value = 'Por favor, preencha o nome completo.'
      return
    }
    if (!cliente.cpf) {
      mensagensErro.value = 'Por favor, preencha o CPF.'
      return
    }
    if (!cliente.rg || !cliente.orgao_emissor) {
      mensagensErro.value = 'Por favor, preencha o RG e o Órgão Emissor.'
      return
    }
    if (!cliente.datanascimento) {
      mensagensErro.value = 'Por favor, preencha a data de nascimento.'
      return
    }
    if (!cliente.nacionalidade) {
      mensagensErro.value = 'Por favor, selecione a nacionalidade.'
      return
    }
    if (!cliente.estado_civil) {
      mensagensErro.value = 'Por favor, selecione o estado civil.'
      return
    }
    if (!cliente.profissao) {
      mensagensErro.value = 'Por favor, preencha a profissão.'
      return
    }
  } else if (etapaAtual.value === 2) {
    // Validação da etapa 2 (Contato)
    let telefonesValidos = true
    let emailsValidos = true

    // Verificar se há pelo menos um whatsapp válido
    if (cliente.telefones.length === 0) {
      mensagensErro.value = 'Adicione pelo menos um número de whatsapp.'
      return
    }
    
    // Verificar se os whatsapps estão preenchidos
    cliente.telefones.forEach((telefone, index) => {
      if (!telefone.numero || telefone.numero.trim() === '') {
        telefonesValidos = false
        mensagensErro.value = `Por favor, preencha o whatsapp ${index + 1}.`
        return
      }
    })
    
    if (!telefonesValidos) return

    // Verificar se há pelo menos um email válido
    if (cliente.emails.length === 0) {
      mensagensErro.value = 'Adicione pelo menos um endereço de e-mail.'
      return
    }
    
    // Verificar se os emails estão preenchidos e válidos
    cliente.emails.forEach((email, index) => {
      if (!email.endereco || email.endereco.trim() === '') {
        emailsValidos = false
        mensagensErro.value = `Por favor, preencha o e-mail ${index + 1}.`
        return
      }
      
      // Validação simples de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email.endereco)) {
        emailsValidos = false
        mensagensErro.value = `Por favor, insira um e-mail válido no campo ${index + 1}.`
      }
    })
    
    if (!emailsValidos) return
  }

  // Se passar na validação, avançar para a próxima etapa
  if (etapaAtual.value < 3) {
    etapaAtual.value++
  }
}

const voltarEtapa = () => {
  if (etapaAtual.value > 1) {
    etapaAtual.value--
  }
}

// Fechar o modal
const fecharModal = () => {
  // Resetar o formulário
  resetarFormulario()
  emit('close')
}

// Função para resetar o formulário
const resetarFormulario = () => {
  tipoCliente.value = 'pf' // Resetar o tipo de cliente para PF
  etapaAtual.value = 1
  cliente.nome = ''
  cliente.cpf = ''
  cliente.rg = ''
  cliente.orgao_emissor = ''
  cliente.pasep = ''
  cliente.datanascimento = ''
  cliente.sexo = ''
  cliente.nacionalidade = ''
  cliente.estado_civil = ''
  cliente.profissao = ''
  cliente.nome_mae = ''
  cliente.nome_pai = ''
  cliente.observacoes = ''
  cliente.telefones = [{ numero: '' }]
  cliente.emails = [{ endereco: '' }]
  cliente.cep = ''
  cliente.rua = ''
  cliente.numero = ''
  cliente.complemento = ''
  cliente.bairro = ''
  cliente.cidade = ''
  cliente.estado = ''
  mensagensErro.value = ''
}



// Funções de formatação para campos com máscara

// Formatar CPF: ###.###.###-##
const formatarCPF = () => {
  if (!cliente.cpf) return
  
  // Remover qualquer caractere que não seja número
  let cpf = cliente.cpf.replace(/\D/g, '')
  
  // Aplicar máscara: ###.###.###-##
  if (cpf.length <= 11) {
    cpf = cpf.replace(/^(\d{3})(\d)/, '$1.$2')
    cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  
  // Atualizar o valor no modelo
  cliente.cpf = cpf
}

// Formatar RG: ##.###.###-#
const formatarRG = () => {
  if (!cliente.rg) return
  
  // Remover qualquer caractere que não seja número
  let rg = cliente.rg.replace(/\D/g, '')
  
  // Aplicar máscara: ##.###.###-#
  if (rg.length <= 9) {
    rg = rg.replace(/^(\d{2})(\d)/, '$1.$2')
    rg = rg.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    rg = rg.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  
  // Atualizar o valor no modelo
  cliente.rg = rg
}

// Formatar Data: ##/##/####
const formatarData = () => {
  if (!cliente.datanascimento) return
  
  // Remover qualquer caractere que não seja número
  let data = cliente.datanascimento.replace(/\D/g, '')
  
  // Aplicar máscara: ##/##/####
  if (data.length <= 8) {
    data = data.replace(/^(\d{2})(\d)/, '$1/$2')
    data = data.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
  }
  
  // Atualizar o valor no modelo
  cliente.datanascimento = data
}

// Formatar CEP: #####-###
const formatarCEP = () => {
  if (!cliente.cep) return
  
  // Remover qualquer caractere que não seja número
  let cep = cliente.cep.replace(/\D/g, '')
  
  // Aplicar máscara: #####-###
  if (cep.length <= 8) {
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2')
  }
  
  // Atualizar o valor no modelo
  cliente.cep = cep
}

// Formatar Telefone: (##) #####-#### ou (##) ####-####
const formatarTelefone = (telefone, index) => {
  if (!telefone.numero) return
  
  // Remover qualquer caractere que não seja número
  let numero = telefone.numero.replace(/\D/g, '')
  
  // Aplicar máscara baseada no tamanho
  if (numero.length <= 11) {
    if (numero.length <= 2) {
      numero = numero.replace(/^(\d{1,2})/, '($1')
    } else if (numero.length <= 6) {
      numero = numero.replace(/^(\d{2})(\d{1,4})/, '($1) $2')
    } else if (numero.length <= 10) {
      numero = numero.replace(/^(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3')
    } else {
      numero = numero.replace(/^(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3')
    }
  }
  
  // Atualizar o valor no modelo
  telefone.numero = numero
}

// Funções para manipular os dropdowns
const handleGeneroSelected = (option) => {
  cliente.sexo = option.id
}

const handleEstadoCivilSelected = (option) => {
  cliente.estado_civil = option.id
}

// Função para converter a data do formato DD/MM/YYYY para YYYY-MM-DD
const formatarDataParaBanco = (dataStr) => {
  if (!dataStr) return null
  
  // Verificar se o formato é DD/MM/YYYY
  const partes = dataStr.split('/')
  if (partes.length !== 3) return null
  
  const dia = partes[0].padStart(2, '0')
  const mes = partes[1].padStart(2, '0')
  const ano = partes[2].length === 2 ? `20${partes[2]}` : partes[2] // Assumir 20xx para anos de 2 dígitos
  
  return `${ano}-${mes}-${dia}` // Formato ISO: YYYY-MM-DD
}

// Função para remover caracteres especiais (pontos, traços, etc)
const apenasNumeros = (texto) => {
  if (!texto) return ''
  return texto.replace(/\D/g, '')
}

// Função para formatar arrays corretamente
const formatarArray = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return [] // Retorna array vazio se não houver dados
  }
  return array.filter(item => item && item !== '') // Remove itens vazios ou nulos
}

// Buscar CEP via API externa (ViaCEP)
const buscarCEP = async () => {
  if (!cliente.cep || cliente.cep.replace(/\D/g, '').length < 8) {
    mensagensErro.value = 'Por favor, digite um CEP válido'
    return
  }
  
  // Formatar o CEP removendo caracteres não-numéricos
  const cepNumerico = cliente.cep.replace(/\D/g, '')
  
  try {
    // Consulta à API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`)
    const data = await response.json()
    
    if (data.erro) {
      mensagensErro.value = 'CEP não encontrado. Por favor, verifique e tente novamente.'
      return
    }
    
    // Limpar mensagem de erro caso exista
    limparMensagensErro()
    
    // Preencher os campos com os dados retornados
    cliente.rua = data.logradouro
    cliente.bairro = data.bairro
    cliente.cidade = data.localidade
    cliente.estado = data.uf
    
    console.log('Endereço encontrado:', data)
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    mensagensErro.value = 'Erro ao buscar o CEP. Por favor, tente novamente.'
  }
}

// Salvar cliente
const salvarCliente = async () => {
  limparMensagensErro()

  // Validar a última etapa antes de salvar
  if (!cliente.bairro) {
    mensagensErro.value = 'Por favor, preencha o bairro.'
    return
  }
  if (!cliente.cidade) {
    mensagensErro.value = 'Por favor, preencha a cidade.'
    return
  }
  if (!cliente.estado) {
    mensagensErro.value = 'Por favor, preencha o estado.'
    return
  }

  // Preparar dados conforme estrutura da tabela no Supabase
  const clienteParaSalvar = {
    // Dados pessoais
    nome: cliente.nome?.trim(),
    cpf: apenasNumeros(cliente.cpf),
    rg: apenasNumeros(cliente.rg),
    orgao_emissor: cliente.orgao_emissor?.trim(),
    pasep: apenasNumeros(cliente.pasep),
    datanascimento: formatarDataParaBanco(cliente.datanascimento), // Converter para formato YYYY-MM-DD
    sexo: cliente.sexo?.trim(),
    nacionalidade: cliente.nacionalidade?.trim(),
    estado_civil: cliente.estado_civil?.trim(),
    profissao: cliente.profissao?.trim(),
    nome_mae: cliente.nome_mae?.trim(),
    nome_pai: cliente.nome_pai?.trim(),
    observacoes: cliente.observacoes?.trim(),
    
    // Contatos - convertendo para os campos lista_whatsapp e lista_emails
    lista_whatsapp: formatarArray(cliente.telefones.map(tel => apenasNumeros(tel.numero))),
    lista_emails: formatarArray(cliente.emails.map(email => email.endereco?.trim().toLowerCase())),
    // Manter compatibilidade com campo telefone existente
    telefone: cliente.telefones.length > 0 ? apenasNumeros(cliente.telefones[0].numero) : '',
    // Manter compatibilidade com campo email existente
    email: cliente.emails.length > 0 ? cliente.emails[0].endereco?.trim().toLowerCase() : '',
    
    // Endereço
    cep: apenasNumeros(cliente.cep),
    rua: cliente.rua?.trim(),
    numero: parseInt(cliente.numero) || null,
    complemento: cliente.complemento?.trim(),
    bairro: cliente.bairro?.trim(),
    cidade: cliente.cidade?.trim(),
    estado: cliente.estado?.trim(),
    
    // Flags
    empresa: false, // Sempre false para pessoa física
    ativo: true,
    cliente_novo: true,
    cliente_andamento: false,
    cliente_finalizado: false
  }
  
  // Fazer um último check nos dados antes de enviar
  // Verificar campos obrigatórios
  if (!clienteParaSalvar.nome) {
    mensagensErro.value = 'Nome é obrigatório para salvar o cliente.'
    return
  }
  
  // Verificar CPF válido (pelo menos com tamanho correto)
  if (clienteParaSalvar.cpf && clienteParaSalvar.cpf.length !== 11) {
    mensagensErro.value = 'CPF inválido. Deve conter 11 dígitos.'
    return
  }
  
  console.log(props.modoEdicao ? 'Atualizando cliente:' : 'Salvando cliente:', clienteParaSalvar)
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('Usuário não está autenticado')
      mensagensErro.value = 'Você precisa estar autenticado para salvar clientes.'
      return
    }
    
    console.log('Usuário autenticado:', session.user.email)
    
    // Adicionar o UUID do usuário autenticado ao cliente
    clienteParaSalvar.uuid = session.user.id
    console.log('UUID do usuário adicionado:', clienteParaSalvar.uuid)
    
    let data, error
    
    if (props.modoEdicao && props.clienteParaEdicao) {
      // Lógica para atualizar o cliente existente no Supabase
      const result = await supabase
        .from('clientes')
        .update(clienteParaSalvar)
        .eq('id', props.clienteParaEdicao.id)
        .select()
      
      data = result.data
      error = result.error
      
      console.log('Resultado da atualização:', { data, error })
    } else {
      // Lógica para salvar novo cliente no Supabase
      const result = await supabase
        .from('clientes')
        .insert(clienteParaSalvar)
        .select()
      
      data = result.data
      error = result.error
    }

    if (error) {
      // Tratamento de erros específicos
      if (error.code === '23505') {
        mensagensErro.value = 'Este CPF já está cadastrado no sistema.'
        return
      } else if (error.code === '22008') {
        mensagensErro.value = 'Formato de data inválido. Use o formato DD/MM/AAAA.'
        return
      } else {
        throw error
      }
    }
    
    console.log('Cliente processado com sucesso:', data)
    
    // Emitir evento para o componente pai informando que um cliente foi salvo/atualizado
    const mensagemSucesso = props.modoEdicao 
      ? `Cliente ${clienteParaSalvar.nome} atualizado com sucesso!`
      : `Cliente ${clienteParaSalvar.nome} cadastrado com sucesso!`
    
    emit('clienteSalvo', {
      cliente: clienteParaSalvar,
      mensagem: mensagemSucesso
    })
    
    // Resetar o formulário apenas se não estiver em modo de edição
    if (!props.modoEdicao) {
      resetarFormulario()
    }
    
    // Fechar o formulário
    emit('close')
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    mensagensErro.value = `Erro ao salvar cliente: ${error.message || 'Erro desconhecido'}`
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

/* Seletor de tipo de cliente */
.tipo-cliente-selector {
  margin-bottom: 24px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #111827;
  position: relative;
}

.radio-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.radio-dot {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  border: 1px solid #D1D5DB;
  display: inline-block;
  margin-right: 8px;
  position: relative;
}

.radio-container input:checked ~ .radio-dot {
  border-color: #0468FA;
}

.radio-container input:checked ~ .radio-dot:after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0468FA;
}

.radio-text {
  font-weight: 500;
}

/* Estilos para campos do formulário */
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

.input-field, .select-field, .textarea-field {
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
.select-field:focus, 
.textarea-field:focus {
  outline: none;
  border-color: #0468FA;
  box-shadow: 0 0 0 1px rgba(4, 104, 250, 0.2);
}

.select-wrapper {
  position: relative;
}

.select-wrapper:after {
  content: "";
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #6B7280;
  pointer-events: none;
}

.select-field {
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
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

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 24px 0 16px 0;
}

/* Indicador de progresso */
.progress-indicator {
  margin: 32px 0 24px;
}

.etapa-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 8px;
}

.progress-dots {
  display: flex;
  align-items: center;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #E5E7EB;
}

.dot.active {
  background-color: #0468FA;
}

.dot-divider {
  flex: 1;
  height: 2px;
  background-color: #E5E7EB;
  margin: 0 4px;
}

/* Botões de ação */
.buttons-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Define largura fixa para os botões */
.action-button {
  width: 176px !important;
}

/* Estilos para a seção de contato */
.contato-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-end;
}

.contato-item {
  flex: 1;
  max-width: 85%;
}

.add-contato {
  display: flex;
  align-items: center;
  color: #0468FA;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 24px;
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

.remover-contato {
  display: flex;
  align-items: center;
  color: #EF4444;
  font-size: 14px;
  cursor: pointer;
  padding-bottom: 10px;
  margin-left: 8px;
  font-weight: 500;
}

.remover-contato:hover {
  text-decoration: underline;
}

/* Os estilos de botão foram removidos em favor do componente Button.vue */

/* Estilos para o step 3 (Endereço) */
.cep-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cep-input {
  flex: 1;
}

.buscar-cep-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0468FA;
  color: white;
  border: none;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  height: 40px;
  white-space: nowrap;
}

.buscar-icon {
  font-size: 16px;
  margin-right: 8px;
}

/* Estilos responsivos */
@media (max-width: 640px) {
  .fields-row {
    flex-direction: column;
    gap: 16px;
  }

  .radio-group {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 90%;
    margin: 0 auto;
  }
  
  .row-fields {
    flex-direction: column;
  }
  
  .campo-formulario {
    width: 100%;
  }

  .cep-container {
    flex-direction: column;
  }
  
  .buscar-cep-button {
    width: 100%;
    margin-top: 8px;
  }
}

/* Garantindo que os botões tenham border-radius de 12px */
.novo-cliente-btn, .plus-icon-container,
.btn-voltar, .btn-proximo, .btn-salvar {
  border-radius: 12px !important;
}

/* Garantindo que os inputs tenham border-radius de 8px */
.input-field, .select-field, .textarea-field {
  border-radius: 8px !important;
}

/* Estilos para mensagens de erro */
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

/* Garantindo que botões e elementos interativos fiquem na frente */
.action-button, .btn-fechar {
  z-index: 10001 !important;
  position: relative;
}
</style>
