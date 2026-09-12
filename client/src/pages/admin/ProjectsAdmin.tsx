import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  FolderGit2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Eye,
  Heart,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Project } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { Badge } from '../../components/ui/Badge';
import { StatsModal } from '../../components/admin/StatsModal';

export const ProjectsAdmin: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [statsProject, setStatsProject] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    id?: string;
    title: string;
    slug: string;
    shortDesc: string;
    fullDesc: string;
    coverImage: string;
    videoUrl: string;
    audioUrl: string;
    technologies: string;
    githubUrl: string;
    liveDemoUrl: string;
    client: string;
    date: string;
    category: string;
    featured: boolean;
    status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
    images: Array<{ url: string; caption?: string }>;
  }>({
    title: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    coverImage: '',
    videoUrl: '',
    audioUrl: '',
    technologies: '',
    githubUrl: '',
    liveDemoUrl: '',
    client: '',
    date: '2026',
    category: 'Web Application',
    featured: false,
    status: 'PUBLISHED',
    images: [],
  });

  const { success, error } = useToast();

  const loadProjects = () => {
    setLoading(true);
    api
      .get('/projects?status=ALL')
      .then((res) => setProjects(res.data.projects || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const openCreateModal = () => {
    setSelectedProject(null);
    setForm({
      title: '',
      slug: '',
      shortDesc: '',
      fullDesc: '',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      videoUrl: '',
      audioUrl: '',
      technologies: 'React, TypeScript, Node.js, PostgreSQL',
      githubUrl: 'https://github.com',
      liveDemoUrl: 'https://example.com',
      client: 'ScaleFlow Global',
      date: '2026',
      category: 'Cloud Systems',
      featured: false,
      status: 'PUBLISHED',
      images: [],
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setSelectedProject(p);
    let techString = p.technologies;
    try {
      const parsed = JSON.parse(p.technologies);
      if (Array.isArray(parsed)) techString = parsed.join(', ');
    } catch {}

    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc,
      coverImage: p.coverImage,
      videoUrl: p.videoUrl || '',
      audioUrl: p.audioUrl || '',
      technologies: techString,
      githubUrl: p.githubUrl || '',
      liveDemoUrl: p.liveDemoUrl || '',
      client: p.client || '',
      date: p.date || '',
      category: p.category,
      featured: p.featured,
      status: p.status,
      images: p.images ? p.images.map((img) => ({ url: img.url, caption: img.caption || '' })) : [],
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
      slug: !selectedProject ? generateSlug(val) : prev.slug,
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
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
        if (isCover) {
          setForm((prev) => ({ ...prev, coverImage: uploaded[0].url }));
        } else {
          const newImages = uploaded.map((m: any) => ({ url: m.url, caption: m.originalName }));
          setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
        success('Media uploaded and attached!');
      }
    } catch (err: any) {
      error(err.message || 'Media upload failed');
    }
  };

  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setForm((prev) => ({ ...prev, images: [...prev.images, { url, caption: '' }] }));
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const techArray = form.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      ...form,
      technologies: JSON.stringify(techArray),
    };

    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject.id}`, payload);
        success('Project updated successfully');
      } else {
        await api.post('/projects', payload);
        success('Project created successfully');
      }
      setModalOpen(false);
      loadProjects();
    } catch (err: any) {
      error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedProject) return;
    try {
      await api.delete(`/projects/${selectedProject.id}`);
      success('Project removed permanently');
      setDeleteModalOpen(false);
      loadProjects();
    } catch (err: any) {
      error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Content Management</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Projects & Case Studies
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Reactions & Views</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    Loading records...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                    No projects found. Click "Add New Project" to create one.
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={project.coverImage}
                          alt=""
                          className="w-12 h-8 rounded-lg object-cover bg-gray-900 border border-white/10"
                        />
                        <div>
                          <p className="font-bold text-white hover:text-cyan-300">
                            {project.title}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono">/{project.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">{project.category}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          project.status === 'PUBLISHED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : project.status === 'SCHEDULED'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {project.featured ? (
                        <span className="text-cyan-400 font-mono text-[11px]">★ Featured</span>
                      ) : (
                        <span className="text-gray-500 font-mono text-[11px]">Standard</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setStatsProject(project);
                          setStatsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all font-mono text-[11px] group"
                        title="Reaksiyalar va ko'rishlar sonini o'zgartirish (+/-)"
                      >
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{project.viewCount || 0}</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1 text-rose-400">
                          <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                          <span>{project.likeCount || 0}</span>
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-cyan-300 font-bold ml-0.5">±</span>
                      </button>
                    </td>
                    <td className="p-4 text-gray-400 font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProject(project);
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
        title={selectedProject ? 'Edit Project Details' : 'Create New Project'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Project Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. HyperCloud Telemetry System"
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
                placeholder="hypercloud-telemetry-system"
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-gray-900 text-white"
              >
                <option value="Cloud Systems">Cloud Systems</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="FinTech">FinTech</option>
                <option value="Web Application">Web Application</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Publication Status</label>
              <select
                value={form.status}
                onChange={(e: any) => setForm({ ...form, status: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2.5 text-xs bg-gray-900 text-white"
              >
                <option value="PUBLISHED">PUBLISHED (Live)</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs font-mono text-gray-300 cursor-pointer p-2.5 rounded-xl border border-white/10 hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span>Feature on Homepage</span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">Short Summary *</label>
            <textarea
              required
              rows={2}
              value={form.shortDesc}
              onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              placeholder="Brief summary displayed on project cards..."
              className="w-full glass-input rounded-xl px-4 py-2 text-xs"
            />
          </div>

          {/* Full Description (Markdown) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-300">
              Full Case Study (Markdown supported) *
            </label>
            <textarea
              required
              rows={6}
              value={form.fullDesc}
              onChange={(e) => setForm({ ...form, fullDesc: e.target.value })}
              placeholder="Detailed architecture description, engineering challenges, benchmarks..."
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono"
            />
          </div>

          {/* Media Links & Uploads */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Media Assets</h4>

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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Video Embed / MP4 URL</label>
                <input
                  type="text"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://.../demo.mp4"
                  className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                />
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400">Gallery / Carousel Images</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    + Add URL
                  </button>
                  <label className="text-xs text-cyan-400 hover:underline font-mono cursor-pointer">
                    + Upload Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-rose-950/80 text-rose-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Links & Specifications */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Specifications & URLs</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Live Demo URL</label>
                <input
                  type="text"
                  value={form.liveDemoUrl}
                  onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">GitHub URL</label>
                <input
                  type="text"
                  value={form.githubUrl}
                  onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">Client / Org</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="Company Name"
                  className="w-full glass-input rounded-xl px-4 py-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-gray-300">Technologies (Comma-separated)</label>
              <input
                type="text"
                value={form.technologies}
                onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                placeholder="React, TypeScript, Node.js, Redis, Docker"
                className="w-full glass-input rounded-xl px-4 py-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : selectedProject ? 'Update Project' : 'Publish Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Are you certain you wish to delete <span className="text-white font-bold">{selectedProject?.title}</span>? This destructive operation cannot be undone.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

      {/* STATS & REACTIONS MODAL */}
      {statsProject && (
        <StatsModal
          isOpen={statsModalOpen}
          onClose={() => {
            setStatsModalOpen(false);
            setStatsProject(null);
          }}
          title={statsProject.title}
          type="project"
          itemId={statsProject.id}
          initialViews={statsProject.viewCount || 0}
          initialLikes={statsProject.likeCount || 0}
          onSuccess={(newViews, newLikes) => {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === statsProject.id
                  ? { ...p, viewCount: newViews, likeCount: newLikes }
                  : p
              )
            );
          }}
        />
      )}
    </div>
  );
};
