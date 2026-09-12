import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  Music,
  ChevronDown,
  ChevronUp,
  ListMusic,
  Disc,
  Radio,
  X,
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

export const MiniAudioPlayer: React.FC = () => {
  const {
    tracks,
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isDrawerOpen,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleDrawer,
    closeDrawer,
    settings,
  } = useAudioPlayer();

  const [minimized, setMinimized] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // If player is disabled in admin settings or no tracks available, do not render
  if (!settings.enabled || !tracks.length || !currentTrack) return null;

  const is30sMode = settings.mode === 'preview30';
  const effectiveMaxTime = is30sMode ? (settings.duration || 30) : duration;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const progressPercent = effectiveMaxTime > 0 ? Math.min(100, Math.max(0, (currentTime / effectiveMaxTime) * 100)) : 0;
  const volumePercent = Math.round(volume * 100);

  return (
    <>
      {/* Floating Audio Player Deck */}
      <div className="fixed bottom-3 sm:bottom-5 left-3 sm:left-5 z-40 select-none max-w-[calc(100vw-24px)]">
        {minimized ? (
          /* ================= MINIMIZED FLOATING PILL ================= */
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="flex items-center gap-2 sm:gap-2.5 p-1.5 pr-3 sm:pr-4 rounded-full bg-[#141515]/95 border border-[#343636] hover:border-[#d6f779]/50 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(214,247,121,0.12)] backdrop-blur-2xl transition-all group cursor-pointer max-w-[calc(100vw-24px)]"
            onClick={() => setMinimized(false)}
          >
            {/* Mini Spinning Vinyl Cover */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-[#1a1b1b] border border-[#383a3a] flex items-center justify-center shrink-0 shadow-md">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
              ) : (
                <Disc className={`w-4 h-4 text-[#d6f779] ${isPlaying ? 'animate-spin-slow' : ''}`} />
              )}
              {/* Spindle hole */}
              <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-[#101111] border border-[#d6f779]/80 shadow-sm z-10" />
            </div>

            {/* Track metadata ticker */}
            <div className="flex flex-col min-w-0 max-w-[100px] sm:max-w-[130px]">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white truncate group-hover:text-[#d6f779] transition-colors">
                  {currentTrack.title}
                </span>
                {is30sMode && (
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#d6f779]/20 text-[#d6f779] border border-[#d6f779]/40 shrink-0">
                    30s
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#9d9f9e] truncate">
                {currentTrack.artist}
              </span>
            </div>

            {/* Dancing Equalizer */}
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-3 px-0.5 sm:px-1">
                <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-1" />
                <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-2" />
                <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-3" />
              </div>
            )}

            {/* Quick Play/Pause on Mini Pill */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-7 h-7 rounded-full bg-[#d6f779] text-[#101111] flex items-center justify-center shadow-[0_0_12px_rgba(214,247,121,0.4)] hover:bg-[#c3e665] hover:scale-105 active:scale-95 transition-all shrink-0 ml-0.5 sm:ml-1"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              )}
            </button>

            {/* Expand Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(false);
              }}
              className="p-1 text-[#9d9f9e] hover:text-white transition-colors"
              title="Expand player"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          /* ================= EXPANDED FULL PLAYER DECK ================= */
          <motion.div
            initial={{ y: 25, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-[calc(100vw-24px)] sm:w-[380px] max-w-[380px] bg-[#141515]/96 rounded-3xl p-3.5 sm:p-5 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.9),0_0_35px_-5px_rgba(214,247,121,0.1)] border border-[#343636] backdrop-blur-2xl relative overflow-hidden group"
          >
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d6f779]/40 to-transparent pointer-events-none" />
            
            {/* Ambient background glow orb */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#d6f779]/8 rounded-full blur-2xl pointer-events-none" />

            {/* Top Header Row: Status Badge, Visualizer & Window Controls */}
            <div className="flex items-center justify-between gap-2 mb-3.5">
              <div className="flex items-center gap-2">
                {/* Live / Status Pill */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#191a1a] border border-[#343636] text-[10px] font-mono font-medium">
                  {isPlaying ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d6f779] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d6f779]" />
                      </span>
                      <span className="text-[#d6f779] tracking-wider font-semibold">PLAYING</span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex rounded-full h-2 w-2 bg-[#9d9f9e]/50" />
                      <span className="text-[#9d9f9e] tracking-wider">PAUSED</span>
                    </>
                  )}
                </div>

                {/* Mode Indicator Tag */}
                {is30sMode ? (
                  <span className="px-2 py-0.5 rounded-full bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30 text-[9px] font-mono font-bold tracking-tight animate-pulse">
                    ⚡ 30s Auto
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#9d9f9e] border border-white/10 text-[9px] font-mono">
                    🎵 Oddiy Rejim
                  </span>
                )}

                {/* Dancing Equalizer Frequency Bars */}
                <div className="flex items-end gap-[3px] h-3.5 px-1">
                  <span className={`w-[2.5px] rounded-full bg-[#d6f779] ${isPlaying ? 'animate-eq-1' : 'h-1'}`} />
                  <span className={`w-[2.5px] rounded-full bg-[#d6f779] ${isPlaying ? 'animate-eq-2' : 'h-2'}`} />
                  <span className={`w-[2.5px] rounded-full bg-[#d6f779] ${isPlaying ? 'animate-eq-3' : 'h-1'}`} />
                  <span className={`w-[2.5px] rounded-full bg-[#d6f779] ${isPlaying ? 'animate-eq-4' : 'h-2.5'}`} />
                  <span className={`w-[2.5px] rounded-full bg-[#d6f779] ${isPlaying ? 'animate-eq-5' : 'h-1'}`} />
                </div>
              </div>

              {/* Action Buttons: Playlist & Minimize */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleDrawer}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono transition-all border ${
                    isDrawerOpen
                      ? 'bg-[#d6f779]/15 border-[#d6f779]/40 text-[#d6f779]'
                      : 'bg-[#191a1a] border-[#343636] text-[#9d9f9e] hover:text-white hover:border-[#383a38]'
                  }`}
                  title="Tracklist Queue"
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{tracks.length}</span>
                </button>

                <button
                  onClick={() => setMinimized(true)}
                  className="p-1.5 rounded-xl bg-[#191a1a] border border-[#343636] text-[#9d9f9e] hover:text-white hover:border-[#383a38] transition-colors"
                  title="Minimize Player"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Track Info & Vinyl Art Card */}
            <div className="flex items-center gap-3.5 mb-4 p-2.5 rounded-2xl bg-[#191a1a]/80 border border-[#343636]/70">
              {/* Spinning Vinyl Platter */}
              <div
                className={`relative w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-[#101111] via-[#242626] to-[#141515] border border-[#383a3a] shadow-lg shrink-0 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 ${
                  isPlaying ? 'ring-2 ring-[#d6f779]/30' : ''
                }`}
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {/* Vinyl Grooves Ring Styling */}
                <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
                
                {/* Center Disc Artwork */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center bg-[#101111]">
                  {currentTrack.coverUrl ? (
                    <img
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                    />
                  ) : (
                    <Disc className={`w-6 h-6 text-[#d6f779] ${isPlaying ? 'animate-spin-slow' : ''}`} />
                  )}
                  {/* Center Spindle Dot */}
                  <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-[#101111] border border-[#d6f779] shadow-sm z-10" />
                </div>
              </div>

              {/* Title & Artist & Format */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white truncate hover:text-[#d6f779] transition-colors">
                    {currentTrack.title}
                  </h4>
                </div>
                <p className="text-xs text-[#9d9f9e] truncate mt-0.5">
                  {currentTrack.artist || 'Original Track'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-[#9d9f9e] border border-white/5">
                    Hi-Fi Audio
                  </span>
                  {currentTrack.duration && (
                    <span className="text-[10px] font-mono text-[#9d9f9e]/80">
                      {currentTrack.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Interactive Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="relative w-full h-2 rounded-full bg-[#242626] overflow-visible flex items-center group/progress cursor-pointer">
                {/* Background Track Filled with Lime Gradient */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d6f779] to-[#c3e665] shadow-[0_0_12px_rgba(214,247,121,0.5)] transition-[width] duration-100 ease-linear pointer-events-none relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Glowing Draggable Thumb */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#ffffff] border-2 border-[#d6f779] shadow-[0_0_10px_rgba(214,247,121,1)] transition-transform duration-150 group-hover/progress:scale-125" />
                </div>

                {/* Invisible HTML range input for seamless drag & click seek */}
                <input
                  type="range"
                  min={0}
                  max={effectiveMaxTime || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>

              {/* Timestamp Indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#9d9f9e]">
                <span className="text-white/80 font-medium">{formatTime(currentTime)}</span>
                <span className="text-[#9d9f9e]/60">
                  {formatTime(effectiveMaxTime)}
                  {is30sMode && <span className="text-[#d6f779] ml-1 text-[9px] font-bold">(30s Auto)</span>}
                </span>
              </div>
            </div>

            {/* Bottom Controls Bar: Volume, Prev/Play/Next, Shuffle/Loop */}
            <div className="flex items-center justify-between pt-1 border-t border-[#343636]/40">
              {/* Volume Popover / Slider */}
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="p-2 rounded-xl text-[#9d9f9e] hover:text-white hover:bg-white/5 transition-colors"
                  title={volume === 0 ? 'Unmute' : `Mute (${volumePercent}%)`}
                >
                  {volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-[#d6f779]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#d6f779]" />
                  )}
                </button>

                {/* Volume Slider Track */}
                <div
                  className="flex items-center gap-1.5"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <div className="relative w-14 sm:w-16 h-1.5 rounded-full bg-[#242626] overflow-visible flex items-center group/vol cursor-pointer">
                    <div
                      className="h-full rounded-full bg-[#d6f779] pointer-events-none"
                      style={{ width: `${volumePercent}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title={`Volume: ${volumePercent}%`}
                    />
                  </div>
                </div>
              </div>

              {/* Main Playback Buttons: Prev, Play/Pause, Next */}
              <div className="flex items-center gap-2">
                {/* Prev Button */}
                <button
                  onClick={prevTrack}
                  className="p-2 rounded-full text-[#9d9f9e] hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                {/* Big Glowing Play/Pause Center Button */}
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] flex items-center justify-center font-bold shadow-[0_0_24px_rgba(214,247,121,0.45)] hover:shadow-[0_0_30px_rgba(214,247,121,0.65)] hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={nextTrack}
                  className="p-2 rounded-full text-[#9d9f9e] hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>

              {/* Radio / Live Stream Icon */}
              <div className="flex items-center text-[#9d9f9e]">
                <span
                  className="p-2 rounded-xl text-[#9d9f9e] hover:text-[#d6f779] transition-colors"
                  title="Stereo Master"
                >
                  <Radio className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ================= PLAYLIST QUEUE MODAL ================= */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-[#141515]/98 rounded-3xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(214,247,121,0.15)] border border-[#343636] z-10 backdrop-blur-2xl overflow-hidden"
            >
              {/* Top Accent Gradient */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#d6f779]/50 to-transparent pointer-events-none" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#343636]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#d6f779]/10 border border-[#d6f779]/30 flex items-center justify-center text-[#d6f779]">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Soundtrack Queue</h3>
                    <p className="text-xs text-[#9d9f9e]">
                      {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'} available for streaming
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-xl text-[#9d9f9e] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tracklist List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {tracks.map((track, idx) => {
                  const isCurrent = currentTrack.id === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all group ${
                        isCurrent
                          ? 'bg-[#d6f779]/12 border border-[#d6f779]/35 text-[#d6f779] shadow-sm'
                          : 'bg-[#191a1a]/60 border border-[#343636]/60 hover:bg-[#191a1a] hover:border-[#383a38] text-[#9d9f9e]'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Number or Equalizer */}
                        <div className="w-6 flex items-center justify-center shrink-0">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end gap-[2px] h-3.5">
                              <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-1" />
                              <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-2" />
                              <span className="w-[2px] bg-[#d6f779] rounded-full animate-eq-3" />
                            </div>
                          ) : (
                            <span className={`text-xs font-mono ${isCurrent ? 'text-[#d6f779] font-bold' : 'text-[#9d9f9e]/70'}`}>
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#101111] border border-[#343636] shrink-0 flex items-center justify-center">
                          {track.coverUrl ? (
                            <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-4 h-4 text-[#d6f779]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="truncate">
                          <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-[#9d9f9e] truncate">
                            {track.artist || 'Original Track'}
                          </p>
                        </div>
                      </div>

                      {/* Duration & Play status */}
                      <div className="flex items-center gap-3 text-xs font-mono shrink-0 ml-2">
                        <span className={isCurrent ? 'text-[#d6f779]' : 'text-[#9d9f9e]'}>
                          {track.duration}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? 'bg-[#d6f779] text-[#101111]'
                              : 'bg-white/5 text-[#9d9f9e] group-hover:bg-[#d6f779] group-hover:text-[#101111]'
                          }`}
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
