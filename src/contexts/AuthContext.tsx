import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type Modulo =
  | 'dashboard' | 'pdv' | 'estoque' | 'financeiro'
  | 'crm' | 'catalogo' | 'configuracoes';

export type Membro = {
  id: string;
  user_id: string;
  nome: string;
  username: string;
  email: string;
  permissoes: Record<Modulo, string>;
  tema: string;
  idioma: string;
  status: 'ativo' | 'inativo';
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  membro: Membro | null;
  loading: boolean;
  isPinFallback: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (modulo: Modulo, levels?: string[]) => boolean;
  reloadMembro: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const PIN_FLAG = 'sinho_admin'; // fallback legado

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membro, setMembro] = useState<Membro | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPinFallback, setIsPinFallback] = useState(false);

  const loadMembro = async (uid: string) => {
    const { data } = await supabase
      .from('membros')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    setMembro((data as unknown as Membro) ?? null);
  };

  useEffect(() => {
    // 1) listener PRIMEIRO
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer fetch para evitar deadlock
        setTimeout(() => loadMembro(sess.user.id), 0);
      } else {
        setMembro(null);
      }
    });

    // 2) sessão atual
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) loadMembro(sess.user.id);
      // PIN fallback
      setIsPinFallback(localStorage.getItem(PIN_FLAG) === 'true' && !sess);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Usuário ou senha incorretos' };
    return { error: null };
  };

  const signOut = async () => {
    localStorage.removeItem(PIN_FLAG);
    setIsPinFallback(false);
    await supabase.auth.signOut();
  };

  const hasPermission: AuthCtx['hasPermission'] = (modulo, levels) => {
    // PIN fallback = admin total
    if (isPinFallback) return true;
    if (!membro || membro.status !== 'ativo') return false;
    const lvl = membro.permissoes?.[modulo] ?? 'sem_acesso';
    if (lvl === 'sem_acesso') return false;
    if (!levels || levels.length === 0) return true;
    return levels.includes(lvl);
  };

  const reloadMembro = async () => {
    if (user) await loadMembro(user.id);
  };

  const value = useMemo(
    () => ({ user, session, membro, loading, isPinFallback, signIn, signOut, hasPermission, reloadMembro }),
    [user, session, membro, loading, isPinFallback]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be used within AuthProvider');
  return c;
};
