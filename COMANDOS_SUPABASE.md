# Comandos para Configurar Supabase Storage

## Criar Bucket 'documentos'

Se você receber o erro "Bucket not found", execute os comandos abaixo no painel do Supabase:

### 1. Via Interface Supabase (Recomendado)

1. Acesse o painel do Supabase
2. Vá em **Storage** → **Buckets**
3. Clique em **New bucket**
4. Nome: `documentos`
5. **Public bucket**: Desmarque (bucket privado)
6. Clique em **Save**

### 2. Via SQL (Alternativo)

Execute no **SQL Editor** do Supabase:

```sql
-- Criar bucket documentos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos',
  'documentos', 
  false, 
  5242880, -- 5MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ]
);
```

### 3. Configurar Políticas de Segurança (RLS)

Execute também no **SQL Editor**:

```sql
-- Permitir upload para usuários autenticados
CREATE POLICY "Usuarios podem fazer upload de documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documentos');

-- Permitir download para usuários autenticados de seus próprios arquivos
CREATE POLICY "Usuarios podem baixar seus documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir deletar para usuários autenticados de seus próprios arquivos
CREATE POLICY "Usuarios podem deletar seus documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir atualização para usuários autenticados de seus próprios arquivos
CREATE POLICY "Usuarios podem atualizar seus documentos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'documentos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política para admins fazerem qualquer operação
CREATE POLICY "Admins podem fazer qualquer operação nos documentos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documentos' AND 
  EXISTS (
    SELECT 1 FROM usuario 
    WHERE usuario.uuid = auth.uid() 
    AND usuario.role_atual = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'documentos' AND 
  EXISTS (
    SELECT 1 FROM usuario 
    WHERE usuario.uuid = auth.uid() 
    AND usuario.role_atual = 'admin'
  )
);
```

### 4. Verificar se funcionou

Após criar o bucket, teste fazendo upload de um arquivo no sistema.

## Troubleshooting

### Erro: "Insufficient privileges"
- Verifique se você é admin do projeto Supabase
- Execute os comandos na ordem apresentada

### Erro: "Bucket already exists"
- O bucket já foi criado, ignore este erro

### Erro: "Policy already exists"
- As políticas já foram criadas, ignore este erro 