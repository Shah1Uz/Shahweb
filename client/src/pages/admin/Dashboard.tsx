import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2,
  Newspaper,
  BookOpen,
  MessageSquare,
  HardDrive,
  Clock,
  PlusCircle,
  Activity,
  ArrowUpRight,
  Sparkles,
  Eye,
  Heart,
  Flame,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardStats } from '../../types';
import { formatBytes } from '../../lib/utils';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/content/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-sm font-mono text-gray-400">Loading telemetry metrics...</div>;
  }

  const counts = stats?.counts;

  return (
    <div className="space-y-10">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">Control Center</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            System Overview & Metrics
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/projects"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Project</span>
          </Link>
          <Link
            to="/admin/news"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Schedule News</span>
          </Link>
        </div>
      </div>

      {/* Global Engagement Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#d6f779]/15 via-cyan-500/10 to-indigo-500/10 border border-[#343636] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d6f779] flex items-center justify-center shadow-lg shadow-[#d6f779]/30 shrink-0">
            <Flame className="w-6 h-6 text-[#101111]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Audience Traffic & Reactions</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-[#d6f779]/20 text-[#d6f779] font-bold">LIVE TELEMETRY</span>
            </h2>
            <p className="text-xs text-[#9d9f9e]">
              Real visitor impressions, project interest and community reactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 sm:gap-8 shrink-0">
          <div className="text-center sm:text-right">
            <span className="text-[10px] font-mono text-[#9d9f9e] uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-end">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Total Views</span>
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {(counts?.engagement?.totalViews || 0).toLocaleString()}
            </span>
          </div>
          <div className="w-px h-10 bg-[#343636]" />
          <div className="text-center sm:text-right">
            <span className="text-[10px] font-mono text-[#9d9f9e] uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-end">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
              <span>Total Reactions</span>
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#d6f779]">
              {(counts?.engagement?.totalLikes || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Projects</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {counts?.projects.total || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-white/5">
            <span className="text-emerald-400">{counts?.projects.published || 0} Live</span>
            <span>{counts?.projects.draft || 0} Drafts</span>
            <span className="text-purple-400">{counts?.projects.scheduled || 0} Sched</span>
          </div>
        </div>

        {/* News Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">News & Releases</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Newspaper className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {counts?.news.total || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-white/5">
            <span className="text-emerald-400">{counts?.news.published || 0} Published</span>
            <span className="text-purple-400 font-bold">{counts?.news.scheduled || 0} Scheduled</span>
          </div>
        </div>

        {/* Blog Posts Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Technical Articles</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {counts?.blog.total || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-white/5">
            <span className="text-emerald-400">{counts?.blog.published || 0} Published</span>
            <span>0 Drafts</span>
          </div>
        </div>

        {/* Messages Card */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400">Inquiries Inbox</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {counts?.messages.total || 0}
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 pt-2 border-t border-white/5">
            <span className={counts?.messages.unread ? 'text-rose-400 font-bold' : 'text-gray-400'}>
              {counts?.messages.unread || 0} Unread
            </span>
            <Link to="/admin/messages" className="text-cyan-400 hover:underline">
              View Inbox →
            </Link>
          </div>
        </div>
      </div>

      {/* Storage and Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Recent System Activity</h3>
            </div>
            <span className="text-xs font-mono text-gray-500">Live Telemetry</span>
          </div>

          <div className="space-y-3">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-500/20 text-cyan-300">
                      {log.action}
                    </span>
                    <span className="text-gray-300">{log.details || `${log.action} on ${log.entityType}`}</span>
                  </div>
                  <span className="text-gray-500 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">No recent actions logged yet.</p>
            )}
          </div>
        </div>

        {/* Quick Launch & Storage Widget */}
        <div className="lg:col-span-4 space-y-6">
          {/* Media Storage */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <span>Media Storage</span>
              </h3>
              <Link to="/admin/media" className="text-xs text-cyan-400 hover:underline">
                Manage
              </Link>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>Disk Usage</span>
                <span className="text-white font-bold">{formatBytes(counts?.media.totalBytes || 0)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 w-1/4 rounded-full" />
              </div>
              <p className="text-[11px] text-gray-500">Total {counts?.media.total || 0} assets stored locally</p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-cyan-400">Quick Shortcuts</h3>
            <div className="space-y-2">
              <Link
                to="/admin/profile"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span>Edit Hero & Profile Bio</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
              <Link
                to="/admin/skills"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span>Adjust Skills & Percentages</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span>Change Theme & SEO Meta</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* TOP ENGAGED PROJECTS & ARTICLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Projects */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Top Viewed & Liked Projects</span>
            </h3>
            <Link to="/admin/projects" className="text-xs font-mono text-cyan-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.topProjects && stats.topProjects.length > 0 ? (
              stats.topProjects.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/10 text-cyan-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <img src={p.coverImage} alt="" className="w-10 h-7 rounded-md object-cover bg-gray-900 shrink-0" />
                    <span className="font-semibold text-white truncate">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{p.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                      <span>{p.likeCount || 0}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No project statistics recorded yet.</p>
            )}
          </div>
        </div>

        {/* Top Blog Posts */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Top Read & Liked Articles</span>
            </h3>
            <Link to="/admin/blog" className="text-xs font-mono text-emerald-400 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.topBlogPosts && stats.topBlogPosts.length > 0 ? (
              stats.topBlogPosts.map((b, idx) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <img src={b.coverImage} alt="" className="w-10 h-7 rounded-md object-cover bg-gray-900 shrink-0" />
                    <span className="font-semibold text-white truncate">{b.title}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-300">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{b.viewCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
                      <span>{b.likeCount || 0}</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 py-4 text-center">No article statistics recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
