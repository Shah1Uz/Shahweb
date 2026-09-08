import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Sparkles, Newspaper, Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { News as NewsType } from '../../types';
import { CountdownCard } from '../../components/public/CountdownCard';
import { Badge } from '../../components/ui/Badge';

export const News: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsType[]>([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNews = () => {
    setLoading(true);
    let url = `/news?includeScheduled=true&`;
    if (category !== 'ALL') url += `category=${encodeURIComponent(category)}&`;
    if (search.trim()) url += `search=${encodeURIComponent(search.trim())}&`;

    api
      .get(url)
      .then((res) => {
        setNewsList(res.data.news || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, [category, search]);

  const scheduledItems = newsList.filter((n) => n.status === 'SCHEDULED');
  const publishedItems = newsList.filter((n) => n.status === 'PUBLISHED');

  const categories = ['ALL', 'Product Launch', 'Conferences', 'Announcement', 'Architecture'];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Releases & Media</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          News & Scheduled Releases
        </h1>
        <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed">
          Product launches, conference keynotes, scheduled software releases, and engineering updates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#343636]">
        {/* Category Pills */}
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

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#9d9f9e] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
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

      {/* SCHEDULED "COMING SOON" COUNTDOWN SECTION */}
      {scheduledItems.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d6f779]" />
            <h2 className="text-xl font-bold text-white tracking-wide">Upcoming Unveilings</h2>
          </div>
          <div className="space-y-6">
            {scheduledItems.map((item) => (
              <CountdownCard key={item.id} item={item} onTimerEnd={fetchNews} />
            ))}
          </div>
        </div>
      )}

      {/* PUBLISHED NEWS GRID */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-wide">Latest Announcements</h2>

        {loading ? (
          <div className="py-20 text-center text-sm font-mono text-[#9d9f9e]">Loading announcements...</div>
        ) : publishedItems.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Newspaper className="w-10 h-10 text-gray-500 mx-auto" />
            <p className="text-base text-gray-300">No published news items in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedItems.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl glass-card overflow-hidden flex flex-col border border-[#343636] hover:border-[#d6f779]/45 transition-all duration-300 bg-[#191a1a]"
              >
                <div className="relative aspect-video overflow-hidden bg-[#101111]">
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="white">{item.category}</Badge>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#9d9f9e] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#d6f779] transition-colors">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-xs text-[#9d9f9e] line-clamp-3 leading-relaxed">
                      {item.shortDesc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#343636] flex items-center justify-between">
                    <Link
                      to={`/news/${item.slug}`}
                      className="text-xs font-semibold text-[#d6f779] hover:text-[#c3e665] flex items-center gap-1"
                    >
                      <span>Read Announcement</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[11px] text-[#9d9f9e] font-mono">{item.viewCount} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
