import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, User, Share2, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { BlogPost } from '../../types';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { Badge } from '../../components/ui/Badge';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blog/${slug}`)
      .then((res) => {
        setPost(res.data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Article not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return <div className="pt-36 pb-20 text-center text-sm font-mono text-[#9d9f9e]">Loading technical guide...</div>;
  }

  if (error || !post) {
    return (
      <div className="pt-36 pb-20 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Article Not Found</h2>
        <p className="text-sm text-[#9d9f9e]">{error}</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] text-[#101111] hover:bg-[#c3e665] text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>
      </div>
    );
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(post.tags || '[]');
  } catch {
    tags = (post.tags || '').split(',').map((t) => t.trim());
  }

  return (
    <div className="pt-28 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#9d9f9e] hover:text-[#d6f779] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all articles</span>
      </Link>

      {/* Header */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="white">{post.category}</Badge>
            <span className="text-xs font-mono text-[#9d9f9e] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#d6f779]" />
              {post.readingTime}
            </span>
          </div>
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191a1a] hover:bg-[#202222] text-xs font-mono text-[#EEEEEE] border border-[#343636] transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#d6f779]" />
                <span className="text-[#d6f779]">Link copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-[#9d9f9e] border-b border-[#343636] pb-6">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      <div className="rounded-3xl overflow-hidden glass-panel border border-[#343636] aspect-video max-h-[460px] bg-[#101111]">
        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* Markdown Content */}
      <div className="p-8 rounded-3xl glass-card border border-[#343636] bg-[#191a1a]">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="pt-6 border-t border-[#343636] flex flex-wrap gap-2">
          {tags.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-[#101111] border border-[#343636] text-xs font-mono text-[#9d9f9e]"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
