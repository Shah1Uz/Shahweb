import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Sliders, Columns, Eye, Code, Zap, ArrowLeftRight } from 'lucide-react';
import { BeforeAfterConfig } from '../../types';

interface BeforeAfterSliderProps {
  config: BeforeAfterConfig;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ config }) => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>(
    config.type === 'code' ? 'slider' : 'slider'
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleStopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleStopDrag);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleStopDrag);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleStopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleStopDrag);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleStopDrag]);

  if (!config.enabled) return null;

  return (
    <div className="rounded-3xl border border-[#343636] bg-[#141515] p-5 sm:p-7 shadow-2xl space-y-5 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#343636] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#d6f779] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transformation Comparison</span>
            </span>
            {config.metricBadge && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#d6f779]/15 border border-[#d6f779]/30 text-[#d6f779] font-mono text-[11px] font-extrabold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {config.metricBadge}
              </span>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {config.title || (config.type === 'code' ? 'Code & Query Optimization' : 'Before vs. After Architecture')}
          </h3>
        </div>

        {/* Mode switcher (for code or side-by-side) */}
        <div className="flex items-center gap-1 bg-[#191a1a] p-1 rounded-xl border border-[#343636] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'slider'
                ? 'bg-[#d6f779] text-[#101111] font-bold shadow-md'
                : 'text-[#9d9f9e] hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Interactive Slider</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-[#d6f779] text-[#101111] font-bold shadow-md'
                : 'text-[#9d9f9e] hover:text-white'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT AREA */}
      {viewMode === 'slider' ? (
        /* ================== SLIDER VIEW ================== */
        <div className="space-y-2 select-none">
          <div
            ref={containerRef}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleMove(e.clientX);
            }}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleMove(e.touches[0].clientX);
            }}
            className="relative w-full rounded-2xl overflow-hidden cursor-ew-resize border border-[#343636] bg-[#101111] min-h-[340px] sm:min-h-[420px] max-h-[560px] flex items-center justify-center group"
          >
            {/* TYPE = IMAGE */}
            {config.type === 'image' ? (
              <>
                {/* AFTER IMAGE (Bottom Layer) */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={config.afterImage || ''}
                    alt={config.afterLabel}
                    className="w-full h-full object-cover"
                  />
                  {/* AFTER Badge */}
                  <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{config.afterLabel || 'AFTER (Modern / Optimized)'}</span>
                  </div>
                </div>

                {/* BEFORE IMAGE (Top Layer with dynamic clip) */}
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={config.beforeImage || ''}
                    alt={config.beforeLabel}
                    className="w-full h-full object-cover"
                  />
                  {/* BEFORE Badge */}
                  <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>{config.beforeLabel || 'BEFORE (Legacy)'}</span>
                  </div>
                </div>
              </>
            ) : (
              /* TYPE = CODE (Interactive Morph Slider) */
              <>
                {/* AFTER CODE (Bottom Layer) */}
                <div className="absolute inset-0 w-full h-full p-5 sm:p-6 overflow-hidden bg-[#0d0e0e] text-emerald-300 font-mono text-xs sm:text-sm leading-relaxed">
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono">
                    ✓ {config.afterLabel || 'AFTER: Optimized'}
                  </div>
                  <pre className="whitespace-pre font-mono text-emerald-100/90 overflow-x-hidden">
                    <code>{config.afterCode || '// Optimized clean code'}</code>
                  </pre>
                </div>

                {/* BEFORE CODE (Top Layer with dynamic clip) */}
                <div
                  className="absolute inset-0 w-full h-full p-5 sm:p-6 overflow-hidden bg-[#181212] text-rose-300 font-mono text-xs sm:text-sm leading-relaxed"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold font-mono">
                    ⚠ {config.beforeLabel || 'BEFORE: Legacy'}
                  </div>
                  <pre className="whitespace-pre font-mono text-rose-100/90 overflow-x-hidden">
                    <code>{config.beforeCode || '// Legacy unoptimized code'}</code>
                  </pre>
                </div>
              </>
            )}

            {/* DIVIDER LINE & DRAGGABLE HANDLE */}
            <div
              className="absolute top-0 bottom-0 z-30 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              {/* Vertical neon line */}
              <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-gradient-to-b from-[#d6f779] via-cyan-400 to-[#d6f779] shadow-[0_0_12px_rgba(214,247,121,0.8)]" />

              {/* Center Handle Button */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#101111] border-2 border-[#d6f779] text-[#d6f779] flex items-center justify-center shadow-xl shadow-[#d6f779]/40 transition-transform ${
                  isDragging ? 'scale-115' : 'group-hover:scale-110'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-[#d6f779]" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#9d9f9e] px-1">
            <span className="text-rose-400">◀ {config.beforeLabel || 'Before'}</span>
            <span className="flex items-center gap-1 text-gray-500">
              <Sliders className="w-3 h-3" />
              <span>Surish orqali taqqoslang ({Math.round(sliderPos)}%)</span>
            </span>
            <span className="text-emerald-400">{config.afterLabel || 'After'} ▶</span>
          </div>
        </div>
      ) : (
        /* ================== SIDE-BY-SIDE VIEW ================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BEFORE COLUMN */}
          <div className="rounded-2xl bg-[#161212] border border-rose-500/30 overflow-hidden space-y-3 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
              <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{config.beforeLabel || 'BEFORE (Legacy Architecture)'}</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400/70 uppercase">Legacy</span>
            </div>

            {config.type === 'image' ? (
              <div className="rounded-xl overflow-hidden border border-[#343636] aspect-video bg-black/40">
                <img src={config.beforeImage || ''} alt="Before" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-xl bg-black/60 p-4 font-mono text-xs text-rose-200/90 overflow-x-auto max-h-[320px]">
                <pre><code>{config.beforeCode || ''}</code></pre>
              </div>
            )}
          </div>

          {/* AFTER COLUMN */}
          <div className="rounded-2xl bg-[#121614] border border-emerald-500/30 overflow-hidden space-y-3 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{config.afterLabel || 'AFTER (Modern / Optimized)'}</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/70 uppercase">Optimized</span>
            </div>

            {config.type === 'image' ? (
              <div className="rounded-xl overflow-hidden border border-[#343636] aspect-video bg-black/40">
                <img src={config.afterImage || ''} alt="After" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-xl bg-black/60 p-4 font-mono text-xs text-emerald-200/90 overflow-x-auto max-h-[320px]">
                <pre><code>{config.afterCode || ''}</code></pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
