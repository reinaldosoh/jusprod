<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../lib/supabase';
import { createCheckoutSession, getCurrentUserPlan, isUpgrade } from '../../services/payment';
import CardPlanoFree from './cardPlanoFree.vue';
import CardPlanoSilver from './cardPlanoSilver.vue';
import CardPlanoGold from './cardPlanoGold.vue';
import CardPlanoPlatinum from './cardPlanoPlatinum.vue';
import NotificarEmail from './notificarEmail.vue';
import Button from '../../components/UI/Button.vue';
import AlertaSucesso from '../../components/UI/AlertaSucesso.vue';

const router = useRouter();
const isAnual = ref(false);
const planoSelecionado = ref('free');
const isLoading = ref(false);
const showUpgradeSuccess = ref(false);
const upgradeMessage = ref('');

// Dados do usuário autenticado
const usuarioLogado = ref({
  id: null,
  uuid: null, // UUID do Supabase Auth
  email: '',
  planoAtual: 'free',
  periodoAtual: null // 'monthly', 'yearly' ou null para free
});

// Hierarquia dos planos (ordem crescente)
const hierarquiaPlanos = ['free', 'silver', 'gold', 'platinum'];

// Computed para determinar quais planos estão desabilitados
const planoAtualUsuario = computed(() => {
  return usuarioLogado.value?.planoAtual || 'free';
});

const periodoAtualUsuario = computed(() => {
  return usuarioLogado.value?.periodoAtual;
});

// Verificar se cada plano está desabilitado baseado nas regras específicas
const isPlanoDisabled = computed(() => {
  const planoAtual = planoAtualUsuario.value;
  const periodoAtual = periodoAtualUsuario.value;
  const toggleAnual = isAnual.value;
  const indiceAtual = hierarquiaPlanos.indexOf(planoAtual);
  
  console.log('=== COMPUTE isPlanoDisabled ===');
  console.log('planoAtual:', planoAtual);
  console.log('periodoAtual:', periodoAtual);
  console.log('toggleAnual:', toggleAnual);
  console.log('indiceAtual:', indiceAtual);
  
  // Se o usuário tem plano free, apenas o free fica sempre desabilitado no anual
  if (planoAtual === 'free') {
    return {
      free: toggleAnual, // Free só fica desabilitado no anual
      silver: false,
      gold: false,
      platinum: false
    };
  }
  
  // Se o usuário tem plano anual, todos os mensais devem ser desativados
  if (periodoAtual === 'anual') {
    return {
      free: true, // Free sempre desabilitado para quem tem plano pago
      silver: !toggleAnual || indiceAtual >= hierarquiaPlanos.indexOf('silver'),
      gold: !toggleAnual || indiceAtual >= hierarquiaPlanos.indexOf('gold'),
      platinum: !toggleAnual || indiceAtual >= hierarquiaPlanos.indexOf('platinum')
    };
  }
  
  // Se o usuário tem plano mensal
  if (periodoAtual === 'mensal') {
    const resultado = {
      free: true, // Free sempre desabilitado para quem tem plano pago
      silver: !toggleAnual ? (indiceAtual >= hierarquiaPlanos.indexOf('silver')) : (indiceAtual > hierarquiaPlanos.indexOf('silver')), // Mensal: desabilita atual e inferiores, Anual: habilita atual e superiores
      gold: !toggleAnual ? (indiceAtual >= hierarquiaPlanos.indexOf('gold')) : (indiceAtual > hierarquiaPlanos.indexOf('gold')),
      platinum: !toggleAnual ? (indiceAtual >= hierarquiaPlanos.indexOf('platinum')) : (indiceAtual > hierarquiaPlanos.indexOf('platinum'))
    };
    console.log('📅 USUÁRIO COM PLANO MENSAL - Resultado:', resultado);
    return resultado;
  }
  
  // Fallback - não deveria chegar aqui
  return {
    free: true,
    silver: false,
    gold: false,
    platinum: false
  };
});

