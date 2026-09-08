import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Profile } from '../types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const CACHE_KEY = 'portfolio_profile_cache';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize from cache if available so there is ZERO delay / flash on page transitions
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(!profile);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/content/profile');
      if (res.data) {
        setProfile(res.data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, loading, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
