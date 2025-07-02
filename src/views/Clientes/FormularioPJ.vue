<template>
  <teleport to="body">
    <!-- Modal completo -->
    <div class="modal-overlay" @click.self="fecharModal">
      <div class="modal-container">
        <!-- Cabeçalho azul -->
        <div class="header-bar">
          <h2 class="modal-title">{{ modoEdicao ? 'Editar empresa' : 'Novo cliente' }}</h2>
          <button class="close-button" @click="fecharModal">×</button>
        </div>

        <!-- Conteúdo do formulário -->
        <div class="form-content">
          <h2 class="form-title">{{ modoEdicao ? 'Editar dados da empresa' : 'Insira os dados do cliente' }}</h2>

          <!-- Seletor de tipo de cliente - Oculto em modo de edição -->
          <div v-if="!modoEdicao" class="tipo-cliente-selector">
            <div class="radio-group">
              <label class="radio-container">
                <input type="radio" name="tipoCliente" value="pf" v-model="tipoCliente">
                <span class="radio-dot"></span>
                <span class="radio-text">Pessoa física</span>
              </label>
              <label class="radio-container">
                <input type="radio" name="tipoCliente" value="pj" v-model="tipoCliente">
                <span class="radio-dot"></span>
                <span class="radio-text">Pessoa jurídica</span>
              </label>
              <label class="radio-container">
                <input type="radio" name="tipoCliente" value="lote" v-model="tipoCliente">
                <span class="radio-dot"></span>
                <span class="radio-text">Em lote</span>
              </label>
            </div>
          </div>

          <!-- Etapa 1 - Dados da empresa -->
          <div v-if="etapaAtual === 1">
            <h3 class="section-title">Dados da empresa</h3>

            <div class="campo-formulario full-width">
              <label for="razao_social">Razão social<span class="campo-obrigatorio">*</span></label>
              <input 
                type="text" 
                id="razao_social" 
                v-model="empresa.razao_social" 
                class="input-field" 
                placeholder="Insira a razão da social da empresa"
                required
              />
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="cnpj">CNPJ<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="cnpj" 
                  v-model="empresa.cnpj" 
                  @input="formatarCNPJ"
                  class="input-field" 
                  placeholder="Ex: 12.345.678/0001-90"
                  maxlength="18"
                  required
                />
              </div>

              <div class="campo-formulario">
                <label for="nome_fantasia">Nome fantasia<span class="campo-obrigatorio">*</span></label>
                <input 
                  type="text" 
                  id="nome_fantasia" 
                  v-model="empresa.nome_fantasia" 
                  class="input-field" 
                  placeholder="Insira o nome fantasia"
                  required
                />
              </div>
            </div>

            <div class="fields-row">
              <div class="campo-formulario">
                <label for="inscricao_estadual">Inscrição estadual</label>
                <input 
                  type="text" 
                  id="inscricao_estadual" 
                  v-model="empresa.inscricao_estadual" 
                  class="input-field" 
                  placeholder="Insira"
                />
              </div>

              <div class="campo-formulario">
                <label for="inscricao_municipal">Inscrição municipal</label>
                <input 
                  type="text" 
                  id="inscricao_municipal" 
                  v-model="empresa.inscricao_municipal" 
                  class="input-field" 
                  placeholder="Insira o nome fantasia"
                />
              </div>
            </div>

            <div class="campo-formulario full-width">
              <label for="observacoes">Observações</label>
              <textarea 
                id="observacoes" 
                v-model="empresa.observacoes" 
                class="textarea-field" 
                placeholder="Escreva a mensagem"
                rows="4"
              ></textarea>
            </div>
          </div>

          <!-- Etapa 2 - Representantes legais -->
          <div v-if="etapaAtual === 2">
            <h3 class="section-title">Representantes legais</h3>
            
            <div v-for="(representante, index) in empresa.representantes" :key="'rep-'+index" class="representante-section">
              <div class="campo-formulario full-width">
                <label :for="'nome_completo_'+index">Nome completo</label>
                <input 
                  type="text" 
                  :id="'nome_completo_'+index" 
                  v-model="representante.nome" 
                  class="input-field" 
                  placeholder="Insira"
                />
              </div>

              <div class="fields-row">
                <div class="campo-formulario">
                  <label :for="'cpf_rep_'+index">CPF</label>
                  <input 
                    type="text" 
                    :id="'cpf_rep_'+index" 
                    v-model="representante.cpf" 
                    @input="formatarCPF(representante)"
                    class="input-field" 
                    placeholder="Insira CNPJ da empresa"
                    maxlength="14"
                  />
                </div>

                <div class="campo-formulario">
                  <label :for="'data_nascimento_'+index">Data de nascimento</label>
                  <input 
                    type="text" 
                    :id="'data_nascimento_'+index" 
                    v-model="representante.data_nascimento" 
                    @input="formatarData(representante)"
                    class="input-field" 
                    placeholder="dd/mm/aaaa"
                    maxlength="10"
                  />
                </div>
              </div>

              <div class="fields-row">
                <div class="campo-formulario">
                  <label :for="'telefone_rep_'+index">Whatsapp</label>
                  <input 
                    type="text" 
                    :id="'telefone_rep_'+index" 
                    v-model="representante.telefone" 
                    @input="formatarTelefone(representante)"
                    class="input-field" 
                    placeholder="(00) 00000-0000"
                    maxlength="15"
                  />
                </div>

                <div class="campo-formulario">
                  <label :for="'email_rep_'+index">e-mail</label>
                  <input 
                    type="email" 
                    :id="'email_rep_'+index" 
                    v-model="representante.email" 
                    class="input-field" 
                    placeholder="Insira o e-mail"
                  />
                </div>
              </div>

              <div class="campo-formulario full-width">
                <label :for="'cep_rep_'+index">CEP</label>
                <div class="cep-container">
                  <input
                    type="text"
                    :id="'cep_rep_'+index"
                    v-model="representante.cep"
                    @input="formatarCEP(representante)"
                    class="input-field cep-input"
                    placeholder="Ex: 12345-678"
                    maxlength="9"
                  />
                  <button class="buscar-cep-button" @click="buscarCEP(representante)" type="button">
                    <span class="buscar-icon">⚲</span>
                    Bucar CEP
                  </button>
                </div>
              </div>

              <div class="campo-formulario full-width">
                <label :for="'logradouro_rep_'+index">Logradouro</label>
                <input 
                  type="text" 
                  :id="'logradouro_rep_'+index" 
                  v-model="representante.logradouro" 
                  class="input-field" 
                  placeholder="Insira o nome do logradouro"
                />
              </div>

              <div class="row-fields">
                <div class="campo-formulario">
                  <label :for="'numero_rep_'+index">Número</label>
                  <input 
                    type="text" 
                    :id="'numero_rep_'+index" 
                    v-model="representante.numero" 
                    class="input-field" 
                    placeholder="Insira o número"
                  />
                </div>
              </div>

              <div class="campo-formulario full-width">
                <label :for="'complemento_rep_'+index">Complemento</label>
                <input 
                  type="text" 
                  :id="'complemento_rep_'+index" 
                  v-model="representante.complemento" 
                  class="input-field" 
                  placeholder="Insira o nome do logradouro"
                />
              </div>

              <div class="row-fields">
                <div class="campo-formulario">
                  <label :for="'bairro_rep_'+index">Bairro<span class="campo-obrigatorio">*</span></label>
                  <input 
                    type="text" 
                    :id="'bairro_rep_'+index" 
                    v-model="representante.bairro" 
                    class="input-field" 
                    placeholder="Insira"
                    required
                  />
                </div>
                <div class="campo-formulario">
                  <label :for="'cidade_rep_'+index">Cidade<span class="campo-obrigatorio">*</span></label>
                  <input 
                    type="text" 
                    :id="'cidade_rep_'+index" 
                    v-model="representante.cidade" 
                    class="input-field" 
                    placeholder="Insira"
                    required
                  />
                </div>
                <div class="campo-formulario">
                  <label :for="'estado_rep_'+index">Estado<span class="campo-obrigatorio">*</span></label>
                  <input 
                    type="text" 
                    :id="'estado_rep_'+index" 
                    v-model="representante.estado" 
                    class="input-field" 
                    placeholder="Insira"
                    required
                  />
                </div>
              </div>

              <div class="campo-formulario full-width">
                <label :for="'observacoes_rep_'+index">Observações</label>
                <textarea 
                  :id="'observacoes_rep_'+index" 
                  v-model="representante.observacoes" 
                  class="textarea-field" 
                  placeholder="Escreva a mensagem"
                  rows="4"
                ></textarea>
              </div>

              <div class="remover-representante" v-if="empresa.representantes.length > 1" @click="removerRepresentante(index)">
                <span>Remover representante</span>
              </div>
            </div>

            <div class="add-contato" @click="adicionarRepresentante">
              <div class="add-icon">+</div>
              <span>Novo representante legal</span>
            </div>
          </div>

          <!-- Etapa 3 - Contatos gerais -->
          <div v-if="etapaAtual === 3">
            <h3 class="section-title">Contatos gerais</h3>
            
            <div v-for="(telefone, index) in empresa.telefones" :key="'tel-'+index" class="contato-row">
              <div class="contato-item">
                <label for="telefone">Whatsapp</label>
                <input 
                  type="text" 
                  :id="'telefone-'+index" 
                  v-model="telefone.numero" 
                  @input="formatarTelefone(telefone)"
                  class="input-field" 
                  placeholder="(00) 00000-0000"
                  maxlength="15"
                />
              </div>
              <div class="remover-contato" @click="removerTelefone(index)" v-if="empresa.telefones.length > 1">
                <span>Remover</span>
              </div>
            </div>

            <div class="add-contato" @click="adicionarTelefone">
              <div class="add-icon">+</div>
              <span>Novo Whatsapp</span>
            </div>

            <div v-for="(email, index) in empresa.emails" :key="'email-'+index" class="contato-row">
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
              <div class="remover-contato" @click="removerEmail(index)" v-if="empresa.emails.length > 1">
                <span>Remover</span>
              </div>
            </div>

            <div class="add-contato" @click="adicionarEmail">
              <div class="add-icon">+</div>
              <span>Novo e-mail</span>
            </div>
          </div>

          <!-- Etapa 4 - Endereço da empresa -->
          <div v-if="etapaAtual === 4">
            <h3 class="section-title">Endereço da empresa</h3>
            
            <div class="campo-formulario full-width">
              <label for="cep">CEP</label>
              <div class="cep-container">
                <input
                  type="text"
                  id="cep"
                  v-model="empresa.cep"
                  @input="formatarCEP"
                  class="input-field cep-input"
                  placeholder="Ex: 12345-678"
                  maxlength="9"
                />
                <button class="buscar-cep-button" @click="buscarCEPEmpresa" type="button">
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
                v-model="empresa.logradouro" 
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
                  v-model="empresa.numero" 
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
                v-model="empresa.complemento" 
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
                  v-model="empresa.bairro" 
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
                  v-model="empresa.cidade" 
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
                  v-model="empresa.estado" 
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
              Etapa {{ etapaAtual }}/4
            </div>
            <div class="progress-dots">
              <div class="dot" :class="{ active: etapaAtual >= 1 }"></div>
              <div class="dot-divider"></div>
              <div class="dot" :class="{ active: etapaAtual >= 2 }"></div>
              <div class="dot-divider"></div>
              <div class="dot" :class="{ active: etapaAtual >= 3 }"></div>
              <div class="dot-divider"></div>
              <div class="dot" :class="{ active: etapaAtual >= 4 }"></div>
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
              v-if="etapaAtual < 4" 
              @click="proximaEtapa" 
              label="Próximo"
              type="primary"
              buttonType="button"
              class="action-button"
            />
            <Button 
              v-else 
              @click="salvarEmpresa" 
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

