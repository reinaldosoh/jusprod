<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header azul -->
      <div class="modal-header">
        <h2 class="modal-title">Detalhes do compromisso</h2>
        <button @click="$emit('close')" class="close-button">
          <img src="/images/fechaBranco.svg" alt="Fechar" class="close-icon">
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Carregando compromisso...</p>
      </div>

      <!-- Conteúdo do compromisso -->
      <div v-else-if="compromisso" class="modal-content">
        <!-- Título com ícone da categoria -->
        <div class="titulo-section">
          <div class="categoria-info">
            <img :src="getCategoriaIcon(compromisso.categoria_id)" :alt="categoriaNome" class="categoria-icon">
            <span class="categoria-nome">{{ categoriaNome }}</span>
          </div>
          <h3 class="compromisso-titulo" :style="{ color: compromisso.cor || '#6b7280' }">
            {{ compromisso.titulo }}
          </h3>
        </div>

        <!-- Cliente e Processo -->
        <div class="cliente-processo-section">
          <div class="info-item">
            <img src="/images/user.svg" alt="Cliente" class="info-icon">
            <span class="info-text">{{ compromisso.nome_cliente || 'Cliente não selecionado' }}</span>
          </div>
          <div class="info-item">
            <img src="/images/balanca.svg" alt="Processo" class="info-icon">
            <span class="info-text">{{ compromisso.processo_nome || compromisso.processo_cnpj || 'Processo não selecionado' }}</span>
          </div>
        </div>

        <!-- Marcar na agenda -->
        <div class="agenda-section">
          <div class="info-item">
            <img src="/images/calendarioMarcado.svg" alt="Agenda" class="info-icon">
            <span class="info-text">{{ formatarDataHora() }}</span>
          </div>
        </div>

        <!-- Link da reunião -->
        <div v-if="compromisso.link_reuniao" class="link-section">
          <div class="info-item">
            <img src="/images/link.svg" alt="Link" class="info-icon">
            <span class="info-text">{{ compromisso.link_reuniao }}</span>
            <button @click="copiarLink" class="copy-button">
              <img src="/images/copiar_ativo.svg" alt="Copiar" class="copy-icon">
            </button>
          </div>
        </div>

        <!-- Endereço -->
        <div v-if="compromisso.endereco" class="endereco-section">
          <div class="info-item">
            <img src="/images/localizacao.svg" alt="Endereço" class="info-icon">
            <span class="info-text">{{ compromisso.endereco }}</span>
          </div>
        </div>

        <!-- Emails -->
        <div v-if="compromisso.emails" class="emails-section">
          <div class="info-item">
            <img src="/images/users2.svg" alt="Emails" class="info-icon">
            <span class="info-text">{{ compromisso.emails }}</span>
          </div>
        </div>

        <!-- Nota/Descrição -->
        <div v-if="compromisso.descricao" class="nota-section">
          <div class="info-item">
            <span class="nota-label">Nota:</span>
            <span class="nota-text">{{ compromisso.descricao }}</span>
          </div>
        </div>

        <!-- Ações -->
        <div class="actions-section">
          <button @click="excluir" class="delete-button">
            <img src="/images/lixeira.svg" alt="Excluir" class="delete-icon">
          </button>
          <div class="action-buttons">
            <Button 
              label="Editar"
              type="outline"
              @click="editar" 
              class="btn-editar"
              :disabled="loading"
            />
            <Button 
              :label="enviandoEmail ? 'Enviando...' : 'Enviar'"
              @click="enviarPorEmail" 
              class="btn-enviar"
              :disabled="enviandoEmail"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <ConfirmarExclusaoAgenda
      v-if="mostrarConfirmacaoExclusao"
      :compromisso="compromisso"
      @confirmar="confirmarExclusao"
      @cancelar="mostrarConfirmacaoExclusao = false"
    />
  </div>
</template>

