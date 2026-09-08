import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MiniAudioPlayer } from '../audio/MiniAudioPlayer';
import { GlobalSearchModal } from './GlobalSearchModal';

export const PublicLayout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Instant scroll to top on route change to prevent visual jump/flicker
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#101111] text-[#EEEEEE] relative selection:bg-[#d6f779]/30 selection:text-[#d6f779]">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MiniAudioPlayer />
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

