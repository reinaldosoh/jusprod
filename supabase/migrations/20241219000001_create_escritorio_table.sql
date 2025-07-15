-- Criar tabela escritorio
CREATE TABLE IF NOT EXISTS public.escritorio (
    id BIGSERIAL PRIMARY KEY,
    nome_escritorio TEXT NOT NULL,
    site TEXT,
    url_logotipo TEXT,
    rua TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    usuario_id BIGINT REFERENCES public.usuario(id) ON DELETE CASCADE,
    uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS na tabela escritorio
ALTER TABLE public.escritorio ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários podem ver apenas seus próprios escritórios
CREATE POLICY "Usuarios podem ver seus escritorios"
ON public.escritorio FOR SELECT
TO authenticated
USING (auth.uid() = uuid);

-- Política para INSERT: usuários podem inserir apenas com seu próprio UUID
CREATE POLICY "Usuarios podem inserir seus escritorios"
ON public.escritorio FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = uuid);

-- Política para UPDATE: usuários podem atualizar apenas seus próprios escritórios
CREATE POLICY "Usuarios podem atualizar seus escritorios"
ON public.escritorio FOR UPDATE
TO authenticated
USING (auth.uid() = uuid)
WITH CHECK (auth.uid() = uuid);

-- Política para DELETE: usuários podem deletar apenas seus próprios escritórios
CREATE POLICY "Usuarios podem deletar seus escritorios"
ON public.escritorio FOR DELETE
TO authenticated
USING (auth.uid() = uuid);

-- Política para admins fazerem qualquer operação
CREATE POLICY "Admins podem fazer qualquer operacao nos escritorios"
ON public.escritorio FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuario 
    WHERE usuario.uuid = auth.uid() 
    AND usuario.role_atual = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuario 
    WHERE usuario.uuid = auth.uid() 
    AND usuario.role_atual = 'admin'
  )
);

-- Criar índices para performance
CREATE INDEX idx_escritorio_uuid ON public.escritorio(uuid);
CREATE INDEX idx_escritorio_usuario_id ON public.escritorio(usuario_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_escritorio_updated_at 
    BEFORE UPDATE ON public.escritorio 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas colunas para documentação
COMMENT ON TABLE public.escritorio IS 'Tabela para armazenar dados dos escritórios dos usuários';
COMMENT ON COLUMN public.escritorio.nome_escritorio IS 'Nome do escritório de advocacia';
COMMENT ON COLUMN public.escritorio.site IS 'Website do escritório';
COMMENT ON COLUMN public.escritorio.url_logotipo IS 'URL da logo do escritório';
COMMENT ON COLUMN public.escritorio.rua IS 'Endereço - rua do escritório';
COMMENT ON COLUMN public.escritorio.numero IS 'Endereço - número do escritório';
COMMENT ON COLUMN public.escritorio.bairro IS 'Endereço - bairro do escritório';
COMMENT ON COLUMN public.escritorio.cidade IS 'Endereço - cidade do escritório';
COMMENT ON COLUMN public.escritorio.estado IS 'Endereço - estado do escritório';
COMMENT ON COLUMN public.escritorio.usuario_id IS 'FK para tabela usuario - se deletar usuário apaga registros';
COMMENT ON COLUMN public.escritorio.uuid IS 'FK para auth.users - se deletar usuário apaga registros'; 