CREATE OR REPLACE FUNCTION public.confirmar_venda(p_produto_id uuid, p_quantidade integer, p_valor_unitario numeric, p_desconto numeric DEFAULT 0, p_cupom text DEFAULT NULL::text, p_forma_pagamento text DEFAULT 'pix'::text, p_parcelas integer DEFAULT 1, p_observacao text DEFAULT NULL::text, p_cliente_nome text DEFAULT NULL::text, p_variacao text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_produto RECORD;
  v_venda_id UUID;
  v_preco NUMERIC;
  v_var jsonb;
  v_subtotal NUMERIC;
  v_desconto NUMERIC;
  v_valor_total NUMERIC;
BEGIN
  IF NOT public.check_user_permission('pdv', 'editar') THEN
    RAISE EXCEPTION 'Sem permissão para registrar vendas';
  END IF;
  IF p_quantidade IS NULL OR p_quantidade <= 0 THEN
    RAISE EXCEPTION 'Quantidade deve ser maior que zero';
  END IF;

  SELECT id, nome, quantidade, valor, variacoes INTO v_produto
    FROM public.produtos WHERE id = p_produto_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Produto não encontrado'; END IF;
  IF v_produto.quantidade < p_quantidade THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %', v_produto.quantidade;
  END IF;

  -- Preço sempre definido pelo servidor (ignora p_valor_unitario do cliente)
  v_preco := COALESCE(v_produto.valor, 0);
  IF p_variacao IS NOT NULL AND p_variacao <> '' THEN
    SELECT e INTO v_var FROM jsonb_array_elements(COALESCE(v_produto.variacoes, '[]'::jsonb)) e
      WHERE e->>'tamanho' = p_variacao OR e->>'label' = p_variacao LIMIT 1;
    IF v_var IS NULL THEN RAISE EXCEPTION 'Variação inválida'; END IF;
    IF COALESCE((v_var->>'valor')::numeric, 0) > 0 THEN
      v_preco := (v_var->>'valor')::numeric;
    END IF;
  END IF;

  v_subtotal := v_preco * p_quantidade;
  v_desconto := COALESCE(p_desconto, 0);
  IF v_desconto < 0 OR v_desconto > v_subtotal THEN
    RAISE EXCEPTION 'Desconto inválido';
  END IF;
  v_valor_total := v_subtotal - v_desconto;

  INSERT INTO public.vendas (
    produto_id, produto_nome, variacao, quantidade, valor_unitario, valor_total, desconto_aplicado, cupom_codigo,
    forma_pagamento, parcelas, status, observacao, cliente_nome
  ) VALUES (
    p_produto_id, v_produto.nome, p_variacao, p_quantidade, v_preco, v_valor_total, v_desconto, p_cupom,
    p_forma_pagamento, GREATEST(COALESCE(p_parcelas, 1), 1), 'concluida', p_observacao, p_cliente_nome
  ) RETURNING id INTO v_venda_id;

  UPDATE public.produtos SET quantidade = quantidade - p_quantidade WHERE id = p_produto_id;

  INSERT INTO public.estoque_movimentacoes (produto_id, produto_nome, tipo, quantidade, valor_unitario, motivo, venda_id)
  VALUES (p_produto_id, v_produto.nome, 'saida', p_quantidade, v_preco, 'Venda PDV', v_venda_id);

  INSERT INTO public.financeiro_lancamentos (tipo, categoria, descricao, valor, forma_pagamento, venda_id)
  VALUES ('receita', 'venda', 'Venda: ' || v_produto.nome || ' x' || p_quantidade, v_valor_total, p_forma_pagamento, v_venda_id);

  RETURN v_venda_id;
END;
$function$;