import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Briefcase, GraduationCap } from 'lucide-react';
import { api } from '../../lib/api';
import { Experience } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const ExperienceAdmin: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Experience | null>(null);

  const [form, setForm] = useState({
    type: 'WORK',
    role: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    sortOrder: 0,
  });

  const { success, error } = useToast();

  const loadExperiences = () => {
    setLoading(true);
    api
      .get('/content/experiences')
      .then((res) => setExperiences(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  const openCreate = () => {
    setSelectedItem(null);
    setForm({
      type: 'WORK',
      role: '',
      organization: '',
      location: 'Remote',
      startDate: '2024',
      endDate: 'Present',
      current: true,
      description: '',
      sortOrder: experiences.length,
    });
    setModalOpen(true);
  };

  const openEdit = (item: Experience) => {
    setSelectedItem(item);
    setForm({
      type: item.type,
      role: item.role,
      organization: item.organization,
      location: item.location || '',
      startDate: item.startDate,
      endDate: item.endDate || '',
      current: item.current,
      description: item.description,
      sortOrder: item.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/content/experiences/${selectedItem.id}`, form);
        success('Record updated');
      } else {
        await api.post('/content/experiences', form);
        success('Record added');
      }
      setModalOpen(false);
      loadExperiences();
    } catch (err: any) {
      error(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/content/experiences/${id}`);
      success('Record deleted');
      loadExperiences();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Career & Journey</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Experience & Education CMS</h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">Loading timeline...</div>
        ) : experiences.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 font-mono">No records yet.</div>
        ) : (
          <div className="space-y-3">
            {experiences.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
                    {item.type === 'WORK' ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.role}</h4>
                    <p className="text-xs font-mono text-cyan-300">
                      {item.organization} • {item.startDate} - {item.current ? 'Present' : item.endDate}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem ? 'Edit Career Record' : 'Add Career Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-gray-900 text-white"
              >
                <option value="WORK">Work Experience</option>
                <option value="EDUCATION">Education & Degree</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Role / Degree Title *</label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Principal Architect"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Organization / University *</label>
              <input
                type="text"
                required
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="San Francisco, CA (Remote)"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Start Date</label>
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                placeholder="2022"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">End Date</label>
              <input
                type="text"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                placeholder="Present"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300">Description of Responsibilities</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 font-mono"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