// Props e emits
const props = defineProps({
  empresaParaEdicao: {
    type: Object,
    default: null
  },
  modoEdicao: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'clienteSalvo', 'switchToPF', 'switchToLote'])

// Estados do formulário
const tipoCliente = ref('pj') // pj por padrão
const etapaAtual = ref(1) // Começando na etapa 1 (Dados da empresa)

// Dados da empresa
const empresa = reactive({
  razao_social: '',
  cnpj: '',
  nome_fantasia: '',
  inscricao_estadual: '',
  inscricao_municipal: '',
  observacoes: '',
  // Representantes legais
  representantes: [
    {
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      email: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      observacoes: ''
    }
  ],
  // Contatos gerais
  telefones: [
    { numero: '' }
  ],
  emails: [
    { endereco: '' }
  ],
  // Endereço da empresa
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  ativo: true
})

// Mensagens de erro para validação
const mensagensErro = ref('')

// Função para carregar dados da empresa em modo de edição
const carregarDadosEmpresa = async () => {
  if (props.modoEdicao && props.empresaParaEdicao) {
    const e = props.empresaParaEdicao
    console.log('Carregando dados da empresa para edição:', e)
    
    // Dados da empresa
    empresa.razao_social = e.nome || ''  // nome é usado como razão social
    empresa.cnpj = formatarCNPJParaExibicao(e.cnpj || '')
    empresa.nome_fantasia = e.nome_fantasia || ''
    empresa.inscricao_estadual = e.inscricao_estadual || ''
    empresa.inscricao_municipal = e.inscricao_municipal || ''
    empresa.observacoes = e.observacoes || ''
    
    // Carregar representantes legais
    if (e.id) {
      try {
        const { data: representantes, error } = await supabase
          .from('representante_legais')
          .select('*')
          .eq('cliente_id', e.id)
        
        if (!error && representantes && representantes.length > 0) {
          empresa.representantes = representantes.map(rep => ({
            nome: rep.nome_completo || '',
            cpf: formatarCPFParaExibicao(rep.cpf || ''),
            data_nascimento: formatarDataParaExibicao(rep.data_nascimento || ''),
            telefone: formatarTelefoneParaExibicao(rep.whatsapp || ''),
            email: rep.email || '',
            cep: formatarCEPParaExibicao(rep.cep || ''),
            logradouro: rep.logradouro || '',
            numero: rep.numero || '',
            complemento: rep.complemento || '',
            bairro: rep.bairro || '',
            cidade: rep.cidade || '',
            estado: rep.estado || '',
            observacoes: rep.observacoes || ''
          }))
        }
      } catch (error) {
        console.error('Erro ao carregar representantes legais:', error)
      }
    }
    
    // Telefones - usar lista_whatsapp se disponível, senão usar telefone
    if (e.lista_whatsapp && e.lista_whatsapp.length > 0) {
      empresa.telefones = e.lista_whatsapp.map(tel => ({ numero: formatarTelefoneParaExibicao(tel) }))
    } else if (e.telefone) {
      empresa.telefones = [{ numero: formatarTelefoneParaExibicao(e.telefone) }]
    }
    
    // Emails - usar lista_emails se disponível, senão usar email
    if (e.lista_emails && e.lista_emails.length > 0) {
      empresa.emails = e.lista_emails.map(email => ({ endereco: email }))
    } else if (e.email) {
      empresa.emails = [{ endereco: e.email }]
    }
    
    // Endereço da empresa
    empresa.cep = formatarCEPParaExibicao(e.cep || '')
    empresa.logradouro = e.rua || ''
    empresa.numero = e.numero || ''
    empresa.complemento = e.complemento || ''
    empresa.bairro = e.bairro || ''
    empresa.cidade = e.cidade || ''
    empresa.estado = e.estado || ''
    empresa.ativo = e.ativo !== false
  }
}

