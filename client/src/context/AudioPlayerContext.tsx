import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { AudioTrack } from '../types';

interface AudioPlayerContextType {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isDrawerOpen: boolean;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  reloadTracks: () => Promise<void>;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<AudioTrack[]>([]);
  const currentTrackRef = useRef<AudioTrack | null>(null);

  // Synchronize refs with state to prevent stale closures in event listeners
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const playTrack = useCallback((track: AudioTrack) => {
    if (!audioRef.current) return;
    setCurrentTrack(track);
    currentTrackRef.current = track;
    audioRef.current.src = track.audioUrl;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((e) => console.warn('Audio playback error:', e));
  }, []);

  const loadTracks = useCallback(async () => {
    try {
      const res = await api.get('/audio');
      const list: AudioTrack[] = res.data || [];
      setTracks(list);
      tracksRef.current = list;
      if (list.length > 0 && !currentTrackRef.current) {
        setCurrentTrack(list[0]);
        currentTrackRef.current = list[0];
        if (audioRef.current) {
          audioRef.current.src = list[0].audioUrl;
        }
      }
    } catch (err) {
      console.warn('Failed to load audio tracks:', err);
    }
  }, []);

  // Handlers for track ended
  const handleTrackEnded = useCallback(() => {
    const list = tracksRef.current;
    const current = currentTrackRef.current;

    // 1. Agar faqat 1 ta musiqa bo'lsa yoki musiqa qolmagan bo'lsa -> pause bo'lsin
    if (!list.length || list.length <= 1 || !current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // 2. Agar 2 yoki undan ortiq musiqa bo'lsa -> darhol 2-chisiga (keyingisiga) o'tsin va o'ynasin
    const currentIndex = list.findIndex((t) => t.id === current.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextTrackItem = list[nextIndex];
    playTrack(nextTrackItem);
  }, [playTrack]);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.onended = () => {
      handleTrackEnded();
    };

    loadTracks();

    // Listen for custom event when admin uploads new tracks
    const handleReload = () => {
      loadTracks();
    };
    window.addEventListener('portfolio:reload_audio', handleReload);

    return () => {
      window.removeEventListener('portfolio:reload_audio', handleReload);
      audio.pause();
      audio.src = '';
    };
  }, [handleTrackEnded, loadTracks]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Audio playback error:', e));
    }
  };

  const nextTrack = () => {
    const list = tracksRef.current;
    const current = currentTrackRef.current;
    if (!list.length || !current) return;
    const currentIndex = list.findIndex((t) => t.id === current.id);
    const nextIndex = (currentIndex + 1) % list.length;
    playTrack(list[nextIndex]);
  };

  const prevTrack = () => {
    const list = tracksRef.current;
    const current = currentTrackRef.current;
    if (!list.length || !current) return;
    const currentIndex = list.findIndex((t) => t.id === current.id);
    const prevIndex = (currentIndex - 1 + list.length) % list.length;
    playTrack(list[prevIndex]);
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <AudioPlayerContext.Provider
      value={{
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
        reloadTracks: loadTracks,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
};
