import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, Newspaper, BookOpen, ArrowRight, X } from 'lucide-react';
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

  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
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
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [projRes, newsRes, blogRes] = await Promise.all([
          api.get(`/projects?search=${encodeURIComponent(query)}&limit=4`),
          api.get(`/news?search=${encodeURIComponent(query)}&limit=4&includeScheduled=true`),
          api.get(`/blog?search=${encodeURIComponent(query)}&limit=4`),
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
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const totalResults = results.projects.length + results.news.length + results.blog.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl glass-panel bg-[#191a1a]/98 rounded-2xl shadow-2xl border border-[#343636] z-10 overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#343636] gap-3">
              <Search className="w-5 h-5 text-[#d6f779] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, technical articles, announcements..."
                className="w-full bg-transparent text-white placeholder-[#9d9f9e] text-sm focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block bg-white/5 border border-[#343636] text-[#9d9f9e] text-[10px] px-2 py-0.5 rounded font-mono">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {loading && (
                <div className="py-8 text-center text-xs font-mono text-[#9d9f9e]">
                  Searching index...
                </div>
              )}

              {/* Secret Admin Entry if search is "admin" */}
              {query.toLowerCase().trim().includes('admin') && (
                <div className="p-2.5 rounded-xl bg-[#d6f779]/10 border border-[#d6f779]/30">
                  <button
                    onClick={() => handleSelect('/admin/login')}
                    className="w-full flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🔐</span>
                      <div>
                        <p className="text-xs font-bold text-[#d6f779]">Admin Portal</p>
                        <p className="text-[10px] text-[#9d9f9e] font-mono">Boshqaruv paneliga xavfsiz kirish</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#d6f779] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {!loading && query && totalResults === 0 && !query.toLowerCase().trim().includes('admin') && (
                <div className="py-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-gray-300">No matching indexed records found</p>
                  <p className="text-xs text-gray-500 font-mono">
                    Try searching for keywords like "React", "Docker", "Architecture", or "Postgres"
                  </p>
                </div>
              )}

              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#d6f779] mb-2 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5" />
                    <span>Projects ({results.projects.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelect(`/projects/${p.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/5 group transition-colors"
                      >
                        <div className="truncate">
                          <p className="text-sm font-medium text-white group-hover:text-[#d6f779] truncate">
                            {p.title}
                          </p>
                          <p className="text-xs text-[#9d9f9e] truncate">{p.shortDesc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#9d9f9e] group-hover:text-[#d6f779] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* News */}
              {results.news.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5" />
                    <span>News & Releases ({results.news.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.news.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleSelect(`/news/${n.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/5 group transition-colors"
                      >
                        <div className="truncate">
                          <p className="text-sm font-medium text-white group-hover:text-purple-300 truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{n.shortDesc}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blog */}
              {results.blog.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Articles ({results.blog.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {results.blog.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/blog/${b.slug}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-left hover:bg-white/5 group transition-colors"
                      >
                        <div className="truncate">
                          <p className="text-sm font-medium text-white group-hover:text-emerald-300 truncate">
                            {b.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{b.excerpt}</p>
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
