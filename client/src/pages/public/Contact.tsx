import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, CheckCircle2, AlertCircle, MessageSquare, Calendar, Clock, Video } from 'lucide-react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { CalEmbed } from '../../components/public/CalEmbed';

export const Contact: React.FC = () => {
  const [mode, setMode] = useState<'message' | 'calendar'>('message');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: '', // Spam protection
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { success, error } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot spam check
    if (formData.honeypot) {
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/messages', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Project Inquiry',
        message: formData.message,
      });

      setSubmitted(true);
      success('Your message was transmitted successfully! I will respond promptly.', 'Inquiry Sent');
      setFormData({ name: '', email: '', subject: '', message: '', honeypot: '' });
    } catch (err: any) {
      error(err.message || 'Failed to deliver message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Initiate Contact</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Let’s Build Something Exceptional
        </h1>
        <p className="text-base text-[#9d9f9e] leading-relaxed">
          Whether you need architectural consulting, full-stack application development, or technical direction, leave a message or book a live 30-min call.
        </p>

        {/* Interactive Mode Switcher Pill */}
        <div className="pt-2 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#191a1a] border border-[#343636] shadow-xl">
            <button
              type="button"
              onClick={() => setMode('message')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'message'
                  ? 'bg-[#d6f779] text-[#101111] shadow-lg shadow-[#d6f779]/20 font-bold'
                  : 'text-[#9d9f9e] hover:text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Send a Message</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('calendar')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'calendar'
                  ? 'bg-[#d6f779] text-[#101111] shadow-lg shadow-[#d6f779]/20 font-bold'
                  : 'text-[#9d9f9e] hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Book 30-Min Call</span>
              <span className="hidden xs:inline-block text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/20">
                LIVE
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Instant Call Action Card */}
          <div className="p-6 rounded-3xl glass-card border border-[#d6f779]/35 bg-[#191a1a] shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-[#d6f779] text-xs font-mono font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Direct Video Call</span>
            </div>
            <h4 className="text-base font-bold text-white">Prefer a live discovery call?</h4>
            <p className="text-xs text-[#9d9f9e] leading-relaxed">
              Skip back-and-forth emails. Pick an open slot directly on my calendar. Google Meet link will be generated automatically.
            </p>
            <button
              type="button"
              onClick={() => setMode('calendar')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#d6f779]/15 hover:bg-[#d6f779]/25 text-[#d6f779] border border-[#d6f779]/35 text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Select Date & Time on Calendar</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-[#343636] bg-[#191a1a] space-y-4">
            <h3 className="text-lg font-bold text-white">Direct Channels</h3>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#9d9f9e]">Email Address</p>
                  <a
                    href="mailto:shahuztech@gmail.com"
                    className="text-sm font-semibold text-white hover:text-[#d6f779] transition-colors"
                  >
                    shahuztech@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#9d9f9e]">Availability & Timezone</p>
                  <p className="text-sm font-semibold text-white">Worldwide / Remote (UTC+5)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-mono text-[#9d9f9e]">Typical Response Time</p>
                  <p className="text-sm font-semibold text-white">Within 12 - 24 Hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-[#343636] bg-[#191a1a] space-y-2">
            <h4 className="text-xs font-mono font-bold text-[#d6f779] uppercase tracking-widest">
              Production SLA
            </h4>
            <p className="text-xs text-[#9d9f9e] leading-relaxed">
              Every message entered here is routed directly into the internal PostgreSQL/Prisma CMS inbox with timestamp and sender telemetry for rapid triage.
            </p>
          </div>
        </div>

        {/* Form or Calendar */}
        <div className="lg:col-span-7">
          {mode === 'calendar' ? (
            <div className="p-4 sm:p-6 rounded-3xl glass-panel border border-[#343636] bg-[#191a1a] shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#343636]">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>30-Minute Video Consultation</span>
                  </h3>
                  <p className="text-xs text-[#9d9f9e]">Direct Google Meet video conference</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('message')}
                  className="text-xs font-mono text-[#d6f779] hover:underline cursor-pointer"
                >
                  ← Switch to message form
                </button>
              </div>
              <CalEmbed height="600px" />
            </div>
          ) : (
            <div className="p-8 sm:p-10 rounded-3xl glass-panel border border-[#343636] bg-[#191a1a] shadow-2xl">
            {submitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#d6f779]/20 border border-[#d6f779]/40 text-[#d6f779] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Transmitted!</h3>
                <p className="text-sm text-[#9d9f9e] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your transmission has been written to the database inbox. I'll get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#101111] hover:bg-[#151616] border border-[#343636] text-xs font-mono text-[#EEEEEE] transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot hidden input */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={handleChange}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-300">
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarah Connor"
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-gray-300">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="sarah@example.com"
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">
                    Subject / Project Scope
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Distributed Cloud Architecture Consulting"
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-gray-300">
                    Detailed Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your technical requirements, goals, timelines, or questions..."
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-sm shadow-xl shadow-[#d6f779]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="font-mono text-xs">Transmitting packet...</span>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
