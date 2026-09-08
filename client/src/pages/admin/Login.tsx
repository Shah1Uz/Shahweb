import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Authenticated successfully. Welcome back!', 'Access Granted');
      navigate('/admin/dashboard');
    } catch (err: any) {
      error(err.message || 'Invalid credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101111] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#d6f779]/5 rounded-full blur-[140px] pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] bg-[#d6f779]/5 rounded-full blur-[140px] pointer-events-none -bottom-24 -right-24" />

      <div className="relative w-full max-w-md glass-panel bg-[#191a1a]/95 rounded-3xl p-8 sm:p-10 border border-[#343636] shadow-2xl space-y-8 backdrop-blur-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#d6f779] flex items-center justify-center mx-auto shadow-xl shadow-[#d6f779]/20">
            <Shield className="w-7 h-7 text-[#101111] font-extrabold" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Admin Access Portal
          </h2>
          <p className="text-xs font-mono text-[#9d9f9e]">
            Authenticate to access internal CMS & telemetry controls
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Administrator Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Secure Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl pl-10 pr-10 py-3 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-sm shadow-xl shadow-[#d6f779]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs">Tekshirilmoqda...</span>
            ) : (
              <>
                <span>Boshqaruv Paneliga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <a href="/" className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors">
            ← Asosiy saytga qaytish
          </a>
        </div>
      </div>
    </div>
  );
};
