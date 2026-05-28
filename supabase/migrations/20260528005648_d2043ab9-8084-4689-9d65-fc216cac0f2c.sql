-- Garantir que anon e authenticated possam selecionar todas as colunas para evitar erros de select *
-- A segurança real é feita via RLS nas linhas
GRANT SELECT ON public.produtos TO anon, authenticated;
GRANT SELECT ON public.estoque_movimentacoes TO authenticated;
GRANT SELECT ON public.vendas TO authenticated;
GRANT SELECT ON public.financeiro_lancamentos TO authenticated;

-- Assegurar que o RLS está habilitado
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
