import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Music,
  Play,
  Pause,
  Upload,
  Loader2,
  Edit3,
  Volume2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { AudioTrack } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const AudioAdmin: React.FC = () => {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<AudioTrack | null>(null);

  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<HTMLAudioElement | null>(null);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const modalAudioInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    artist: 'Shahzod Beats',
    coverUrl: '',
    audioUrl: '',
    duration: '3:00',
    description: '',
    published: true,
  });

  const { success, error } = useToast();

  const loadTracks = () => {
    setLoading(true);
    api
      .get('/audio')
      .then((res) => setTracks(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTracks();
    return () => {
      if (activeAudio) activeAudio.pause();
    };
  }, []);

  const notifyPlayerReload = () => {
    window.dispatchEvent(new Event('portfolio:reload_audio'));
  };

  const togglePreview = (track: AudioTrack) => {
    if (activeAudio && previewTrackId === track.id) {
      activeAudio.pause();
      setActiveAudio(null);
      setPreviewTrackId(null);
    } else {
      if (activeAudio) activeAudio.pause();
      const audio = new Audio(track.audioUrl);
      audio.play().catch(() => {});
      audio.onended = () => {
        setPreviewTrackId(null);
        setActiveAudio(null);
      };
      setActiveAudio(audio);
      setPreviewTrackId(track.id);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '3:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Safe duration extractor with 1.5s timeout to NEVER hang
  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve('3:00');
        }
      }, 1500);

      try {
        const tempAudio = new Audio();
        tempAudio.src = URL.createObjectURL(file);
        tempAudio.onloadedmetadata = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              resolve(formatDuration(tempAudio.duration));
            } else {
              resolve('3:00');
            }
          }
        };
        tempAudio.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve('3:00');
          }
        };
        tempAudio.load();
      } catch {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve('3:00');
        }
      }
    });
  };

  // Parse title and artist from filename
  const parseAudioFilename = (filename: string) => {
    const raw = filename.replace(/\.[^/.]+$/, '').trim();
    let artist = 'Shahzod Beats';
    let title = raw;

    if (raw.includes(' - ')) {
      const parts = raw.split(' - ');
      artist = parts[0].trim() || artist;
      title = parts.slice(1).join(' - ').trim();
    } else if (raw.includes('   ')) {
      const parts = raw.split(/\s{2,}/);
      title = parts[0].trim();
      artist = parts[1]?.trim() || artist;
    }

    return {
      title: title || raw || 'Audio Track',
      artist: artist || 'Shahzod Beats',
    };
  };

  // CORE UPLOADER: Handles 1 or multiple files and IMMEDIATELY creates them in the database!
  const processAndUploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setUploadingAudio(true);
    setUploadStatusText(`${files.length} ta audio fayl serverga yuklanmoqda...`);

    try {
      // 1. Measure durations in parallel with safety timeout
      const durations = await Promise.all(files.map((f) => getAudioDuration(f)));

      // 2. Upload files to /media/upload
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedMedia: Array<{ url: string; originalName: string }> = res.data.media || [];
      if (!uploadedMedia.length) {
        throw new Error('Serverdan yuklangan fayllar qaytmadi');
      }

      // 3. Prepare track entries
      const newTracks = uploadedMedia.map((m, idx) => {
        const parsed = parseAudioFilename(m.originalName);
        return {
          title: parsed.title,
          artist: parsed.artist,
          coverUrl: null,
          audioUrl: m.url,
          duration: durations[idx] || '3:00',
          description: 'Original soundtrack beat',
          published: true,
          sortOrder: tracks.length + idx,
        };
      });

      // 4. Save directly to database
      await api.post('/audio', newTracks);

      const msg =
        files.length === 1
          ? `"${newTracks[0].title}" muvaffaqiyatli yuklandi va pleylistga qo‘shildi!`
          : `${files.length} ta musiqa bir vaqtda muvaffaqiyatli yuklandi va pleylistga qo‘shildi!`;
      success(msg);

      notifyPlayerReload();
      loadTracks();
      setModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Musiqani yuklashda xatolik yuz berdi');
    } finally {
      setUploadingAudio(false);
      setUploadStatusText(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAndUploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f) =>
          f.type.startsWith('audio/') ||
          /\.(mp3|wav|m4a|aac|ogg|flac|weba)$/i.test(f.name)
      );
      if (files.length > 0) {
        processAndUploadFiles(files);
      } else {
        error('Faqat audio fayllarni (.mp3, .m4a, .wav, .aac, .ogg) tashlang');
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCover(true);
    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.media?.[0]?.url) {
        setForm((prev) => ({ ...prev, coverUrl: res.data.media[0].url }));
        success('Muqova rasmi yuklandi!');
      }
    } catch (err: any) {
      error(err.message || 'Rasm yuklashda xatolik');
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const openNewTrackModal = () => {
    setEditingTrack(null);
    setForm({
      title: '',
      artist: 'Shahzod Beats',
      coverUrl: '',
      audioUrl: '',
      duration: '3:00',
      description: '',
      published: true,
    });
    setModalOpen(true);
  };

  const openEditTrackModal = (track: AudioTrack) => {
    setEditingTrack(track);
    setForm({
      title: track.title,
      artist: track.artist || 'Shahzod Beats',
      coverUrl: track.coverUrl || '',
      audioUrl: track.audioUrl,
      duration: track.duration || '3:00',
      description: track.description || '',
      published: track.published,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.audioUrl.trim()) {
      error('Trek nomi va audio fayli talab qilinadi');
      return;
    }

    try {
      if (editingTrack) {
        await api.put(`/audio/${editingTrack.id}`, form);
        success('Trek muvaffaqiyatli tahrirlandi!');
      } else {
        await api.post('/audio', form);
        success('Audio trek mini-playerga qo‘shildi!');
      }
      notifyPlayerReload();
      setModalOpen(false);
      loadTracks();
    } catch (err: any) {
      error(err.message || 'Trekni saqlashda xatolik');
    }
  };

  const togglePublished = async (track: AudioTrack) => {
    try {
      await api.put(`/audio/${track.id}`, { published: !track.published });
      success(track.published ? 'Trek pleerda yashirildi' : 'Trek pleerda faollashtirildi');
      notifyPlayerReload();
      loadTracks();
    } catch (err: any) {
      error(err.message || 'Holatni o‘zgartirishda xatolik');
    }
  };

  const deleteTrack = async (id: string) => {
    if (!confirm('Trekni pleylistdan o‘chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/audio/${id}`);
      success('Trek o‘chirildi');
      notifyPlayerReload();
      loadTracks();
    } catch (err: any) {
      error(err.message || 'O‘chirishda xatolik');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input for main direct device upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*, .mp3, .wav, .m4a, .aac, .ogg, .flac, .weba"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779] flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            Audio Experience & Mini Player
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Soundtrack & Pleylist CMS
          </h1>
          <p className="text-xs text-[#9d9f9e] mt-1 font-mono">
            Qurilmangizdan bitta yoki birdaniga bir nechta musiqalarni tanlang — avtomatik saqlanib pleylistga qo‘shiladi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAudio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
          >
            {uploadingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Qurilmadan Yuklash (1+ music)</span>
          </button>

          <button
            onClick={openNewTrackModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#191a1a] hover:bg-[#202222] border border-[#343636] hover:border-[#d6f779]/40 text-white font-bold text-xs transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#d6f779]" />
            <span>Qo‘lda Kiritish</span>
          </button>
        </div>
      </div>

      {/* PROMINENT DIRECT DRAG & DROP UPLOAD ZONE */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-3xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group ${
          isDragOver
            ? 'border-[#d6f779] bg-[#d6f779]/15 scale-[1.01]'
            : 'border-[#343636] hover:border-[#d6f779]/60 bg-[#151616]/80 hover:bg-[#191a1a]'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-[#101111] border border-[#343636] group-hover:border-[#d6f779]/40 flex items-center justify-center text-[#d6f779] shadow-xl mb-3 group-hover:scale-110 transition-transform">
          {uploadingAudio ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#d6f779]" />
          ) : (
            <Upload className="w-8 h-8 text-[#d6f779]" />
          )}
        </div>

        <h3 className="text-base font-bold text-white tracking-tight">
          {uploadingAudio
            ? uploadStatusText || 'Musiqalar serverga yuklanmoqda...'
            : 'Qurilmangizdagi musiqa faylini bu yerga tashlang yoki bosing'}
        </h3>
        <p className="text-xs text-[#9d9f9e] font-mono mt-1.5 max-w-md">
          Bir vaqtda 1 ta, 2 ta yoki undan ko‘p fayllarni (.mp3, .m4a, .wav, .aac, .ogg) tanlashingiz mumkin. Ular darhol pleylistga kiritiladi!
        </p>

        {uploadingAudio && (
          <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d6f779]/20 border border-[#d6f779]/30 text-[#d6f779] text-xs font-mono font-bold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Yuklanmoqda va pleylist yangilanmoqda...</span>
          </div>
        )}
      </div>

      {/* TRACKS LIST */}
      <div className="rounded-3xl glass-panel border border-[#343636] overflow-hidden shadow-2xl p-6 bg-[#191a1a]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#343636] text-xs font-mono text-[#9d9f9e]">
          <span className="font-bold text-white">Pleylistdagi Treklar ({tracks.length} ta)</span>
          <span>1-musiqa tugagach avtomatik 2-chisiga o‘tadi</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-[#9d9f9e] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#d6f779]" />
            <span>Musiqalar yuklanmoqda...</span>
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#9d9f9e] font-mono">
            Hozircha hech qanday audio trek yuklanmagan. Yuqoridagi blok orqali musiqalaringizni yuklang!
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, idx) => {
              const isPlaying = previewTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                    isPlaying
                      ? 'border-[#d6f779] bg-[#d6f779]/10 shadow-lg shadow-[#d6f779]/5'
                      : 'border-[#343636] hover:border-[#d6f779]/40 bg-[#101111]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-[#9d9f9e] w-6 text-center shrink-0">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>

                    <button
                      onClick={() => togglePreview(track)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 shrink-0 shadow-md ${
                        isPlaying
                          ? 'bg-[#d6f779] text-[#101111]'
                          : 'bg-[#d6f779]/15 hover:bg-[#d6f779]/25 text-[#d6f779] border border-[#d6f779]/30'
                      }`}
                      title={isPlaying ? 'Pauza' : 'Eshitib ko‘rish'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#151616] border border-[#343636] shrink-0 flex items-center justify-center">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-5 h-5 text-[#d6f779]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                      <p className="text-xs text-[#9d9f9e] font-mono truncate">
                        {track.artist || 'Shahzod Beats'} • {track.duration || '3:00'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => togglePublished(track)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-mono border font-semibold transition-all ${
                        track.published
                          ? 'bg-[#d6f779]/15 text-[#d6f779] border-[#d6f779]/30 hover:bg-[#d6f779]/25'
                          : 'bg-[#191a1a] text-[#9d9f9e] border-[#343636] hover:text-white'
                      }`}
                      title="Saytdagi pleyerda ko‘rsatish/yashirish"
                    >
                      {track.published ? 'Pleerda Faol' : 'Yashirilgan'}
                    </button>

                    <button
                      onClick={() => openEditTrackModal(track)}
                      className="p-2 rounded-xl text-[#9d9f9e] hover:text-white hover:bg-[#191a1a] border border-transparent hover:border-[#343636] transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTrack(track.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MANUAL ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTrack ? 'Trekni Tahrirlash' : 'Yangi Trek Qo‘shish (Qo‘lda)'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* UPLOAD FILE FOR MODAL */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#EEEEEE] font-bold block">
              Audio Fayl (Qurilmadan yoki URL orqali) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                placeholder="https://.../music.mp3 yoki qurilmadan yuklang"
                className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => modalAudioInputRef.current?.click()}
                disabled={uploadingAudio}
                className="px-4 py-2.5 rounded-xl bg-[#191a1a] hover:bg-[#202222] border border-[#343636] text-xs font-mono text-white flex items-center gap-1.5 shrink-0"
              >
                {uploadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#d6f779]" />
                ) : (
                  <Upload className="w-4 h-4 text-[#d6f779]" />
                )}
                <span>Yuklash</span>
              </button>
              <input
                ref={modalAudioInputRef}
                type="file"
                accept="audio/*, .mp3, .wav, .m4a, .aac, .ogg, .flac, .weba"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingAudio(true);
                  try {
                    const durationStr = await getAudioDuration(file);
                    const parsed = parseAudioFilename(file.name);
                    const formData = new FormData();
                    formData.append('files', file);
                    const res = await api.post('/media/upload', formData, {
                      headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (res.data.media?.[0]?.url) {
                      setForm((prev) => ({
                        ...prev,
                        audioUrl: res.data.media[0].url,
                        title: prev.title.trim() ? prev.title : parsed.title,
                        artist: prev.artist && prev.artist !== 'Shahzod Beats' ? prev.artist : parsed.artist,
                        duration: durationStr,
                      }));
                      success('Audio fayl serverga yuklandi!');
                    }
                  } catch (err: any) {
                    error(err.message || 'Yuklashda xatolik');
                  } finally {
                    setUploadingAudio(false);
                    if (e.target) e.target.value = '';
                  }
                }}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#EEEEEE]">Trek Nomi (Title) *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Masalan: Around Me ft. Don Toliver"
              className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#EEEEEE]">Ijrochi (Artist)</label>
              <input
                type="text"
                value={form.artist}
                onChange={(e) => setForm({ ...form, artist: e.target.value })}
                placeholder="Metro Boomin / Shahzod Beats"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#EEEEEE]">Davomiyligi (Duration)</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="3:12"
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#EEEEEE]">Muqova Rasmi (Cover Image)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                placeholder="https://.../cover.jpg"
                className="flex-1 glass-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={uploadingCover}
                className="px-4 py-2.5 rounded-xl bg-[#191a1a] hover:bg-[#202222] border border-[#343636] text-xs font-mono text-white flex items-center gap-1.5 shrink-0"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d6f779]" />
                ) : (
                  <Upload className="w-3.5 h-3.5 text-[#d6f779]" />
                )}
                <span>Rasm</span>
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#343636] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-[#9d9f9e] hover:text-white font-mono"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={uploadingAudio || !form.audioUrl.trim() || !form.title.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            >
              {editingTrack ? 'O‘zgarishlarni Saqlash' : 'Trekni Saqlash'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
