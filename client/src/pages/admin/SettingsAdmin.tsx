import React, { useState, useEffect } from 'react';
import { Save, Lock, Palette, Globe, Check, ExternalLink, Clock, Terminal, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';

export const SettingsAdmin: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const { refreshSettings } = useSettings();
  const [seo, setSeo] = useState({
    siteTitle: '',
    siteDescription: '',
    keywords: '',
    canonicalUrl: '',
    robots: 'index, follow',
    brandName: 'SHAHZOD.DEV',
  });

  const [sections, setSections] = useState<any>({
    hero: true,
    about: true,
    skills: true,
    projects: true,
    news: true,
    blog: true,
    services: true,
    stats: true,
    testimonials: true,
    contact: true,
    upcomingTimer: true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    api
      .get('/content/settings')
      .then((res) => {
        if (res.data.seo) {
          setSeo({
            ...res.data.seo,
            brandName: res.data.seo.brandName || 'SHAHZOD.DEV',
          });
        }
        if (res.data.site?.enableSections) {
          try {
            setSections((prev: any) => ({ ...prev, ...JSON.parse(res.data.site.enableSections) }));
          } catch {}
        }
      })
      .catch((err) => error(err.message));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/content/settings', {
        seo,
        site: {
          theme,
          accentColor,
          enableSections: JSON.stringify(sections),
        },
      });
      await refreshSettings();
      window.dispatchEvent(new Event('portfolio:reload_settings'));
      success('SEO, Brand name & Homepage preferences saved!');
    } catch (err: any) {
      error(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setChangingPass(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      success('Admin password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      error(err.message || 'Password update failed');
    } finally {
      setChangingPass(false);
    }
  };

  const accentPresets = [
    { name: 'Electric Lime (Eyramusic)', color: '#d6f779' },
    { name: 'Neon Cyan', color: '#00F2FE' },
    { name: 'Electric Indigo', color: '#6366F1' },
    { name: 'Cyber Emerald', color: '#10B981' },
    { name: 'Purple Nebula', color: '#8B5CF6' },
    { name: 'Coral Rose', color: '#F43F5E' },
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">System Configuration</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Global SEO, Design Theme & Section Toggles
        </h1>
      </div>

      {/* THEME & DESIGN */}
      <div className="p-8 rounded-3xl glass-panel border border-[#343636] space-y-6 shadow-2xl bg-[#191a1a]">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#d6f779]" />
          <span>Visual Aesthetics & Theme Modes</span>
        </h3>

        {/* Theme modes */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-[#9d9f9e]">Base Theme Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                theme === 'dark'
                  ? 'bg-[#d6f779]/10 border-[#d6f779] text-white font-bold ring-2 ring-[#d6f779]/20'
                  : 'glass-card border-[#343636] text-[#9d9f9e]'
              }`}
            >
              <div className="w-full h-8 rounded-lg bg-[#101111] border border-[#343636] mb-2" />
              <p className="text-xs font-bold text-white">Dark Obsidian</p>
              <p className="text-[10px] text-[#9d9f9e] font-mono">Eyramusic dark aesthetic (#101111)</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('oled')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                theme === 'oled'
                  ? 'bg-[#d6f779]/10 border-[#d6f779] text-white font-bold ring-2 ring-[#d6f779]/20'
                  : 'glass-card border-[#343636] text-[#9d9f9e]'
              }`}
            >
              <div className="w-full h-8 rounded-lg bg-black border border-[#343636] mb-2" />
              <p className="text-xs font-bold text-white">Pitch OLED</p>
              <p className="text-[10px] text-[#9d9f9e] font-mono">Pure black high contrast mode</p>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                theme === 'light'
                  ? 'bg-[#d6f779]/10 border-[#d6f779] text-white font-bold ring-2 ring-[#d6f779]/20'
                  : 'glass-card border-[#343636] text-[#9d9f9e]'
              }`}
            >
              <div className="w-full h-8 rounded-lg bg-gray-100 border border-gray-300 mb-2" />
              <p className="text-xs font-bold text-white">Minimal Light</p>
              <p className="text-[10px] text-[#9d9f9e] font-mono">Clean white aesthetic</p>
            </button>
          </div>
        </div>

        {/* Accent Color Preset */}
        <div className="space-y-2 pt-4 border-t border-[#343636]">
          <label className="text-xs font-mono text-[#9d9f9e]">Accent Color Preset</label>
          <div className="flex flex-wrap items-center gap-3">
            {accentPresets.map((p) => (
              <button
                key={p.color}
                type="button"
                onClick={() => setAccentColor(p.color)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                  accentColor === p.color ? 'border-[#d6f779] bg-[#d6f779]/15 text-white font-bold' : 'border-[#343636] hover:bg-white/5 text-[#9d9f9e]'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Upcoming Release Timer Toggle */}
        <div className="pt-4 border-t border-[#343636] space-y-2">
          <label className="text-xs font-mono text-[#9d9f9e]">Bosh Sahifa Reliz Taymeri (Upcoming Timer)</label>
          <div className="p-5 rounded-2xl bg-[#101111] border border-[#343636] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d6f779]" />
                <span className="text-sm font-bold text-white">Homepage Upcoming Countdown Banner</span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  sections.upcomingTimer !== false
                    ? 'bg-[#d6f779]/15 text-[#d6f779] border-[#d6f779]/35'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}>
                  {sections.upcomingTimer !== false ? 'YOQILGAN / KO’RSATILADI' : 'O’CHIRILGAN / YASHIRILGAN'}
                </span>
              </div>
              <p className="text-xs text-[#9d9f9e] max-w-xl leading-relaxed">
                Bosh sahifada (Home page) rejalashtirilgan kelgusi nashr yoki reliz sanasi taymerini (Countdown Card) yoqish yoki o'chirish.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSections((prev: any) => ({ ...prev, upcomingTimer: prev.upcomingTimer === false }))}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                sections.upcomingTimer !== false ? 'bg-[#d6f779]' : 'bg-[#343636]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-[#101111] shadow-md ring-0 transition duration-200 ease-in-out ${
                  sections.upcomingTimer !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Homepage section toggles */}
        <div className="space-y-3 pt-4 border-t border-[#343636]">
          <label className="text-xs font-mono text-[#9d9f9e]">Boshqa Bosh Sahifa Bo’limlari Ko’rinishi</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.keys(sections).filter(k => k !== 'upcomingTimer').map((secKey) => (
              <label
                key={secKey}
                className="flex items-center gap-2 p-2.5 rounded-xl glass-card border border-[#343636] text-xs font-mono capitalize cursor-pointer hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={(sections as any)[secKey]}
                  onChange={(e) => setSections({ ...sections, [secKey]: e.target.checked })}
                  className="rounded text-[#d6f779] focus:ring-0"
                />
                <span>{secKey}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SEO SETTINGS */}
      <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl glass-panel border border-[#343636] space-y-6 shadow-2xl bg-[#191a1a]">
        <div className="flex items-center justify-between border-b border-[#343636] pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#d6f779]" />
            <span>Search Engine Optimization (SEO) & Metadata</span>
          </h3>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-[#d6f779] hover:underline flex items-center gap-1"
          >
            <span>Live Sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-4">
          {/* Brand Logo Text (Navbar & Footer) */}
          <div className="p-5 rounded-2xl bg-[#141515] border border-[#343636] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-mono font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#d6f779]" />
                <span>Website Brand Logo Text (SHAHZOD.DEV)</span>
              </label>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-[#343636]">
                <span className="text-[10px] uppercase font-mono text-[#9d9f9e]">Live Preview:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-[#d6f779] flex items-center justify-center shadow-sm shadow-[#d6f779]/30">
                    <Terminal className="w-3 h-3 text-[#101111] font-extrabold" />
                  </div>
                  <span className="font-mono font-bold text-xs tracking-wider text-white">
                    {(() => {
                      const text = seo.brandName?.trim() || 'SHAHZOD.DEV';
                      const dotIdx = text.lastIndexOf('.');
                      if (dotIdx !== -1) {
                        return (
                          <>
                            {text.slice(0, dotIdx)}
                            <span className="text-[#d6f779]">{text.slice(dotIdx)}</span>
                          </>
                        );
                      }
                      return text;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            <input
              type="text"
              value={seo.brandName || ''}
              onChange={(e) => setSeo({ ...seo, brandName: e.target.value })}
              placeholder="SHAHZOD.DEV"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-gray-500 focus:border-[#d6f779]"
            />
            <p className="text-[11px] text-[#9d9f9e] leading-relaxed">
              Ushbu yozuv butun veb-sayt bo'ylab yuqori menyudagi (Navbar) va pastdagi (Footer) asosiy brend logotipi matni sifatida ishlatiladi. Masalan: <code className="text-[#d6f779] font-mono">SHAHZOD.DEV</code>, <code className="text-[#d6f779] font-mono">SHAHZOD.UZ</code> yoki o'zingiz xohlagan brend nomi. Nuqtadan keyingi qism avtomatik ravishda yashil aksent rangda ajratib ko'rsatiladi.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9d9f9e]">Global Site Title *</label>
            <input
              type="text"
              required
              value={seo.siteTitle}
              onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9d9f9e]">Global Meta Description *</label>
            <textarea
              rows={3}
              required
              value={seo.siteDescription}
              onChange={(e) => setSeo({ ...seo, siteDescription: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9d9f9e]">Keywords (Comma-separated)</label>
              <input
                type="text"
                value={seo.keywords}
                onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#9d9f9e]">Canonical Site URL</label>
              <input
                type="text"
                value={seo.canonicalUrl}
                onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{savingSettings ? 'Saving...' : 'Save All Settings & Toggles'}</span>
          </button>
        </div>
      </form>

      {/* SECURITY / PASSWORD */}
      <form onSubmit={handleChangePassword} className="p-8 rounded-3xl glass-panel border border-[#343636] space-y-6 shadow-2xl bg-[#191a1a]">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-400" />
          <span>Change Administrator Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9d9f9e]">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9d9f9e]">New Password</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#9d9f9e]">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={changingPass}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all hover:bg-rose-600"
          >
            <Lock className="w-4 h-4" />
            <span>{changingPass ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
