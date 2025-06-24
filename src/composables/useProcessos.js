import { ref, computed, onMounted } from 'vue';
import { processoService } from '../services/processoService';

/**
 * Composable para gerenciar estado e operações de processos
 * @returns {Object} Estado reativo e funções para gerenciar processos
 */
export function useProcessos() {
  // Estado reativo
  const processos = ref([]);
  const statusProcessos = ref({
    processos_ativos: 0,
    max_processos: 5,
    pode_ativar_processo: true,
    plano_nome: 'free',
    processos_disponiveis: 5
  });
  const estatisticas = ref({});
  
  // Estados de loading
  const carregandoProcessos = ref(false);
  const carregandoStatus = ref(false);
  const operandoProcesso = ref(false);
  
  // Estados de erro
  const erroProcessos = ref('');
  const erroStatus = ref('');

  // Computed properties
  const processosAtivos = computed(() => 
    processos.value.filter(p => !p.arquivado)
  );

  const processosArquivados = computed(() => 
    processos.value.filter(p => p.arquivado)
  );

  const percentualUso = computed(() => {
    const max = statusProcessos.value.max_processos;
    const atual = statusProcessos.value.processos_ativos;
    return max > 0 ? Math.round((atual / max) * 100) : 0;
  });

  const proximoDoLimite = computed(() => 
    percentualUso.value >= 80
  );

  const noLimite = computed(() => 
    !statusProcessos.value.pode_ativar_processo
  );

  // Função para carregar status dos processos
  const carregarStatus = async () => {
    try {
      carregandoStatus.value = true;
      erroStatus.value = '';
      
      const status = await processoService.obterStatusProcessos();
      statusProcessos.value = status;
      
      return status;
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      erroStatus.value = error.message;
      throw error;
    } finally {
      carregandoStatus.value = false;
    }
  };

  // Função para carregar lista de processos
  const carregarProcessos = async (filtros = {}) => {
    try {
      carregandoProcessos.value = true;
      erroProcessos.value = '';
      
      const lista = await processoService.listarProcessos(filtros);
      processos.value = lista;
      
      return lista;
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      erroProcessos.value = error.message;
      throw error;
    } finally {
      carregandoProcessos.value = false;
    }
  };

  // Função para carregar estatísticas completas
  const carregarEstatisticas = async () => {
    try {
      const stats = await processoService.obterEstatisticas();
      estatisticas.value = stats;
      statusProcessos.value = {
        processos_ativos: stats.processos_ativos,
        max_processos: stats.max_processos,
        pode_ativar_processo: stats.pode_ativar_processo,
        plano_nome: stats.plano_nome,
        processos_disponiveis: stats.processos_disponiveis
      };
      
      return stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      throw error;
    }
  };

  // Função para ativar processo
  const ativarProcesso = async (processoId) => {
    try {
      operandoProcesso.value = true;
      
      const resultado = await processoService.ativarProcesso(processoId);
      
      // Atualizar status local
      statusProcessos.value = resultado.status;
      
      // Atualizar processo na lista local se estiver carregada
      const index = processos.value.findIndex(p => p.id === processoId);
      if (index !== -1) {
        processos.value[index].arquivado = false;
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao ativar processo:', error);
      throw error;
    } finally {
      operandoProcesso.value = false;
    }
  };

  // Função para arquivar processo
  const arquivarProcesso = async (processoId) => {
    try {
      operandoProcesso.value = true;
      
      const resultado = await processoService.arquivarProcesso(processoId);
      
      // Atualizar status local
      statusProcessos.value = resultado.status;
      
      // Atualizar processo na lista local se estiver carregada
      const index = processos.value.findIndex(p => p.id === processoId);
      if (index !== -1) {
        processos.value[index].arquivado = true;
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao arquivar processo:', error);
      throw error;
    } finally {
      operandoProcesso.value = false;
    }
  };

  // Função para criar processo
  const criarProcesso = async (dadosProcesso) => {
    try {
      const novoProcesso = await processoService.criarProcesso(dadosProcesso);
      
      // Adicionar à lista local
      processos.value.unshift(novoProcesso);
      
      // Recarregar status
      await carregarStatus();
      
      return novoProcesso;
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      throw error;
    }
  };

  // Função para atualizar processo
  const atualizarProcesso = async (processoId, dadosAtualizacao) => {
    try {
      const processoAtualizado = await processoService.atualizarProcesso(processoId, dadosAtualizacao);
      
      // Atualizar na lista local
      const index = processos.value.findIndex(p => p.id === processoId);
      if (index !== -1) {
        processos.value[index] = { ...processos.value[index], ...processoAtualizado };
      }
      
      return processoAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      throw error;
    }
  };

  // Função para excluir processo
  const excluirProcesso = async (processoId) => {
    try {
      await processoService.excluirProcesso(processoId);
      
      // Remover da lista local
      const index = processos.value.findIndex(p => p.id === processoId);
      if (index !== -1) {
        processos.value.splice(index, 1);
      }
      
      // Recarregar status
      await carregarStatus();
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      throw error;
    }
  };

  // Função para obter um processo específico
  const obterProcesso = async (processoId) => {
    try {
      return await processoService.obterProcesso(processoId);
    } catch (error) {
      console.error('Erro ao obter processo:', error);
      throw error;
    }
  };

  // Função para verificar se pode ativar processo
  const podeAtivar = async () => {
    try {
      return await processoService.podeAtivarProcesso();
    } catch (error) {
      console.error('Erro ao verificar se pode ativar:', error);
      return false;
    }
  };

  // Função para inicializar (carregar dados iniciais)
  const inicializar = async (carregarLista = true) => {
    try {
      await carregarStatus();
      
      if (carregarLista) {
        await carregarProcessos();
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error);
      throw error;
    }
  };

  // Função para recarregar todos os dados
  const recarregar = async () => {
    await Promise.all([
      carregarStatus(),
      carregarProcessos()
    ]);
  };

  // Carregar dados ao montar se necessário
  const autoInicializar = (opcoes = { carregarStatus: true, carregarProcessos: false }) => {
    onMounted(async () => {
      try {
        if (opcoes.carregarStatus) {
          await carregarStatus();
        }
        
        if (opcoes.carregarProcessos) {
          await carregarProcessos();
        }
      } catch (error) {
        console.error('Erro ao auto-inicializar:', error);
      }
    });
  };

  return {
    // Estado
    processos,
    statusProcessos,
    estatisticas,
    
    // Estados derivados
    processosAtivos,
    processosArquivados,
    percentualUso,
    proximoDoLimite,
    noLimite,
    
    // Estados de loading
    carregandoProcessos,
    carregandoStatus,
    operandoProcesso,
    
    // Estados de erro
    erroProcessos,
    erroStatus,
    
    // Funções
    carregarStatus,
    carregarProcessos,
    carregarEstatisticas,
    ativarProcesso,
    arquivarProcesso,
    criarProcesso,
    atualizarProcesso,
    excluirProcesso,
    obterProcesso,
    podeAtivar,
    inicializar,
    recarregar,
    autoInicializar
  };
}

// Exportar também como default
export default useProcessos; 