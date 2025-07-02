import { supabase } from '../lib/supabase';

export const emailService = {
  async enviarMensagem(dadosEnvio) {
    try {
      console.log('🚀 Iniciando envio de email para processo:', dadosEnvio.processoId);

      // 1. Obter sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', session.user.id);

      // 2. Buscar dados do processo
      const { data: processoData, error: processoError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', dadosEnvio.processoId)
        .eq('uuid', session.user.id) // Garantir que é do usuário logado
        .single();

      if (processoError || !processoData) {
        console.error('❌ Erro ao buscar processo:', processoError);
        throw new Error('Processo não encontrado');
      }

      console.log('📁 Processo encontrado:', processoData.cnpj);

      // 3. Buscar clientes vinculados ao processo
      const { data: clientesVinculados, error: clientesError } = await supabase
        .from('processo_cliente')
        .select(`
          cliente_id,
          clientes (
            id,
            nome,
            empresa,
            lista_emails
          )
        `)
        .eq('processo_id', dadosEnvio.processoId);

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError);
        throw new Error('Erro ao buscar clientes vinculados');
      }

      console.log('👥 Clientes vinculados encontrados:', clientesVinculados?.length || 0);

      // 4. Extrair emails dos clientes
      const emailsClientes = [];
      
      if (clientesVinculados && clientesVinculados.length > 0) {
        for (const vinculo of clientesVinculados) {
          const cliente = vinculo.clientes;
          if (cliente) {
            // 4.1. Processar emails do cliente principal
            if (cliente.lista_emails) {
              try {
                // Se lista_emails já é um array (vem do Supabase como JSON)
                let emails = cliente.lista_emails;
                
                // Se for string, tentar parsear
                if (typeof emails === 'string') {
                  emails = JSON.parse(emails);
                }
                
                // Garantir que é um array
                if (Array.isArray(emails)) {
                  emails.forEach(email => {
                    if (email && email.trim()) {
                      emailsClientes.push(email.trim());
                    }
                  });
                }
              } catch (parseError) {
                console.warn('⚠️ Erro ao processar emails do cliente:', cliente.nome, parseError);
              }
            }

            // 4.2. Se for empresa, buscar emails dos representantes legais
            if (cliente.empresa === true) {
              console.log('🏢 Cliente é empresa, buscando representantes legais:', cliente.nome);
              
              try {
                const { data: representantes, error: repError } = await supabase
                  .from('representante_legais')
                  .select('email, nome_completo')
                  .eq('cliente_id', cliente.id)
                  .eq('uuid', session.user.id); // Garantir que é do usuário logado

                if (repError) {
                  console.warn('⚠️ Erro ao buscar representantes legais:', repError);
                } else if (representantes && representantes.length > 0) {
                  console.log('👥 Representantes legais encontrados:', representantes.length);
                  
                  representantes.forEach(rep => {
                    if (rep.email && rep.email.trim()) {
                      emailsClientes.push(rep.email.trim());
                      console.log('📧 Email do representante adicionado:', rep.email, '(', rep.nome_completo, ')');
                    }
                  });
                } else {
                  console.log('ℹ️ Nenhum representante legal encontrado para a empresa:', cliente.nome);
                }
              } catch (repError) {
                console.warn('⚠️ Erro ao processar representantes legais:', repError);
              }
            }
          }
        }
      }

      console.log('📧 Emails dos clientes:', emailsClientes);

      // 5. Adicionar emails adicionais
      const emailsAdicionais = dadosEnvio.emailsAdicionais || [];
      const emailsExtras = emailsAdicionais.map(item => item.email).filter(email => email && email.trim());

      console.log('📧 Emails adicionais:', emailsExtras);

      // 6. Consolidar todos os emails
      const todosEmails = [...emailsClientes, ...emailsExtras];
      
      if (todosEmails.length === 0) {
        throw new Error('Nenhum email encontrado para envio');
      }

      console.log('📧 Total de emails para envio:', todosEmails.length);

      // 7. Formatar data atual no formato solicitado (DD - MM - YYYY)
      const dataAtual = new Date();
      const dia = String(dataAtual.getDate()).padStart(2, '0');
      const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
      const ano = dataAtual.getFullYear();
      const dataFormatada = `${dia} - ${mes} - ${ano}`;

      // 8. Montar estrutura de dados para cada email
      const emailsParaEnvio = todosEmails.map(email => ({
        cnpj: processoData.cnpj || '',
        autor: processoData.autor || '',
        reu: processoData.reu || '',
        tribunal: processoData.tribunal || '',
        area: processoData.area || '',
        classe: processoData.classe || '',
        assunto: processoData.assunto || '',
        orgao_julgador: processoData.orgao_julgador || '',
        valor_causa: processoData.valor_causa || '',
        data_atual: dataFormatada,
        titulo: dadosEnvio.titulo,
        mensagem: dadosEnvio.mensagem,
        email: email,
        userId: session.user.id,
        userUuid: session.user.id,
        timestamp: new Date().toISOString()
      }));

      // 9. Enviar para webhook N8N
      const webhookUrl = 'https://n8nwebhook.estruturadeapi.com/webhook/c263f444-e0e9-4ebc-aa83-99254d67799e';
      console.log('📤 Enviando para webhook N8N...');
      console.log('Dados sendo enviados:', JSON.stringify(emailsParaEnvio, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(emailsParaEnvio),
      });

      if (!response.ok) {
        console.error('❌ Erro na resposta do webhook:', response.status, response.statusText);
        
        if (response.status === 429) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        }
        
        throw new Error(`Erro no servidor: ${response.status}`);
      }

      // Tratar resposta do webhook (pode ser JSON ou texto simples)
      let resultado;
      try {
        const responseText = await response.text();
        console.log('📥 Resposta bruta do webhook:', responseText);
        
        // Tentar parsear como JSON, se falhar usar como texto
        try {
          resultado = JSON.parse(responseText);
        } catch {
          // Se não for JSON válido, usar a resposta como string
          resultado = { message: responseText };
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar resposta do webhook:', error);
        resultado = { message: 'Resposta processada com sucesso' };
      }
      
      console.log('✅ Resultado processado:', resultado);

      console.log('✅ Emails enviados com sucesso!');

      // 10. Retornar sucesso
      return {
        sucesso: true,
        totalEnvios: emailsParaEnvio.length,
        mensagem: `Email enviado com sucesso para ${emailsParaEnvio.length} destinatário${emailsParaEnvio.length > 1 ? 's' : ''}!`
      };

    } catch (error) {
      console.error('❌ Erro no emailService.enviarMensagem:', error);
      throw error;
    }
  },

  /**
   * Envia email para intimação com PDF anexado
   * @param {Object} dadosEnvio - Dados para envio incluindo intimação
   * @returns {Promise<Object>} Resultado do envio
   */
  async enviarMensagemIntimacao(dadosEnvio) {
    try {
      console.log('🚀 Iniciando envio de email para intimação:', dadosEnvio.intimacao?.id);

      // 1. Obter sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', session.user.id);

      // 2. Buscar dados do processo
      const { data: processoData, error: processoError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', dadosEnvio.processoId)
        .eq('uuid', session.user.id) // Garantir que é do usuário logado
        .single();

      if (processoError || !processoData) {
        console.error('❌ Erro ao buscar processo:', processoError);
        throw new Error('Processo não encontrado');
      }

      console.log('📁 Processo encontrado:', processoData.cnpj);

      // 3. Buscar clientes vinculados ao processo
      const { data: clientesVinculados, error: clientesError } = await supabase
        .from('processo_cliente')
        .select(`
          cliente_id,
          clientes (
            id,
            nome,
            empresa,
            lista_emails
          )
        `)
        .eq('processo_id', dadosEnvio.processoId);

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError);
        throw new Error('Erro ao buscar clientes vinculados');
      }

      console.log('👥 Clientes vinculados encontrados:', clientesVinculados?.length || 0);

      // 4. Extrair emails dos clientes
      const emailsClientes = [];
      
      if (clientesVinculados && clientesVinculados.length > 0) {
        for (const vinculo of clientesVinculados) {
          const cliente = vinculo.clientes;
          if (cliente) {
            // 4.1. Processar emails do cliente principal
            if (cliente.lista_emails) {
              try {
                // Se lista_emails já é um array (vem do Supabase como JSON)
                let emails = cliente.lista_emails;
                
                // Se for string, tentar parsear
                if (typeof emails === 'string') {
                  emails = JSON.parse(emails);
                }
                
                // Garantir que é um array
                if (Array.isArray(emails)) {
                  emails.forEach(email => {
                    if (email && email.trim()) {
                      emailsClientes.push(email.trim());
                    }
                  });
                }
              } catch (parseError) {
                console.warn('⚠️ Erro ao processar emails do cliente:', cliente.nome, parseError);
              }
            }

            // 4.2. Se for empresa, buscar emails dos representantes legais
            if (cliente.empresa === true) {
              console.log('🏢 Cliente é empresa, buscando representantes legais:', cliente.nome);
              
              try {
                const { data: representantes, error: repError } = await supabase
                  .from('representante_legais')
                  .select('email, nome_completo')
                  .eq('cliente_id', cliente.id)
                  .eq('uuid', session.user.id); // Garantir que é do usuário logado

                if (repError) {
                  console.warn('⚠️ Erro ao buscar representantes legais:', repError);
                } else if (representantes && representantes.length > 0) {
                  console.log('👥 Representantes legais encontrados:', representantes.length);
                  
                  representantes.forEach(rep => {
                    if (rep.email && rep.email.trim()) {
                      emailsClientes.push(rep.email.trim());
                      console.log('📧 Email do representante adicionado:', rep.email, '(', rep.nome_completo, ')');
                    }
                  });
                } else {
                  console.log('ℹ️ Nenhum representante legal encontrado para a empresa:', cliente.nome);
                }
              } catch (repError) {
                console.warn('⚠️ Erro ao processar representantes legais:', repError);
              }
            }
          }
        }
      }

      console.log('📧 Emails dos clientes:', emailsClientes);

      // 5. Adicionar emails adicionais
      const emailsAdicionais = dadosEnvio.emailsAdicionais || [];
      const emailsExtras = emailsAdicionais.map(item => item.email).filter(email => email && email.trim());

      console.log('📧 Emails adicionais:', emailsExtras);

      // 6. Consolidar todos os emails
      const todosEmails = [...emailsClientes, ...emailsExtras];
      
      if (todosEmails.length === 0) {
        throw new Error('Nenhum email encontrado para envio');
      }

      console.log('📧 Total de emails para envio:', todosEmails.length);

      // 7. Gerar PDF da intimação
      console.log('📄 Gerando PDF da intimação...');
      const { pdfService } = await import('./pdfService.js');
      const { blob: pdfBlob, nomeArquivo } = await pdfService.gerarPDFIntimacaoParaUpload(dadosEnvio.intimacao);
      console.log('📄 PDF gerado:', nomeArquivo);

      // 8. Fazer upload do PDF no Supabase Storage
      console.log('☁️ Fazendo upload do PDF no Supabase...');
      const caminhoArquivo = `${session.user.id}/${nomeArquivo}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('PDF INTIMACAO')
        .upload(caminhoArquivo, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true // Substituir se já existir
        });

      if (uploadError) {
        console.error('❌ Erro no upload do PDF:', uploadError);
        throw new Error('Erro ao fazer upload do PDF');
      }

      console.log('✅ PDF enviado para Supabase:', uploadData.path);

      // 9. Obter URL pública do PDF
      const { data: urlData } = supabase.storage
        .from('PDF INTIMACAO')
        .getPublicUrl(caminhoArquivo);

      console.log('🔗 URL pública do PDF:', urlData.publicUrl);

      // 10. Formatar data da intimação (DD - MM - YYYY)
      let dataIntimacaoFormatada = 'N/A';
      if (dadosEnvio.intimacao.data) {
        const dataInt = new Date(dadosEnvio.intimacao.data);
        const dia = String(dataInt.getDate()).padStart(2, '0');
        const mes = String(dataInt.getMonth() + 1).padStart(2, '0');
        const ano = dataInt.getFullYear();
        dataIntimacaoFormatada = `${dia} - ${mes} - ${ano}`;
      }

      // 11. Remover HTML do conteúdo
      const conteudoSemHTML = dadosEnvio.intimacao.conteudo 
        ? dadosEnvio.intimacao.conteudo.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        : '';

      // 12. Montar estrutura de dados para cada email
      const emailsParaEnvio = todosEmails.map(email => ({
        // Dados do processo
        cnpj: processoData.cnpj || '',
        autor: processoData.autor || '',
        reu: processoData.reu || '',
        tribunal: processoData.tribunal || '',
        area: processoData.area || '',
        classe: processoData.classe || '',
        assunto: processoData.assunto || '',
        orgao_julgador: processoData.orgao_julgador || '',
        valor_causa: processoData.valor_causa || '',
        
        // Dados do email
        titulo: dadosEnvio.titulo,
        mensagem: dadosEnvio.mensagem,
        email: email,
        
        // URL do PDF
        pdf_url: urlData.publicUrl,
        
        // Dados específicos da intimação
        data_intimacao: dataIntimacaoFormatada,
        snippet: dadosEnvio.intimacao.snippet || '',
        secao: dadosEnvio.intimacao.secao || '',
        tipo: dadosEnvio.intimacao.tipo || '',
        conteudo: conteudoSemHTML,
        dscPequena: dadosEnvio.intimacao.dscPequena || '',
        
        // Metadados
        userId: session.user.id,
        userUuid: session.user.id,
        timestamp: new Date().toISOString()
      }));

      // 13. Enviar para webhook N8N específico de intimações
      const webhookUrl = 'https://n8nwebhook.estruturadeapi.com/webhook/cc80b335-60de-4a06-877c-cc0d0fcef393';
      console.log('📤 Enviando para webhook N8N de intimações...');
      console.log('Dados sendo enviados:', JSON.stringify(emailsParaEnvio, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(emailsParaEnvio),
      });

      if (!response.ok) {
        console.error('❌ Erro na resposta do webhook:', response.status, response.statusText);
        
        if (response.status === 429) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        }
        
        throw new Error(`Erro no servidor: ${response.status}`);
      }

      // Tratar resposta do webhook
      let resultado;
      try {
        const responseText = await response.text();
        console.log('📥 Resposta bruta do webhook:', responseText);
        
        try {
          resultado = JSON.parse(responseText);
        } catch {
          resultado = { message: responseText };
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar resposta do webhook:', error);
        resultado = { message: 'Resposta processada com sucesso' };
      }
      
      console.log('✅ Resultado processado:', resultado);
      console.log('✅ Emails de intimação enviados com sucesso!');

      // 14. Retornar sucesso
      return {
        sucesso: true,
        totalEnvios: emailsParaEnvio.length,
        pdfUrl: urlData.publicUrl,
        mensagem: `Email enviado com sucesso para ${emailsParaEnvio.length} destinatário${emailsParaEnvio.length > 1 ? 's' : ''} com PDF anexado!`
      };

    } catch (error) {
      console.error('❌ Erro no emailService.enviarMensagemIntimacao:', error);
      throw error;
    }
  }
}; 