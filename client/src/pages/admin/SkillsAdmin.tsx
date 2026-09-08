import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Code2, Check, X } from 'lucide-react';
import { api } from '../../lib/api';
import { Skill } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const SkillsAdmin: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [form, setForm] = useState({
    name: '',
    icon: 'Code',
    category: 'Frontend',
    percentage: 90,
    description: '',
    sortOrder: 0,
    published: true,
  });

  const { success, error } = useToast();

  const loadSkills = () => {
    setLoading(true);
    api
      .get('/content/skills')
      .then((res) => setSkills(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const openCreate = () => {
    setSelectedSkill(null);
    setForm({
      name: '',
      icon: 'Code',
      category: 'Frontend',
      percentage: 90,
      description: '',
      sortOrder: skills.length,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Skill) => {
    setSelectedSkill(s);
    setForm({
      name: s.name,
      icon: s.icon || 'Code',
      category: s.category,
      percentage: s.percentage,
      description: s.description || '',
      sortOrder: s.sortOrder,
      published: s.published,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedSkill) {
        await api.put(`/content/skills/${selectedSkill.id}`, form);
        success('Skill updated');
      } else {
        await api.post('/content/skills', form);
        success('Skill added');
      }
      setModalOpen(false);
      loadSkills();
    } catch (err: any) {
      error(err.message);
    }
  };

  const deleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await api.delete(`/content/skills/${id}`);
      success('Skill removed');
      loadSkills();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Technical Skills</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Skills & Capabilities CMS</h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl p-6">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">No skills added yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10">
                      {skill.percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">{skill.category}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(skill)}
                    className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSkill(skill.id)}
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
        title={selectedSkill ? 'Edit Skill' : 'Add New Skill'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300">Skill Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. React 19 / TypeScript"
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs bg-gray-900 text-white"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="DevOps">DevOps</option>
                <option value="Databases">Databases</option>
                <option value="Tools">Tools</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-300">Proficiency: {form.percentage}%</label>
              <input
                type="range"
                min={1}
                max={100}
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 mt-2"
              />
            </div>
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
              Save Skill
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
