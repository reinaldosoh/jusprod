<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container">
      <!-- Cabeçalho azul -->
      <div class="header-bar">
        <h2>Importar clientes</h2>
        <button @click="emit('close')" class="close-button">✕</button>
      </div>

      <!-- Conteúdo -->
      <div class="content">
        <h3 class="titulo">Importar em lote</h3>

        <!-- Radio buttons -->
        <div class="radio-group">
          <label class="radio-item">
            <input type="radio" name="tipo" value="pf" v-model="tipoSelecionado">
            <span class="radio-circle"></span>
            <span>Pessoa física</span>
          </label>
          
          <label class="radio-item">
            <input type="radio" name="tipo" value="pj" v-model="tipoSelecionado">
            <span class="radio-circle"></span>
            <span>Pessoa jurídica</span>
          </label>
          
          <label class="radio-item">
            <input type="radio" name="tipo" value="lote" v-model="tipoSelecionado">
            <span class="radio-circle"></span>
            <span>Em lote</span>
          </label>
        </div>

                 <!-- Área de upload pontilhada -->
         <div 
           class="upload-area" 
           @click="triggerUpload"
           @dragover.prevent="handleDragOver"
           @dragleave.prevent="handleDragLeave"
           @drop.prevent="handleDrop"
           :class="{ 'drag-over': isDragOver }"
         >
           <div class="upload-icon">
             <FolderOpen :size="32" color="#6b7280" />
           </div>
           <p class="upload-text">
             <span class="link-blue">Clique para carregar</span> ou arraste e solte
           </p>
           <p class="upload-info">XLS (Tamanho máximo 5 MB)</p>
           <input ref="fileInput" type="file" accept=".xls,.xlsx" @change="handleFileSelect" style="display: none;">
         </div>

         <!-- Arquivo selecionado -->
         <div v-if="arquivoSelecionado" class="arquivo-selecionado">
           <div class="arquivo-info">
             <span class="arquivo-icone">
               <FileText :size="16" color="#6b7280" />
             </span>
             <span class="arquivo-nome">{{ arquivoSelecionado.name }}</span>
             <button @click="removerArquivo" class="remover-btn">✕</button>
           </div>
         </div>

         <!-- Mensagem de erro -->
         <div v-if="mensagemErro" class="mensagem-erro">
           {{ mensagemErro }}
         </div>

        <!-- Links de download -->
        <div class="download-links">
          <a href="#" @click.prevent="downloadTemplate('pf')" class="download-link">
            <Download :size="16" color="#0468FA" /> Baixar template PF
          </a>
          <a href="#" @click.prevent="downloadTemplate('pj')" class="download-link">
            <Download :size="16" color="#0468FA" /> Baixar template PJ
          </a>
        </div>
      </div>

             <!-- Botões do rodapé -->
       <div class="footer">
         <Button 
           @click="emit('close')" 
           label="Cancelar"
           type="secondary"
           buttonType="button"
           class="action-button"
         />
         <Button 
           @click="salvarLote" 
           :label="carregando ? 'Processando...' : 'Salvar'"
           type="primary"
           buttonType="button"
           :disabled="!arquivoSelecionado || carregando"
           class="action-button"
         />
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase.js'
import { FolderOpen, Download, FileText } from 'lucide-vue-next'
import Button from '../../components/UI/Button.vue'

console.log('🎉 FormularioLote foi carregado!')
console.log('🎨 Ícones Lucide importados:', { FolderOpen, Download, FileText })

// Emits
const emit = defineEmits(['close', 'clientesSalvos', 'switchToPF', 'switchToPJ'])

// Dados reativos
const tipoSelecionado = ref('lote')
const arquivoSelecionado = ref(null)
const mensagemErro = ref('')
const carregando = ref(false)
const fileInput = ref(null)
const isDragOver = ref(false)

// Watcher para detectar mudança de tipo e emitir eventos para trocar formulários
watch(tipoSelecionado, (newValue, oldValue) => {
  console.log('📁 Lote Watcher tipoSelecionado mudou de', oldValue, 'para', newValue)
  if (newValue === 'pf') {
    console.log('📁 Lote Watcher detectou mudança para PF')
    emit('switchToPF')
  } else if (newValue === 'pj') {
    console.log('📁 Lote Watcher detectou mudança para PJ')
    emit('switchToPJ')
  }
})

