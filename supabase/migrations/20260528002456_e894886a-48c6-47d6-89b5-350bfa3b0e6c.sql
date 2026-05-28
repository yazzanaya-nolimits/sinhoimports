ALTER TABLE public.vendas 
ADD COLUMN IF NOT EXISTS checkout_id TEXT,
ADD COLUMN IF NOT EXISTS pagamento_status TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS pagamento_metodo TEXT,
ADD COLUMN IF NOT EXISTS checkout_url TEXT;

CREATE INDEX IF NOT EXISTS idx_vendas_checkout_id ON public.vendas(checkout_id);
