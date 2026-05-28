CREATE OR REPLACE FUNCTION public.check_user_permission(_module text, _level text DEFAULT 'ver'::text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_level text;
BEGIN
  -- Busca o nível de permissão do usuário para o módulo
  SELECT permissoes->>_module INTO _user_level
  FROM public.membros
  WHERE user_id = auth.uid() 
    AND status = 'ativo';

  -- Se não encontrar o usuário ou o módulo, retorna falso
  IF _user_level IS NULL THEN
    -- Admin master (configurações=total) tem acesso a tudo
    RETURN EXISTS (
      SELECT 1 FROM public.membros 
      WHERE user_id = auth.uid() 
        AND status = 'ativo' 
        AND (permissoes->>'configuracoes') = 'total'
    );
  END IF;

  -- Lógica hierárquica: total > editar > ver
  IF _level = 'ver' THEN
    RETURN _user_level IN ('ver', 'editar', 'total');
  ELSIF _level = 'editar' THEN
    RETURN _user_level IN ('editar', 'total');
  ELSIF _level = 'total' THEN
    RETURN _user_level = 'total';
  END IF;

  RETURN FALSE;
END;
$function$;