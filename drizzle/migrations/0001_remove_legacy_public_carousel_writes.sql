DROP POLICY IF EXISTS "Qualquer um pode inserir carrossel" ON public.carrossel_imagens;
DROP POLICY IF EXISTS "Qualquer um pode atualizar carrossel" ON public.carrossel_imagens;
DROP POLICY IF EXISTS "Qualquer um pode excluir carrossel" ON public.carrossel_imagens;
DROP POLICY IF EXISTS "Carrossel visivel publicamente" ON public.carrossel_imagens;

REVOKE INSERT, UPDATE, DELETE ON public.carrossel_imagens FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.imagens_site FROM anon;
GRANT SELECT ON public.carrossel_imagens TO anon;
GRANT SELECT ON public.imagens_site TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrossel_imagens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.imagens_site TO authenticated;
GRANT ALL ON public.carrossel_imagens TO service_role;
GRANT ALL ON public.imagens_site TO service_role;