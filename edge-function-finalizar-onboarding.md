# Edge Function: finalizar-onboarding

Esta Edge Function deve ser criada no Supabase para atualizar as tabelas `onboarding` e `primeiro_acesso` quando o usuário completar ou pular o tutorial.

## Nome da Função
```
finalizar-onboarding
```

## Parâmetros de Entrada
```typescript
{
  userUuid: string,  // UUID do usuário
  tipo: 'completo' | 'pulado'  // Tipo de finalização
}
```

## Código da Edge Function (TypeScript)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { userUuid, tipo } = await req.json()

    if (!userUuid) {
      return new Response(
        JSON.stringify({ error: 'userUuid é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🎯 Finalizando onboarding para usuário: ${userUuid}, tipo: ${tipo}`)

    // 1. Atualizar/Criar registro na tabela onboarding
    const { data: existingOnboarding, error: checkOnboardingError } = await supabaseClient
      .from('onboarding')
      .select('id, finalizado')
      .eq('usuario_uuid', userUuid)
      .single()

    if (checkOnboardingError && checkOnboardingError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar onboarding:', checkOnboardingError)
    }

    if (existingOnboarding) {
      // Atualizar registro existente
      console.log('📝 Atualizando onboarding existente...')
      
      const { error: updateOnboardingError } = await supabaseClient
        .from('onboarding')
        .update({ 
          finalizado: true,
          data_finalizacao: new Date().toISOString(),
          tipo_finalizacao: tipo
        })
        .eq('usuario_uuid', userUuid)

      if (updateOnboardingError) {
        console.error('❌ Erro ao atualizar onboarding:', updateOnboardingError)
        throw updateOnboardingError
      }
    } else {
      // Criar novo registro
      console.log('➕ Criando novo registro de onboarding...')
      
      const { error: insertOnboardingError } = await supabaseClient
        .from('onboarding')
        .insert({
          usuario_uuid: userUuid,
          finalizado: true,
          data_finalizacao: new Date().toISOString(),
          tipo_finalizacao: tipo
        })

      if (insertOnboardingError) {
        console.error('❌ Erro ao criar onboarding:', insertOnboardingError)
        throw insertOnboardingError
      }
    }

    // 2. Atualizar/Criar registro na tabela primeiro_acesso
    const { data: existingPrimeiroAcesso, error: checkPrimeiroAcessoError } = await supabaseClient
      .from('primeiro_acesso')
      .select('id, finalizado')
      .eq('usuario_uuid', userUuid)
      .single()

    if (checkPrimeiroAcessoError && checkPrimeiroAcessoError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar primeiro_acesso:', checkPrimeiroAcessoError)
    }

    if (existingPrimeiroAcesso) {
      // Atualizar registro existente
      console.log('📝 Atualizando primeiro_acesso existente...')
      
      const { error: updatePrimeiroAcessoError } = await supabaseClient
        .from('primeiro_acesso')
        .update({ 
          finalizado: true,
          data_finalizacao: new Date().toISOString(),
          tipo_finalizacao: tipo
        })
        .eq('usuario_uuid', userUuid)

      if (updatePrimeiroAcessoError) {
        console.error('❌ Erro ao atualizar primeiro_acesso:', updatePrimeiroAcessoError)
        throw updatePrimeiroAcessoError
      }
    } else {
      // Criar novo registro
      console.log('➕ Criando novo registro de primeiro_acesso...')
      
      const { error: insertPrimeiroAcessoError } = await supabaseClient
        .from('primeiro_acesso')
        .insert({
          usuario_uuid: userUuid,
          finalizado: true,
          data_finalizacao: new Date().toISOString(),
          tipo_finalizacao: tipo
        })

      if (insertPrimeiroAcessoError) {
        console.error('❌ Erro ao criar primeiro_acesso:', insertPrimeiroAcessoError)
        throw insertPrimeiroAcessoError
      }
    }

    console.log('✅ Onboarding e primeiro acesso finalizados com sucesso!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Onboarding e primeiro acesso finalizados com sucesso',
        tipo: tipo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

## Estrutura das Tabelas Esperadas

### Tabela: onboarding
```sql
CREATE TABLE onboarding (
  id SERIAL PRIMARY KEY,
  usuario_uuid UUID REFERENCES auth.users(id),
  finalizado BOOLEAN DEFAULT FALSE,
  data_finalizacao TIMESTAMP,
  tipo_finalizacao VARCHAR(20), -- 'completo' ou 'pulado'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: primeiro_acesso
```sql
CREATE TABLE primeiro_acesso (
  id SERIAL PRIMARY KEY,
  usuario_uuid UUID REFERENCES auth.users(id),
  finalizado BOOLEAN DEFAULT FALSE,
  data_finalizacao TIMESTAMP,
  tipo_finalizacao VARCHAR(20), -- 'completo' ou 'pulado'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Como Criar a Edge Function no Supabase

1. Acesse o painel do Supabase
2. Vá para "Edge Functions"
3. Clique em "Create Function"
4. Nome: `finalizar-onboarding`
5. Cole o código TypeScript acima
6. Deploy da função

## Testando a Função

```javascript
const { data, error } = await supabase.functions.invoke('finalizar-onboarding', {
  body: { 
    userUuid: 'uuid-do-usuario',
    tipo: 'completo' // ou 'pulado'
  }
});
```

## Logs de Debug

A função inclui logs detalhados para acompanhar:
- ✅ Sucesso nas operações
- ❌ Erros específicos
- 📝 Atualizações de registros existentes
- ➕ Criação de novos registros 