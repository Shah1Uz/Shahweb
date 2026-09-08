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
    </div>
  );
};
