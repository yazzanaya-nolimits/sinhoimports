-- 1. Garantir search_path em todas as funções
ALTER FUNCTION public.update_site_config_updated_at() SET search_path = public;
ALTER FUNCTION public.estoque_calc_fields() SET search_path = public;
ALTER FUNCTION public.confirmar_venda(uuid, integer, numeric, numeric, text, text, integer, text, text, text) SET search_path = public;
ALTER FUNCTION public.produtos_calc_fields() SET search_path = public;
ALTER FUNCTION public.membros_count() SET search_path = public;
ALTER FUNCTION public.get_module_permission(uuid, text) SET search_path = public;
ALTER FUNCTION public.registrar_entrada_estoque(uuid, integer, numeric, text, boolean) SET search_path = public;
ALTER FUNCTION public.has_module_level(uuid, text, text) SET search_path = public;
ALTER FUNCTION public.has_module_permission(uuid, text) SET search_path = public;
ALTER FUNCTION public.cancelar_venda(uuid) SET search_path = public;

-- 2. Restringir execução de funções sensíveis
REVOKE EXECUTE ON FUNCTION public.membros_count() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_module_permission(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_module_level(uuid, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_module_permission(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_user_permission(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.membros_count() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_module_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_module_level(uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_module_permission(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_user_permission(text, text) TO authenticated, service_role;
