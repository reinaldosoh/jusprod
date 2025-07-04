-- Criar políticas RLS para o bucket 'documentos'

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