// Funções auxiliares para formatação de dados para exibição
const formatarCNPJParaExibicao = (cnpj) => {
  if (!cnpj) return ''
  const apenasNumeros = cnpj.replace(/\D/g, '')
  if (apenasNumeros.length === 14) {
    return apenasNumeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return cnpj
}

const formatarCPFParaExibicao = (cpf) => {
  if (!cpf) return ''
  const apenasNumeros = cpf.replace(/\D/g, '')
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return cpf
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

// Carregar dados quando o componente montar ou quando props mudarem
onMounted(() => {
  carregarDadosEmpresa()
})

// Watcher para carregar dados quando as props mudarem
watch(() => props.empresaParaEdicao, () => {
  carregarDadosEmpresa()
}, { deep: true })

// Função para lidar com mudança de tipo de cliente
const handleTipoClienteChange = () => {
  // Não executar em modo de edição
  if (props.modoEdicao) return
  
  console.log('🔥 PJ handleTipoClienteChange chamada! tipoCliente.value:', tipoCliente.value)
  if (tipoCliente.value === 'pf') {
    console.log('🔄 Trocando para FormularioPF...')
    // Emitir evento para trocar para FormularioPF
    emit('switchToPF')
  } else if (tipoCliente.value === 'lote') {
    console.log('📁 Trocando para FormularioLote...')
    // Emitir evento para trocar para FormularioLote
    emit('switchToLote')
  }
}

// Watcher para detectar mudança para Pessoa Física ou Em lote (backup)
watch(tipoCliente, (newValue, oldValue) => {
  // Não executar em modo de edição
  if (props.modoEdicao) return
  
  console.log('👁️ PJ Watcher tipoCliente mudou de', oldValue, 'para', newValue)
  if (newValue === 'pf') {
    console.log('👁️ Watcher detectou mudança para PF')
    // Emitir evento para trocar para FormularioPF
    emit('switchToPF')
  } else if (newValue === 'lote') {
    console.log('👁️ PJ Watcher detectou mudança para Lote')
    // Emitir evento para trocar para FormularioLote
    console.log('👁️ PJ WATCHER EMITINDO switchToLote...')
    emit('switchToLote')
    console.log('👁️ PJ WATCHER switchToLote EMITIDO!')
  }
})

// Limpar mensagens de erro
const limparMensagensErro = () => {
  mensagensErro.value = ''
}

// Funções para adicionar/remover representantes
const adicionarRepresentante = () => {
  empresa.representantes.push({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: ''
  })
}

const removerRepresentante = (index) => {
  if (empresa.representantes.length > 1) {
    empresa.representantes.splice(index, 1)
  }
}

// Funções para adicionar/remover telefones
const adicionarTelefone = () => {
  empresa.telefones.push({ numero: '' })
}

const removerTelefone = (index) => {
  if (empresa.telefones.length > 1) {
    empresa.telefones.splice(index, 1)
  }
}

// Funções para adicionar/remover emails
const adicionarEmail = () => {
  empresa.emails.push({ endereco: '' })
}

const removerEmail = (index) => {
  if (empresa.emails.length > 1) {
    empresa.emails.splice(index, 1)
  }
}

// Funções de navegação entre etapas com validação
const proximaEtapa = () => {
  limparMensagensErro()

  // Validar etapa atual antes de avançar
  if (etapaAtual.value === 1) {
    // Validação da etapa 1 (Dados da empresa)
    if (!empresa.razao_social) {
      mensagensErro.value = 'Por favor, preencha a razão social.'
      return
    }
    if (!empresa.cnpj) {
      mensagensErro.value = 'Por favor, preencha o CNPJ.'
      return
    }
    if (!empresa.nome_fantasia) {
      mensagensErro.value = 'Por favor, preencha o nome fantasia.'
      return
    }
  } else if (etapaAtual.value === 2) {
    // Validação da etapa 2 (Representantes legais)
    for (let i = 0; i < empresa.representantes.length; i++) {
      const rep = empresa.representantes[i]
      if (!rep.nome) {
        mensagensErro.value = `Por favor, preencha o nome do representante ${i + 1}.`
        return
      }
    }
  } else if (etapaAtual.value === 3) {
    // Validação da etapa 3 (Contatos gerais)
    let telefonesValidos = true
    let emailsValidos = true

    // Verificar se há pelo menos um whatsapp válido
    if (empresa.telefones.length === 0) {
      mensagensErro.value = 'Adicione pelo menos um número de whatsapp.'
      return
    }
    
    // Verificar se os whatsapps estão preenchidos
    empresa.telefones.forEach((telefone, index) => {
      if (!telefone.numero || telefone.numero.trim() === '') {
        telefonesValidos = false
        mensagensErro.value = `Por favor, preencha o whatsapp ${index + 1}.`
        return
      }
    })
    
    if (!telefonesValidos) return

    // Verificar se há pelo menos um email válido
    if (empresa.emails.length === 0) {
      mensagensErro.value = 'Adicione pelo menos um endereço de e-mail.'
      return
    }
    
    // Verificar se os emails estão preenchidos e válidos
    empresa.emails.forEach((email, index) => {
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
  if (etapaAtual.value < 4) {
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
  resetarFormulario()
  emit('close')
}

// Função para resetar o formulário
const resetarFormulario = () => {
  tipoCliente.value = 'pj' // Resetar o tipo de cliente para PJ
  etapaAtual.value = 1
  empresa.razao_social = ''
  empresa.cnpj = ''
  empresa.nome_fantasia = ''
  empresa.inscricao_estadual = ''
  empresa.inscricao_municipal = ''
  empresa.observacoes = ''
  empresa.representantes = [{
    nome: '', cpf: '', data_nascimento: '', telefone: '', email: '',
    cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', observacoes: ''
  }]
  empresa.telefones = [{ numero: '' }]
  empresa.emails = [{ endereco: '' }]
  empresa.cep = ''
  empresa.logradouro = ''
  empresa.numero = ''
  empresa.complemento = ''
  empresa.bairro = ''
  empresa.cidade = ''
  empresa.estado = ''
  mensagensErro.value = ''
}

// Funções de formatação
const formatarCNPJ = () => {
  if (!empresa.cnpj) return
  
  let cnpj = empresa.cnpj.replace(/\D/g, '')
  
  if (cnpj.length <= 14) {
    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2')
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5')
  }
  
  empresa.cnpj = cnpj
}

const formatarCPF = (representante) => {
  if (!representante.cpf) return
  
  let cpf = representante.cpf.replace(/\D/g, '')
  
  if (cpf.length <= 11) {
    cpf = cpf.replace(/^(\d{3})(\d)/, '$1.$2')
    cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
  }
  
  representante.cpf = cpf
}

const formatarData = (representante) => {
  if (!representante.data_nascimento) return
  
  let data = representante.data_nascimento.replace(/\D/g, '')
  
  if (data.length <= 8) {
    data = data.replace(/^(\d{2})(\d)/, '$1/$2')
    data = data.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
  }
  
  representante.data_nascimento = data
}

const formatarCEP = (item = empresa) => {
  if (!item.cep) return
  
  let cep = item.cep.replace(/\D/g, '')
  
  if (cep.length <= 8) {
    cep = cep.replace(/^(\d{5})(\d)/, '$1-$2')
  }
  
  item.cep = cep
}

const formatarTelefone = (item) => {
  if (!item.numero) return
  
  let numero = item.numero.replace(/\D/g, '')
  
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
  
  item.numero = numero
}

// Buscar CEP via API externa (ViaCEP)
const buscarCEP = async (item) => {
  if (!item.cep || item.cep.replace(/\D/g, '').length < 8) {
    mensagensErro.value = 'Por favor, digite um CEP válido'
    return
  }
  
  const cepNumerico = item.cep.replace(/\D/g, '')
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`)
    const data = await response.json()
    
    if (data.erro) {
      mensagensErro.value = 'CEP não encontrado. Por favor, verifique e tente novamente.'
      return
    }
    
    limparMensagensErro()
    
    item.logradouro = data.logradouro
    item.bairro = data.bairro
    item.cidade = data.localidade
    item.estado = data.uf
    
    console.log('Endereço encontrado:', data)
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    mensagensErro.value = 'Erro ao buscar o CEP. Por favor, tente novamente.'
  }
}

const buscarCEPEmpresa = () => buscarCEP(empresa)

// Função para converter a data do formato DD/MM/YYYY para YYYY-MM-DD
const formatarDataParaBanco = (dataStr) => {
  if (!dataStr) return null
  
  const partes = dataStr.split('/')
  if (partes.length !== 3) return null
  
  const dia = partes[0].padStart(2, '0')
  const mes = partes[1].padStart(2, '0')
  const ano = partes[2].length === 2 ? `20${partes[2]}` : partes[2]
  
  return `${ano}-${mes}-${dia}`
}

// Função para remover caracteres especiais
const apenasNumeros = (texto) => {
  if (!texto) return ''
  return texto.replace(/\D/g, '')
}

// Função para formatar arrays corretamente
const formatarArray = (array) => {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return []
  }
  return array.filter(item => item && item !== '')
}

// Salvar empresa
const salvarEmpresa = async () => {
  limparMensagensErro()

  // Validar a última etapa antes de salvar
  if (!empresa.bairro) {
    mensagensErro.value = 'Por favor, preencha o bairro.'
    return
  }
  if (!empresa.cidade) {
    mensagensErro.value = 'Por favor, preencha a cidade.'
    return
  }
  if (!empresa.estado) {
    mensagensErro.value = 'Por favor, preencha o estado.'
    return
  }

  // Preparar dados conforme estrutura da tabela no Supabase
  const empresaParaSalvar = {
    // Dados da empresa
    nome: empresa.razao_social?.trim(),
    cnpj: apenasNumeros(empresa.cnpj),
    nome_fantasia: empresa.nome_fantasia?.trim(),
    inscricao_estadual: empresa.inscricao_estadual?.trim(),
    inscricao_municipal: empresa.inscricao_municipal?.trim(),
    observacoes: empresa.observacoes?.trim(),
    
    // Contatos - convertendo para os campos lista_whatsapp e lista_emails
    lista_whatsapp: formatarArray(empresa.telefones.map(tel => apenasNumeros(tel.numero))),
    lista_emails: formatarArray(empresa.emails.map(email => email.endereco?.trim().toLowerCase())),
    telefone: empresa.telefones.length > 0 ? apenasNumeros(empresa.telefones[0].numero) : '',
    email: empresa.emails.length > 0 ? empresa.emails[0].endereco?.trim().toLowerCase() : '',
    
    // Endereço da empresa
    cep: apenasNumeros(empresa.cep),
    rua: empresa.logradouro?.trim(),
    numero: parseInt(empresa.numero) || null,
    complemento: empresa.complemento?.trim(),
    bairro: empresa.bairro?.trim(),
    cidade: empresa.cidade?.trim(),
    estado: empresa.estado?.trim(),
    
    // Representantes legais serão salvos separadamente na tabela representante_legais
    
    // Flags
    empresa: true, // Sempre true para pessoa jurídica
    ativo: true,
    cliente_novo: true,
    cliente_andamento: false,
    cliente_finalizado: false
  }
  
  // Verificar campos obrigatórios
  if (!empresaParaSalvar.nome) {
    mensagensErro.value = 'Razão social é obrigatória para salvar a empresa.'
    return
  }
  
  // Verificar CNPJ válido (pelo menos com tamanho correto)
  if (empresaParaSalvar.cnpj && empresaParaSalvar.cnpj.length !== 14) {
    mensagensErro.value = 'CNPJ inválido. Deve conter 14 dígitos.'
    return
  }
  
  console.log(props.modoEdicao ? 'Atualizando empresa:' : 'Salvando empresa:', empresaParaSalvar)
  
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('Usuário não está autenticado')
      mensagensErro.value = 'Você precisa estar autenticado para salvar empresas.'
      return
    }
    
    console.log('Usuário autenticado:', session.user.email)
    
    // Adicionar o UUID do usuário autenticado à empresa
    empresaParaSalvar.uuid = session.user.id
    console.log('UUID do usuário adicionado:', empresaParaSalvar.uuid)
    
    let clienteData, clienteError, clienteId
    
    if (props.modoEdicao && props.empresaParaEdicao) {
      // Lógica para atualizar a empresa existente no Supabase
      const result = await supabase
        .from('clientes')
        .update(empresaParaSalvar)
        .eq('id', props.empresaParaEdicao.id)
        .select()
      
      clienteData = result.data
      clienteError = result.error
      clienteId = props.empresaParaEdicao.id
      
      console.log('Resultado da atualização da empresa:', { clienteData, clienteError })
    } else {
      // Lógica para salvar nova empresa no Supabase
      const result = await supabase
        .from('clientes')
        .insert(empresaParaSalvar)
        .select()
      
      clienteData = result.data
      clienteError = result.error
      clienteId = clienteData?.[0]?.id
    }

    if (clienteError) {
      // Tratamento de erros específicos
      if (clienteError.code === '23505') {
        mensagensErro.value = 'Este CNPJ já está cadastrado no sistema.'
        return
      } else if (clienteError.code === '22008') {
        mensagensErro.value = 'Formato de data inválido. Use o formato DD/MM/AAAA.'
        return
      } else {
        throw clienteError
      }
    }
    
    console.log('Empresa processada com sucesso:', clienteData)
    console.log('ID do cliente:', clienteId)
    
    // Gerenciar representantes legais
    if (empresa.representantes && empresa.representantes.length > 0 && clienteId) {
      console.log('Gerenciando representantes legais...')
      
      const representantesParaSalvar = empresa.representantes
        .filter(rep => rep.nome && rep.nome.trim()) // Só salvar representantes com nome preenchido
        .map(rep => ({
          nome_completo: rep.nome?.trim(),
          cpf: apenasNumeros(rep.cpf),
          data_nascimento: formatarDataParaBanco(rep.data_nascimento),
          whatsapp: apenasNumeros(rep.telefone),
          email: rep.email?.trim().toLowerCase(),
          cep: apenasNumeros(rep.cep),
          logradouro: rep.logradouro?.trim(),
          numero: rep.numero?.trim(),
          complemento: rep.complemento?.trim(),
          bairro: rep.bairro?.trim(),
          cidade: rep.cidade?.trim(),
          estado: rep.estado?.trim(),
          observacoes: rep.observacoes?.trim(),
          cliente_id: clienteId,
          uuid: session.user.id
        }))
      
      if (props.modoEdicao) {
        // Em modo de edição, remover representantes existentes e inserir os novos
        try {
          // Remover representantes existentes
          await supabase
            .from('representante_legais')
            .delete()
            .eq('cliente_id', clienteId)
          
          console.log('Representantes legais existentes removidos')
        } catch (error) {
          console.error('Erro ao remover representantes existentes:', error)
        }
      }
      
      if (representantesParaSalvar.length > 0) {
        const { error: representantesError } = await supabase
          .from('representante_legais')
          .insert(representantesParaSalvar)
        
        if (representantesError) {
          console.error('Erro ao salvar representantes legais:', representantesError)
          mensagensErro.value = 'Empresa processada, mas houve erro ao salvar os representantes legais.'
          // Mesmo assim vamos continuar o processo, pois a empresa já foi salva
        } else {
          console.log('Representantes legais salvos com sucesso!')
        }
      }
    }
    
    // Emitir evento para o componente pai informando que uma empresa foi salva/atualizada
    const qtdRepresentantes = empresa.representantes.filter(rep => rep.nome && rep.nome.trim()).length
    const mensagemSucesso = props.modoEdicao
      ? (qtdRepresentantes > 0 
        ? `Empresa ${empresaParaSalvar.nome} e ${qtdRepresentantes} representante(s) legal(is) atualizados com sucesso!`
        : `Empresa ${empresaParaSalvar.nome} atualizada com sucesso!`)
      : (qtdRepresentantes > 0 
        ? `Empresa ${empresaParaSalvar.nome} e ${qtdRepresentantes} representante(s) legal(is) cadastrados com sucesso!`
        : `Empresa ${empresaParaSalvar.nome} cadastrada com sucesso!`)
    
    emit('clienteSalvo', {
      cliente: empresaParaSalvar,
      mensagem: mensagemSucesso
    })
    
    // Resetar o formulário apenas se não estiver em modo de edição
    if (!props.modoEdicao) {
      resetarFormulario()
    }
    
    // Fechar o formulário
    emit('close')
  } catch (error) {
    console.error('Erro ao salvar empresa:', error)
    mensagensErro.value = `Erro ao salvar empresa: ${error.message || 'Erro desconhecido'}`
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

.textarea-field {
  min-height: 80px;
  resize: vertical;
}

.fields-row {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}

.row-fields {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
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

.remover-contato, .remover-representante {
  display: flex;
  align-items: center;
  color: #EF4444;
  font-size: 14px;
  cursor: pointer;
  padding-bottom: 10px;
  margin-left: 8px;
  font-weight: 500;
  margin-top: 16px;
}

.remover-contato:hover, .remover-representante:hover {
  text-decoration: underline;
}

/* Estilos para representante section */
.representante-section {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  background-color: #F9FAFB;
}

.representante-section:first-child {
  margin-top: 0;
}

/* Estilos para CEP */
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
  .fields-row, .row-fields {
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

  .contato-row {
    flex-direction: column;
  }
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