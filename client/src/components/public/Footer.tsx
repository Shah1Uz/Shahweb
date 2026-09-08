import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Send, Instagram, Terminal, ArrowUp } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

export const Footer: React.FC = () => {
  const { profile } = useProfile();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#101111] border-t border-[#343636] pt-16 pb-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#d6f779]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#343636]">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#d6f779] flex items-center justify-center">
                <Terminal className="w-5 h-5 text-[#101111] font-extrabold" />
              </div>
              <span className="font-mono font-bold text-lg tracking-wider text-white">
                {profile?.name || 'SHAHZOD'}<span className="text-[#d6f779]">.DEV</span>
              </span>
            </Link>
            <p className="text-sm text-[#9d9f9e] max-w-md leading-relaxed">
              {profile?.bio ||
                'Senior Full-Stack Architect crafting resilient microservices, distributed cloud backends, and pixel-perfect reactive client applications.'}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {profile?.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#9d9f9e] hover:text-[#d6f779] hover:border-[#d6f779]/40 hover:bg-[#d6f779]/10 transition-all"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {profile?.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#9d9f9e] hover:text-[#d6f779] hover:border-[#d6f779]/40 hover:bg-[#d6f779]/10 transition-all"
                  title="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {profile?.twitterUrl && (
                <a
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#9d9f9e] hover:text-[#d6f779] hover:border-[#d6f779]/40 hover:bg-[#d6f779]/10 transition-all"
                  title="X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {profile?.telegramUrl && (
                <a
                  href={profile.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#9d9f9e] hover:text-[#d6f779] hover:border-[#d6f779]/40 hover:bg-[#d6f779]/10 transition-all"
                  title="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {profile?.instagramUrl && (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#9d9f9e] hover:text-[#d6f779] hover:border-[#d6f779]/40 hover:bg-[#d6f779]/10 transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d6f779] font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d6f779]" />
              <span>Navigation</span>
            </h4>
            <ul className="space-y-2 text-sm text-[#9d9f9e]">
              <li><Link to="/about" className="hover:text-[#d6f779] transition-colors">About & Journey</Link></li>
              <li><Link to="/projects" className="hover:text-[#d6f779] transition-colors">Featured Projects</Link></li>
              <li><Link to="/news" className="hover:text-[#d6f779] transition-colors">Announcements & Releases</Link></li>
              <li><Link to="/blog" className="hover:text-[#d6f779] transition-colors">Technical Articles</Link></li>
              <li><Link to="/services" className="hover:text-[#d6f779] transition-colors">Engineering Services</Link></li>
            </ul>
          </div>

          {/* Col 3: Direct Connect */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#d6f779] font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d6f779]" />
              <span>Direct Inquiries</span>
            </h4>
            <p className="text-xs text-[#9d9f9e] leading-relaxed">
              Have an ambitious software project or enterprise cloud requirement? Let's discuss architecture and delivery.
            </p>
            <div className="pt-1">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9d9f9e] font-mono">
          <div>
            <Link
              to="/admin/login"
              className="text-[#9d9f9e] hover:text-[#d6f779] transition-colors select-none"
              title="©"
            >
              ©
            </Link>{' '}
            {new Date().getFullYear()} {profile?.name || 'Shahzod'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Sitemap.xml
            </a>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
