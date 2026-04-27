-- ============= CRM LEADS =============
CREATE TABLE public.crm_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  interesse TEXT,
  etapa TEXT NOT NULL DEFAULT 'novo_contato',
  observacao TEXT,
  historico JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads visiveis publicamente" ON public.crm_leads FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir leads" ON public.crm_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar leads" ON public.crm_leads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir leads" ON public.crm_leads FOR DELETE USING (true);

CREATE TRIGGER update_crm_leads_updated_at
BEFORE UPDATE ON public.crm_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.crm_leads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crm_leads;

-- ============= ESTOQUE =============
CREATE TABLE public.estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT,
  quantidade INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER NOT NULL DEFAULT 5,
  valor_compra NUMERIC NOT NULL DEFAULT 0,
  valor_venda NUMERIC NOT NULL DEFAULT 0,
  lucro_valor NUMERIC NOT NULL DEFAULT 0,
  margem_percentual NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'disponivel',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estoque visivel publicamente" ON public.estoque FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir estoque" ON public.estoque FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar estoque" ON public.estoque FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir estoque" ON public.estoque FOR DELETE USING (true);

-- Função para calcular lucro, margem e status automaticamente
CREATE OR REPLACE FUNCTION public.estoque_calc_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.lucro_valor := COALESCE(NEW.valor_venda, 0) - COALESCE(NEW.valor_compra, 0);
  IF COALESCE(NEW.valor_compra, 0) > 0 THEN
    NEW.margem_percentual := (NEW.lucro_valor / NEW.valor_compra) * 100;
  ELSE
    NEW.margem_percentual := 0;
  END IF;

  IF COALESCE(NEW.quantidade, 0) <= 0 THEN
    NEW.status := 'esgotado';
  ELSIF NEW.quantidade <= COALESCE(NEW.quantidade_minima, 5) THEN
    NEW.status := 'baixo';
  ELSE
    NEW.status := 'disponivel';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER estoque_calc_before_insert
BEFORE INSERT ON public.estoque
FOR EACH ROW EXECUTE FUNCTION public.estoque_calc_fields();

CREATE TRIGGER estoque_calc_before_update
BEFORE UPDATE ON public.estoque
FOR EACH ROW EXECUTE FUNCTION public.estoque_calc_fields();

ALTER TABLE public.estoque REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque;