import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ThemeKey = 'preto_dourado' | 'rosa_branco' | 'azul_marinho' | 'branco_preto' | 'verde_neon';

export type ThemeMeta = {
  label: string;
  emoji: string;
  tagline: string;
  preview: {
    bg: string;
    sidebar: string;
    primary: string;
    accent: string;
    card: string;
    text: string;
  };
};

export const THEME_META: Record<ThemeKey, ThemeMeta> = {
  preto_dourado: {
    label: 'Black Gold Emperor',
    emoji: '⭐',
    tagline: 'Ultra luxo · poder · exclusividade',
    preview: {
      bg: '#0A0A0A', sidebar: 'linear-gradient(160deg,#000 0%,#1A1A1A 60%,#0D0D0D 100%)',
      primary: '#D4AF37', accent: '#FFD700', card: '#1A1A1A', text: '#F5E6C0',
    },
  },
  rosa_branco: {
    label: 'Rose Gold Premium',
    emoji: '🌸',
    tagline: 'Luxo feminino · sofisticação',
    preview: {
      bg: '#FFF5F8', sidebar: 'linear-gradient(160deg,#C2185B 0%,#E91E8C 50%,#F06292 100%)',
      primary: '#C2185B', accent: '#F48FB1', card: '#FFFFFF', text: '#3D0020',
    },
  },
  azul_marinho: {
    label: 'Navy Blue Luxury',
    emoji: '🌊',
    tagline: 'Executivo premium · confiança',
    preview: {
      bg: '#F0F4FF', sidebar: 'linear-gradient(160deg,#0A1931 0%,#1565C0 70%,#1976D2 100%)',
      primary: '#1565C0', accent: '#42A5F5', card: '#FFFFFF', text: '#0A1931',
    },
  },
  branco_preto: {
    label: 'Monochrome Elite',
    emoji: '🤍',
    tagline: 'Minimalismo · alta costura',
    preview: {
      bg: '#FAFAFA', sidebar: 'linear-gradient(160deg,#111 0%,#2C2C2C 100%)',
      primary: '#111111', accent: '#333333', card: '#FFFFFF', text: '#111111',
    },
  },
  verde_neon: {
    label: 'Cyber Neon Matrix',
    emoji: '💚',
    tagline: 'Tecnologia futurista · energia digital',
    preview: {
      bg: '#050505', sidebar: 'linear-gradient(160deg,#000 0%,#001A00 60%,#002200 100%)',
      primary: '#39FF14', accent: '#00FF41', card: '#0A0F0A', text: '#E0FFE0',
    },
  },
};

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey, persist?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'preto_dourado', setTheme: () => {} });

/**
 * Paletas em HSL (sem hsl(), apenas valores) + variáveis "ricas" em CSS literal
 * que são consumidas em index.css (gradientes de sidebar, sombras, etc).
 */
