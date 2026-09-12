import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { SeoSettings } from '../types';

interface SettingsContextType {
  seo: SeoSettings | null;
  brandName: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const CACHE_KEY = 'portfolio_settings_cache';
const DEFAULT_BRAND = 'SHAHZOD.DEV';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seo, setSeo] = useState<SeoSettings | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(!seo);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/content/settings');
      if (res.data?.seo) {
        setSeo(res.data.seo);
        localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.seo));
      }
    } catch (err) {
      console.warn('Failed to load SEO & settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleReload = () => {
      fetchSettings();
    };

    window.addEventListener('portfolio:reload_settings', handleReload);
    return () => {
      window.removeEventListener('portfolio:reload_settings', handleReload);
    };
  }, []);

  const brandName = (seo?.brandName && seo.brandName.trim()) ? seo.brandName.trim() : DEFAULT_BRAND;

  return (
    <SettingsContext.Provider value={{ seo, brandName, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