// Função para acionar seleção de arquivo
const triggerUpload = () => {
  fileInput.value.click()
}

// Função para lidar com arquivo selecionado
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    validarArquivo(file)
  }
}

// Função para lidar com drag over
const handleDragOver = () => {
  isDragOver.value = true
}

// Função para lidar com drag leave
const handleDragLeave = () => {
  isDragOver.value = false
}

// Função para lidar com drag and drop
const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validarArquivo(file)
  }
}

// Função para validar arquivo
const validarArquivo = (file) => {
  mensagemErro.value = ''
  
  // Verificar tipo de arquivo
  const tiposPermitidos = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  if (!tiposPermitidos.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/i)) {
    mensagemErro.value = 'Formato de arquivo inválido. Use apenas arquivos XLS ou XLSX.'
    return
  }
  
  // Verificar tamanho (5MB = 5 * 1024 * 1024 bytes)
  const tamanhoMaximo = 5 * 1024 * 1024
  if (file.size > tamanhoMaximo) {
    mensagemErro.value = 'Arquivo muito grande. Tamanho máximo permitido: 5MB.'
    return
  }
  
  arquivoSelecionado.value = file
}

// Função para remover arquivo
const removerArquivo = () => {
  arquivoSelecionado.value = null
  fileInput.value.value = ''
  mensagemErro.value = ''
}

// Função para criar template PF
const criarTemplatePF = () => {
  const dados = [
    {
      'Nome*': '',
      'CPF*': '',
      'RG': '',
      'Órgão Emissor': '',
      'PIS/PASEP': '',
      'Data de Nascimento (DD/MM/AAAA)': '',
      'Sexo (M/F)': '',
      'Nacionalidade': '',
      'Estado Civil': '',
      'Profissão': '',
      'Nome da Mãe': '',
      'Nome do Pai': '',
      'WhatsApp': '',
      'E-mail': '',
      'CEP': '',
      'Logradouro': '',
      'Número': '',
      'Complemento': '',
      'Bairro*': '',
      'Cidade*': '',
      'Estado*': '',
      'Observações': ''
    }
  ]
  
  return dados
}

// Função para criar template PJ
const criarTemplatePJ = () => {
  const dados = [
    {
      'Razão Social*': '',
      'CNPJ*': '',
      'Nome Fantasia*': '',
      'Inscrição Estadual': '',
      'Inscrição Municipal': '',
      'WhatsApp': '',
      'E-mail': '',
      'CEP': '',
      'Logradouro': '',
      'Número': '',
      'Complemento': '',
      'Bairro*': '',
      'Cidade*': '',
      'Estado*': '',
      'Observações': ''
    }
  ]
  
  return dados
}

// Função para download do template
const downloadTemplate = (tipo) => {
  let dados, nomeArquivo
  
  if (tipo === 'pf') {
    dados = criarTemplatePF()
    nomeArquivo = 'template_pessoa_fisica.xlsx'
  } else {
    dados = criarTemplatePJ()
    nomeArquivo = 'template_pessoa_juridica.xlsx'
  }
  
  // Criar planilha
  const worksheet = XLSX.utils.json_to_sheet(dados)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes')
  
  // Download
  XLSX.writeFile(workbook, nomeArquivo)
}

