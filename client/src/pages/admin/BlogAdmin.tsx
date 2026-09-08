import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, BookOpen, Upload, Eye } from 'lucide-react';
import { api } from '../../lib/api';
import { BlogPost } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';

export const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [form, setForm] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Backend Architecture',
    tags: 'Node.js, Redis, Architecture',
    author: 'Shahzod',
    readingTime: '5 min read',
    seoTitle: '',
    seoDesc: '',
    status: 'PUBLISHED',
  });

  const { success, error } = useToast();

  const loadPosts = () => {
    setLoading(true);
    api
      .get('/blog?status=ALL')
      .then((res) => setPosts(res.data.posts || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const openCreateModal = () => {
    setSelectedPost(null);
    setForm({
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: `### Architectural Overview\n\nExplain the technical design pattern here...\n\n\`\`\`typescript\nexport async function handleRequest() {\n  // Code here\n}\n\`\`\``,
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      category: 'Backend Architecture',
      tags: 'Node.js, Redis, Microservices',
      author: 'Shahzod',
      readingTime: '5 min read',
      seoTitle: '',
      seoDesc: '',
      status: 'PUBLISHED',
    });
    setPreviewMode(false);
    setModalOpen(true);
  };

  const openEditModal = (p: BlogPost) => {
    setSelectedPost(p);
    let tagString = p.tags || '';
    try {
      const parsed = JSON.parse(p.tags || '[]');
      if (Array.isArray(parsed)) tagString = parsed.join(', ');
    } catch {}

    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      category: p.category,
      tags: tagString,
      author: p.author,
      readingTime: p.readingTime,
      seoTitle: p.seoTitle || '',
      seoDesc: p.seoDesc || '',
      status: p.status,
    });
    setPreviewMode(false);
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
      slug: !selectedPost ? generateSlug(val) : prev.slug,
      seoTitle: !selectedPost ? val : prev.seoTitle,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.media?.[0]?.url) {
        setForm((prev) => ({ ...prev, coverImage: res.data.media[0].url }));
        success('Cover image attached');
      }
    } catch (err: any) {
      error(err.message || 'Upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const tagArray = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      ...form,
      tags: JSON.stringify(tagArray),
    };

    try {
      if (selectedPost) {
        await api.put(`/blog/${selectedPost.id}`, payload);
        success('Article updated successfully');
      } else {
        await api.post('/blog', payload);
        success('Article created successfully');
      }
      setModalOpen(false);
      loadPosts();
    } catch (err: any) {
      error(err.message || 'Failed to save blog post');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      await api.delete(`/blog/${selectedPost.id}`);
      success('Article removed');
      setDeleteModalOpen(false);
      loadPosts();
    } catch (err: any) {
      error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">Content Management</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Technical Articles & Blog CMS
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4">Article</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reading Time</th>
                <th className="p-4">Views</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    Loading articles...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    No articles found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.coverImage}
                          alt=""
                          className="w-12 h-8 rounded-lg object-cover bg-gray-900 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white hover:text-emerald-300">{post.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{post.category}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-mono">{post.readingTime}</td>
                    <td className="p-4 text-gray-400 font-mono">{post.viewCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPost(post);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
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
        title={selectedPost ? 'Edit Technical Article' : 'Write Technical Article'}
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
                placeholder="e.g. Distributed Consensus in Node.js"
                className="w-full glass-input rounded-xl px-4 py-2 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">SEO Slug *</label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="distributed-consensus-nodejs"
                className="w-full glass-input rounded-xl px-4 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-gray-900 text-white"
              >
                <option value="Backend Architecture">Backend Architecture</option>
                <option value="Frontend Engineering">Frontend Engineering</option>
                <option value="DevOps & Cloud">DevOps & Cloud</option>
                <option value="Distributed Systems">Distributed Systems</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Reading Time</label>
              <input
                type="text"
                value={form.readingTime}
                onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                placeholder="5 min read"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-gray-900 text-white"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Excerpt / Brief Summary *</label>
            <textarea
              required
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>

          {/* Markdown Content Editor with Live Preview Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-gray-300">Article Content (Markdown supported) *</label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:underline font-mono"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewMode ? 'Switch to Editor' : 'Live Markdown Preview'}</span>
              </button>
            </div>

            {previewMode ? (
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 max-h-96 overflow-y-auto">
                <MarkdownRenderer content={form.content} />
              </div>
            ) : (
              <textarea
                required
                rows={10}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono leading-relaxed"
                placeholder="Write in Markdown with ```ts code blocks, ### headings, - bullet lists..."
              />
            )}
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
              <label className="text-xs font-mono text-gray-300">Tags (Comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Node.js, PostgreSQL, Architecture"
                className="w-full glass-input rounded-xl px-4 py-2 text-xs font-mono"
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : selectedPost ? 'Update Post' : 'Publish Article'}
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
            Permanently remove <span className="text-white font-bold">{selectedPost?.title}</span>?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-xs text-gray-400">
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
