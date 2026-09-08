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
  ChevronRight,
  Calendar,
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
          ? 'bg-[#101111]/95 backdrop-blur-xl border-b border-[#343636] py-2 sm:py-2.5 shadow-2xl'
          : 'bg-[#101111]/80 md:bg-[#101111]/40 backdrop-blur-md py-2.5 sm:py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo */}
        <Link
          to="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 group shrink-0 select-none cursor-pointer"
          title="SHAHZOD.DEV"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#d6f779] flex items-center justify-center shadow-lg shadow-[#d6f779]/25 group-hover:scale-105 transition-transform shrink-0">
            <Terminal className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#101111] font-extrabold" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono font-bold text-sm sm:text-base lg:text-lg tracking-wider text-white flex items-center gap-0.5">
              SHAHZOD<span className="text-[#d6f779]">.DEV</span>
            </span>
            <span className="hidden xs:block text-[8px] sm:text-[9px] uppercase font-mono tracking-widest text-[#9d9f9e] truncate">
              Staff Engineer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (visible on md, lg, xl screens) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-[#191a1a]/90 border border-[#343636] rounded-full px-1.5 lg:px-3 py-1 backdrop-blur-md shrink-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.id}
                to={item.url}
                className={`relative px-2 lg:px-3.5 xl:px-4 py-1 text-xs lg:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
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

        {/* Desktop Right Action Icons */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-mono transition-all shrink-0 cursor-pointer"
            title="Search (Ctrl + K / ⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#d6f779]" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-gray-300 font-mono">⌘K</kbd>
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center bg-[#191a1a] border border-[#343636] rounded-full p-0.5 shrink-0">
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

          {/* Quick Book Call Button */}
          <Link
            to="/book"
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full bg-[#d6f779]/15 hover:bg-[#d6f779]/25 border border-[#d6f779]/35 text-[#d6f779] text-xs font-semibold font-mono transition-all shrink-0 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Schedule a 30-Min Call"
          >
            <Calendar className="w-3.5 h-3.5 text-[#d6f779]" />
            <span className="hidden xl:inline">Book a Call</span>
          </Link>

          {/* Admin Panel Link */}
          {user && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/35 text-[#d6f779] hover:bg-[#d6f779]/25 text-xs font-semibold transition-all shrink-0"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile Action Bar (< md) */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {/* Quick Search Button on mobile */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#343636] text-gray-200 hover:text-white active:scale-95 transition-all text-xs font-mono"
            aria-label="Search"
            title="Search"
          >
            <Search className="w-4 h-4 text-[#d6f779]" />
            <span className="text-xs text-gray-300">Search</span>
            <kbd className="hidden xs:inline bg-white/10 px-1 py-0.2 text-[9px] rounded text-gray-400">⌘K</kbd>
          </button>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl bg-white/5 border border-[#343636] text-gray-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#d6f779]" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 top-[52px] sm:top-[60px] bg-black/60 backdrop-blur-sm z-30"
            />

            {/* Slide-down drawer */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden relative z-40 bg-[#141515] border-b border-[#343636] backdrop-blur-2xl px-4 py-5 max-h-[calc(100dvh-60px)] overflow-y-auto space-y-4 shadow-2xl"
            >
              {/* Quick Search Button in Drawer */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/5 border border-[#343636] hover:border-[#d6f779]/40 text-gray-400 hover:text-white transition-all text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-[#d6f779] shrink-0" />
                  <span className="text-xs sm:text-sm font-mono text-gray-300">
                    Search projects, news, blog...
                  </span>
                </div>
                <kbd className="text-[10px] font-mono text-[#d6f779] bg-[#d6f779]/10 px-2 py-0.5 rounded border border-[#d6f779]/20">
                  ⌘K
                </kbd>
              </button>

              {/* Quick Book Call in Mobile Drawer */}
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#d6f779]/15 border border-[#d6f779]/35 text-[#d6f779] hover:bg-[#d6f779]/25 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#d6f779] shrink-0" />
                  <span className="text-xs sm:text-sm font-bold font-mono">
                    Schedule 30-Min Call
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#d6f779]/20 font-bold">
                  LIVE
                </span>
              </Link>

              {/* Nav Items Links */}
              <div className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30 font-bold'
                          : 'text-[#9d9f9e] hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isActive ? 'text-[#d6f779] translate-x-0.5' : 'text-gray-600'
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* Theme Selector */}
              <div className="pt-3 border-t border-[#343636] flex items-center justify-between">
                <span className="text-xs text-[#9d9f9e] font-mono">Theme Mode</span>
                <div className="flex items-center gap-1 bg-[#191a1a] rounded-lg p-1 border border-[#343636]">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                      theme === 'dark'
                        ? 'bg-[#d6f779]/20 text-[#d6f779] font-bold'
                        : 'text-[#9d9f9e] hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme('oled')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                      theme === 'oled'
                        ? 'bg-[#d6f779]/20 text-[#d6f779] font-bold'
                        : 'text-[#9d9f9e] hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>OLED</span>
                  </button>
                </div>
              </div>

              {/* Admin Panel Entry */}
              {user && (
                <div className="pt-2">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d6f779]/15 border border-[#d6f779]/35 text-[#d6f779] text-sm font-semibold"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
