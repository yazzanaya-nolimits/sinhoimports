import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeKey = 'preto_dourado' | 'rosa_branco' | 'azul_marinho' | 'branco_preto' | 'verde_neon';

export const THEME_META: Record<ThemeKey, { label: string; emoji: string; preview: { bg: string; primary: string; accent: string } }> = {
  preto_dourado: { label: 'Preto com Dourado Luxo', emoji: '⭐', preview: { bg: '#0A0A0A', primary: '#D4AF37', accent: '#F0C040' } },
  rosa_branco:   { label: 'Rosa com Branco',         emoji: '🌸', preview: { bg: '#FFFFFF', primary: '#FF69B4', accent: '#FF1493' } },
  azul_marinho:  { label: 'Azul Marinho com Branco', emoji: '🔵', preview: { bg: '#FFFFFF', primary: '#0A1931', accent: '#1A3A6B' } },
  branco_preto:  { label: 'Branco com Preto',        emoji: '🖤', preview: { bg: '#FFFFFF', primary: '#111111', accent: '#333333' } },
  verde_neon:    { label: 'Verde Neon com Preto',    emoji: '💚', preview: { bg: '#0A0A0A', primary: '#39FF14', accent: '#00FF00' } },
};

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey, persist?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'preto_dourado', setTheme: () => {} });

// Valores HSL para os 5 temas
const THEMES: Record<ThemeKey, Record<string, string>> = {
  preto_dourado: {
    '--background': '0 0% 4%', '--foreground': '40 20% 92%',
    '--card': '0 0% 7%', '--card-foreground': '40 20% 92%',
    '--popover': '0 0% 7%', '--popover-foreground': '40 20% 92%',
    '--primary': '43 72% 55%', '--primary-foreground': '0 0% 4%',
    '--secondary': '0 0% 12%', '--secondary-foreground': '40 20% 92%',
    '--muted': '0 0% 12%', '--muted-foreground': '0 0% 55%',
    '--accent': '43 72% 55%', '--accent-foreground': '0 0% 4%',
    '--border': '0 0% 16%', '--input': '0 0% 16%', '--ring': '43 72% 55%',
    '--sidebar': '0 0% 6%', '--sidebar-border': '0 0% 14%', '--sidebar-accent': '0 0% 12%',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  rosa_branco: {
    '--background': '0 0% 100%', '--foreground': '0 0% 7%',
    '--card': '330 100% 97%', '--card-foreground': '0 0% 7%',
    '--popover': '0 0% 100%', '--popover-foreground': '0 0% 7%',
    '--primary': '330 100% 71%', '--primary-foreground': '0 0% 100%',
    '--secondary': '330 60% 95%', '--secondary-foreground': '0 0% 7%',
    '--muted': '330 30% 94%', '--muted-foreground': '0 0% 40%',
    '--accent': '328 100% 54%', '--accent-foreground': '0 0% 100%',
    '--border': '330 40% 88%', '--input': '330 40% 88%', '--ring': '330 100% 71%',
    '--sidebar': '330 100% 71%', '--sidebar-border': '330 60% 60%', '--sidebar-accent': '330 80% 80%',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  azul_marinho: {
    '--background': '0 0% 100%', '--foreground': '215 70% 12%',
    '--card': '218 100% 97%', '--card-foreground': '215 70% 12%',
    '--popover': '0 0% 100%', '--popover-foreground': '215 70% 12%',
    '--primary': '215 70% 12%', '--primary-foreground': '0 0% 100%',
    '--secondary': '215 40% 92%', '--secondary-foreground': '215 70% 12%',
    '--muted': '215 30% 94%', '--muted-foreground': '215 20% 40%',
    '--accent': '215 60% 26%', '--accent-foreground': '0 0% 100%',
    '--border': '215 40% 85%', '--input': '215 40% 85%', '--ring': '215 70% 12%',
    '--sidebar': '215 70% 12%', '--sidebar-border': '215 60% 22%', '--sidebar-accent': '215 50% 22%',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  branco_preto: {
    '--background': '0 0% 100%', '--foreground': '0 0% 7%',
    '--card': '0 0% 96%', '--card-foreground': '0 0% 7%',
    '--popover': '0 0% 100%', '--popover-foreground': '0 0% 7%',
    '--primary': '0 0% 7%', '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 92%', '--secondary-foreground': '0 0% 7%',
    '--muted': '0 0% 94%', '--muted-foreground': '0 0% 40%',
    '--accent': '0 0% 20%', '--accent-foreground': '0 0% 100%',
    '--border': '0 0% 85%', '--input': '0 0% 85%', '--ring': '0 0% 7%',
    '--sidebar': '0 0% 7%', '--sidebar-border': '0 0% 18%', '--sidebar-accent': '0 0% 16%',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  verde_neon: {
    '--background': '0 0% 4%', '--foreground': '111 100% 54%',
    '--card': '120 30% 7%', '--card-foreground': '0 0% 95%',
    '--popover': '120 30% 7%', '--popover-foreground': '0 0% 95%',
    '--primary': '111 100% 54%', '--primary-foreground': '0 0% 4%',
    '--secondary': '120 30% 10%', '--secondary-foreground': '111 100% 54%',
    '--muted': '120 20% 12%', '--muted-foreground': '111 30% 60%',
    '--accent': '120 100% 50%', '--accent-foreground': '0 0% 4%',
    '--border': '111 100% 18%', '--input': '120 20% 14%', '--ring': '111 100% 54%',
    '--sidebar': '0 0% 4%', '--sidebar-border': '111 80% 14%', '--sidebar-accent': '120 30% 10%',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
};

const STORAGE_KEY = 'sinho_theme';

const isValid = (t: string | null): t is ThemeKey =>
  !!t && t in THEMES;

const applyTheme = (t: ThemeKey) => {
  const root = document.documentElement;
  Object.entries(THEMES[t]).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = t;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isValid(saved) ? saved : 'preto_dourado';
  });

  // Aplica imediatamente
  useEffect(() => { applyTheme(theme); }, [theme]);

  // Sincroniza com tema salvo no membro logado
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;
      const { data } = await supabase.from('membros').select('tema').eq('user_id', user.id).maybeSingle();
      const remote = (data as { tema?: string } | null)?.tema;
      if (mounted && isValid(remote)) {
        setThemeState(remote);
        localStorage.setItem(STORAGE_KEY, remote);
      }
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      if (sess) sync();
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const setTheme = async (t: ThemeKey, persist = true) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    if (!persist) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('membros').update({ tema: t }).eq('user_id', user.id);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