const THEMES: Record<ThemeKey, Record<string, string>> = {
  // ⭐ BLACK GOLD EMPEROR — preto profundo + dourado metálico
  preto_dourado: {
    '--background': '0 0% 4%', '--foreground': '43 50% 86%',
    '--card': '0 0% 10%', '--card-foreground': '43 50% 86%',
    '--popover': '0 0% 10%', '--popover-foreground': '43 50% 86%',
    '--primary': '46 65% 52%', '--primary-foreground': '0 0% 4%',
    '--secondary': '0 0% 14%', '--secondary-foreground': '43 50% 86%',
    '--muted': '0 0% 12%', '--muted-foreground': '43 30% 65%',
    '--accent': '50 100% 50%', '--accent-foreground': '0 0% 4%',
    '--border': '46 65% 30%', '--input': '0 0% 16%', '--ring': '46 65% 52%',
    '--sidebar': '0 0% 0%', '--sidebar-foreground': '46 65% 52%',
    '--sidebar-border': '46 65% 25%', '--sidebar-accent': '46 30% 12%',
    '--sidebar-accent-foreground': '50 100% 60%',
    '--sidebar-gradient': 'linear-gradient(160deg, #000000 0%, #1A1A1A 60%, #0D0D0D 100%)',
    '--button-gradient': 'linear-gradient(135deg, #B8960C, #D4AF37, #FFD700)',
    '--card-gradient': 'linear-gradient(135deg, #1A1600, #2A2200)',
    '--theme-shadow': '0 8px 32px -8px rgba(212,175,55,0.35)',
    '--theme-glow': '0 0 24px rgba(212,175,55,0.45)',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  // 🌸 ROSE GOLD PREMIUM
  rosa_branco: {
    '--background': '335 100% 98%', '--foreground': '335 100% 12%',
    '--card': '0 0% 100%', '--card-foreground': '335 100% 12%',
    '--popover': '0 0% 100%', '--popover-foreground': '335 100% 12%',
    '--primary': '337 75% 43%', '--primary-foreground': '0 0% 100%',
    '--secondary': '335 100% 94%', '--secondary-foreground': '335 100% 18%',
    '--muted': '335 60% 95%', '--muted-foreground': '335 40% 40%',
    '--accent': '339 82% 76%', '--accent-foreground': '335 100% 12%',
    '--border': '335 60% 87%', '--input': '335 50% 90%', '--ring': '337 75% 43%',
    '--sidebar': '337 75% 43%', '--sidebar-foreground': '0 0% 100%',
    '--sidebar-border': '337 60% 35%', '--sidebar-accent': '337 75% 55%',
    '--sidebar-accent-foreground': '0 0% 100%',
    '--sidebar-gradient': 'linear-gradient(160deg, #C2185B 0%, #E91E8C 50%, #F06292 100%)',
    '--button-gradient': 'linear-gradient(135deg, #C2185B, #E91E8C)',
    '--card-gradient': 'linear-gradient(135deg, #FCE4EC, #F8BBD0)',
    '--theme-shadow': '0 8px 32px -8px rgba(194,24,91,0.25)',
    '--theme-glow': '0 0 20px rgba(244,143,177,0.55)',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  // 🌊 NAVY BLUE LUXURY
  azul_marinho: {
    '--background': '224 100% 97%', '--foreground': '218 76% 12%',
    '--card': '0 0% 100%', '--card-foreground': '218 76% 12%',
    '--popover': '0 0% 100%', '--popover-foreground': '218 76% 12%',
    '--primary': '212 84% 42%', '--primary-foreground': '0 0% 100%',
    '--secondary': '215 80% 92%', '--secondary-foreground': '218 76% 12%',
    '--muted': '215 60% 94%', '--muted-foreground': '218 40% 35%',
    '--accent': '210 88% 61%', '--accent-foreground': '0 0% 100%',
    '--border': '215 60% 86%', '--input': '215 50% 90%', '--ring': '212 84% 42%',
    '--sidebar': '218 76% 12%', '--sidebar-foreground': '210 100% 92%',
    '--sidebar-border': '215 60% 22%', '--sidebar-accent': '212 84% 30%',
    '--sidebar-accent-foreground': '0 0% 100%',
    '--sidebar-gradient': 'linear-gradient(160deg, #0A1931 0%, #1565C0 70%, #1976D2 100%)',
    '--button-gradient': 'linear-gradient(135deg, #0A1931, #1565C0)',
    '--card-gradient': 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
    '--theme-shadow': '0 8px 32px -8px rgba(10,25,49,0.25)',
    '--theme-glow': '0 0 20px rgba(66,165,245,0.55)',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  // 🤍 MONOCHROME ELITE
  branco_preto: {
    '--background': '0 0% 98%', '--foreground': '0 0% 7%',
    '--card': '0 0% 100%', '--card-foreground': '0 0% 7%',
    '--popover': '0 0% 100%', '--popover-foreground': '0 0% 7%',
    '--primary': '0 0% 7%', '--primary-foreground': '0 0% 100%',
    '--secondary': '0 0% 94%', '--secondary-foreground': '0 0% 7%',
    '--muted': '0 0% 96%', '--muted-foreground': '0 0% 33%',
    '--accent': '0 0% 20%', '--accent-foreground': '0 0% 100%',
    '--border': '0 0% 88%', '--input': '0 0% 88%', '--ring': '0 0% 7%',
    '--sidebar': '0 0% 7%', '--sidebar-foreground': '0 0% 100%',
    '--sidebar-border': '0 0% 18%', '--sidebar-accent': '0 0% 17%',
    '--sidebar-accent-foreground': '0 0% 100%',
    '--sidebar-gradient': 'linear-gradient(160deg, #111111 0%, #2C2C2C 100%)',
    '--button-gradient': 'linear-gradient(135deg, #111111, #333333)',
    '--card-gradient': 'linear-gradient(135deg, #FFFFFF, #F5F5F5)',
    '--theme-shadow': '0 12px 36px -12px rgba(0,0,0,0.18)',
    '--theme-glow': '0 0 18px rgba(0,0,0,0.10)',
    '--destructive': '0 70% 50%', '--destructive-foreground': '0 0% 98%',
  },
  // 💚 CYBER NEON MATRIX
  verde_neon: {
    '--background': '0 0% 2%', '--foreground': '111 100% 88%',
    '--card': '120 40% 5%', '--card-foreground': '111 100% 88%',
    '--popover': '120 40% 5%', '--popover-foreground': '111 100% 88%',
    '--primary': '111 100% 54%', '--primary-foreground': '0 0% 4%',
    '--secondary': '120 40% 8%', '--secondary-foreground': '111 100% 54%',
    '--muted': '120 30% 10%', '--muted-foreground': '111 50% 62%',
    '--accent': '136 100% 50%', '--accent-foreground': '0 0% 4%',
    '--border': '111 100% 22%', '--input': '120 30% 12%', '--ring': '111 100% 54%',
    '--sidebar': '0 0% 0%', '--sidebar-foreground': '111 100% 54%',
    '--sidebar-border': '111 100% 18%', '--sidebar-accent': '120 40% 10%',
    '--sidebar-accent-foreground': '111 100% 70%',
    '--sidebar-gradient': 'linear-gradient(160deg, #000000 0%, #001A00 60%, #002200 100%)',
    '--button-gradient': 'linear-gradient(135deg, #006600, #39FF14)',
    '--card-gradient': 'linear-gradient(135deg, #001A00, #002800)',
    '--theme-shadow': '0 8px 32px -8px rgba(57,255,20,0.30)',
    '--theme-glow': '0 0 20px rgba(57,255,20,0.55)',
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

// Aplica antes do primeiro render para evitar flash
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  applyTheme(isValid(saved) ? saved : 'preto_dourado');
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isValid(saved) ? saved : 'preto_dourado';
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

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
