import { supabase } from '../lib/supabase.js';

// Função helper para remover tags HTML
function removerHTML(texto) {
  if (!texto) return '';
  return texto.replace(/<[^>]*>/g, '').trim();
}

export const whatsappService = {
  /**
   * Envia mensagem WhatsApp para clientes vinculados ao processo
   * @param {Object} dados - Dados para envio
   * @param {string|number} dados.processoId - ID do processo
   * @param {string} dados.titulo - Título da mensagem
   * @param {string} dados.mensagem - Conteúdo da mensagem
   * @param {Array} dados.telefonesAdicionais - Lista de telefones adicionais (opcional)
   * @param {Object} dados.intimacao - Dados da intimação (opcional)
   * @returns {Promise<Object>} Resultado do envio
   */
  async enviarMensagem(dados) {
    try {
      const { processoId, titulo, mensagem, telefonesAdicionais = [], intimacao = null } = dados;

      // Validar dados obrigatórios
      if (!processoId || !titulo || !mensagem) {
        throw new Error('Dados obrigatórios não fornecidos');
      }

      // 1. Buscar dados do processo
      console.log(`Buscando processo ID: ${processoId}`);
      const { data: processo, error: processoError } = await supabase
        .from('processos')
        .select('cnpj, autor, reu, tribunal, area, classe, assunto, orgao_julgador, valor_causa')
        .eq('id', processoId)
        .single();

      if (processoError || !processo) {
        console.error('Erro ao buscar processo:', processoError);
        throw new Error('Processo não encontrado');
      }

      console.log('Processo encontrado:', processo);

      // 2. Buscar clientes vinculados
      console.log('Buscando clientes vinculados...');
      const { data: clientesVinculados, error: clientesError } = await supabase
        .from('processo_cliente')
        .select(`
          cliente:clientes(
            id,
            nome,
            empresa,
            lista_whatsapp
          )
        `)
        .eq('processo_id', processoId);

      if (clientesError) {
        console.error('Erro ao buscar clientes vinculados:', clientesError);
        throw new Error('Erro ao buscar clientes vinculados');
      }

      console.log(`Clientes vinculados encontrados: ${clientesVinculados?.length || 0}`);

      // 3. Preparar lista de WhatsApps
      const whatsappsParaEnvio = [];

      // Adicionar WhatsApps dos clientes vinculados
      if (clientesVinculados && clientesVinculados.length > 0) {
        for (const vinculo of clientesVinculados) {
          const cliente = vinculo.cliente;
          if (cliente) {
            // 3.1. Processar WhatsApps do cliente principal
            if (cliente.lista_whatsapp) {
            let listaWhatsapp = [];
            try {
              listaWhatsapp = typeof cliente.lista_whatsapp === 'string'
                ? JSON.parse(cliente.lista_whatsapp)
                : Array.isArray(cliente.lista_whatsapp)
                ? cliente.lista_whatsapp
                : [cliente.lista_whatsapp];
            } catch (e) {
              console.warn(`Erro ao parsear lista_whatsapp do cliente ${cliente.id}:`, e);
              continue;
            }

            for (const whatsapp of listaWhatsapp) {
              if (whatsapp && typeof whatsapp === 'string' && whatsapp.trim()) {
                const dadosBase = {
                  cnpj: processo.cnpj || '',
                  autor: processo.autor || '',
                  reu: processo.reu || '',
                  tribunal: processo.tribunal || '',
                  area: processo.area || '',
                  classe: processo.classe || '',
                  assunto: processo.assunto || '',
                  orgao_julgador: processo.orgao_julgador || '',
                  valor_causa: processo.valor_causa || '',
                  titulo,
                  mensagem,
                  whatsapp: whatsapp.trim(),
                };

                // Adicionar campos específicos da intimação se presente
                if (intimacao) {
                  dadosBase.snippet = intimacao.snippet || '';
                  dadosBase.secao = intimacao.secao || '';
                  dadosBase.tipo = intimacao.tipo || '';
                  dadosBase.conteudo = removerHTML(intimacao.conteudo) || '';
                  dadosBase.dscPequena = intimacao.dscPequena || '';
                }

                whatsappsParaEnvio.push(dadosBase);
                }
              }
            }

            // 3.2. Se for empresa, buscar WhatsApps dos representantes legais
            if (cliente.empresa === true) {
              console.log('🏢 Cliente é empresa, buscando representantes legais:', cliente.nome);
              
              try {
                // Obter sessão para garantir que buscamos representantes do usuário correto
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user?.id) {
                  const { data: representantes, error: repError } = await supabase
                    .from('representante_legais')
                    .select('whatsapp, nome_completo')
                    .eq('cliente_id', cliente.id)
                    .eq('uuid', session.user.id); // Garantir que é do usuário logado

                  if (repError) {
                    console.warn('⚠️ Erro ao buscar representantes legais:', repError);
                  } else if (representantes && representantes.length > 0) {
                    console.log('👥 Representantes legais encontrados:', representantes.length);
                    
                    for (const rep of representantes) {
                      if (rep.whatsapp && rep.whatsapp.trim()) {
                        const dadosBase = {
                          cnpj: processo.cnpj || '',
                          autor: processo.autor || '',
                          reu: processo.reu || '',
                          tribunal: processo.tribunal || '',
                          area: processo.area || '',
                          classe: processo.classe || '',
                          assunto: processo.assunto || '',
                          orgao_julgador: processo.orgao_julgador || '',
                          valor_causa: processo.valor_causa || '',
                          titulo,
                          mensagem,
                          whatsapp: rep.whatsapp.trim(),
                        };

                        // Adicionar campos específicos da intimação se presente
                        if (intimacao) {
                          dadosBase.snippet = intimacao.snippet || '';
                          dadosBase.secao = intimacao.secao || '';
                          dadosBase.tipo = intimacao.tipo || '';
                          dadosBase.conteudo = removerHTML(intimacao.conteudo) || '';
                          dadosBase.dscPequena = intimacao.dscPequena || '';
                        }

                        whatsappsParaEnvio.push(dadosBase);
                        console.log('📱 WhatsApp do representante adicionado:', rep.whatsapp, '(', rep.nome_completo, ')');
                      }
                    }
                  } else {
                    console.log('ℹ️ Nenhum representante legal encontrado para a empresa:', cliente.nome);
                  }
                }
              } catch (repError) {
                console.warn('⚠️ Erro ao processar representantes legais:', repError);
              }
            }
          }
        }
      }

      // 4. Adicionar telefones adicionais
      if (telefonesAdicionais && telefonesAdicionais.length > 0) {
        console.log(`Adicionando ${telefonesAdicionais.length} telefones extras`);
        for (const telefone of telefonesAdicionais) {
          if (telefone.numero && telefone.numero.trim()) {
            const numeroLimpo = telefone.numero.replace(/\D/g, '');
            const whatsappCompleto = `${telefone.ddi}${numeroLimpo}`;

            const dadosBase = {
              cnpj: processo.cnpj || '',
              autor: processo.autor || '',
              reu: processo.reu || '',
              tribunal: processo.tribunal || '',
              area: processo.area || '',
              classe: processo.classe || '',
              assunto: processo.assunto || '',
              orgao_julgador: processo.orgao_julgador || '',
              valor_causa: processo.valor_causa || '',
              titulo,
              mensagem,
              whatsapp: whatsappCompleto,
            };

            // Adicionar campos específicos da intimação se presente
            if (intimacao) {
              dadosBase.snippet = intimacao.snippet || '';
              dadosBase.secao = intimacao.secao || '';
              dadosBase.tipo = intimacao.tipo || '';
              dadosBase.conteudo = removerHTML(intimacao.conteudo) || '';
              dadosBase.dscPequena = intimacao.dscPequena || '';
            }

            whatsappsParaEnvio.push(dadosBase);
          }
        }
      }

      console.log(`Total de WhatsApps para envio: ${whatsappsParaEnvio.length}`);

      // 5. Verificar se há WhatsApps para envio
      if (whatsappsParaEnvio.length === 0) {
        throw new Error('Nenhum WhatsApp encontrado para envio');
      }

      // 6. Formatar data atual no formato solicitado (DD - MM - YYYY)
      const dataAtual = new Date();
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      const dataFormatada = `${dia} - ${mes} - ${ano}`;

      // 7. Obter JWT do usuário autenticado
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      console.log('JWT do usuário obtido:', session.access_token.substring(0, 50) + '...');

      // 8. Adicionar informações do usuário para rate limiting
      const timestampEnvio = new Date().toISOString();
      const userInfo = {
        userId: session.user.id,
        userUuid: session.user.id,
        timestamp: timestampEnvio
      };

      // Adicionar informações do usuário a cada mensagem
      const mensagensComUserInfo = whatsappsParaEnvio.map(mensagem => ({
        ...mensagem,
        data_atual: dataFormatada,
        ...userInfo
      }));

      // 9. Enviar para webhook N8N
      const webhookUrl = intimacao 
        ? 'https://n8nwebhook.estruturadeapi.com/webhook/7b7361a2-2c00-4529-8306-cd00e2fd251f'
        : 'https://n8nwebhook.estruturadeapi.com/webhook/3968cb00-16b4-4ca6-a122-9ac73c24fa5e';
      console.log(`Enviando para webhook N8N ${intimacao ? '(Intimação)' : '(Processo)'}...`);
      console.log('URL do webhook:', webhookUrl);
      console.log('Dados sendo enviados:', JSON.stringify(mensagensComUserInfo, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(mensagensComUserInfo),
      });

      if (!response.ok) {
        // Tratar erro de rate limit especificamente
        if (response.status === 429) {
          console.error('Erro de Rate Limit:', await response.text());
          throw new Error('Você atingiu o limite de envios. Tente novamente mais tarde.');
        }
        console.error('Erro ao enviar para webhook:', response.status, response.statusText);
        throw new Error('Erro ao enviar mensagens');
      }

      console.log('Mensagens enviadas com sucesso!');

      // 10. Retornar sucesso
      return {
        success: true,
        totalEnvios: whatsappsParaEnvio.length,
        mensagem: `Mensagem enviada para ${whatsappsParaEnvio.length} WhatsApp(s)`,
      };

    } catch (error) {
      console.error('Erro no serviço de WhatsApp:', error);
      throw error;
    }
  }
}; 