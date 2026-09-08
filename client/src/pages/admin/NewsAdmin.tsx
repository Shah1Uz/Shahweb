import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Upload,
  Sparkles,
  Newspaper,
} from 'lucide-react';
import { api } from '../../lib/api';
import { News } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const NewsAdmin: React.FC = () => {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    shortDesc: string;
    fullContent: string;
    coverImage: string;
    videoUrl: string;
    audioUrl: string;
    category: string;
    tags: string;
    author: string;
    featured: boolean;
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    scheduledAtDate: string;
    scheduledAtTime: string;
    images: Array<{ url: string; caption?: string }>;
  }>({
    title: '',
    slug: '',
    shortDesc: '',
    fullContent: '',
    coverImage: '',
    videoUrl: '',
    audioUrl: '',
    category: 'Product Launch',
    tags: 'Launch, Distributed, Cloud',
    author: 'Shahzod',
    featured: false,
    status: 'PUBLISHED',
    scheduledAtDate: '',
    scheduledAtTime: '12:00',
    images: [],
  });

  const [timerEnabled, setTimerEnabled] = useState(true);
  const { success, error } = useToast();

  const loadSettings = () => {
    api
      .get('/content/settings')
      .then((res) => {
        if (res.data.site?.enableSections) {
          try {
            const parsed = JSON.parse(res.data.site.enableSections);
            setTimerEnabled(parsed.upcomingTimer !== false);
          } catch {}
        }
      })
      .catch(() => {});
  };

  const loadNews = () => {
    setLoading(true);
    api
      .get('/news?status=ALL')
      .then((res) => setNewsList(res.data.news || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
    loadSettings();
  }, []);

  const handleToggleTimer = async () => {
    try {
      const res = await api.get('/content/settings');
      let currentSections = {};
      if (res.data.site?.enableSections) {
        try {
          currentSections = JSON.parse(res.data.site.enableSections);
        } catch {}
      }
      const newStatus = !timerEnabled;
      const updated = { ...currentSections, upcomingTimer: newStatus };
      await api.put('/content/settings', {
        site: {
          enableSections: JSON.stringify(updated),
        },
      });
      setTimerEnabled(newStatus);
      success(
        newStatus
          ? 'Bosh sahifadagi Upcoming Countdown banner yoqildi!'
          : 'Bosh sahifadagi Upcoming Countdown banner o‘chirildi!'
      );
    } catch (err: any) {
      error(err.message || 'Failed to update timer toggle');
    }
  };

  const openCreateModal = () => {
    setSelectedNews(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    setForm({
      title: '',
      slug: '',
      shortDesc: '',
      fullContent: '',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      videoUrl: '',
      audioUrl: '',
      category: 'Product Launch',
      tags: 'Launch, Distributed, Cloud',
      author: 'Shahzod',
      featured: false,
      status: 'PUBLISHED',
      scheduledAtDate: dateStr,
      scheduledAtTime: '15:00',
      images: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (n: News) => {
    setSelectedNews(n);
    let schedDate = '';
    let schedTime = '12:00';
    if (n.scheduledAt) {
      const d = new Date(n.scheduledAt);
      schedDate = d.toISOString().split('T')[0];
      schedTime = d.toTimeString().slice(0, 5);
    }

    setForm({
      id: n.id,
      title: n.title,
      slug: n.slug,
      shortDesc: n.shortDesc,
      fullContent: n.fullContent,
      coverImage: n.coverImage,
      videoUrl: n.videoUrl || '',
      audioUrl: n.audioUrl || '',
      category: n.category,
      tags: n.tags || '',
      author: n.author,
      featured: n.featured,
      status: n.status as any,
      scheduledAtDate: schedDate,
      scheduledAtTime: schedTime,
      images: n.images ? n.images.map((img) => ({ url: img.url, caption: img.caption || '' })) : [],
    });
    setModalOpen(true);
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: !selectedNews ? generateSlug(val) : prev.slug,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data.media;
      if (uploaded && uploaded.length > 0) {
        setForm((prev) => ({ ...prev, coverImage: uploaded[0].url }));
        success('Cover image uploaded!');
      }
    } catch (err: any) {
      error(err.message || 'Media upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let scheduledAtIso: string | null = null;
    if (form.status === 'SCHEDULED' && form.scheduledAtDate) {
      scheduledAtIso = new Date(`${form.scheduledAtDate}T${form.scheduledAtTime}:00`).toISOString();
    }

    const payload = {
      ...form,
      scheduledAt: scheduledAtIso,
    };

    try {
      if (selectedNews) {
        await api.put(`/news/${selectedNews.id}`, payload);
        success('Announcement updated');
      } else {
        await api.post('/news', payload);
        success('Announcement published/scheduled');
      }
      setModalOpen(false);
      loadNews();
    } catch (err: any) {
      error(err.message || 'Failed to save news');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;
    try {
      await api.delete(`/news/${selectedNews.id}`);
      success('News deleted');
      setDeleteModalOpen(false);
      loadNews();
    } catch (err: any) {
      error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Content Management</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            News & Release Scheduler
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* QUICK TOGGLE: Homepage Upcoming Release Timer */}
      <div className="p-5 rounded-2xl bg-[#191a1a] border border-[#343636] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Homepage Upcoming Timer Banner</span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  timerEnabled
                    ? 'bg-[#d6f779]/15 text-[#d6f779] border-[#d6f779]/35'
                    : 'bg-red-500/15 text-red-400 border-red-500/30'
                }`}
              >
                {timerEnabled ? 'VISIBLE ON HOMEPAGE' : 'HIDDEN FROM HOMEPAGE'}
              </span>
            </div>
            <p className="text-xs text-[#9d9f9e] mt-0.5">
              Bosh sahifada (Home page) rejalashtirilgan reliz sanasi uchun orqaga hisoblash taymerini ko'rsatish yoki yashirish.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleTimer}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 ${
            timerEnabled
              ? 'bg-[#d6f779] text-[#101111] hover:bg-[#c3e665] shadow-lg shadow-[#d6f779]/20'
              : 'bg-[#343636] text-[#9d9f9e] hover:text-white border border-[#343636]'
          }`}
        >
          {timerEnabled ? "Taymerni O'chirish" : 'Taymerni Yoqish'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-panel border border-[#343636] overflow-hidden shadow-2xl bg-[#191a1a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Scheduled For</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    Loading records...
                  </td>
                </tr>
              ) : newsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    No news articles created yet.
                  </td>
                </tr>
              ) : (
                newsList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.coverImage}
                          alt=""
                          className="w-12 h-8 rounded-lg object-cover bg-gray-900 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white hover:text-purple-300">{item.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{item.category}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'SCHEDULED'
                            ? 'bg-purple-500/20 text-purple-300 animate-pulse'
                            : item.status === 'EXPIRED'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-400">
                      {item.scheduledAt ? (
                        <span className="text-purple-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.scheduledAt).toLocaleString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 font-mono text-gray-400">{item.viewCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/news/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                          title="Preview"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-500/10"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNews(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedNews ? 'Edit News / Release' : 'Create News & Schedule Publication'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Article Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Major Architecture Release v3.0"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">SEO Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="major-architecture-release-v3"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          {/* SCHEDULER CONTROLS */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs font-mono">
                <Clock className="w-4 h-4" />
                <span>PUBLICATION SCHEDULER & WORKFLOW</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'PUBLISHED' })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    form.status === 'PUBLISHED'
                      ? 'bg-emerald-500 text-black font-bold'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Publish Now
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'SCHEDULED' })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    form.status === 'SCHEDULED'
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Schedule for Later
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: 'DRAFT' })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                    form.status === 'DRAFT'
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Draft
                </button>
              </div>
            </div>

            {form.status === 'SCHEDULED' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-500/20">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-purple-300">Target Date</label>
                  <input
                    type="date"
                    required
                    value={form.scheduledAtDate}
                    onChange={(e) => setForm({ ...form, scheduledAtDate: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-purple-300">Target Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={form.scheduledAtTime}
                    onChange={(e) => setForm({ ...form, scheduledAtTime: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-gray-900 text-white"
              >
                <option value="Product Launch">Product Launch</option>
                <option value="Conferences">Conferences</option>
                <option value="Announcement">Announcement</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Author</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer p-2 rounded-xl border border-white/10 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded text-purple-500"
                />
                <span>Featured Countdown Card</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Short Summary *</label>
            <textarea
              required
              rows={2}
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Full Content (Markdown Supported)</label>
            <textarea
              rows={6}
              value={form.fullContent}
              onChange={(e) => setForm({ ...form, fullContent: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Cover Image URL *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="flex-1 glass-input rounded-xl px-4 py-2 text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer flex items-center gap-1 text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Demo Video URL (optional)</label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://.../video.mp4"
                className="w-full glass-input rounded-xl px-4 py-2 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : selectedNews ? 'Update News' : 'Save & Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Delete announcement <span className="text-white font-bold">{selectedNews?.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
