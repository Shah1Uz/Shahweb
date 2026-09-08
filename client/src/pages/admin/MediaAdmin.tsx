import React, { useState, useEffect } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  HardDrive,
  Filter,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Media } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { formatBytes } from '../../lib/utils';

export const MediaAdmin: React.FC = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [totalBytes, setTotalBytes] = useState(0);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadMedia = () => {
    setLoading(true);
    let url = `/media?`;
    if (typeFilter !== 'ALL') url += `type=${typeFilter}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    api
      .get(url)
      .then((res) => {
        setMediaList(res.data.media || []);
        setTotalBytes(res.data.totalBytes || 0);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, [typeFilter, search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      success(`Successfully uploaded ${files.length} asset(s)`);
      loadMedia();
    } catch (err: any) {
      error(err.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    success('Asset URL copied to clipboard');
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this media file?')) return;
    try {
      await api.delete(`/media/${id}`);
      success('File deleted from server');
      loadMedia();
    } catch (err: any) {
      error(err.message || 'Delete failed');
    }
  };

  const renderIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-cyan-400" />;
    if (mime.startsWith('video/')) return <Video className="w-5 h-5 text-purple-400" />;
    if (mime.startsWith('audio/')) return <Music className="w-5 h-5 text-indigo-400" />;
    return <FileText className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Assets & Storage</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Media Library & Storage CMS
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Total disk storage: <span className="text-cyan-300 font-bold">{formatBytes(totalBytes)}</span> across {mediaList.length} files
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'Uploading Files...' : 'Upload Media'}</span>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'image', 'video', 'audio', 'document'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all capitalize ${
                typeFilter === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {t === 'ALL' ? 'All Formats' : `${t}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Grid of Media Assets */}
      {loading ? (
        <div className="py-20 text-center text-sm font-mono text-gray-400">Loading media library...</div>
      ) : mediaList.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <HardDrive className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-base text-gray-300">No media assets found in library.</p>
          <p className="text-xs text-gray-500">Upload JPG, PNG, WEBP, MP4, MP3, or PDF files above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl glass-card border border-white/10 overflow-hidden flex flex-col justify-between"
            >
              {/* Asset Preview Thumbnail */}
              <div
                onClick={() => setPreviewMedia(item)}
                className="relative aspect-square bg-gray-950 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                {item.mimeType.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : item.mimeType.startsWith('video/') ? (
                  <div className="flex flex-col items-center gap-1 text-purple-400">
                    <Video className="w-8 h-8" />
                    <span className="text-[10px] font-mono">Video</span>
                  </div>
                ) : item.mimeType.startsWith('audio/') ? (
                  <div className="flex flex-col items-center gap-1 text-indigo-400">
                    <Music className="w-8 h-8" />
                    <span className="text-[10px] font-mono">Audio</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-emerald-400">
                    <FileText className="w-8 h-8" />
                    <span className="text-[10px] font-mono">Document</span>
                  </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(item.url, item.id);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-cyan-500 text-white transition-colors"
                    title="Copy Link"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMedia(item.id);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-rose-500 text-white transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details footer */}
              <div className="p-2.5 space-y-0.5 border-t border-white/5">
                <p className="text-[11px] font-medium text-white truncate" title={item.originalName}>
                  {item.originalName}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  <span>{formatBytes(item.size)}</span>
                  <span>{item.mimeType.split('/')[1]?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.originalName || 'Asset Inspector'}
        maxWidth="max-w-3xl"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh]">
              {previewMedia.mimeType.startsWith('image/') ? (
                <img src={previewMedia.url} alt="" className="max-w-full max-h-[55vh] object-contain" />
              ) : previewMedia.mimeType.startsWith('video/') ? (
                <video src={previewMedia.url} controls className="w-full max-h-[55vh]" />
              ) : previewMedia.mimeType.startsWith('audio/') ? (
                <div className="p-8 w-full text-center">
                  <audio src={previewMedia.url} controls className="w-full" />
                </div>
              ) : (
                <div className="p-12 text-center text-gray-300 font-mono text-xs">
                  PDF / Document asset available at URL.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-xs font-mono text-gray-400">
                <span>Size: {formatBytes(previewMedia.size)}</span> •{' '}
                <span>Uploaded: {new Date(previewMedia.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => copyUrl(previewMedia.url, previewMedia.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-mono hover:bg-cyan-500/30 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Asset URL</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
