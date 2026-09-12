import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api';
import { AudioTrack, AudioSettings } from '../types';

interface AudioPlayerContextType {
  tracks: AudioTrack[];
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isDrawerOpen: boolean;
  settings: AudioSettings;
  playTrack: (track: AudioTrack) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  reloadTracks: () => Promise<void>;
  updateSettings: (newSettings: Partial<AudioSettings>) => Promise<void>;
}

const defaultSettings: AudioSettings = {
  enabled: true,
  mode: 'normal',
  autoplay: false,
  duration: 30,
  action: 'next',
  volume: 0.7,
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(defaultSettings);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<AudioTrack[]>([]);
  const currentTrackRef = useRef<AudioTrack | null>(null);
  const settingsRef = useRef<AudioSettings>(defaultSettings);
  const hasAttemptedAutoplay = useRef<boolean>(false);

  // Synchronize refs with state
  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    settingsRef.current = settings;
    if (audioRef.current && settings.volume !== undefined) {
      audioRef.current.volume = settings.volume;
      setVolumeState(settings.volume);
    }
  }, [settings]);

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

  const handleTrackEnded = useCallback(() => {
    const list = tracksRef.current;
    const current = currentTrackRef.current;

    if (!list.length || list.length <= 1 || !current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    const currentIndex = list.findIndex((t) => t.id === current.id);
    const nextIndex = (currentIndex + 1) % list.length;
    const nextTrackItem = list[nextIndex];
    playTrack(nextTrackItem);
  }, [playTrack]);

  // Load audio settings from server
  const loadSettings = useCallback(async () => {
    try {
      const res = await api.get('/audio/settings');
      if (res.data) {
        const loaded: AudioSettings = {
          ...defaultSettings,
          ...res.data,
        };
        setSettings(loaded);
        settingsRef.current = loaded;
      }
    } catch (err) {
      console.warn('Failed to load audio settings:', err);
    }
  }, []);

  // Update audio settings (admin)
  const updateSettings = async (newSettings: Partial<AudioSettings>) => {
    try {
      const res = await api.put('/audio/settings', newSettings);
      const updated = { ...settings, ...res.data };
      setSettings(updated);
      settingsRef.current = updated;
      window.dispatchEvent(new Event('portfolio:reload_audio'));
    } catch (err) {
      console.error('Failed to update audio settings:', err);
      throw err;
    }
  };

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

  // Autoplay trigger logic
  useEffect(() => {
    if (hasAttemptedAutoplay.current) return;
    if (!tracks.length || !settings.autoplay || !settings.enabled) return;

    hasAttemptedAutoplay.current = true;
    const audio = audioRef.current;
    if (!audio) return;

    const tryStartAudio = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          cleanupListeners();
        })
        .catch(() => {
          // Autoplay blocked by browser policy; wait for first user interaction
          attachInteractionListeners();
        });
    };

    const onUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
      cleanupListeners();
    };

    const attachInteractionListeners = () => {
      window.addEventListener('click', onUserInteraction, { once: true });
      window.addEventListener('touchstart', onUserInteraction, { once: true });
      window.addEventListener('keydown', onUserInteraction, { once: true });
    };

    const cleanupListeners = () => {
      window.removeEventListener('click', onUserInteraction);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('keydown', onUserInteraction);
    };

    tryStartAudio();

    return () => {
      cleanupListeners();
    };
  }, [tracks, settings.autoplay, settings.enabled]);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);
      if (!isNaN(audio.duration)) {
        setDuration(audio.duration);
      }

      // Check 30-second / custom duration preview mode limit
      const currentConfig = settingsRef.current;
      if (currentConfig.mode === 'preview30' && currentConfig.duration > 0) {
        if (cur >= currentConfig.duration) {
          if (currentConfig.action === 'next') {
            handleTrackEnded();
          } else {
            audio.pause();
            setIsPlaying(false);
            audio.currentTime = 0;
            setCurrentTime(0);
          }
        }
      }
    };

    audio.onended = () => {
      handleTrackEnded();
    };

    loadSettings();
    loadTracks();

    const handleReload = () => {
      loadSettings();
      loadTracks();
    };
    window.addEventListener('portfolio:reload_audio', handleReload);

    return () => {
      window.removeEventListener('portfolio:reload_audio', handleReload);
      audio.pause();
      audio.src = '';
    };
  }, [handleTrackEnded, loadTracks, loadSettings]);

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
        settings,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        toggleDrawer,
        closeDrawer,
        reloadTracks: loadTracks,
        updateSettings,
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
