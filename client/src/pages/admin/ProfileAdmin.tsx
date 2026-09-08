import React, { useState, useEffect } from 'react';
import { Save, Upload, User, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { Profile } from '../../types';
import { useToast } from '../../components/ui/Toast';
import { useProfile } from '../../context/ProfileContext';

export const ProfileAdmin: React.FC = () => {
  const { refreshProfile } = useProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    yearsExperience: 7,
    projectsCompleted: 64,
    happyClients: 42,
    codeCommits: '18.5k',
  });
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    api
      .get('/content/profile')
      .then((res) => {
        setProfile(res.data);
        if (res.data?.statsJson) {
          try {
            setStats(JSON.parse(res.data.statsJson));
          } catch {}
        }
      })
      .catch((err) => error(err.message));
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'heroImageUrl' | 'cvUrl') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.media?.[0]?.url && profile) {
        setProfile({ ...profile, [field]: res.data.media[0].url });
        success('Asset updated and attached');
      }
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const payload = {
        ...profile,
        statsJson: JSON.stringify(stats),
      };
      await api.put('/content/profile', payload);
      await refreshProfile();
      success('Profile & Hero details saved!');
    } catch (err: any) {
      error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return <div className="py-20 text-center text-xs font-mono text-gray-400">Loading profile data...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Branding & Hero</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Programmer Profile & Bio</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Identity */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Identity & Hero Copy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Display Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Professional Title</label>
              <input
                type="text"
                required
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Biography / Short Pitch</label>
            <textarea
              rows={3}
              required
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">CTA Primary Text</label>
              <input
                type="text"
                value={profile.ctaWorkText}
                onChange={(e) => setProfile({ ...profile, ctaWorkText: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">CTA Secondary Text</label>
              <input
                type="text"
                value={profile.ctaContactText}
                onChange={(e) => setProfile({ ...profile, ctaContactText: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Media & Resume Assets */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Profile Photos & Resume Assets</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-300">Programmer Portrait Avatar</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.avatarUrl || ''}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="flex-1 glass-input rounded-xl px-4 py-2 text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center gap-1 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'avatarUrl')} className="hidden" />
                </label>
              </div>
              {profile.avatarUrl && (
                <img src={profile.avatarUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border border-white/10 mt-2" />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-300">Resume / CV File (PDF / Link)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.cvUrl || ''}
                  onChange={(e) => setProfile({ ...profile, cvUrl: e.target.value })}
                  className="flex-1 glass-input rounded-xl px-4 py-2 text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer flex items-center gap-1 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept=".pdf" onChange={(e) => handleUpload(e, 'cvUrl')} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Social & Developer Networks</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">GitHub</label>
              <input
                type="text"
                value={profile.githubUrl || ''}
                onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">LinkedIn</label>
              <input
                type="text"
                value={profile.linkedinUrl || ''}
                onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Twitter / X</label>
              <input
                type="text"
                value={profile.twitterUrl || ''}
                onChange={(e) => setProfile({ ...profile, twitterUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Telegram</label>
              <input
                type="text"
                value={profile.telegramUrl || ''}
                onChange={(e) => setProfile({ ...profile, telegramUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Instagram</label>
              <input
                type="text"
                value={profile.instagramUrl || ''}
                onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Statistics Counter */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Homepage Telemetry Stats</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Years Experience</label>
              <input
                type="number"
                value={stats.yearsExperience}
                onChange={(e) => setStats({ ...stats, yearsExperience: parseInt(e.target.value, 10) || 0 })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Projects Completed</label>
              <input
                type="number"
                value={stats.projectsCompleted}
                onChange={(e) => setStats({ ...stats, projectsCompleted: parseInt(e.target.value, 10) || 0 })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Happy Clients</label>
              <input
                type="number"
                value={stats.happyClients}
                onChange={(e) => setStats({ ...stats, happyClients: parseInt(e.target.value, 10) || 0 })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Git Commits (string)</label>
              <input
                type="text"
                value={stats.codeCommits}
                onChange={(e) => setStats({ ...stats, codeCommits: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-xl shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
