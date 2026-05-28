-- 1. Funções Auxiliares de Segurança e Permissões
CREATE OR REPLACE FUNCTION public.check_user_permission(_module text, _level text DEFAULT 'ver')
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.membros
    WHERE user_id = auth.uid() 
      AND status = 'ativo'
      AND (
        (permissoes->>_module) = _level 
        OR (permissoes->>_module) = 'total'
        OR (permissoes->>'configuracoes') = 'total' -- Admin master tem tudo
      )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Ajustar funções existentes
ALTER FUNCTION public.has_module_level(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. Segurança de Funções
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- 3. Segurança de Colunas (Restringir acesso anônimo a dados sensíveis)
-- Produtos: esconder custos e margens de lucro do público
REVOKE SELECT ON public.produtos FROM anon;
GRANT SELECT (
  id, nome, descricao, valor, foto_url, imagem_destaque_url, 
  cupom_codigo, cupom_tipo, cupom_valor, cupom_validade, 
  status, created_at, updated_at, ingredientes, modo_uso, 
  informacoes_gerais, variacoes, aceita_pix, aceita_cartao, 
  max_parcelas, tipo, estoque_status, categoria, destaque
) ON public.produtos TO anon;

-- Configurações: esconder token do Mercado Pago
REVOKE SELECT ON public.site_config FROM anon;
GRANT SELECT (
  id, mercado_pago_public_key, mercado_pago_enabled, whatsapp_numero, updated_at
) ON public.site_config TO anon;

-- 4. Row Level Security (RLS) - Resetar e Aplicar Políticas Estritas

-- Membros
DROP POLICY IF EXISTS "Membros autenticados veem lista" ON public.membros;
CREATE POLICY "Membros veem seu próprio perfil" ON public.membros
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins veem todos os membros" ON public.membros
  FOR SELECT TO authenticated USING (public.check_user_permission('configuracoes'));

-- CRM Leads
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leads visiveis publicamente" ON public.crm_leads;
DROP POLICY IF EXISTS "Qualquer um pode inserir leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Qualquer um pode atualizar leads" ON public.crm_leads;
DROP POLICY IF EXISTS "Qualquer um pode excluir leads" ON public.crm_leads;

CREATE POLICY "Acesso CRM para admins" ON public.crm_leads
  FOR ALL TO authenticated USING (public.check_user_permission('crm'));

-- Financeiro
ALTER TABLE public.financeiro_lancamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lancamentos visiveis publicamente" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Qualquer um pode inserir lancamentos" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar lancamentos" ON public.financeiro_lancamentos;
DROP POLICY IF EXISTS "Qualquer um pode excluir lancamentos" ON public.financeiro_lancamentos;

CREATE POLICY "Acesso Financeiro para admins" ON public.financeiro_lancamentos
  FOR ALL TO authenticated USING (public.check_user_permission('financeiro'));

-- Vendas
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vendas visiveis publicamente" ON public.vendas;
DROP POLICY IF EXISTS "Qualquer um pode inserir vendas" ON public.vendas;
DROP POLICY IF EXISTS "Qualquer um pode atualizar vendas" ON public.vendas;
DROP POLICY IF EXISTS "Qualquer um pode excluir vendas" ON public.vendas;

CREATE POLICY "Público pode inserir vendas" ON public.vendas
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso Vendas para admins" ON public.vendas
  FOR SELECT TO authenticated USING (public.check_user_permission('financeiro') OR public.check_user_permission('dashboard'));
CREATE POLICY "Update Vendas para admins" ON public.vendas
  FOR UPDATE TO authenticated USING (public.check_user_permission('financeiro'));
CREATE POLICY "Delete Vendas para admins" ON public.vendas
  FOR DELETE TO authenticated USING (public.check_user_permission('financeiro'));

-- Estoque e Movimentações
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_movimentacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Estoque visivel publicamente" ON public.estoque;
DROP POLICY IF EXISTS "Qualquer um pode inserir estoque" ON public.estoque;
DROP POLICY IF EXISTS "Qualquer um pode atualizar estoque" ON public.estoque;
DROP POLICY IF EXISTS "Qualquer um pode excluir estoque" ON public.estoque;
DROP POLICY IF EXISTS "Movimentacoes visiveis publicamente" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "Qualquer um pode inserir movimentacoes" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "Qualquer um pode atualizar movimentacoes" ON public.estoque_movimentacoes;
DROP POLICY IF EXISTS "Qualquer um pode excluir movimentacoes" ON public.estoque_movimentacoes;

CREATE POLICY "Acesso Estoque para admins" ON public.estoque
  FOR ALL TO authenticated USING (public.check_user_permission('estoque'));
CREATE POLICY "Acesso Movimentacoes para admins" ON public.estoque_movimentacoes
  FOR ALL TO authenticated USING (public.check_user_permission('estoque'));

-- Produtos (Políticas)
DROP POLICY IF EXISTS "Produtos sao visiveis publicamente" ON public.produtos;
DROP POLICY IF EXISTS "Qualquer um pode inserir produtos" ON public.produtos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar produtos" ON public.produtos;
DROP POLICY IF EXISTS "Qualquer um pode excluir produtos" ON public.produtos;

CREATE POLICY "Produtos visíveis para todos" ON public.produtos
  FOR SELECT USING (status = 'ativo' OR public.check_user_permission('catalogo'));
CREATE POLICY "Gestão de Produtos para admins" ON public.produtos
  FOR ALL TO authenticated USING (public.check_user_permission('catalogo') OR public.check_user_permission('estoque'));

-- Banner, Imagens, Carrossel
DROP POLICY IF EXISTS "Banner visivel publicamente" ON public.banner_desconto;
DROP POLICY IF EXISTS "Qualquer um pode inserir banner" ON public.banner_desconto;
DROP POLICY IF EXISTS "Qualquer um pode atualizar banner" ON public.banner_desconto;
DROP POLICY IF EXISTS "Qualquer um pode excluir banner" ON public.banner_desconto;

CREATE POLICY "Banner visível publicamente" ON public.banner_desconto FOR SELECT USING (true);
CREATE POLICY "Gestão Banner para admins" ON public.banner_desconto 
  FOR ALL TO authenticated USING (public.check_user_permission('configuracoes'));

DROP POLICY IF EXISTS "Imagens visiveis publicamente" ON public.imagens_site;
DROP POLICY IF EXISTS "Qualquer um pode inserir imagens" ON public.imagens_site;
DROP POLICY IF EXISTS "Qualquer um pode atualizar imagens" ON public.imagens_site;
DROP POLICY IF EXISTS "Qualquer um pode excluir imagens" ON public.imagens_site;

CREATE POLICY "Imagens visíveis publicamente" ON public.imagens_site FOR SELECT USING (true);
CREATE POLICY "Gestão Imagens para admins" ON public.imagens_site 
  FOR ALL TO authenticated USING (public.check_user_permission('configuracoes'));

ALTER TABLE public.carrossel_imagens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Carrossel visível publicamente" ON public.carrossel_imagens;
DROP POLICY IF EXISTS "Gestão Carrossel para admins" ON public.carrossel_imagens;
CREATE POLICY "Carrossel visível publicamente" ON public.carrossel_imagens FOR SELECT USING (true);
CREATE POLICY "Gestão Carrossel para admins" ON public.carrossel_imagens 
  FOR ALL TO authenticated USING (public.check_user_permission('configuracoes'));

-- Site Config
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Config visível publicamente" ON public.site_config;
DROP POLICY IF EXISTS "Gestão Config para admins" ON public.site_config;
CREATE POLICY "Config visível publicamente" ON public.site_config FOR SELECT USING (true);
CREATE POLICY "Gestão Config para admins" ON public.site_config 
  FOR ALL TO authenticated USING (public.check_user_permission('configuracoes', 'total'));

-- 5. Segurança do Storage
-- Bucket: produtos
DROP POLICY IF EXISTS "Imagens produtos leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Imagens produtos escrita admin" ON storage.objects;
DROP POLICY IF EXISTS "Imagens de produtos sao publicamente visiveis" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode fazer upload em produtos" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode atualizar imagens de produtos" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode excluir imagens de produtos" ON storage.objects;

CREATE POLICY "Imagens produtos leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'produtos');
CREATE POLICY "Imagens produtos escrita admin" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'produtos' AND public.check_user_permission('catalogo'));

-- Bucket: site-imagens
DROP POLICY IF EXISTS "Site imagens leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Site imagens escrita admin" ON storage.objects;
DROP POLICY IF EXISTS "Site imagens public read" ON storage.objects;
DROP POLICY IF EXISTS "Site imagens public insert" ON storage.objects;
DROP POLICY IF EXISTS "Site imagens public update" ON storage.objects;
DROP POLICY IF EXISTS "Site imagens public delete" ON storage.objects;

CREATE POLICY "Site imagens leitura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-imagens');
CREATE POLICY "Site imagens escrita admin" ON storage.objects
  FOR ALL TO authenticated USING (bucket_id = 'site-imagens' AND public.check_user_permission('configuracoes'));

-- 6. Realtime (Remover tabelas sensíveis da publicação)
ALTER PUBLICATION supabase_realtime DROP TABLE public.crm_leads;
ALTER PUBLICATION supabase_realtime DROP TABLE public.financeiro_lancamentos;
ALTER PUBLICATION supabase_realtime DROP TABLE public.vendas;
ALTER PUBLICATION supabase_realtime DROP TABLE public.estoque_movimentacoes;
ALTER PUBLICATION supabase_realtime DROP TABLE public.membros;
