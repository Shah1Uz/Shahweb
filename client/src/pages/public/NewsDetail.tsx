import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Video, Music } from 'lucide-react';
import { api } from '../../lib/api';
import { News } from '../../types';
import { ImageCarousel } from '../../components/public/ImageCarousel';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { CountdownCard } from '../../components/public/CountdownCard';
import { Badge } from '../../components/ui/Badge';

export const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItem = () => {
    setLoading(true);
    api
      .get(`/news/${slug}`)
      .then((res) => {
        setItem(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'News item not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItem();
  }, [slug]);

  if (loading) {
    return <div className="pt-36 pb-20 text-center text-sm font-mono text-gray-400">Loading announcement...</div>;
  }

  if (error || !item) {
    return (
      <div className="pt-36 pb-20 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Announcement Not Found</h2>
        <p className="text-sm text-gray-400">{error}</p>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] text-[#101111] font-bold text-xs hover:bg-[#c3e665] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to News</span>
        </Link>
      </div>
    );
  }

  const carouselImages = item.images && item.images.length > 0
    ? item.images.map((img) => ({ url: img.url, caption: img.caption }))
    : [{ url: item.coverImage, caption: item.title }];

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Link
        to="/news"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#9d9f9e] hover:text-[#d6f779] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all announcements</span>
      </Link>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="white">{item.category}</Badge>
          <span className="text-xs font-mono text-[#9d9f9e] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="text-xs font-mono text-[#9d9f9e] flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {item.author}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {item.title}
        </h1>

        <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed">
          {item.shortDesc}
        </p>
      </div>

      {/* If Scheduled, show Countdown banner inside article too */}
      {item.status === 'SCHEDULED' && (
        <CountdownCard item={item} onTimerEnd={fetchItem} />
      )}

      {/* Carousel */}
      <div className="rounded-3xl overflow-hidden glass-panel border border-[#343636] bg-[#191a1a] p-2">
        <ImageCarousel images={carouselImages} autoplay interval={4500} />
      </div>

      {/* Video if present */}
      {item.videoUrl && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-[#d6f779]" />
            <span>Event / Demo Video</span>
          </h3>
          <div className="rounded-2xl overflow-hidden glass-panel border border-[#343636] aspect-video bg-[#101111]">
            <video src={item.videoUrl} controls className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Audio if present */}
      {item.audioUrl && (
        <div className="p-4 rounded-2xl glass-card border border-[#343636] bg-[#191a1a] flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#d6f779]/15 text-[#d6f779]">
            <Music className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">Audio Announcement</h4>
            <audio src={item.audioUrl} controls className="w-full mt-2 h-8" />
          </div>
        </div>
      )}

      {/* Markdown Body */}
      <div className="p-8 rounded-3xl glass-card border border-[#343636] bg-[#191a1a]">
        <MarkdownRenderer content={item.fullContent} />
      </div>
    </div>
  );
};
