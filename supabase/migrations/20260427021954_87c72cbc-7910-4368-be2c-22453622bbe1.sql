-- Atualiza tabela produtos
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS ingredientes TEXT,
  ADD COLUMN IF NOT EXISTS modo_uso TEXT,
  ADD COLUMN IF NOT EXISTS informacoes_gerais TEXT,
  ADD COLUMN IF NOT EXISTS variacoes JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS aceita_pix BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS aceita_cartao BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_parcelas INTEGER NOT NULL DEFAULT 12;

-- Tabela imagens_site
CREATE TABLE IF NOT EXISTS public.imagens_site (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('capa','carrossel')),
  url TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.imagens_site ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imagens visiveis publicamente" ON public.imagens_site FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir imagens" ON public.imagens_site FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar imagens" ON public.imagens_site FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir imagens" ON public.imagens_site FOR DELETE USING (true);

ALTER TABLE public.imagens_site REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.imagens_site;

-- Tabela banner_desconto
CREATE TABLE IF NOT EXISTS public.banner_desconto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensagem TEXT NOT NULL DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banner_desconto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banner visivel publicamente" ON public.banner_desconto FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir banner" ON public.banner_desconto FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar banner" ON public.banner_desconto FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir banner" ON public.banner_desconto FOR DELETE USING (true);

CREATE TRIGGER update_banner_updated_at
BEFORE UPDATE ON public.banner_desconto
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.banner_desconto REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.banner_desconto;

-- Linha única padrão para o banner
INSERT INTO public.banner_desconto (mensagem, ativo)
SELECT '', false
WHERE NOT EXISTS (SELECT 1 FROM public.banner_desconto);

-- Bucket público para imagens do site
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-imagens', 'site-imagens', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site imagens public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-imagens');

CREATE POLICY "Site imagens public insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-imagens');

CREATE POLICY "Site imagens public update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-imagens');

CREATE POLICY "Site imagens public delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-imagens');