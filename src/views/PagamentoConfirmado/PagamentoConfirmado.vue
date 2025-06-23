<template>
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); padding: 24px;">
    <div style="max-width: 400px; width: 100%; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); padding: 32px; text-align: center;">
      
      <!-- Ícone de sucesso -->
      <div style="margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
          ✓
        </div>
      </div>

      <!-- Título -->
      <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px;">
        Pagamento Confirmado!
      </h1>

      <!-- Mensagem -->
      <p style="color: #6b7280; margin-bottom: 24px;">
        Seu pagamento foi processado com sucesso. Bem-vindo ao Jusprod!
      </p>

      <!-- Informações adicionais -->
      <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #1e40af;">
          Você receberá um e-mail de confirmação em breve com os detalhes da sua assinatura.
        </p>
      </div>

      <!-- Botão para continuar -->
      <button 
        @click="irParaDashboard"
        style="width: 100%; background: #2563eb; color: white; padding: 12px 16px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: background 0.2s;"
        onmouseover="this.style.background='#1d4ed8'"
        onmouseout="this.style.background='#2563eb'"
      >
        Ir para o Dashboard
      </button>

      <!-- Link para suporte -->
      <p style="font-size: 14px; color: #6b7280; margin-top: 16px;">
        Precisa de ajuda? 
        <a href="mailto:suporte@jusprod.com" style="color: #2563eb; text-decoration: none;">
          Entre em contato
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const irParaDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
/* Estilos específicos se necessário */
</style> 