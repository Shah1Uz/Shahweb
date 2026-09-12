import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen, User, X, Eye, Heart } from 'lucide-react';
import { api } from '../../lib/api';
import { BlogPost } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = `/blog?`;
    if (category !== 'ALL') url += `category=${encodeURIComponent(category)}&`;
    if (search) url += `search=${encodeURIComponent(search)}&`;

    api
      .get(url)
      .then((res) => {
        setPosts(res.data.posts || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category, search]);

  const categories = ['ALL', 'Architecture', 'DevOps', 'TypeScript', 'Performance'];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Articles & Insights</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">Engineering Articles</h1>
        <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed">
          Deep dives into distributed state machines, microservices, reactive UI patterns, and cloud scalability.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#343636]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0 scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all shrink-0 ${
                category === cat
                  ? 'bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/35 font-semibold'
                  : 'bg-[#191a1a] text-[#9d9f9e] hover:text-white border border-[#343636]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#9d9f9e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full bg-[#191a1a] border border-[#343636] rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-[#9d9f9e] focus:outline-none focus:border-[#d6f779] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-mono text-[#9d9f9e]">Loading technical posts...</div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <BookOpen className="w-10 h-10 text-[#9d9f9e] mx-auto" />
          <p className="text-base text-gray-300">No blog posts match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => {
            let tags: string[] = [];
            try {
              tags = JSON.parse(post.tags || '[]');
            } catch {
              tags = (post.tags || '').split(',').map((t) => t.trim());
            }

            return (
              <div
                key={post.id}
                className="group rounded-3xl glass-card overflow-hidden flex flex-col border border-[#343636] hover:border-[#d6f779]/45 transition-all duration-300 bg-[#191a1a]"
              >
                <div className="relative aspect-video overflow-hidden bg-[#101111]">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="white">{post.category}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#101111]/80 backdrop-blur-md border border-[#343636] text-[10px] font-mono text-white">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Eye className="w-3 h-3" />
                      <span>{post.viewCount || 0}</span>
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3 h-3 fill-rose-500/30" />
                      <span>{post.likeCount || 0}</span>
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs font-mono text-[#9d9f9e]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#d6f779]" />
                        {post.readingTime}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-[#d6f779] transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-[#9d9f9e] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-[#101111] border border-[#343636] text-[11px] font-mono text-[#9d9f9e]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#343636] flex items-center justify-between">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs font-semibold text-[#d6f779] hover:text-[#c3e665] flex items-center gap-1"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-3 text-xs font-mono text-[#9d9f9e]">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{post.viewCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                        <span>{post.likeCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
