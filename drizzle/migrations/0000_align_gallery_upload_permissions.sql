DROP POLICY IF EXISTS "Gestão Imagens para admins" ON public.imagens_site;
CREATE POLICY "Gestão Imagens para admins"
ON public.imagens_site
FOR ALL
TO authenticated
USING (public.check_user_permission('catalogo', 'editar'))
WITH CHECK (public.check_user_permission('catalogo', 'editar'));

DROP POLICY IF EXISTS "Gestão Carrossel para admins" ON public.carrossel_imagens;
CREATE POLICY "Gestão Carrossel para admins"
ON public.carrossel_imagens
FOR ALL
TO authenticated
USING (public.check_user_permission('catalogo', 'editar'))
WITH CHECK (public.check_user_permission('catalogo', 'editar'));

DROP POLICY IF EXISTS "Site imagens escrita admin" ON storage.objects;
CREATE POLICY "Site imagens escrita admin"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'site-imagens' AND public.check_user_permission('catalogo', 'editar'))
WITH CHECK (bucket_id = 'site-imagens' AND public.check_user_permission('catalogo', 'editar'));