
-- =========================================
-- Tabela produtos
-- =========================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  foto_url TEXT,
  imagem_destaque_url TEXT,
  cupom_codigo TEXT,
  cupom_tipo TEXT CHECK (cupom_tipo IN ('percentual', 'fixo')),
  cupom_valor NUMERIC(10,2),
  cupom_validade DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON public.produtos;
CREATE TRIGGER trg_produtos_updated_at
BEFORE UPDATE ON public.produtos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- RLS
-- =========================================
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Leitura pública (catálogo da homepage)
CREATE POLICY "Produtos sao visiveis publicamente"
ON public.produtos
FOR SELECT
USING (true);

-- Escrita liberada (admin é protegido por PIN no frontend)
CREATE POLICY "Qualquer um pode inserir produtos"
ON public.produtos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Qualquer um pode atualizar produtos"
ON public.produtos
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Qualquer um pode excluir produtos"
ON public.produtos
FOR DELETE
USING (true);

-- =========================================
-- Realtime
-- =========================================
ALTER TABLE public.produtos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.produtos;

-- =========================================
-- Storage bucket "produtos" (público, 5MB max, imagens)
-- =========================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'produtos',
  'produtos',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies
CREATE POLICY "Imagens de produtos sao publicamente visiveis"
ON storage.objects
FOR SELECT
USING (bucket_id = 'produtos');

CREATE POLICY "Qualquer um pode fazer upload em produtos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'produtos');

CREATE POLICY "Qualquer um pode atualizar imagens de produtos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'produtos')
WITH CHECK (bucket_id = 'produtos');

CREATE POLICY "Qualquer um pode excluir imagens de produtos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'produtos');
