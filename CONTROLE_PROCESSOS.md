# Sistema de Controle de Processos - Jusprod

Este documento explica como funciona o sistema de controle de processos baseado no plano do usuário.

## 🎯 **Objetivo**

Controlar quantos processos ativos (arquivado = false) cada usuário pode ter, baseado no seu plano atual, com validação robusta no backend que não pode ser burlada pelo frontend.

## 🏗️ **Arquitetura da Solução**

### **1. Backend (Supabase)**

#### **Funções SQL Criadas:**
- `get_processos_ativos_count(user_uuid)` - Conta processos ativos do usuário
- `get_usuario_limites_processos(user_uuid)` - Retorna informações completas de limite
- `pode_ativar_processo(user_uuid)` - Valida se pode ativar mais processos

#### **Triggers de Validação:**
- `trigger_validate_processo_arquivado` - Valida alterações no status arquivado
- `trigger_validate_new_processo` - Valida novos processos

#### **Edge Function:**
- `gerenciar-processo` - API segura para ativar/arquivar processos

### **2. Frontend (Vue.js)**

#### **Serviço:**
- `src/services/processoService.js` - Centraliza comunicação com backend

#### **Composable:**
- `src/composables/useProcessos.js` - Estado reativo e funções

#### **Componentes:**
- `src/components/UI/Controlador.vue` - Mostra contadores e barra de progresso
- `src/components/ProcessoItem.vue` - Exemplo de uso em lista

## 📊 **Limites por Plano**

| Plano | Max Processos Ativos |
|-------|---------------------|
| Free | 5 |
| Silver | 45 |
| Gold | 150 |
| Platinum | 350 |

## 🚀 **Como Usar**

### **1. Exibir Contadores (Componente Controlador)**

```vue
<template>
  <!-- O componente carrega automaticamente os dados -->
  <Controlador />
</template>

<script setup>
import Controlador from '@/components/UI/Controlador.vue';
</script>
```

**Funcionalidades:**
- ✅ Mostra "X/Y processos" automaticamente
- ✅ Barra azul que fica vermelha quando restam ≤5 processos  
- ✅ Exibe nome do plano atual
- ✅ Botão "Fazer upgrade" que redireciona para `/planos`

### **2. Gerenciar Processos (Usando Composable)**

```vue
<script setup>
import { useProcessos } from '@/composables/useProcessos';

const { 
  statusProcessos,     // Estado reativo com contadores
  ativarProcesso,      // Função para ativar
  arquivarProcesso,    // Função para arquivar
  noLimite,           // Se atingiu o limite
  operandoProcesso    // Loading state
} = useProcessos();

// Carregar dados iniciais
await carregarStatus();

// Ativar processo
const ativar = async (processoId) => {
  try {
    await ativarProcesso(processoId);
    // Status atualizado automaticamente
  } catch (error) {
    // Erro já tratado, mostrar para usuário
    alert(error.message);
  }
};
</script>

<template>
  <div>
    <!-- Contadores -->
    <p>Processos: {{ statusProcessos.processos_ativos }}/{{ statusProcessos.max_processos }}</p>
    <p>Disponíveis: {{ statusProcessos.processos_disponiveis }}</p>
    
    <!-- Botão com validação -->
    <button 
      @click="ativar(123)"
      :disabled="noLimite || operandoProcesso"
    >
      Ativar Processo
    </button>
  </div>
</template>
```

### **3. Listar Processos com Controle**

```vue
<script setup>
import { useProcessos } from '@/composables/useProcessos';
import ProcessoItem from '@/components/ProcessoItem.vue';

const { 
  processos, 
  carregarProcessos,
  autoInicializar 
} = useProcessos();

// Carregar automaticamente
autoInicializar({ carregarProcessos: true });
</script>

<template>
  <div>
    <ProcessoItem 
      v-for="processo in processos" 
      :key="processo.id"
      :processo="processo"
      @atualizado="carregarProcessos"
    />
  </div>
</template>
```

## 🔒 **Segurança**

