import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Body = {
  nome: string;
  username: string;
  senha: string;
  permissoes: Record<string, string>;
};

const MODULES = ['dashboard', 'pdv', 'estoque', 'financeiro', 'crm', 'catalogo', 'configuracoes'] as const;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization') ?? '';
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const body = (await req.json()) as Body;
    if (!body?.nome || !body?.username || !body?.senha) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const username = String(body.username).toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    if (username.length < 3) {
      return new Response(JSON.stringify({ error: 'Usuário deve ter ao menos 3 caracteres (a-z, 0-9, _ . -)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.senha.length < 6) {
      return new Response(JSON.stringify({ error: 'Senha deve ter ao menos 6 caracteres' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // E-mail sintético interno (Supabase Auth exige email; usuário nunca vê isso)
    const syntheticEmail = `${username}@sinho.local`;

    // Verifica autorização: precisa estar logado e ter configuracoes=total OU ser o primeiro membro
    const { data: countData } = await admin.from('membros').select('id', { count: 'exact', head: true });
    const isFirst = (countData as unknown as { length: number })?.length === 0 || countData == null;

    const { data: { user } } = await userClient.auth.getUser();

    if (!isFirst) {
      if (!user) {
        return new Response(JSON.stringify({ error: 'Não autenticado' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data: hasPerm } = await admin.rpc('has_module_level', {
        _user_id: user.id, _module: 'configuracoes', _level: 'total',
      });
      if (!hasPerm) {
        return new Response(JSON.stringify({ error: 'Sem permissão para criar membros' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Normaliza permissoes
    const permissoes: Record<string, string> = {};
    for (const m of MODULES) {
      permissoes[m] = body.permissoes?.[m] ?? 'sem_acesso';
    }
    // Se for o primeiro membro, força admin total
    if (isFirst) {
      for (const m of MODULES) permissoes[m] = m === 'pdv' ? 'total' : 'total';
      permissoes.estoque = 'editar';
      permissoes.catalogo = 'editar';
      permissoes.dashboard = 'ver';
    }

    // 1) Cria usuário no Auth (já confirmado) usando email sintético
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: body.senha,
      email_confirm: true,
      user_metadata: { nome: body.nome, username },
    });
    if (createErr || !created.user) {
      return new Response(JSON.stringify({ error: createErr?.message ?? 'Falha ao criar usuário' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Insere registro em membros
    const { error: insErr } = await admin.from('membros').insert({
      user_id: created.user.id,
      nome: body.nome,
      username,
      email: syntheticEmail,
      permissoes,
      status: 'ativo',
    });
    if (insErr) {
      // rollback do auth
      await admin.auth.admin.deleteUser(created.user.id);
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, user_id: created.user.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
