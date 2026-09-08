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
                    <span className="text-[10px] font-mono text-gray-400 shrink-0">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
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
                  <h3 className="text-xl font-bold text-white">{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-400 mt-1">
                    <span className="text-gray-200">From: {selectedMsg.name}</span>
                    <span>&lt;{selectedMsg.email}&gt;</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
                    title="Reply via Email"
                  >
                    <Reply className="w-4 h-4" />
                  </a>
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

              <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMsg.message}
              </div>

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
