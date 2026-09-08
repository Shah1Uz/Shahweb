import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Service } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const ServicesAdmin: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    icon: 'Layers',
    features: 'React, TypeScript, Architecture, Automated Tests',
    sortOrder: 0,
    published: true,
  });

  const { success, error } = useToast();

  const loadServices = () => {
    setLoading(true);
    api
      .get('/content/services')
      .then((res) => setServices(res.data || []))
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreate = () => {
    setSelectedService(null);
    setForm({
      title: '',
      description: '',
      icon: 'Layers',
      features: 'Enterprise Architecture, Type Safety, Zero Downtime',
      sortOrder: services.length,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setSelectedService(s);
    let featString = s.features;
    try {
      const parsed = JSON.parse(s.features);
      if (Array.isArray(parsed)) featString = parsed.join(', ');
    } catch {}

    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon,
      features: featString,
      sortOrder: s.sortOrder,
      published: s.published,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const featArray = form.features.split(',').map((f) => f.trim()).filter(Boolean);
    const payload = {
      ...form,
      features: JSON.stringify(featArray),
    };

    try {
      if (selectedService) {
        await api.put(`/content/services/${selectedService.id}`, payload);
        success('Service updated');
      } else {
        await api.post('/content/services', payload);
        success('Service created');
      }
      setModalOpen(false);
      loadServices();
    } catch (err: any) {
      error(err.message);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Delete service?')) return;
    try {
      await api.delete(`/content/services/${id}`);
      success('Service deleted');
      loadServices();
    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Offerings</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Services & Deliverables CMS</h1>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => {
          let feats: string[] = [];
          try {
            feats = JSON.parse(s.features);
          } catch {}

          return (
            <div
              key={s.id}
              className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteService(s.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-1.5">
                {feats.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px] text-gray-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300">Service Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300">Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300">Features (Comma-separated)</label>
            <input
              type="text"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Next.js, TypeScript, Microservices, Testing"
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
              Save Service
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
