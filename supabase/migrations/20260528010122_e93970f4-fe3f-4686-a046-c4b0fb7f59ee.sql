-- 1. Garantir permissões de leitura para todos os papéis necessários
-- O SELECT precisa estar disponível para que o PostgREST consiga ler a tabela
GRANT SELECT ON public.produtos TO anon, authenticated, service_role;

-- 2. Corrigir políticas de RLS para serem mais robustas
DROP POLICY IF EXISTS "Produtos visíveis para todos" ON public.produtos;
DROP POLICY IF EXISTS "Gestão de Produtos para admins" ON public.produtos;
DROP POLICY IF EXISTS "Gestão de Produtos para admins qual" ON public.produtos;

-- Política para o catálogo (público e logado vê produtos ativos)
CREATE POLICY "Produtos ativos são visíveis para todos" 
ON public.produtos 
FOR SELECT 
USING (status = 'ativo');

-- Política para administradores (vêem tudo e gerenciam tudo)
-- Usamos a função check_user_permission que já corrigimos anteriormente
CREATE POLICY "Admins gerenciam todos os produtos" 
ON public.produtos 
FOR ALL 
TO authenticated 
USING (check_user_permission('catalogo') OR check_user_permission('estoque'))
WITH CHECK (check_user_permission('catalogo') OR check_user_permission('estoque'));

-- 3. Garantir que as colunas básicas estão acessíveis para o público (anon)
-- Revogamos restrições de coluna que podem quebrar o "SELECT *"
GRANT SELECT ON public.produtos TO anon;
GRANT SELECT ON public.produtos TO authenticated;
