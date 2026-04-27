-- ========================================
-- 1) PRODUTOS: adicionar campos de estoque/custo
-- ========================================
ALTER TABLE public.produtos
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quantidade_minima INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS valor_compra NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lucro_valor NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS margem_percentual NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estoque_status TEXT NOT NULL DEFAULT 'disponivel';

-- Trigger para calcular lucro/margem/status automaticamente
CREATE OR REPLACE FUNCTION public.produtos_calc_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.lucro_valor := COALESCE(NEW.valor, 0) - COALESCE(NEW.valor_compra, 0);
  IF COALESCE(NEW.valor_compra, 0) > 0 THEN
    NEW.margem_percentual := (NEW.lucro_valor / NEW.valor_compra) * 100;
  ELSE
    NEW.margem_percentual := 0;
  END IF;

  IF COALESCE(NEW.quantidade, 0) <= 0 THEN
    NEW.estoque_status := 'esgotado';
  ELSIF NEW.quantidade <= COALESCE(NEW.quantidade_minima, 5) THEN
    NEW.estoque_status := 'baixo';
  ELSE
    NEW.estoque_status := 'disponivel';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS produtos_calc_trigger ON public.produtos;
CREATE TRIGGER produtos_calc_trigger
BEFORE INSERT OR UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.produtos_calc_fields();

-- Recalcula linhas existentes
UPDATE public.produtos SET updated_at = now();

-- ========================================
-- 2) VENDAS
-- ========================================
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  variacao TEXT,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  desconto_aplicado NUMERIC NOT NULL DEFAULT 0,
  cupom_codigo TEXT,
  forma_pagamento TEXT NOT NULL DEFAULT 'pix',
  parcelas INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'concluida',
  observacao TEXT,
  cliente_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendas visiveis publicamente" ON public.vendas FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir vendas" ON public.vendas FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar vendas" ON public.vendas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir vendas" ON public.vendas FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_vendas_created_at ON public.vendas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendas_produto ON public.vendas(produto_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON public.vendas(status);

-- ========================================
-- 3) ESTOQUE_MOVIMENTACOES
-- ========================================
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada','saida','cancelamento','ajuste')),
  quantidade INTEGER NOT NULL,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  motivo TEXT,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Movimentacoes visiveis publicamente" ON public.estoque_movimentacoes FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir movimentacoes" ON public.estoque_movimentacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar movimentacoes" ON public.estoque_movimentacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir movimentacoes" ON public.estoque_movimentacoes FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_mov_produto ON public.estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_mov_created ON public.estoque_movimentacoes(created_at DESC);

-- ========================================
-- 4) FINANCEIRO_LANCAMENTOS
-- ========================================
CREATE TABLE IF NOT EXISTS public.financeiro_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita','despesa')),
  categoria TEXT NOT NULL DEFAULT 'outros',
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  forma_pagamento TEXT,
  venda_id UUID REFERENCES public.vendas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lancamentos visiveis publicamente" ON public.financeiro_lancamentos FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir lancamentos" ON public.financeiro_lancamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar lancamentos" ON public.financeiro_lancamentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Qualquer um pode excluir lancamentos" ON public.financeiro_lancamentos FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_lanc_created ON public.financeiro_lancamentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lanc_tipo ON public.financeiro_lancamentos(tipo);

