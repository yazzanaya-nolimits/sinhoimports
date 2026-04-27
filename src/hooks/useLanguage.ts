import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import type { LangCode } from '@/i18n';

const SUPPORTED: LangCode[] = ['pt-BR', 'en', 'es'];
const isValid = (l: string | null | undefined): l is LangCode =>
  !!l && (SUPPORTED as string[]).includes(l);

export function useLanguage() {
  const { i18n } = useTranslation();

  // Sincroniza com idioma salvo no membro logado
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      const { data } = await supabase.from('membros').select('idioma').eq('user_id', user.id).maybeSingle();
      const remote = (data as { idioma?: string } | null)?.idioma;
      if (mounted && isValid(remote) && remote !== i18n.language) {
        i18n.changeLanguage(remote);
        localStorage.setItem('sinho_lang', remote);
      }
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess) sync();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [i18n]);

  const setLanguage = async (lang: LangCode, persist = true) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('sinho_lang', lang);
    if (!persist) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('membros').update({ idioma: lang }).eq('user_id', user.id);
  };

  return {
    language: (isValid(i18n.language) ? i18n.language : 'pt-BR') as LangCode,
    setLanguage,
  };
}
