# 📋 Instruções para Implementação do Sistema de Pagamentos com Stripe

## 🎯 Resumo da Implementação

Agora você tem um sistema completo de integração com Stripe que inclui:

### ✅ **Arquivos Criados/Modificados:**

1. **`src/services/payment.js`** - Serviço de pagamentos
2. **`src/views/PagamentoConfirmado/PagamentoConfirmado.vue`** - Página de sucesso
3. **`src/views/Planos/Planos.vue`** - Página de planos integrada
4. **`src/router/index.js`** - Nova rota adicionada
5. **`supabase/functions/create-checkout-session/index.ts`** - Edge Function de checkout
6. **`supabase/functions/stripe-webhook/index.ts`** - Edge Function de webhook

## 🔧 **Próximos Passos para Finalizar:**

### 1. **Deploy das Edge Functions no Supabase**

Execute os comandos abaixo no terminal (você precisa estar logado no Supabase CLI):

```bash
# Login no Supabase CLI (se não estiver logado)
npx supabase login

# Deploy da função de checkout
npx supabase functions deploy create-checkout-session --project-ref zdfrfzgnhdnhgmihmrfo

# Deploy da função de webhook
npx supabase functions deploy stripe-webhook --project-ref zdfrfzgnhdnhgmihmrfo
```

### 2. **Configurar Webhook no Stripe Dashboard**

1. Acesse o [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. URL do endpoint: `https://zdfrfzgnhdnhgmihmrfo.supabase.co/functions/v1/stripe-webhook`
4. Eventos para escutar: `checkout.session.completed`
5. Copie a chave de assinatura do webhook

### 3. **Configurar Variáveis de Ambiente no Supabase**

No painel do Supabase, vá em Settings > Edge Functions e adicione:

- `STRIPE_WEBHOOK_SECRET`: Chave de assinatura do webhook do Stripe
- `SUPABASE_URL`: URL do seu projeto
- `SUPABASE_SERVICE_ROLE_KEY`: Chave de service role

## 🎮 **Como Funciona o Fluxo:**

### **Cenário 1: Cliente Free → Plano Pago**
1. Cliente clica em "Selecionar" em um plano
2. Sistema chama `createCheckoutSession()` 
3. Redireciona para Stripe Checkout
4. Após pagamento → Stripe chama webhook
5. Webhook atualiza banco de dados
6. Cliente é redirecionado para `/pagamento-confirmado`

### **Cenário 2: Cliente com Plano → Upgrade**
1. Cliente seleciona plano superior
2. Mesmo fluxo de pagamento
3. Após confirmação → Redireciona para `/dashboard` com popup de sucesso

## 📊 **Estrutura do Banco de Dados:**

### **Tabela `usuario`**
```sql
- role_atual: 'free', 'silver', 'gold', 'platinum'
- assinatura_ativa: boolean
- plano_atual_id: referência para tabela planos
```

### **Tabela `usuario_assinaturas`**
```sql
- usuario_id: referência para usuário
- plano_id: referência para plano
- status: 'ativa', 'cancelada', 'expirada', 'trial'
- data_inicio, data_fim: datas da assinatura
- preco_pago: valor pago
- gateway_pagamento: 'stripe'
- transaction_id: ID da transação do Stripe
```

## 🔒 **Segurança Implementada:**

- ✅ Edge Functions para proteger chaves do Stripe
- ✅ Validação de usuário autenticado
- ✅ Webhook assinado para verificar origem
- ✅ RLS (Row Level Security) nas tabelas
- ✅ Validação de dados nos services

## 🧪 **Para Testar:**

1. **Teste de plano gratuito:** Usuário free deve ver plano Free desabilitado
2. **Teste de checkout:** Selecionar plano → deve abrir Stripe Checkout
3. **Teste de webhook:** Após pagamento teste → deve atualizar banco
4. **Teste de upgrade:** Usuário com plano deve ver popup de sucesso

## 🚀 **Status Atual:**

- ✅ Frontend completo implementado
- ✅ Serviços de pagamento criados
- ✅ Edge Functions criadas (precisam deploy)
- ✅ Páginas de planos e confirmação prontas
- ✅ Integração com banco de dados
- 🔄 **Pendente:** Deploy das Edge Functions e configuração do webhook

## 📋 **Mapeamento de Price IDs do Stripe:**

```javascript
const PRICE_IDS = {
  silver: {
    monthly: 'price_1RdCCnQodJis8Zpg7xaReK6k',
    yearly: 'price_1RdCFCQodJis8Zpg4gdV9gHA'
  },
  gold: {
    monthly: 'price_1RdCHKQodJis8Zpgz0EU95R2',
    yearly: 'price_1RdCGJQodJis8ZpgSukT48LP'
  },
  platinum: {
    monthly: 'price_1RdCIIQodJis8ZpgzZfvaM6K',
    yearly: 'price_1RdCJEQodJis8ZpglV5vnL6j'
  }
};
```

---

Agora você tem um sistema completo de assinaturas integrado ao Stripe! 🎉

Basta fazer o deploy das Edge Functions e configurar o webhook para que tudo funcione perfeitamente. 