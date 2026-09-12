import React, { useState, useEffect } from 'react';
import { Eye, Heart, Plus, Minus, Save, X, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../ui/Toast';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'project' | 'blog';
  itemId: string;
  initialViews: number;
  initialLikes: number;
  onSuccess: (updatedViews: number, updatedLikes: number) => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  itemId,
  initialViews,
  initialLikes,
  onSuccess,
}) => {
  const [views, setViews] = useState<number>(initialViews || 0);
  const [likes, setLikes] = useState<number>(initialLikes || 0);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      setViews(initialViews || 0);
      setLikes(initialLikes || 0);
    }
  }, [isOpen, initialViews, initialLikes]);

  if (!isOpen) return null;

  const handleAdjustViews = (delta: number) => {
    setViews((prev) => Math.max(0, prev + delta));
  };

  const handleAdjustLikes = (delta: number) => {
    setLikes((prev) => Math.max(0, prev + delta));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = type === 'project' ? `/projects/${itemId}/stats` : `/blog/${itemId}/stats`;
      const res = await api.patch(endpoint, {
        viewCount: views,
        likeCount: likes,
      });

      success(`Reactions and views updated! (👁️ ${views}, ❤️ ${likes})`);
      onSuccess(res.data.viewCount ?? views, res.data.likeCount ?? likes);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to update stats');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141515] border border-[#343636] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#343636] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#d6f779] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Engagement Manager</span>
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#9d9f9e] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* VIEWS SECTION */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#343636] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>Views (Ko'rishlar)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={views}
                  onChange={(e) => setViews(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-24 text-right font-mono font-bold text-sm bg-[#191a1a] border border-[#343636] rounded-lg px-2.5 py-1 text-white focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Quick +/- Views Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-gray-500 mr-1">Qo'shish:</span>
              {[10, 50, 100, 500].map((num) => (
                <button
                  type="button"
                  key={`+view-${num}`}
                  onClick={() => handleAdjustViews(num)}
                  className="px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{num}</span>
                </button>
              ))}
              <span className="text-[10px] font-mono text-gray-500 mx-1">Ayirish:</span>
              {[10, 50].map((num) => (
                <button
                  type="button"
                  key={`-view-${num}`}
                  onClick={() => handleAdjustViews(-num)}
                  disabled={views <= 0}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5"
                >
                  <Minus className="w-3 h-3" />
                  <span>{num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LIKES / REACTIONS SECTION */}
          <div className="p-4 rounded-2xl bg-black/40 border border-[#343636] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-rose-400 flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>Reactions / Likes (Reaksiyalar)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={likes}
                  onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-24 text-right font-mono font-bold text-sm bg-[#191a1a] border border-[#343636] rounded-lg px-2.5 py-1 text-white focus:border-rose-400"
                />
              </div>
            </div>

            {/* Quick +/- Likes Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono text-gray-500 mr-1">Qo'shish:</span>
              {[1, 5, 10, 25, 50].map((num) => (
                <button
                  type="button"
                  key={`+like-${num}`}
                  onClick={() => handleAdjustLikes(num)}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{num}</span>
                </button>
              ))}
              <span className="text-[10px] font-mono text-gray-500 mx-1">Ayirish:</span>
              {[1, 5, 10].map((num) => (
                <button
                  type="button"
                  key={`-like-${num}`}
                  onClick={() => handleAdjustLikes(-num)}
                  disabled={likes <= 0}
                  className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5"
                >
                  <Minus className="w-3 h-3" />
                  <span>{num}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9d9f9e] hover:text-white text-xs font-mono transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-bold text-xs shadow-lg shadow-[#d6f779]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
