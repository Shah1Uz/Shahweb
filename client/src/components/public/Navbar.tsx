import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Search,
  Moon,
  Monitor,
  Terminal,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';
import { NavigationItem } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const logoClicksRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  // Secret 3-click on logo within 800ms
  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - logoClicksRef.current.lastTime < 800) {
      logoClicksRef.current.count += 1;
    } else {
      logoClicksRef.current.count = 1;
    }
    logoClicksRef.current.lastTime = now;

    if (logoClicksRef.current.count >= 3) {
      e.preventDefault();
      logoClicksRef.current.count = 0;
      navigate(user ? '/admin/dashboard' : '/admin/login');
    }
  };

  // Secret Hotkey: Ctrl+Shift+A or Alt+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') ||
        (e.altKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        navigate(user ? '/admin/dashboard' : '/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    api
      .get('/content/navigation')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setNavItems(res.data.filter((item: NavigationItem) => item.isVisible));
        } else {
          // Fallback defaults
          setNavItems([
            { id: '1', label: 'Home', url: '/', isExternal: false, isVisible: true, sortOrder: 0 },
            { id: '2', label: 'About', url: '/about', isExternal: false, isVisible: true, sortOrder: 1 },
            { id: '3', label: 'Projects', url: '/projects', isExternal: false, isVisible: true, sortOrder: 2 },
            { id: '4', label: 'News', url: '/news', isExternal: false, isVisible: true, sortOrder: 3 },
            { id: '5', label: 'Blog', url: '/blog', isExternal: false, isVisible: true, sortOrder: 4 },
            { id: '6', label: 'Services', url: '/services', isExternal: false, isVisible: true, sortOrder: 5 },
            { id: '7', label: 'Contact', url: '/contact', isExternal: false, isVisible: true, sortOrder: 6 },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#101111]/85 backdrop-blur-xl border-b border-[#343636] py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0 select-none cursor-pointer"
          title="SHAHZOD.DEV"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#d6f779] flex items-center justify-center shadow-lg shadow-[#d6f779]/25 group-hover:scale-105 transition-transform shrink-0">
            <Terminal className="w-5 h-5 text-[#101111] font-extrabold" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono font-bold text-base sm:text-lg tracking-wider text-white flex items-center gap-1">
              SHAHZOD<span className="text-[#d6f779]">.DEV</span>
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-[#9d9f9e] truncate">
              Staff Engineer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#191a1a]/90 border border-[#343636] rounded-full px-4 py-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.id}
                to={item.url}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-[#d6f779] font-semibold'
                    : 'text-[#9d9f9e] hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/30"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-mono transition-all"
            title="Search (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300">⌘K</kbd>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center bg-[#191a1a] border border-[#343636] rounded-full p-1">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${
                theme === 'dark' ? 'bg-[#d6f779]/20 text-[#d6f779]' : 'text-[#9d9f9e] hover:text-white'
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('oled')}
              className={`p-1.5 rounded-full transition-all ${
                theme === 'oled' ? 'bg-[#d6f779]/20 text-[#d6f779]' : 'text-[#9d9f9e] hover:text-white'
              }`}
              title="OLED Mode"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Admin Panel Link: Faqat admin tizimga kirganida ko'rinadi */}
          {user && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/35 text-[#d6f779] hover:bg-[#d6f779]/25 text-xs font-semibold transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#d6f779]" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#d6f779]" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#101111]/98 border-b border-[#343636] backdrop-blur-2xl px-4 py-6 max-h-[calc(100dvh-64px)] overflow-y-auto"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                    location.pathname === item.url
                      ? 'bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30 font-bold'
                      : 'text-[#9d9f9e] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 mt-2 border-t border-[#343636] flex items-center justify-between">
                <span className="text-xs text-[#9d9f9e] font-mono">Theme Mode</span>
                <div className="flex items-center gap-1 bg-[#191a1a] rounded-lg p-1 border border-[#343636]">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded ${theme === 'dark' ? 'bg-[#d6f779]/15 text-[#d6f779]' : 'text-[#9d9f9e]'}`}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTheme('oled')}
                    className={`p-1.5 rounded ${theme === 'oled' ? 'bg-[#d6f779]/15 text-[#d6f779]' : 'text-[#9d9f9e]'}`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {user && (
                <div className="pt-2">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#d6f779]/15 border border-[#d6f779]/35 text-[#d6f779] text-sm font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
