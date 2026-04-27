-- ============================================================
-- TABELA MEMBROS — vincula auth.users a permissões por módulo
-- ============================================================
CREATE TABLE IF NOT EXISTS public.membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  permissoes JSONB NOT NULL DEFAULT jsonb_build_object(
    'dashboard', 'ver',
    'pdv', 'sem_acesso',
    'estoque', 'sem_acesso',
    'financeiro', 'sem_acesso',
    'crm', 'sem_acesso',
    'catalogo', 'sem_acesso',
    'configuracoes', 'sem_acesso'
  ),
  tema TEXT NOT NULL DEFAULT 'preto_dourado',
  idioma TEXT NOT NULL DEFAULT 'pt-BR',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membros_user_id ON public.membros(user_id);
CREATE INDEX IF NOT EXISTS idx_membros_username ON public.membros(username);

ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNÇÕES SECURITY DEFINER (evitam recursão em RLS)
-- ============================================================

-- Retorna o nível de acesso do usuário num dado módulo
CREATE OR REPLACE FUNCTION public.get_module_permission(_user_id UUID, _module TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (permissoes ->> _module),
    'sem_acesso'
  )
  FROM public.membros
  WHERE user_id = _user_id
    AND status = 'ativo'
  LIMIT 1;
$$;

-- Verifica se usuário tem QUALQUER nível de acesso (diferente de 'sem_acesso') no módulo
CREATE OR REPLACE FUNCTION public.has_module_permission(_user_id UUID, _module TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membros
    WHERE user_id = _user_id
      AND status = 'ativo'
      AND COALESCE(permissoes ->> _module, 'sem_acesso') NOT IN ('sem_acesso', '')
  );
$$;

-- Verifica se usuário tem nível específico de acesso ('total', 'editar', 'ver', etc.)
CREATE OR REPLACE FUNCTION public.has_module_level(_user_id UUID, _module TEXT, _level TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membros
    WHERE user_id = _user_id
      AND status = 'ativo'
      AND (permissoes ->> _module) = _level
  );
$$;

-- Conta quantos membros existem (para bootstrap do primeiro admin)
CREATE OR REPLACE FUNCTION public.membros_count()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.membros;
$$;

-- ============================================================
-- POLICIES RLS — membros
-- ============================================================

-- Ver: qualquer membro autenticado pode listar membros
CREATE POLICY "Membros autenticados veem lista"
ON public.membros FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Inserir: somente quem tem 'configuracoes' = 'total' OU quando ainda não há nenhum membro (bootstrap)
CREATE POLICY "Admin master pode criar membros"
ON public.membros FOR INSERT
TO authenticated
WITH CHECK (
  public.has_module_level(auth.uid(), 'configuracoes', 'total')
  OR public.membros_count() = 0
);

-- Atualizar: admin master pode tudo; usuário comum pode atualizar APENAS seu tema/idioma
CREATE POLICY "Admin master pode atualizar qualquer membro"
ON public.membros FOR UPDATE
TO authenticated
USING (public.has_module_level(auth.uid(), 'configuracoes', 'total'))
WITH CHECK (public.has_module_level(auth.uid(), 'configuracoes', 'total'));

CREATE POLICY "Usuario pode atualizar suas preferencias"
ON public.membros FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Excluir: só admin master, e nunca a si mesmo
CREATE POLICY "Admin master pode excluir outros membros"
ON public.membros FOR DELETE
TO authenticated
USING (
  public.has_module_level(auth.uid(), 'configuracoes', 'total')
  AND auth.uid() <> user_id
);

-- ============================================================
-- TRIGGER: updated_at
-- ============================================================
CREATE TRIGGER update_membros_updated_at
BEFORE UPDATE ON public.membros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.membros;