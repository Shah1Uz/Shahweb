import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video, Globe2, ExternalLink } from 'lucide-react';
import { CalEmbed } from './CalEmbed';

interface CalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  calLink?: string;
}

export const CalBookingModal: React.FC<CalBookingModalProps> = ({
  isOpen,
  onClose,
  calLink = 'shahzod-roziqulov-nvrnt5/30min',
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className="relative w-full max-w-4xl bg-[#101111] border border-[#343636] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[95vh]"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#343636] flex items-center justify-between bg-[#141515]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#d6f779]/15 border border-[#d6f779]/30 flex items-center justify-center text-[#d6f779]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Schedule 30-Min Strategy Call</span>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
                      LIVE CALENDAR
                    </span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#9d9f9e] font-mono pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#d6f779]" />
                      30 mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-[#d6f779]" />
                      Google Meet
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe2 className="w-3.5 h-3.5 text-[#d6f779]" />
                      Auto Timezone
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://cal.com/${calLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#343636] text-xs font-mono text-[#9d9f9e] hover:text-white transition-all"
                  title="Open in Cal.com"
                >
                  <span>Open tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-[#343636] text-gray-300 hover:text-white flex items-center justify-center transition-all active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Cal Embed */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-[#101111]">
              <CalEmbed calLink={calLink} height="580px" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
