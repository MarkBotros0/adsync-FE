'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Always start with 'light' to match SSR — avoids hydration mismatch.
  // The inline script in layout.tsx sets .dark on <html> synchronously before paint,
  // so there is no visual flash even though React state starts as 'light'.
  const [theme, setThemeState] = useState<Theme>('light');

  // Tracks whether localStorage has been read. The apply effect must not touch
  // the DOM before this, otherwise it removes .dark (set by the inline script)
  // while theme is still the 'light' SSR default, causing a flash.
  const mounted = useRef(false);

  // IMPORTANT: apply effect must be defined BEFORE the mount effect.
  // React fires effects in definition order, so this runs first on the initial
  // render — sees mounted=false and bails out, preserving the inline script's class.
  // After mount effect sets mounted=true and updates theme, this fires correctly.
  useEffect(() => {
    if (!mounted.current) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // On mount: read real preference, then mark as mounted so the apply effect
  // is allowed to run on subsequent renders.
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }
    mounted.current = true;
  }, []);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