### **Validação no Backend:**
1. **Triggers SQL** - Impossível burlar via queries diretas
2. **Edge Function** - Autenticação obrigatória 
3. **RLS Policies** - Usuário só acessa seus próprios dados
4. **Função SECURITY DEFINER** - Executa com privilégios seguros

### **Fluxo de Validação:**
1. Frontend chama Edge Function
2. Edge Function verifica autenticação
3. Edge Function chama trigger SQL
4. Trigger valida limites no banco
5. Se válido, altera processo
6. Se inválido, retorna erro

## 📱 **Estados Reativos Disponíveis**

```javascript
const {
  // Dados principais
  statusProcessos: {
    processos_ativos: 5,        // Quantos estão ativos
    max_processos: 45,          // Limite do plano
    pode_ativar_processo: true, // Se pode ativar mais
    plano_nome: 'silver',       // Nome do plano
    processos_disponiveis: 40   // Quantos ainda pode ativar
  },
  
  // Estados derivados
  percentualUso: 11,            // Percentual usado (5/45 = 11%)
  proximoDoLimite: false,       // Se >= 80% usado
  noLimite: false,              // Se não pode ativar mais
  
  // Loading states
  carregandoStatus: false,
  operandoProcesso: false,
  
  // Erros
  erroStatus: '',
} = useProcessos();
```

## 🎨 **Estilos do Controlador**

- **Barra Azul**: Quando tem processos disponíveis
- **Barra Vermelha**: Quando restam ≤5 processos
- **Transição Suave**: CSS transition de 300ms

## 🚦 **Tratamento de Erros**

### **Mensagens de Erro:**
- `"Limite de processos ativos atingido. Faça upgrade do seu plano para ativar mais processos."`
- `"Processo não encontrado"`
- `"Não autorizado"`

### **Como Tratar:**
```javascript
try {
  await ativarProcesso(123);
} catch (error) {
  // error.message contém a mensagem em português
  showNotification(error.message, 'error');
}
```

## 🔄 **Atualizações em Tempo Real**

- ✅ Contadores atualizados automaticamente após operações
- ✅ Estado local sincronizado com backend
- ✅ Barra de progresso reativa
- ✅ Botões habilitados/desabilitados automaticamente

## 📝 **Exemplo Completo**

```vue
<template>
  <div class="processo-manager">
    <!-- Header com contadores -->
    <div class="header">
      <Controlador />
    </div>
    
    <!-- Lista de processos -->
    <div class="lista">
      <ProcessoItem 
        v-for="processo in processos" 
        :key="processo.id"
        :processo="processo"
        @atualizado="recarregar"
      />
    </div>
    
    <!-- Estatísticas -->
    <div v-if="estatisticas.total_processos > 0" class="stats">
      <p>Total: {{ estatisticas.total_processos }}</p>
      <p>Ativos: {{ estatisticas.processos_ativos }}</p>
      <p>Arquivados: {{ estatisticas.processos_arquivados }}</p>
      <p>Uso: {{ estatisticas.percentual_uso }}%</p>
    </div>
  </div>
</template>

<script setup>
import { useProcessos } from '@/composables/useProcessos';
import Controlador from '@/components/UI/Controlador.vue';
import ProcessoItem from '@/components/ProcessoItem.vue';

const { 
  processos,
  estatisticas,
  carregarEstatisticas,
  recarregar,
  autoInicializar 
} = useProcessos();

// Inicializar dados
autoInicializar({ 
  carregarStatus: true, 
  carregarProcessos: true 
});

// Carregar estatísticas
await carregarEstatisticas();
</script>
```

## ✅ **Resumo dos Benefícios**

1. **🔒 Segurança Total**: Impossível burlar no frontend
2. **📊 Controle Preciso**: Baseado no plano do usuário  
3. **🎯 UX Inteligente**: Feedback visual e desabilitação de botões
4. **🔄 Tempo Real**: Contadores sempre atualizados
5. **🎨 Interface Rica**: Barras de progresso e alertas visuais
6. **📱 Reutilizável**: Componentes podem ser usados em qualquer lugar
7. **⚡ Performance**: Estado local otimizado com atualizações mínimas

---

**Pronto para usar!** 🚀 O sistema está completamente funcional e integrado ao seu projeto Vue.js com Supabase. 