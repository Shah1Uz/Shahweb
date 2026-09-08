import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type ThemeMode = 'dark' | 'oled' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('portfolio_theme') as ThemeMode;
    return saved === 'light' ? 'oled' : (saved || 'oled');
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('portfolio_accent') || '#d6f779';
  });

  // Fetch from server settings if available
  useEffect(() => {
    api.get('/content/settings').then((res) => {
      if (res.data?.site?.theme && res.data.site.theme !== 'light') {
        setThemeState(res.data.site.theme);
      }
      if (res.data?.site?.accentColor) {
        setAccentColorState(res.data.site.accentColor);
      }
    }).catch(() => {});
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('portfolio_theme', newTheme);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('portfolio_accent', color);
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark', 'oled', 'light');
    body.classList.remove('dark', 'oled', 'light');

    if (theme === 'oled') {
      root.classList.add('dark', 'oled');
      body.classList.add('oled');
    } else if (theme === 'light') {
      root.classList.add('light');
      body.classList.add('light');
    } else {
      root.classList.add('dark');
      body.classList.add('dark');
    }

    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-glow', `${accentColor}33`);
  }, [theme, accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
