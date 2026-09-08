import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Newspaper,
  BookOpen,
  Image as ImageIcon,
  Music,
  Code2,
  Briefcase,
  Layers,
  MessageSquare,
  MessageSquareQuote,
  Navigation,
  Settings,
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-sm font-mono text-gray-400">
        Authenticating administrator session...
      </div>
    );
  }

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Profile & Bio', icon: User, path: '/admin/profile' },
    { label: 'Projects CMS', icon: FolderGit2, path: '/admin/projects' },
    { label: 'News & Scheduler', icon: Newspaper, path: '/admin/news' },
    { label: 'Blog Posts', icon: BookOpen, path: '/admin/blog' },
    { label: 'Media Library', icon: ImageIcon, path: '/admin/media' },
    { label: 'Music & Audio', icon: Music, path: '/admin/audio' },
    { label: 'Skills & Tech', icon: Code2, path: '/admin/skills' },
    { label: 'Experience', icon: Briefcase, path: '/admin/experience' },
    { label: 'Services', icon: Layers, path: '/admin/services' },
    { label: 'Client Feedback', icon: MessageSquareQuote, path: '/admin/testimonials' },
    { label: 'Messages Inbox', icon: MessageSquare, path: '/admin/messages' },
    { label: 'Navigation Menu', icon: Navigation, path: '/admin/navigation' },
    { label: 'SEO & Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#101111] text-[#EEEEEE] flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#151616]/95 border-r border-[#343636] flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#343636] flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#d6f779] flex items-center justify-center shrink-0 shadow-lg shadow-[#d6f779]/20">
              <Shield className="w-5 h-5 text-[#101111] font-extrabold" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-mono font-bold text-sm tracking-wider text-white block truncate">
                  CMS CORE
                </span>
                <span className="text-[10px] uppercase font-mono text-[#d6f779] block tracking-widest font-bold">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30 font-semibold'
                    : 'text-[#9d9f9e] hover:text-white hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d6f779]' : 'text-[#9d9f9e]'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: User profile & Logout */}
        <div className="p-4 border-t border-[#343636] space-y-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/35 flex items-center justify-center text-[#d6f779] font-mono font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#9d9f9e] truncate">{user.email}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-mono transition-colors"
              title="View Live Public Website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {!collapsed && <span>Live Site</span>}
            </a>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-[#151616]/95 border-b border-[#343636] px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-mono font-bold text-sm text-[#d6f779]">ADMIN DASHBOARD</span>
          <a href="/" target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-[#d6f779]">
            <ExternalLink className="w-4 h-4" />
          </a>
        </header>

        {/* Dynamic Admin Page View */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
