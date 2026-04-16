import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeKey = 'black-gold' | 'navy-white' | 'neon-green';

interface ThemeContextType {
  theme: ThemeKey;
  setTheme: (t: ThemeKey) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'black-gold', setTheme: () => {} });

const THEMES: Record<ThemeKey, Record<string, string>> = {
  'black-gold': {
    '--background': '0 0% 4%',
    '--foreground': '40 20% 92%',
    '--card': '0 0% 7%',
    '--card-foreground': '40 20% 92%',
    '--popover': '0 0% 7%',
    '--popover-foreground': '40 20% 92%',
    '--primary': '43 72% 55%',
    '--primary-foreground': '0 0% 4%',
    '--secondary': '0 0% 12%',
    '--secondary-foreground': '40 20% 92%',
    '--muted': '0 0% 12%',
    '--muted-foreground': '0 0% 55%',
    '--accent': '43 72% 55%',
    '--accent-foreground': '0 0% 4%',
    '--border': '0 0% 16%',
    '--input': '0 0% 16%',
    '--ring': '43 72% 55%',
  },
  'navy-white': {
    '--background': '210 100% 8%',
    '--foreground': '0 0% 98%',
    '--card': '210 80% 12%',
    '--card-foreground': '0 0% 98%',
    '--popover': '210 80% 12%',
    '--popover-foreground': '0 0% 98%',
    '--primary': '210 100% 60%',
    '--primary-foreground': '0 0% 100%',
    '--secondary': '210 60% 18%',
    '--secondary-foreground': '0 0% 98%',
    '--muted': '210 40% 20%',
    '--muted-foreground': '210 20% 60%',
    '--accent': '210 100% 60%',
    '--accent-foreground': '0 0% 100%',
    '--border': '210 40% 22%',
    '--input': '210 40% 22%',
    '--ring': '210 100% 60%',
  },
  'neon-green': {
    '--background': '0 0% 3%',
    '--foreground': '120 100% 55%',
    '--card': '0 0% 6%',
    '--card-foreground': '0 0% 92%',
    '--popover': '0 0% 6%',
    '--popover-foreground': '0 0% 92%',
    '--primary': '120 100% 55%',
    '--primary-foreground': '0 0% 3%',
    '--secondary': '0 0% 10%',
    '--secondary-foreground': '120 100% 55%',
    '--muted': '0 0% 12%',
    '--muted-foreground': '0 0% 50%',
    '--accent': '120 100% 55%',
    '--accent-foreground': '0 0% 3%',
    '--border': '120 100% 15%',
    '--input': '0 0% 14%',
    '--ring': '120 100% 55%',
  },
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    return (localStorage.getItem('sinho_theme') as ThemeKey) || 'black-gold';
  });

  const setTheme = (t: ThemeKey) => {
    setThemeState(t);
    localStorage.setItem('sinho_theme', t);
  };

  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