// Carregar dados do usuário ao montar o componente
onMounted(async () => {
  await loadUserData();
  
  // Debug para verificar os dados carregados
  console.log('=== DEBUG PLANOS ===');
  console.log('Usuario logado:', usuarioLogado.value);
  console.log('Plano atual:', planoAtualUsuario.value);
  console.log('Período atual:', periodoAtualUsuario.value);
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('upgrade') === 'success') {
    const plano = urlParams.get('plano');
    const periodo = urlParams.get('periodo');
    
    if (plano) {
      const planoNome = plano.charAt(0).toUpperCase() + plano.slice(1);
      const periodoTexto = periodo === 'yearly' ? 'Anual' : 'Mensal';
      upgradeMessage.value = `Parabéns! Você atualizou com sucesso para o plano ${planoNome} ${periodoTexto}!`;
      showUpgradeSuccess.value = true;
      
      // Limpar URL após 100ms para dar tempo do componente renderizar
      setTimeout(() => {
        window.history.replaceState({}, '', '/planos');
      }, 100);
    }
  }
});

async function loadUserData() {
  try {
    // Verificar se usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Buscar dados do usuário no banco
      const { data: userData, error } = await supabase
        .from('usuario')
        .select('id, email, role_atual')
        .eq('uuid', session.user.id)
        .single();

      if (!error && userData) {
        // Buscar assinatura ativa do usuário
        let periodoAtual = null;
        if (userData.role_atual !== 'free') {
          console.log('=== BUSCANDO ASSINATURA ===');
          console.log('user_id:', userData.id);
          
          const { data: assinaturaData, error: assinaturaError } = await supabase
            .from('usuario_assinaturas')
            .select('*')
            .eq('usuario_id', userData.id)
            .eq('status', 'ativa')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          console.log('Query resultado:', { assinaturaData, assinaturaError });

          if (!assinaturaError && assinaturaData) {
            periodoAtual = assinaturaData.periodo;
            console.log('Período encontrado:', periodoAtual);
          } else {
            console.log('Nenhuma assinatura ativa encontrada ou erro:', assinaturaError);
            
            // Tentar buscar todas as assinaturas para debug
            const { data: todasAssinaturas, error: erroTodas } = await supabase
              .from('usuario_assinaturas')
              .select('*')
              .eq('usuario_id', userData.id)
              .order('created_at', { ascending: false });
              
            console.log('Todas as assinaturas:', { todasAssinaturas, erroTodas });
          }
        }

        usuarioLogado.value = {
          id: userData.id,
          uuid: session.user.id, // UUID do Supabase Auth
          email: userData.email,
          planoAtual: userData.role_atual || 'free',
          periodoAtual: periodoAtual
        };
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
  }
}

function togglePeriodo() {
  isAnual.value = !isAnual.value;
  
  // Debug para ver como os planos são afetados
  console.log('=== TOGGLE PERÍODO ===');
  console.log('Anual ativo:', isAnual.value);
  console.log('Plano atual:', planoAtualUsuario.value);
  console.log('Período atual:', periodoAtualUsuario.value);
  console.log('Índice atual na hierarquia:', hierarquiaPlanos.indexOf(planoAtualUsuario.value));
  console.log('Planos desabilitados:', isPlanoDisabled.value);
}

function selecionarPlano(plano) {
  if (!isPlanoDisabled.value[plano]) {
    planoSelecionado.value = plano;
  }
}

async function assinarPlano() {
  if (planoSelecionado.value === 'free' || isLoading.value) return;
  
  try {
    isLoading.value = true;

    // Verificar se usuário está autenticado
    if (!usuarioLogado.value.uuid) {
      // Redirecionar para login se não estiver autenticado
      router.push('/');
      return;
    }

    // Criar sessão de checkout
    const checkoutUrl = await createCheckoutSession(
      planoSelecionado.value,
      isAnual.value,
      usuarioLogado.value.uuid // Usar UUID em vez de email
    );

    // Redirecionar para o checkout do Stripe
    window.location.href = checkoutUrl;

  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    alert('Erro ao processar pagamento. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

function closeUpgradeAlert() {
  showUpgradeSuccess.value = false;
  // Recarregar dados do usuário para refletir o novo plano
  loadUserData();
}
</script>

<template>
  <div class="planos-page">
    <!-- Alerta de upgrade bem-sucedido -->
    <AlertaSucesso 
      v-if="showUpgradeSuccess"
      :mensagem="upgradeMessage"
      @fechar="closeUpgradeAlert"
    />

    <!-- Header da página -->
    <div class="header">
      <h1 class="titulo">Escolha seu plano</h1>
      <p class="subtitulo">Selecione o plano ideal para seu escritório</p>
      
      <!-- Toggle Mensal/Anual -->
      <div class="toggle-container">
        <span :class="{ active: !isAnual }">Mensal</span>
        <button 
          class="toggle"
          :class="{ active: isAnual }"
          @click="togglePeriodo"
        >
          <div class="toggle-slider"></div>
        </button>
        <span :class="{ active: isAnual }">Anual</span>
        <span v-if="isAnual" class="desconto-badge">Economize 20%</span>
      </div>
    </div>

    <!-- Grid de planos -->
    <div class="planos-grid">
      <CardPlanoFree 
        :isSelected="planoSelecionado === 'free'"
        :isDisabled="isPlanoDisabled.free"
        @select="selecionarPlano"
      />
      <CardPlanoSilver 
        :isAnual="isAnual"
        :isSelected="planoSelecionado === 'silver'"
        :isDisabled="isPlanoDisabled.silver"
        @select="selecionarPlano"
      />
      <CardPlanoGold 
        :isAnual="isAnual"
        :isSelected="planoSelecionado === 'gold'"
        :isDisabled="isPlanoDisabled.gold"
        @select="selecionarPlano"
      />
      <CardPlanoPlatinum 
        :isAnual="isAnual"
        :isSelected="planoSelecionado === 'platinum'"
        :isDisabled="isPlanoDisabled.platinum"
        @select="selecionarPlano"
      />
    </div>

    <!-- Botão de assinatura -->
    <div class="botao-assinar" v-if="planoSelecionado !== 'free' && !isPlanoDisabled[planoSelecionado]">
      <Button 
        type="primary" 
        :label="isLoading ? 'Processando...' : `Assinar Plano ${planoSelecionado.charAt(0).toUpperCase() + planoSelecionado.slice(1)}`"
        @click="assinarPlano"
        :disabled="isLoading"
        class="btn-assinar"
      />
    </div>

    <!-- Seção de email personalizado -->
    <div class="email-section">
      <NotificarEmail />
    </div>
  </div>
</template>

<style scoped>
.planos-page {
  width: 100%;
  background-color: #FFFFFF;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 24px;
}

.header {
  text-align: center;
  max-width: 800px;
  margin-bottom: 16px;
}

.titulo {
  font-size: 36px;
  font-weight: 700;
  color: #101828;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitulo {
  font-size: 18px;
  color: #6B7280;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 16px;
  font-weight: 500;
}

.toggle-container span {
  color: #6B7280;
  transition: color 0.2s ease;
}

.toggle-container span.active {
  color: #0468FA;
}

.toggle {
  width: 48px;
  height: 24px;
  background-color: #E5E7EB;
  border: none;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0;
}

.toggle.active {
  background-color: #0468FA;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 10px;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle.active .toggle-slider {
  transform: translateX(24px);
}

.desconto-badge {
  background-color: #10B981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
}

.planos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1200px;
}

.botao-assinar {
  margin-top: 24px;
  width: 100%;
  max-width: 320px;
}

.btn-assinar {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.email-section {
  margin-top: 40px;
  width: 100%;
  max-width: 800px;
}

@media (max-width: 768px) {
  .planos-page {
    padding: 24px 16px;
  }
  
  .titulo {
    font-size: 28px;
  }
  
  .subtitulo {
    font-size: 16px;
  }
  
  .planos-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .toggle-container {
    font-size: 14px;
    gap: 12px;
  }
  
  .email-section {
    margin-top: 32px;
  }
}
</style> 