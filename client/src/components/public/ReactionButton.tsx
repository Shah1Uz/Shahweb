import React, { useState, useEffect } from 'react';
import { Heart, Eye, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';

interface ReactionButtonProps {
  id: string;
  type: 'project' | 'blog';
  initialLikes?: number;
  initialViews?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  id,
  type,
  initialLikes = 0,
  initialViews,
  size = 'md',
}) => {
  const [likes, setLikes] = useState<number>(initialLikes || 0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [animating, setAnimating] = useState<boolean>(false);

  const storageKey = `portfolio_reaction_${type}_${id}`;

  useEffect(() => {
    setLikes(initialLikes || 0);
    const saved = localStorage.getItem(storageKey);
    if (saved === 'true') {
      setHasLiked(true);
    }
  }, [id, initialLikes, storageKey]);

  const handleReact = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger subtle confetti burst
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x, y },
        colors: ['#d6f779', '#f43f5e', '#00F2FE', '#ffffff'],
        disableForReducedMotion: true,
      });
    } catch {}

    setAnimating(true);
    setTimeout(() => setAnimating(false), 500);

    // If already liked, allow clapping more (medium-style) or toggle
    const delta = 1;
    setLikes((prev) => prev + delta);
    setHasLiked(true);
    localStorage.setItem(storageKey, 'true');

    try {
      const endpoint = type === 'project' ? `/projects/${id}/react` : `/blog/${id}/react`;
      const res = await api.post(endpoint, { delta });
      if (typeof res.data?.likeCount === 'number') {
        setLikes(res.data.likeCount);
      }
    } catch (err) {
      console.warn('Failed to record reaction:', err);
    }
  };

  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-2.5">
      {/* Interactive Like / Clap Button */}
      <button
        onClick={handleReact}
        className={`group relative flex items-center gap-2 rounded-2xl border transition-all duration-200 select-none ${
          isLg ? 'px-4 py-2.5 text-sm' : 'px-3 py-1.5 text-xs'
        } ${
          hasLiked
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-500/10'
            : 'bg-white/5 hover:bg-white/10 border-[#343636] hover:border-rose-500/40 text-[#9d9f9e] hover:text-white'
        } ${animating ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
        title="Saytga reaksiya bildirish (Like / Clap)"
      >
        <Heart
          className={`transition-all duration-300 ${
            isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'
          } ${
            hasLiked
              ? 'fill-rose-500 text-rose-500 animate-pulse'
              : 'text-gray-400 group-hover:text-rose-400 group-hover:fill-rose-400/20'
          }`}
        />
        <span className="font-mono font-bold">{likes}</span>
        {hasLiked && (
          <span className="text-[10px] text-rose-400 font-mono hidden sm:inline">Liked</span>
        )}
      </button>

      {/* Views count display if provided */}
      {initialViews !== undefined && (
        <div
          className={`flex items-center gap-1.5 font-mono text-[#9d9f9e] rounded-2xl bg-white/5 border border-[#343636] ${
            isLg ? 'px-3.5 py-2.5 text-xs' : 'px-2.5 py-1.5 text-[11px]'
          }`}
          title="Ko'rishlar soni"
        >
          <Eye className={`text-cyan-400 ${isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'}`} />
          <span>{initialViews} views</span>
        </div>
      )}
    </div>
  );
};