-- ========================================
-- 5) RPC: confirmar_venda (ATÔMICA)
-- ========================================
CREATE OR REPLACE FUNCTION public.confirmar_venda(
  p_produto_id UUID,
  p_quantidade INTEGER,
  p_valor_unitario NUMERIC,
  p_desconto NUMERIC DEFAULT 0,
  p_cupom TEXT DEFAULT NULL,
  p_forma_pagamento TEXT DEFAULT 'pix',
  p_parcelas INTEGER DEFAULT 1,
  p_observacao TEXT DEFAULT NULL,
  p_cliente_nome TEXT DEFAULT NULL,
  p_variacao TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_produto RECORD;
  v_venda_id UUID;
  v_valor_total NUMERIC;
BEGIN
  IF p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  SELECT id, nome, quantidade, valor, valor_compra
    INTO v_produto
    FROM public.produtos
    WHERE id = p_produto_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;

  IF v_produto.quantidade < p_quantidade THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %', v_produto.quantidade;
  END IF;

  v_valor_total := (p_valor_unitario * p_quantidade) - COALESCE(p_desconto, 0);
  IF v_valor_total < 0 THEN v_valor_total := 0; END IF;

  -- Inserir venda
  INSERT INTO public.vendas (
    produto_id, produto_nome, variacao, quantidade,
    valor_unitario, valor_total, desconto_aplicado, cupom_codigo,
    forma_pagamento, parcelas, status, observacao, cliente_nome
  ) VALUES (
    p_produto_id, v_produto.nome, p_variacao, p_quantidade,
    p_valor_unitario, v_valor_total, COALESCE(p_desconto, 0), p_cupom,
    p_forma_pagamento, COALESCE(p_parcelas, 1), 'concluida', p_observacao, p_cliente_nome
  ) RETURNING id INTO v_venda_id;

  -- Abater estoque
  UPDATE public.produtos
    SET quantidade = quantidade - p_quantidade
    WHERE id = p_produto_id;

  -- Registrar movimentação
  INSERT INTO public.estoque_movimentacoes (
    produto_id, produto_nome, tipo, quantidade, valor_unitario, motivo, venda_id
  ) VALUES (
    p_produto_id, v_produto.nome, 'saida', p_quantidade, p_valor_unitario, 'Venda PDV', v_venda_id
  );

  -- Lançamento financeiro (receita)
  INSERT INTO public.financeiro_lancamentos (
    tipo, categoria, descricao, valor, forma_pagamento, venda_id
  ) VALUES (
    'receita', 'venda', 'Venda: ' || v_produto.nome || ' x' || p_quantidade,
    v_valor_total, p_forma_pagamento, v_venda_id
  );

  RETURN v_venda_id;
END;
$$;

-- ========================================
-- 6) RPC: cancelar_venda (ATÔMICA)
-- ========================================
CREATE OR REPLACE FUNCTION public.cancelar_venda(p_venda_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_venda RECORD;
BEGIN
  SELECT * INTO v_venda FROM public.vendas WHERE id = p_venda_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada';
  END IF;
  IF v_venda.status = 'cancelada' THEN
    RAISE EXCEPTION 'Venda já está cancelada';
  END IF;

  -- Marcar como cancelada
  UPDATE public.vendas
    SET status = 'cancelada', updated_at = now()
    WHERE id = p_venda_id;

  -- Devolver ao estoque (se produto ainda existe)
  IF v_venda.produto_id IS NOT NULL THEN
    UPDATE public.produtos
      SET quantidade = quantidade + v_venda.quantidade
      WHERE id = v_venda.produto_id;
  END IF;

  -- Movimentação de cancelamento
  INSERT INTO public.estoque_movimentacoes (
    produto_id, produto_nome, tipo, quantidade, valor_unitario, motivo, venda_id
  ) VALUES (
    v_venda.produto_id, v_venda.produto_nome, 'cancelamento',
    v_venda.quantidade, v_venda.valor_unitario, 'Cancelamento de venda', p_venda_id
  );

  -- Estornar lançamentos financeiros relacionados
  UPDATE public.financeiro_lancamentos
    SET status = 'estornado'
    WHERE venda_id = p_venda_id;

  RETURN TRUE;
END;
$$;

-- ========================================
-- 7) RPC: registrar_entrada_estoque (compra de produtos -> opcional despesa)
-- ========================================
CREATE OR REPLACE FUNCTION public.registrar_entrada_estoque(
  p_produto_id UUID,
  p_quantidade INTEGER,
  p_valor_unitario NUMERIC DEFAULT 0,
  p_motivo TEXT DEFAULT 'Entrada manual',
  p_gerar_despesa BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_produto RECORD;
BEGIN
  IF p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  SELECT id, nome INTO v_produto FROM public.produtos WHERE id = p_produto_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado'; END IF;

  UPDATE public.produtos
    SET quantidade = quantidade + p_quantidade
    WHERE id = p_produto_id;

  INSERT INTO public.estoque_movimentacoes (
    produto_id, produto_nome, tipo, quantidade, valor_unitario, motivo
  ) VALUES (v_produto.id, v_produto.nome, 'entrada', p_quantidade, p_valor_unitario, p_motivo);

  IF p_gerar_despesa AND p_valor_unitario > 0 THEN
    INSERT INTO public.financeiro_lancamentos (
      tipo, categoria, descricao, valor
    ) VALUES (
      'despesa', 'fornecedores',
      'Compra: ' || v_produto.nome || ' x' || p_quantidade,
      p_valor_unitario * p_quantidade
    );
  END IF;

  RETURN TRUE;
END;
$$;

-- ========================================
-- 8) Realtime
-- ========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.estoque_movimentacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.financeiro_lancamentos;