<script>
import { supabase } from '../../lib/supabase.js'
import Button from '../../components/UI/Button.vue'
import ConfirmarExclusaoAgenda from '../../components/Agenda/ConfirmarExclusaoAgenda.vue'

export default {
  name: 'VisualizarAgenda',
  components: {
    Button,
    ConfirmarExclusaoAgenda
  },
  props: {
    compromissoId: {
      type: Number,
      required: true
    }
  },
  emits: ['close', 'editar', 'excluido', 'email-enviado', 'erro-email'],
  data() {
    return {
      compromisso: null,
      loading: true,
      enviandoEmail: false,
      mostrarConfirmacaoExclusao: false
    }
  },
  computed: {
    categoriaNome() {
      return this.compromisso?.categoria_agenda?.nome || 'Categoria'
    }
  },
  async mounted() {
    await this.carregarCompromisso()
  },
  methods: {
    async carregarCompromisso() {
      try {
        this.loading = true
        
        // Buscar o compromisso com dados relacionados
        const { data: compromisso, error } = await supabase
          .from('agenda')
          .select(`
            *,
            clientes:cliente_id (
              nome,
              email,
              lista_emails,
              empresa
            ),
            processos:processo_id (
              cnpj,
              nome
            ),
            categoria_agenda:categoria_id (
              nome,
              cor
            )
          `)
          .eq('id', this.compromissoId)
          .single()

        if (error) {
          console.error('Erro ao carregar compromisso:', error)
          this.$emit('close')
          return
        }

        this.compromisso = {
          ...compromisso,
          nome_cliente: compromisso.clientes?.nome,
          processo_nome: compromisso.processos?.nome,
          processo_cnpj: compromisso.processos?.cnpj,
          cor: compromisso.categoria_agenda?.cor
        }

      } catch (error) {
        console.error('Erro ao carregar compromisso:', error)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },

    getCategoriaIcon(categoriaId) {
      const icones = {
        1: '/images/categoria_fatal.svg',
        2: '/images/categoria_audiencia.svg',
        3: '/images/categoria_reuniao.svg',
        4: '/images/categoria_tarefa.svg',
        5: '/images/categoria_vencimento.svg',
        6: '/images/categoria_privado.svg',
        7: '/images/categoria_ferias.svg',
        8: '/images/categoria_outros.svg'
      }
      return icones[categoriaId] || '/images/categoria_outros.svg'
    },

    formatarDataHora() {
      if (!this.compromisso) return ''
      
      const inicio = new Date(this.compromisso.inicio)
      const fim = new Date(this.compromisso.fim)
      
      const dataFormatada = inicio.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      // Verificar se é um compromisso de dia inteiro
      const inicioHora = inicio.toTimeString().slice(0, 5)
      const fimHora = fim.toTimeString().slice(0, 5)
      
      if (inicioHora === '00:00' && fimHora === '23:59') {
        return `${dataFormatada} - Dia inteiro`
      }
      
      return `${dataFormatada} das ${inicioHora} às ${fimHora}`
    },

    async copiarLink() {
      try {
        await navigator.clipboard.writeText(this.compromisso.link_reuniao)
        this.$emit('email-enviado') // Usar o mesmo evento para feedback de sucesso
      } catch (error) {
        console.error('Erro ao copiar link:', error)
        this.$emit('erro-email', 'Erro ao copiar link')
      }
    },

    editar() {
      this.$emit('editar', this.compromisso)
    },

    excluir() {
      this.mostrarConfirmacaoExclusao = true
    },

    async confirmarExclusao() {
      try {
        const { error } = await supabase
          .from('agenda')
          .delete()
          .eq('id', this.compromissoId)

        if (error) {
          console.error('Erro ao excluir compromisso:', error)
          this.$emit('erro-email', 'Erro ao excluir compromisso')
          return
        }

        this.mostrarConfirmacaoExclusao = false
        this.$emit('excluido')
        this.$emit('close')
        
      } catch (error) {
        console.error('Erro ao excluir compromisso:', error)
        this.$emit('erro-email', 'Erro ao excluir compromisso')
      }
    },

    async enviarPorEmail() {
      try {
        this.enviandoEmail = true
        
        // Coletar emails
        const emails = await this.coletarEmails()
        
        if (emails.length === 0) {
          this.$emit('erro-email', 'Nenhum email encontrado para envio')
          return
        }

        // Preparar dados para o webhook
        const dadosEmail = {
          titulo: this.compromisso.titulo,
          descricao: this.compromisso.descricao,
          data_inicio: this.compromisso.inicio,
          data_fim: this.compromisso.fim,
          endereco: this.compromisso.endereco,
          link_reuniao: this.compromisso.link_reuniao,
          cliente: this.compromisso.nome_cliente,
          processo: this.compromisso.processo_cnpj,
          categoria: this.categoriaNome,
          emails: emails
        }

        // Chamar webhook N8N
        const response = await fetch('https://n8nwebhook.estruturadeapi.com/webhook/5a0f4bff-a721-487e-a492-102f650b2b58', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosEmail)
        })

        if (response.ok) {
          console.log('Email enviado com sucesso!')
          this.$emit('email-enviado')
          this.$emit('close')
        } else {
          console.error('Erro na resposta do webhook:', response.status)
          this.$emit('erro-email', 'Erro ao enviar email. Tente novamente.')
        }

      } catch (error) {
        console.error('Erro ao enviar email:', error)
        this.$emit('erro-email', 'Erro ao enviar email. Tente novamente.')
      } finally {
        this.enviandoEmail = false
      }
    },

    async coletarEmails() {
      const emails = new Set()
      
      try {
        // 1. Buscar email do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) {
          emails.add(user.email)
        }

        // 2. Se há cliente vinculado, buscar emails do cliente
        if (this.compromisso.cliente_id) {
          const { data: cliente } = await supabase
            .from('clientes')
            .select('email, lista_emails, empresa')
            .eq('id', this.compromisso.cliente_id)
            .single()

          if (cliente) {
            // Adicionar email principal do cliente
            if (cliente.email) {
              emails.add(cliente.email)
            }

            // Adicionar emails da lista de emails
            if (cliente.lista_emails) {
              const listaEmails = cliente.lista_emails.split(',').map(email => email.trim())
              listaEmails.forEach(email => {
                if (email && this.validarEmail(email)) {
                  emails.add(email)
                }
              })
            }

            // Se o cliente é uma empresa, buscar emails dos representantes legais
            if (cliente.empresa) {
              const { data: representantes } = await supabase
                .from('representante_legais')
                .select('email')
                .eq('cliente_id', this.compromisso.cliente_id)

              if (representantes) {
                representantes.forEach(rep => {
                  if (rep.email && this.validarEmail(rep.email)) {
                    emails.add(rep.email)
                  }
                })
              }
            }
          }
        }

        // 3. Adicionar emails do campo emails da agenda
        if (this.compromisso.emails && typeof this.compromisso.emails === 'string') {
          const emailsAgenda = this.compromisso.emails.split(',').map(email => email.trim())
          emailsAgenda.forEach(email => {
            if (email && this.validarEmail(email)) {
              emails.add(email)
            }
          })
        }

        return Array.from(emails)
        
      } catch (error) {
        console.error('Erro ao coletar emails:', error)
        return []
      }
    },

    validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    }
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
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 647px;
  max-width: 647px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 700px) {
  .modal-container {
    width: calc(100% - 32px);
    margin: 16px;
  }
}

