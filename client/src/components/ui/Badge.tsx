import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'neutral' | 'white';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'white',
  className,
}) => {
  const variantStyles = {
    white: 'bg-[#d6f779]/15 text-[#d6f779] border-[#d6f779]/35',
    cyan: 'bg-[#d6f779]/15 text-[#d6f779] border-[#d6f779]/35',
    purple: 'bg-[#191a1a] text-[#d6f779] border-[#343636]',
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    neutral: 'bg-[#191a1a] text-[#9d9f9e] border-[#343636]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md transition-all',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
