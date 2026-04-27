import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;

    const auth = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
    const admin = createClient(supabaseUrl, serviceKey);

    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: 'user_id obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Não autenticado' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    if (user.id === user_id) return new Response(JSON.stringify({ error: 'Não é possível excluir a si mesmo' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: hasPerm } = await admin.rpc('has_module_level', {
      _user_id: user.id, _module: 'configuracoes', _level: 'total',
    });
    if (!hasPerm) return new Response(JSON.stringify({ error: 'Sem permissão' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    await admin.from('membros').delete().eq('user_id', user_id);
    await admin.auth.admin.deleteUser(user_id);

    return new Response(JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