.modal-header {
  background: #0468FA;
  color: white;
  padding: 12px 30px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.close-button {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
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
  padding: 30px;
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 700px) {
  .modal-content {
    padding: 20px;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #0468FA;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.titulo-section {
  margin-bottom: 24px;
}

.categoria-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.categoria-icon {
  width: 20px;
  height: 20px;
}

.categoria-nome {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.compromisso-titulo {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.cliente-processo-section,
.agenda-section,
.link-section,
.endereco-section,
.emails-section {
  margin-bottom: 20px;
}

.cliente-processo-section {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.info-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.info-text {
  color: #374151;
  font-size: 14px;
  word-break: break-word;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}

.copy-button:hover {
  background: #f3f4f6;
}

.copy-icon {
  width: 16px;
  height: 16px;
}

.nota-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.nota-label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
}

.nota-text {
  color: #6b7280;
  line-height: 1.5;
}

.actions-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-button:hover {
  background: #fef2f2;
}

.delete-icon {
  width: 20px;
  height: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons :deep(button) {
  width: 176px !important;
  height: 44px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  border-radius: 6px !important;
}

/* === RESPONSIVIDADE MOBILE === */
@media (max-width: 768px) {
  .modal-container {
    width: calc(100% - 20px);
    margin: 10px;
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 8px 20px;
    height: auto;
    min-height: 40px;
  }
  
  .modal-title {
    font-size: 14px;
    line-height: 1.3;
  }
  
  .close-icon {
    width: 14px;
    height: 14px;
  }
  
  .modal-content {
    padding: 20px 16px;
  }
  
  .titulo-section {
    margin-bottom: 20px;
  }
  
  .categoria-info {
    margin-bottom: 10px;
  }
  
  .categoria-icon {
    width: 18px;
    height: 18px;
  }
  
  .categoria-nome {
    font-size: 13px;
  }
  
  .compromisso-titulo {
    font-size: 20px;
    line-height: 1.2;
  }
  
  .cliente-processo-section {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .agenda-section,
  .link-section,
  .endereco-section,
  .emails-section {
    margin-bottom: 16px;
  }
  
  .info-item {
    gap: 10px;
  }
  
  .info-icon {
    width: 18px;
    height: 18px;
  }
  
  .info-text {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .copy-button {
    padding: 6px;
    margin-left: 6px;
  }
  
  .copy-icon {
    width: 14px;
    height: 14px;
  }
  
  .nota-section {
    margin-bottom: 20px;
    padding: 12px;
    border-radius: 8px;
  }
  
  .nota-label {
    font-size: 13px;
  }
  
  .nota-text {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .actions-section {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
    align-items: stretch;
  }
  
  .delete-button {
    align-self: center;
    padding: 10px;
    margin-bottom: 8px;
  }
  
  .delete-icon {
    width: 18px;
    height: 18px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .action-buttons :deep(button) {
    width: 100% !important;
    height: 48px !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    border-radius: 8px !important;
  }
}

/* Mobile pequeno */
@media (max-width: 480px) {
  .modal-container {
    width: calc(100% - 16px);
    margin: 8px;
    border-radius: 8px;
  }
  
  .modal-header {
    padding: 6px 16px;
    min-height: 36px;
  }
  
  .modal-title {
    font-size: 13px;
  }
  
  .close-button {
    right: 12px;
  }
  
  .modal-content {
    padding: 16px 12px;
  }
  
  .compromisso-titulo {
    font-size: 18px;
  }
  
  .info-text {
    font-size: 12px;
  }
  
  .categoria-nome {
    font-size: 12px;
  }
  
  .nota-section {
    padding: 10px;
  }
  
  .nota-label,
  .nota-text {
    font-size: 12px;
  }
  
  .action-buttons :deep(button) {
    height: 44px !important;
    font-size: 14px !important;
  }
}

/* Mobile landscape */
@media (max-width: 768px) and (orientation: landscape) {
  .modal-container {
    max-height: 90vh;
    width: calc(100% - 32px);
    margin: 16px;
  }
  
  .modal-content {
    padding: 16px 20px;
  }
  
  .actions-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-buttons {
    flex-direction: row;
    width: auto;
    gap: 12px;
  }
  
  .action-buttons :deep(button) {
    width: 140px !important;
    height: 44px !important;
  }
}
</style> 