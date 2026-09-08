import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { News } from '../../types';

interface CountdownCardProps {
  item: News;
  onTimerEnd?: () => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({ item, onTimerEnd }) => {
  const targetTime = item.scheduledAt ? new Date(item.scheduledAt).getTime() : 0;

  const calculateTimeLeft = () => {
    const now = Date.now();
    const difference = targetTime - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isCompleted: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining.isCompleted && !celebrated) {
        setCelebrated(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onTimerEnd) onTimerEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, celebrated, onTimerEnd]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative rounded-3xl overflow-hidden glass-card border border-[#343636] p-6 md:p-8 bg-[#191a1a] shadow-2xl">
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#d6f779]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Info */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/35 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#d6f779]" />
              <span>UPCOMING RELEASE / COMING SOON</span>
            </span>
            <span className="text-xs font-mono text-[#9d9f9e] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.category}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {item.title}
          </h3>

          <p className="text-sm sm:text-base text-[#9d9f9e] leading-relaxed max-w-xl">
            {item.shortDesc}
          </p>

          <div className="pt-2">
            <Link
              to={`/news/${item.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#d6f779] hover:text-[#c3e665] transition-colors group"
            >
              <span>View preview announcement</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right: Live Countdown Clock Display */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#151616] border border-[#343636] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono tracking-widest uppercase text-[#9d9f9e]">
            <Clock className="w-4 h-4 text-[#d6f779]" />
            <span>Target Unveiling Timer</span>
          </div>

          {timeLeft.isCompleted ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-4 space-y-2"
            >
              <div className="text-2xl font-extrabold text-[#d6f779] font-mono">
                LAUNCHED & UNLOCKED!
              </div>
              <p className="text-xs text-[#9d9f9e]">The scheduled publication is now active.</p>
              <Link
                to={`/news/${item.slug}`}
                className="inline-block mt-2 px-5 py-2 rounded-xl bg-[#d6f779] text-[#101111] font-bold text-xs hover:bg-[#c3e665] transition-colors"
              >
                Read Full Release
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center w-full max-w-sm">
              {/* Days */}
              <div className="p-3 rounded-xl bg-[#101111] border border-[#343636] shadow-inner">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {pad(timeLeft.days)}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#9d9f9e] tracking-wider">
                  Days
                </span>
              </div>
              {/* Hours */}
              <div className="p-3 rounded-xl bg-[#101111] border border-[#343636] shadow-inner">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {pad(timeLeft.hours)}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#9d9f9e] tracking-wider">
                  Hours
                </span>
              </div>
              {/* Minutes */}
              <div className="p-3 rounded-xl bg-[#101111] border border-[#343636] shadow-inner">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-white">
                  {pad(timeLeft.minutes)}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#9d9f9e] tracking-wider">
                  Mins
                </span>
              </div>
              {/* Seconds */}
              <div className="p-3 rounded-xl bg-[#101111] border border-[#d6f779]/50 shadow-inner ring-1 ring-[#d6f779]/30">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-[#d6f779]">
                  {pad(timeLeft.seconds)}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#d6f779] tracking-wider font-semibold">
                  Secs
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