// Função para processar planilha
const processarPlanilha = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        resolve(jsonData)
      } catch (error) {
        reject(new Error('Erro ao processar planilha. Verifique se o formato está correto.'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo.'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// Função para salvar em lote
const salvarLote = async () => {
  if (!arquivoSelecionado.value) {
    mensagemErro.value = 'Selecione um arquivo para importar.'
    return
  }
  
  carregando.value = true
  mensagemErro.value = ''
  
  try {
    // Processar planilha
    const dadosPlanilha = await processarPlanilha(arquivoSelecionado.value)
    
    if (!dadosPlanilha || dadosPlanilha.length === 0) {
      throw new Error('A planilha está vazia ou não contém dados válidos.')
    }
    
    // Obter sessão do usuário
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Você precisa estar autenticado para importar clientes.')
    }
    
    // Processar e salvar clientes
    const clientesParaSalvar = []
    const erros = []
    
    for (let i = 0; i < dadosPlanilha.length; i++) {
      const linha = dadosPlanilha[i]
      const numeroLinha = i + 2 // +2 porque linha 1 é cabeçalho e array começa em 0
      
      try {
        const cliente = processarLinhaCliente(linha, session.user.id)
        if (cliente) {
          clientesParaSalvar.push(cliente)
        }
      } catch (error) {
        erros.push(`Linha ${numeroLinha}: ${error.message}`)
      }
    }
    
    if (erros.length > 0) {
      mensagemErro.value = `Erros encontrados:\n${erros.slice(0, 5).join('\n')}${erros.length > 5 ? `\n... e mais ${erros.length - 5} erros.` : ''}`
      return
    }
    
    if (clientesParaSalvar.length === 0) {
      throw new Error('Nenhum cliente válido encontrado na planilha.')
    }
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('clientes')
      .insert(clientesParaSalvar)
    
    if (error) {
      throw error
    }
    
    // Emitir evento de sucesso
    emit('clientesSalvos', {
      quantidade: clientesParaSalvar.length,
      mensagem: `${clientesParaSalvar.length} cliente(s) importado(s) com sucesso!`
    })
    
    // Fechar modal
    emit('close')
    
  } catch (error) {
    console.error('Erro ao importar clientes:', error)
    mensagemErro.value = error.message || 'Erro ao importar clientes. Tente novamente.'
  } finally {
    carregando.value = false
  }
}

// Função para processar linha do cliente
const processarLinhaCliente = (linha, userId) => {
  // Detectar se é PF ou PJ baseado nas colunas
  const isPJ = linha['Razão Social*'] || linha['CNPJ*']
  
  if (isPJ) {
    // Validações obrigatórias PJ
    if (!linha['Razão Social*']) throw new Error('Razão Social é obrigatória')
    if (!linha['CNPJ*']) throw new Error('CNPJ é obrigatório')
    if (!linha['Nome Fantasia*']) throw new Error('Nome Fantasia é obrigatório')
    
    return {
      nome: linha['Razão Social*']?.trim(),
      cnpj: linha['CNPJ*']?.toString().replace(/\D/g, ''),
      nome_fantasia: linha['Nome Fantasia*']?.trim(),
      inscricao_estadual: linha['Inscrição Estadual']?.trim() || null,
      inscricao_municipal: linha['Inscrição Municipal']?.trim() || null,
      telefone: linha['WhatsApp']?.toString().replace(/\D/g, '') || null,
      email: linha['E-mail']?.trim().toLowerCase() || null,
      cep: linha['CEP']?.toString().replace(/\D/g, '') || null,
      rua: linha['Logradouro']?.trim() || null,
      numero: linha['Número'] ? parseInt(linha['Número']) : null,
      complemento: linha['Complemento']?.trim() || null,
      bairro: linha['Bairro*']?.trim() || null,
      cidade: linha['Cidade*']?.trim() || null,
      estado: linha['Estado*']?.trim() || null,
      observacoes: linha['Observações']?.trim() || null,
      empresa: true,
      ativo: true,
      cliente_novo: true,
      cliente_andamento: false,
      cliente_finalizado: false,
      uuid: userId,
      lista_whatsapp: linha['WhatsApp'] ? [linha['WhatsApp'].toString().replace(/\D/g, '')] : [],
      lista_emails: linha['E-mail'] ? [linha['E-mail'].trim().toLowerCase()] : []
    }
  } else {
    // Validações obrigatórias PF
    if (!linha['Nome*']) throw new Error('Nome é obrigatório')
    if (!linha['CPF*']) throw new Error('CPF é obrigatório')
    
    return {
      nome: linha['Nome*']?.trim(),
      cpf: linha['CPF*']?.toString().replace(/\D/g, ''),
      rg: linha['RG']?.trim() || null,
      orgao_emissor: linha['Órgão Emissor']?.trim() || null,
      pasep: linha['PIS/PASEP']?.toString().replace(/\D/g, '') || null,
      datanascimento: linha['Data de Nascimento (DD/MM/AAAA)'] ? formatarDataParaBanco(linha['Data de Nascimento (DD/MM/AAAA)']) : null,
      sexo: linha['Sexo (M/F)']?.trim().toUpperCase() || null,
      nacionalidade: linha['Nacionalidade']?.trim() || null,
      estado_civil: linha['Estado Civil']?.trim() || null,
      profissao: linha['Profissão']?.trim() || null,
      nome_mae: linha['Nome da Mãe']?.trim() || null,
      nome_pai: linha['Nome do Pai']?.trim() || null,
      telefone: linha['WhatsApp']?.toString().replace(/\D/g, '') || null,
      email: linha['E-mail']?.trim().toLowerCase() || null,
      cep: linha['CEP']?.toString().replace(/\D/g, '') || null,
      rua: linha['Logradouro']?.trim() || null,
      numero: linha['Número'] ? parseInt(linha['Número']) : null,
      complemento: linha['Complemento']?.trim() || null,
      bairro: linha['Bairro*']?.trim() || null,
      cidade: linha['Cidade*']?.trim() || null,
      estado: linha['Estado*']?.trim() || null,
      observacoes: linha['Observações']?.trim() || null,
      empresa: false,
      ativo: true,
      cliente_novo: true,
      cliente_andamento: false,
      cliente_finalizado: false,
      uuid: userId,
      lista_whatsapp: linha['WhatsApp'] ? [linha['WhatsApp'].toString().replace(/\D/g, '')] : [],
      lista_emails: linha['E-mail'] ? [linha['E-mail'].trim().toLowerCase()] : []
    }
  }
}

// Função auxiliar para formatar data
const formatarDataParaBanco = (dataStr) => {
  if (!dataStr) return null
  
  // Tentar vários formatos de data
  const formatos = [
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // DD/MM/AAAA
    /^(\d{4})-(\d{2})-(\d{2})$/, // AAAA-MM-DD
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-AAAA
  ]
  
  for (const formato of formatos) {
    const match = dataStr.toString().match(formato)
    if (match) {
      if (formato === formatos[0] || formato === formatos[2]) {
        // DD/MM/AAAA ou DD-MM-AAAA
        const [, dia, mes, ano] = match
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
      } else {
        // AAAA-MM-DD
        return dataStr
      }
    }
  }
  
  return null
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999 !important;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90vw;
  overflow: hidden;
  z-index: 1000000 !important;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.header-bar {
  background: #0468FA;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000001 !important;
  position: relative;
}

.header-bar h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1000005 !important;
}

.content {
  padding: 24px;
  z-index: 1000002 !important;
  position: relative;
}

.titulo {
  font-size: 18px;
  margin: 0 0 24px 0;
  color: #333;
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  z-index: 1000007 !important;
}

.radio-item input[type="radio"] {
  display: none;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border: 2px solid #ccc;
  border-radius: 50%;
  position: relative;
}

.radio-item input[type="radio"]:checked + .radio-circle {
  border-color: #0468FA;
  background: #0468FA;
}

.radio-item input[type="radio"]:checked + .radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.upload-area {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 24px;
  position: relative;
  z-index: 1000004 !important;
}

.upload-area:hover {
  border-color: #0468FA;
}

.upload-area.drag-over {
  border-color: #0468FA;
  background-color: #f0f8ff;
}

.upload-icon {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  color: #6b7280;
}

.upload-text {
  margin: 0 0 8px 0;
  color: #666;
}

.link-blue {
  color: #0468FA;
  font-weight: 500;
}

.upload-info {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.download-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.download-link {
  color: #0468FA;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.download-link:hover {
  text-decoration: underline;
  color: #0254E1;
  transform: translateY(-1px);
}

/* Arquivo selecionado */
.arquivo-selecionado {
  margin-bottom: 16px;
}

.arquivo-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f3f4f6;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.arquivo-icone {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.arquivo-nome {
  flex: 1;
  font-size: 14px;
  color: #374151;
}

.remover-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1;
}

.remover-btn:hover {
  background-color: #fee2e2;
}

/* Mensagem de erro */
.mensagem-erro {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  white-space: pre-line;
  margin-bottom: 16px;
}

.footer {
  padding: 16px 24px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  z-index: 1000003 !important;
  position: relative;
}

/* Define largura fixa para os botões igual ao FormularioPF */
.action-button {
  width: 176px !important;
  z-index: 1000006 !important;
  position: relative;
}
</style> 