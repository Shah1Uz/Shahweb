import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, Newspaper, BookOpen, ArrowRight, X, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    projects: any[];
    news: any[];
    blog: any[];
  }>({ projects: [], news: [], blog: [] });

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Lock body scroll when search modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Slight delay for focus on mobile to allow animation
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults({ projects: [], news: [], blog: [] });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], news: [], blog: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, newsRes, blogRes] = await Promise.all([
          api.get(`/projects?search=${encodeURIComponent(query)}&limit=5`),
          api.get(`/news?search=${encodeURIComponent(query)}&limit=5&includeScheduled=true`),
          api.get(`/blog?search=${encodeURIComponent(query)}&limit=5`),
        ]);

        setResults({
          projects: projRes.data.projects || [],
          news: newsRes.data.news || [],
          blog: blogRes.data.posts || [],
        });
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const quickSearches = ['React', 'TypeScript', 'Docker', 'Architecture', 'Next.js', 'Telemetry'];

  const totalResults = results.projects.length + results.news.length + results.blog.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-14 p-2 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#141515] rounded-2xl shadow-2xl border border-[#343636] z-10 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[82vh]"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-[#343636] gap-2.5 sm:gap-3 bg-[#191a1a]">
              {loading ? (
                <Loader2 className="w-5 h-5 text-[#d6f779] animate-spin shrink-0" />
              ) : (
                <Search className="w-5 h-5 text-[#d6f779] shrink-0" />
              )}

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, technical articles, announcements..."
                className="w-full bg-transparent text-white placeholder-[#9d9f9e] text-sm sm:text-base focus:outline-none min-w-0"
              />

              {/* Clear Query button */}
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 active:scale-95 transition-all shrink-0"
                  aria-label="Clear search input"
                  title="Clear"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Close Modal Button (Always accessible on all devices) */}
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-[#343636] text-gray-400 hover:text-white text-xs font-mono transition-all shrink-0"
                aria-label="Close search"
                title="Close (ESC)"
              >
                <X className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">ESC</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 overscroll-contain">
              {/* Quick Tags when query is empty */}
              {!query.trim() && (
                <div className="py-2 space-y-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#9d9f9e]">
                    <Sparkles className="w-3.5 h-3.5 text-[#d6f779]" />
                    <span>Popular search terms:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickSearches.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#d6f779]/15 border border-[#343636] hover:border-[#d6f779]/30 text-xs font-mono text-gray-300 hover:text-[#d6f779] transition-all active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#343636]/60 text-[11px] font-mono text-[#9d9f9e] space-y-1">
                    <p className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-[#343636]">Esc</kbd> to close
                    </p>
                    <p className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-[#343636]">Ctrl + K</kbd> to toggle search from anywhere
                    </p>
                  </div>
                </div>
              )}

              {/* Secret Admin Entry if search is "admin" */}
              {query.toLowerCase().trim().includes('admin') && (
                <div className="p-3 rounded-xl bg-[#d6f779]/10 border border-[#d6f779]/30">
                  <button
                    onClick={() => handleSelect('/admin/login')}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔐</span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#d6f779]">Admin Portal</p>
                        <p className="text-[11px] text-[#9d9f9e] font-mono">Boshqaruv paneliga xavfsiz kirish</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#d6f779] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* No results state */}
              {!loading && query.trim() && totalResults === 0 && !query.toLowerCase().trim().includes('admin') && (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-semibold text-gray-300">No matching indexed records found</p>
                  <p className="text-xs text-gray-500 font-mono max-w-sm mx-auto">
                    Try searching for "React", "Docker", "Architecture", or check spelling.
                  </p>
                </div>
              )}

              {/* Projects Results */}
              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#d6f779] mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>Projects</span>
                    </span>
                    <span className="text-[10px] text-[#9d9f9e]">{results.projects.length} found</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/projects/${p.slug}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-[#343636] group transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs sm:text-sm font-medium text-white group-hover:text-[#d6f779] truncate">
                            {p.title}
                          </p>
                          <p className="text-[11px] sm:text-xs text-[#9d9f9e] truncate mt-0.5">{p.shortDesc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9d9f9e] group-hover:text-[#d6f779] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News Results */}
              {results.news.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-purple-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" />
                      <span>News & Announcements</span>
                    </span>
                    <span className="text-[10px] text-[#9d9f9e]">{results.news.length} found</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.news.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleSelect(`/news/${n.slug}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-[#343636] group transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs sm:text-sm font-medium text-white group-hover:text-purple-300 truncate">
                            {n.title}
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">{n.shortDesc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog Results */}
              {results.blog.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Technical Articles</span>
                    </span>
                    <span className="text-[10px] text-[#9d9f9e]">{results.blog.length} found</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.blog.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/blog/${b.slug}`)}
                        className="w-full flex items-center justify-between p-3 rounded-xl text-left bg-white/[0.02] hover:bg-white/5 border border-transparent hover:border-[#343636] group transition-all"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs sm:text-sm font-medium text-white group-hover:text-emerald-300 truncate">
                            {b.title}
                          </p>
                          <p className="text-[11px] sm:text-xs text-gray-400 truncate mt-0.5">{b.excerpt}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
