-- site_config: remove sign-in-only update and open read; hide secret column
DROP POLICY IF EXISTS "Admins can update site_config" ON public.site_config;
DROP POLICY IF EXISTS "Public can view general config" ON public.site_config;
REVOKE SELECT ON public.site_config FROM anon, authenticated;
GRANT SELECT (id, mercado_pago_public_key, mercado_pago_enabled, whatsapp_numero, updated_at) ON public.site_config TO anon, authenticated;
CREATE POLICY "Public can view general config" ON public.site_config FOR SELECT TO anon, authenticated USING (id = 1);

-- imagens_site
DROP POLICY IF EXISTS "Imagens visíveis publicamente" ON public.imagens_site;
CREATE POLICY "Imagens visíveis publicamente" ON public.imagens_site FOR SELECT TO anon, authenticated USING (tipo IN ('capa','carrossel'));

-- banner
DROP POLICY IF EXISTS "Banner visível publicamente" ON public.banner_desconto;
CREATE POLICY "Banner visível publicamente" ON public.banner_desconto FOR SELECT TO anon, authenticated USING (ativo = true);

-- carrossel
DROP POLICY IF EXISTS "Carrossel visível publicamente" ON public.carrossel_imagens;
CREATE POLICY "Carrossel visível publicamente" ON public.carrossel_imagens FOR SELECT TO anon, authenticated USING (ativo = true);

-- vendas: no open inserts (checkout uses server function)
DROP POLICY IF EXISTS "Público pode inserir vendas" ON public.vendas;

-- storage: public buckets serve files by URL without listing policies
DROP POLICY IF EXISTS "Site imagens leitura pública" ON storage.objects;
DROP POLICY IF EXISTS "Imagens produtos leitura pública" ON storage.objects;