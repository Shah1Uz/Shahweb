import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Archive,
  Search,
  CheckCircle2,
  Reply,
  Calendar,
  User,
  Send,
  Sparkles,
  X,
  Check,
} from 'lucide-react';
import { api } from '../../lib/api';
import { ContactMessage } from '../../types';
import { useToast } from '../../components/ui/Toast';

export const MessagesAdmin: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  // Reply Composer State
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const { success, error } = useToast();

  const loadMessages = () => {
    setLoading(true);
    let url = `/messages?`;
    if (filter !== 'all') url += `filter=${filter}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    api
      .get(url)
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, [filter, search]);

  const toggleRead = async (msg: ContactMessage) => {
    try {
      await api.patch(`/messages/${msg.id}/status`, { isRead: !msg.isRead });
      loadMessages();
      if (selectedMsg?.id === msg.id) {
        setSelectedMsg({ ...msg, isRead: !msg.isRead });
      }
    } catch (err: any) {
      error(err.message);
    }
  };

  const toggleArchive = async (msg: ContactMessage) => {
    try {
      await api.patch(`/messages/${msg.id}/status`, { isArchived: !msg.isArchived });
      success(msg.isArchived ? 'Unarchived' : 'Message archived');
      loadMessages();
      if (selectedMsg?.id === msg.id) setSelectedMsg(null);
    } catch (err: any) {
      error(err.message);
    }
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Permanently delete this inquiry?')) return;
    try {
      await api.delete(`/messages/${id}`);
      success('Message deleted');
      loadMessages();
      if (selectedMsg?.id === id) setSelectedMsg(null);
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleOpenReply = (msg: ContactMessage) => {
    setReplySubject(`Re: ${msg.subject}`);
    setReplyText('');
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMsg || !replyText.trim()) {
      error('Iltimos, javob matnini kiriting');
      return;
    }
    setSendingReply(true);
    try {
      const res = await api.post(`/messages/${selectedMsg.id}/reply`, {
        replySubject,
        replyText,
      });
      if (res.data.isTest) {
        error(res.data.message);
      } else {
        success(res.data.message || 'Javob xati mijozning elektron pochtasiga yetkazildi!');
      }
      setReplyOpen(false);
      setReplyText('');
      if (res.data.contactMessage) {
        setSelectedMsg(res.data.contactMessage);
      }
      loadMessages();
    } catch (err: any) {
      error(err.message || 'Javob yuborishda xatolik yuz berdi');
    } finally {
      setSendingReply(false);
    }
  };

  const applyTemplate = (type: 'uz' | 'en' | 'ru') => {
    if (!selectedMsg) return;
    if (type === 'uz') {
      setReplyText(
        `Assalomu alaykum, ${selectedMsg.name}!\n\n` +
        `Shahzod.site orqali qoldirgan murojaatingiz uchun tashakkur.\n` +
        `Loyihangiz tafsilotlarini ko'rib chiqdim. Ushbu yo'nalishda sizga yordam berishdan mamnun bo'laman.\n\n` +
        `Qo'shimcha savollaringiz bo'lsa yoki batafsil gaplashib olish uchun ushbu xatga javob yozishingiz yoki Telegram orqali bog'lanishingiz mumkin.\n\n` +
        `Hurmat bilan,\nShahzod`
      );
    } else if (type === 'en') {
      setReplyText(
        `Hi ${selectedMsg.name},\n\n` +
        `Thank you for reaching out via Shahzod.site!\n` +
        `I have reviewed your inquiry regarding "${selectedMsg.subject}". I would be thrilled to assist you with your project requirements.\n\n` +
        `Feel free to reply to this email or schedule a call if you'd like to discuss the next steps.\n\n` +
        `Best regards,\nShahzod`
      );
    } else if (type === 'ru') {
      setReplyText(
        `Здравствуйте, ${selectedMsg.name}!\n\n` +
        `Спасибо за ваше обращение через Shahzod.site.\n` +
        `Я ознакомился с вашим сообщением по поводу "${selectedMsg.subject}". Буду рад помочь в реализации вашего проекта.\n\n` +
        `Если у вас есть дополнительные вопросы или детали, можете просто ответить на это письмо.\n\n` +
        `С уважением,\nШахзод`
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-rose-400">Communication</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Contact Messages Inbox</h1>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          {['all', 'unread', 'read', 'archived'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all capitalize ${
                filter === f
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sender, subject..."
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Master-Detail Inbox View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-gray-400">Loading inbox...</div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-gray-500 glass-card rounded-2xl p-6">
              No messages found.
            </div>
          ) : (
            messages.map((m) => {
              const isSelected = selectedMsg?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMsg(m);
                    if (!m.isRead) toggleRead(m);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/40 shadow-lg shadow-rose-500/10'
                      : !m.isRead
                      ? 'bg-gray-900/90 border-rose-500/30 font-semibold'
                      : 'glass-card border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-white font-bold truncate">{m.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {m.replySent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Replied
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-rose-300 font-medium truncate">{m.subject}</p>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">{m.message}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Message Reader Pane */}
        <div className="lg:col-span-7">
          {selectedMsg ? (
            <div className="p-8 rounded-3xl glass-panel border border-white/10 shadow-2xl space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedMsg.subject}</h3>
                    {selectedMsg.replySent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Replied
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mt-1">
                    <span className="text-gray-200">From: {selectedMsg.name}</span>
                    <span>&lt;{selectedMsg.email}&gt;</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReply(selectedMsg)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#0c0d0e] font-bold text-xs shadow-lg shadow-[#d6f779]/20 transition-all active:scale-95"
                    title="Reply via Email"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reply</span>
                  </button>
                  <button
                    onClick={() => toggleArchive(selectedMsg)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMsg(selectedMsg.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                  Original Inquiry:
                </span>
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans p-4 rounded-2xl bg-black/30 border border-white/5">
                  {selectedMsg.message}
                </div>
              </div>

              {/* Previous Reply History if already replied */}
              {selectedMsg.replySent && selectedMsg.replyText && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                    <span className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Yuborilgan javob xati (Sent Reply)
                    </span>
                    {selectedMsg.repliedAt && (
                      <span className="text-[10px] text-emerald-400/80">
                        {new Date(selectedMsg.repliedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-100 whitespace-pre-wrap font-sans pl-2 border-l-2 border-emerald-500/50">
                    {selectedMsg.replyText}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenReply(selectedMsg)}
                      className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" /> Yana javob yuborish
                    </button>
                  </div>
                </div>
              )}

              {/* Reply Composer Form */}
              {replyOpen && (
                <div className="p-5 rounded-2xl bg-black/80 border border-[#d6f779]/40 space-y-4 shadow-2xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d6f779] animate-pulse" />
                      <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                        Javob Yozish • Shahzod.site
                      </h4>
                    </div>
                    <button
                      onClick={() => setReplyOpen(false)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recipient & Subject info */}
                  <div className="text-xs font-mono text-gray-400 space-y-2">
                    <div>
                      <span className="text-gray-200 font-semibold">Kimga: </span>
                      <span className="text-[#d6f779]">{selectedMsg.name}</span> &lt;{selectedMsg.email}&gt;
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-semibold shrink-0">Mavzu:</span>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="flex-1 glass-input rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#d6f779]">
                      <Sparkles className="w-3 h-3" /> Tezkor shablonlar:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyTemplate('uz')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300 transition-all hover:text-white"
                      >
                        🇺🇿 O'zbekcha
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('en')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300 transition-all hover:text-white"
                      >
                        🇬🇧 English
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate('ru')}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300 transition-all hover:text-white"
                      >
                        🇷🇺 Русский
                      </button>
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-gray-300">Xat matni:</label>
                    <textarea
                      rows={6}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Javob xatingizni yozing..."
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white font-sans placeholder-gray-500 focus:outline-none focus:border-[#d6f779]/50 leading-relaxed"
                    />
                  </div>

                  {/* Info & Submit */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-gray-400 font-mono">
                      ⚡ Xat mijoz pochtasiga <span className="text-[#d6f779] font-bold">Shahzod.site</span> brendida yetkaziladi.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="button"
                        disabled={sendingReply || !replyText.trim()}
                        onClick={handleSendReply}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#0c0d0e] font-bold text-xs shadow-lg shadow-[#d6f779]/20 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {sendingReply ? (
                          <span>Yuborilmoqda...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Yuborish (Send Reply)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-500">
                <span>Received: {new Date(selectedMsg.createdAt).toLocaleString()}</span>
                <span>Status: {selectedMsg.isRead ? 'Read' : 'Unread'}</span>
              </div>
            </div>
          ) : (
            <div className="p-16 rounded-3xl glass-card border border-white/5 text-center text-gray-500 font-mono text-xs">
              Select an inquiry on the left to read full message.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
