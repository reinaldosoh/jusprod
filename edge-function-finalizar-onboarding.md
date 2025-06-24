# Edge Function: Finalizar Onboarding

## Descrição
Esta edge function é responsável por buscar os processos da API do Escavador e inserir na tabela `processos` do Supabase quando um usuário confirma o pagamento de uma nova assinatura.

## Fluxo de Execução

### 1. Trigger
- Quando o usuário completa o pagamento de uma nova assinatura (não upgrade)
- A success_url no Stripe redireciona para `/pagamento-confirmado?assinaturarealizadasucesso=true`
- O componente `PagamentoConfirmado.vue` detecta o parâmetro e chama a edge function

### 2. Processo da Edge Function

#### Entrada
```json
{
  "userUuid": "uuid-do-usuario",
  "oabEstado": "SP", 
  "oabNumero": "123456"
}
```

#### Processamento
1. **Validação**: Verifica se o usuário existe no banco
2. **Busca na API**: Faz chamadas paginadas para `https://api.escavador.com/api/v2/advogado/processos`
3. **Headers obrigatórios**:
   - `Authorization: Bearer {token}`
   - `X-Requested-With: XMLHttpRequest`
4. **Paginação**: Continua buscando enquanto `links.next` existir (máximo 50 páginas)
5. **Inserção**: Insere processos na tabela `processos` em lotes de 100

#### Mapeamento dos Campos
```javascript
{
  cnpj: numero_cnj,
  autor: titulo_polo_ativo,
  reu: titulo_polo_passivo,
  tribunal: fontes[0].sigla,
  ultima_movimentacao: fontes[0].data_ultima_movimentacao || data_ultima_movimentacao,
  ultimaMovimentacao: new Date(data_ultima_movimentacao),
  data_inicio: data_inicio,
  dataInicio: new Date(data_inicio),
  qdt_movimentacao: quantidade_movimentacoes,
  tribunalDesc: fontes[0].descricao,
  area: fontes[0].capa.area,
  classe: fontes[0].capa.classe,
  assunto: fontes[0].capa.assunto,
  orgao_julgador: fontes[0].capa.orgao_julgador,
  usuario_id: userData.id,
  uuid: userData.uuid
}
```

#### Resposta
```json
{
  "message": "Onboarding finalizado com sucesso",
  "processosColetados": 150,
  "processosInseridos": 148,
  "errosInsercao": 2,
  "paginasProcessadas": 8
}
```

### 3. Frontend (PagamentoConfirmado.vue)

#### Estados da Interface
1. **Loading**: Mostra spinner e status do progresso
2. **Sucesso**: Exibe resultados e botão para dashboard
3. **Erro**: Mostra mensagem de erro

#### Funcionalidades
- Detecta parâmetro `assinaturarealizadasucesso=true`
- Busca dados da OAB do usuário no banco
- Chama a edge function com os dados necessários
- Mostra progresso em tempo real
- Redireciona para o dashboard após conclusão

## Configuração Necessária

### 1. Variáveis de Ambiente
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Token da API do Escavador (hardcoded na função)

### 2. Tabela `processos`
Deve existir no Supabase com os campos mapeados acima.

### 3. Tabela `usuario`
Deve ter os campos `oab_estado` e `oab_numero` preenchidos.

## Deploy

Para fazer deploy da edge function:

```bash
supabase functions deploy finalizar-onboarding
```

## Limitações

1. **Timeout**: Edge functions têm limite de tempo de execução
2. **Rate Limiting**: API do Escavador pode ter limites de requisições
3. **Memória**: Processar muitos processos pode consumir muita memória
4. **Segurança**: Token da API está hardcoded (considerar usar variável de ambiente)

## Melhorias Futuras

1. Mover token para variável de ambiente
2. Implementar retry logic para falhas de rede
3. Adicionar logs mais detalhados
4. Implementar processamento em background para grandes volumes
5. Adicionar cache para evitar reprocessamento 