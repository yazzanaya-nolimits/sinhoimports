-- 1) Tabela carrossel_imagens
CREATE TABLE IF NOT EXISTS public.carrossel_imagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carrossel_imagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carrossel visivel publicamente"
  ON public.carrossel_imagens FOR SELECT TO public USING (true);
CREATE POLICY "Qualquer um pode inserir carrossel"
  ON public.carrossel_imagens FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar carrossel"
  ON public.carrossel_imagens FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir carrossel"
  ON public.carrossel_imagens FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.carrossel_imagens;
ALTER TABLE public.carrossel_imagens REPLICA IDENTITY FULL;

-- 2) Categoria + destaque em produtos
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'outros',
  ADD COLUMN IF NOT EXISTS destaque BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON public.produtos(destaque) WHERE destaque = true;