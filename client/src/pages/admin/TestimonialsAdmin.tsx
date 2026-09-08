import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Quote,
  Upload,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ToggleLeft,
  ToggleRight,
  MessageSquareQuote,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Testimonial } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';

export const TestimonialsAdmin: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Testimonial | null>(null);

  // Homepage Section Toggle State
  const [sectionVisible, setSectionVisible] = useState(true);
  const [togglingSection, setTogglingSection] = useState(false);

  // Avatar Uploading State
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    clientName: '',
    role: 'Chief Technology Officer',
    company: 'Tech Corp',
    avatarUrl: '',
    content: '',
    rating: 5,
    sortOrder: 0,
    published: true,
  });

  const { success, error } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [testRes, settingsRes] = await Promise.all([
        api.get('/content/testimonials'),
        api.get('/content/settings'),
      ]);
      setTestimonials(testRes.data || []);

      if (settingsRes.data?.site?.enableSections) {
        try {
          const parsed = JSON.parse(settingsRes.data.site.enableSections);
          if (parsed.testimonials !== undefined) {
            setSectionVisible(parsed.testimonials);
          }
        } catch {}
      }
    } catch (err: any) {
      error(err.message || 'Maʼlumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toggle the entire Client Feedback section on the Homepage
  const handleToggleSection = async () => {
    setTogglingSection(true);
    const newVisibility = !sectionVisible;
    try {
      const settingsRes = await api.get('/content/settings');
      let currentSections: any = {};
      if (settingsRes.data?.site?.enableSections) {
        try {
          currentSections = JSON.parse(settingsRes.data.site.enableSections);
        } catch {}
      }

      currentSections.testimonials = newVisibility;

      await api.put('/content/settings', {
        seo: settingsRes.data?.seo || {},
        site: {
          theme: settingsRes.data?.site?.theme || 'dark',
          accentColor: settingsRes.data?.site?.accentColor || '#d6f779',
          enableSections: JSON.stringify(currentSections),
        },
      });

      setSectionVisible(newVisibility);
      if (newVisibility) {
        success('Client Feedback bo‘limi bosh sahifada yoqildi va ko‘rinmoqda!');
      } else {
        success('Client Feedback bo‘limi bosh sahifadan butunlay olib tashlandi / yashirildi!');
      }
    } catch (err: any) {
      error(err.message || 'Sozlamani saqlashda xatolik');
    } finally {
      setTogglingSection(false);
    }
  };

  const openCreate = () => {
    setSelectedItem(null);
    setForm({
      clientName: '',
      role: 'Product Lead / CTO',
      company: 'Tech Solutions Inc.',
      avatarUrl: '',
      content: '',
      rating: 5,
      sortOrder: testimonials.length,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setSelectedItem(t);
    setForm({
      clientName: t.clientName,
      role: t.role,
      company: t.company,
      avatarUrl: t.avatarUrl || '',
      content: t.content,
      rating: t.rating,
      sortOrder: t.sortOrder,
      published: t.published,
    });
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.media?.[0]?.url) {
        setForm((prev) => ({ ...prev, avatarUrl: res.data.media[0].url }));
        success('Mijoz surati yuklandi!');
      } else {
        error('Rasm serverga yuklanmadi');
      }
    } catch (err: any) {
      error(err.message || 'Rasm yuklashda xatolik');
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim() || !form.content.trim()) {
      error('Mijoz ismi va fikr matni kiritilishi shart');
      return;
    }

    try {
      if (selectedItem) {
        await api.put(`/content/testimonials/${selectedItem.id}`, form);
        success('Client feedback tahrirlandi!');
      } else {
        await api.post('/content/testimonials', form);
        success('Yangi client feedback muvaffaqiyatli qo‘shildi!');
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Saqlashda xatolik');
    }
  };

  // Quick toggle publish status for individual feedback
  const togglePublish = async (t: Testimonial) => {
    try {
      await api.put(`/content/testimonials/${t.id}`, {
        ...t,
        published: !t.published,
      });
      success(`"${t.clientName}" fikri ${!t.published ? 'saytda faollashtirildi' : 'yashirildi'}`);
      loadData();
    } catch (err: any) {
      error(err.message || 'Statusni o‘zgartirishda xatolik');
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Ushbu feedbackni butunlay o‘chirib tashlaysizmi?')) return;
    try {
      await api.delete(`/content/testimonials/${id}`);
      success('Feedback o‘chirildi');
      loadData();
    } catch (err: any) {
      error(err.message || 'O‘chirishda xatolik');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Client Endorsements</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Client Feedback CMS</h1>
          <p className="text-xs text-[#9d9f9e] mt-1 font-mono">
            Mijozlar fikrlarini qo‘shish, tahrirlash yoki saytdan butunlay olib tashlash.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Feedback Qo‘shish</span>
        </button>
      </div>

      {/* QUICK SECTION TOGGLE BANNER */}
      <div className="p-5 rounded-3xl glass-panel border border-[#343636] bg-[#191a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${sectionVisible ? 'bg-[#d6f779]/15 border-[#d6f779]/30 text-[#d6f779]' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>
            <MessageSquareQuote className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Bosh Sahifada Client Feedback Bo‘limi:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                sectionVisible
                  ? 'bg-[#d6f779]/20 text-[#d6f779] border border-[#d6f779]/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}>
                {sectionVisible ? 'Faol / Saytda Ko‘rinmoqda' : 'O‘chirilgan / Saytdan Olib Tashlangan'}
              </span>
            </h3>
            <p className="text-xs text-[#9d9f9e] mt-0.5">
              {sectionVisible
                ? 'Saytga tashrif buyuruvchilar bosh sahifada ushbu bo‘limni ko‘rishmoqda.'
                : 'Bo‘lim bosh sahifadan butunlay olib tashlangan (yashiringan).'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleSection}
          disabled={togglingSection}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all border shrink-0 ${
            sectionVisible
              ? 'bg-[#101111] hover:bg-[#151616] text-red-400 border-red-500/40 hover:border-red-500/60'
              : 'bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] border-[#d6f779]'
          }`}
        >
          {togglingSection ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : sectionVisible ? (
            <ToggleRight className="w-4 h-4" />
          ) : (
            <ToggleLeft className="w-4 h-4" />
          )}
          <span>
            {sectionVisible ? 'Saytdan Butunlay Olib Tashlash' : 'Saytda Ko‘rsatish'}
          </span>
        </button>
      </div>

      {/* FEEDBACK LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#9d9f9e] px-1">
          <span>Jami fikrlar: {testimonials.length} ta</span>
          <span>{testimonials.filter((t) => t.published).length} ta faol eʼlon qilingan</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-[#9d9f9e]">Mijoz fikrlari yuklanmoqda...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel border border-[#343636] text-center space-y-4 bg-[#191a1a]">
            <Quote className="w-10 h-10 text-[#9d9f9e] mx-auto opacity-50" />
            <h3 className="text-base font-bold text-white">Hozircha hech qanday feedback qo‘shilmagan</h3>
            <p className="text-xs text-[#9d9f9e] max-w-sm mx-auto">
              Mijozlaringizdan kelgan iliq fikrlar va tavsiyanomalarni qo‘shing.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] text-[#101111] font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Birinchi feedbackni qo‘shish</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={`p-6 rounded-3xl glass-card border transition-all space-y-4 relative bg-[#191a1a] ${
                  t.published ? 'border-[#343636] hover:border-[#d6f779]/40' : 'border-[#343636]/40 opacity-70'
                }`}
              >
                <Quote className="w-8 h-8 text-white/5 absolute top-6 right-6 pointer-events-none" />

                <div className="flex items-center justify-between">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-[#d6f779]">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublish(t)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        t.published
                          ? 'bg-[#d6f779]/10 text-[#d6f779] border-[#d6f779]/30 hover:bg-[#d6f779]/20'
                          : 'bg-white/5 text-[#9d9f9e] border-white/10 hover:text-white'
                      }`}
                      title={t.published ? 'Yashirish' : 'Saytda ko‘rsatish'}
                    >
                      {t.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-[#9d9f9e] hover:text-white hover:bg-white/5 transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(t.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-300 italic leading-relaxed">"{t.content}"</p>

                <div className="pt-3 border-t border-[#343636] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {t.avatarUrl ? (
                      <img src={t.avatarUrl} alt={t.clientName} className="w-9 h-9 rounded-full object-cover border border-[#343636] shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#101111] border border-[#343636] flex items-center justify-center text-[#d6f779] font-bold text-xs shrink-0">
                        {t.clientName.charAt(0)}
                      </div>
                    )}
                    <div className="truncate">
                      <h5 className="text-xs font-bold text-white truncate">{t.clientName}</h5>
                      <p className="text-[10px] text-[#9d9f9e] font-mono truncate">{t.role}, {t.company}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold shrink-0 ${
                    t.published ? 'bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30' : 'bg-white/5 text-[#9d9f9e] border border-white/5'
                  }`}>
                    {t.published ? 'Faol' : 'Yashirin'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem ? 'Client Feedbackni Tahrirlash' : 'Yangi Client Feedback Qo‘shish'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#EEEEEE]">Mijoz Ismi (Client Name) *</label>
              <input
                type="text"
                required
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Masalan: Alex Johnson"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#EEEEEE]">Kompaniya (Company) *</label>
              <input
                type="text"
                required
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Masalan: Fintech Global"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#EEEEEE]">Lavozimi (Role / Job Title)</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Masalan: CTO & Founder"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-[#EEEEEE]">Baholash (Rating: 1 - 5)</label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setForm({ ...form, rating: num })}
                    className={`p-1.5 rounded-lg border transition-all ${
                      num <= form.rating
                        ? 'text-[#d6f779] bg-[#d6f779]/15 border-[#d6f779]/40'
                        : 'text-[#9d9f9e] bg-[#101111] border-[#343636]'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Client Avatar upload or URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-[#EEEEEE]">Mijoz Surati (Avatar Image)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://.../avatar.jpg"
                className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 rounded-xl bg-[#191a1a] hover:bg-[#202222] border border-[#343636] text-xs font-mono text-white flex items-center gap-1.5"
              >
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d6f779]" /> : <Upload className="w-3.5 h-3.5 text-[#d6f779]" />}
                <span>Yuklash</span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Feedback Content */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#EEEEEE]">Mijoz Fikri (Feedback Content) *</label>
            <textarea
              rows={4}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Mijoz sizning ishingiz haqida nima dedi..."
              className="w-full glass-input rounded-xl px-3 py-2 text-xs"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#101111] border border-[#343636]">
            <div>
              <p className="text-xs font-bold text-white">Saytda darhol eʼlon qilish</p>
              <p className="text-[10px] text-[#9d9f9e]">O‘chirib qo‘yilsa, feedback faqat adminga ko‘rinadi</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border ${
                form.published
                  ? 'bg-[#d6f779]/20 text-[#d6f779] border-[#d6f779]/40'
                  : 'bg-white/5 text-[#9d9f9e] border-white/10'
              }`}
            >
              {form.published ? 'FAOL' : 'YASHIRIN'}
            </button>
          </div>

          <div className="pt-3 border-t border-[#343636] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-[#9d9f9e] hover:text-white font-mono"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
            >
              {selectedItem ? 'O‘zgarishlarni Saqlash' : 'Feedbackni Qo‘shish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
