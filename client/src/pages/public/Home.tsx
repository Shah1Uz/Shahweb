import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Download,
  Terminal,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Github,
  Star,
  Quote,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Project, News, BlogPost, Service, Skill, Testimonial } from '../../types';
import { CountdownCard } from '../../components/public/CountdownCard';
import { Badge } from '../../components/ui/Badge';
import { useProfile } from '../../context/ProfileContext';

export const Home: React.FC = () => {
  const { profile } = useProfile();
  const [projects, setProjects] = useState<Project[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [sections, setSections] = useState<any>({
    hero: true,
    about: true,
    skills: true,
    projects: true,
    news: true,
    blog: true,
    services: true,
    stats: true,
    testimonials: true,
    contact: true,
    upcomingTimer: true,
  });
  const [stats, setStats] = useState<any>({
    yearsExperience: 7,
    projectsCompleted: 64,
    happyClients: 42,
    codeCommits: '18.5k',
  });

  useEffect(() => {
    if (profile?.statsJson) {
      try {
        setStats(JSON.parse(profile.statsJson));
      } catch {}
    }
  }, [profile]);

  useEffect(() => {
    // Load home data
    Promise.all([
      api.get('/projects?featured=true&limit=3'),
      api.get('/news?limit=3&includeScheduled=true'),
      api.get('/blog?limit=3'),
      api.get('/content/services'),
      api.get('/content/skills'),
      api.get('/content/testimonials'),
      api.get('/content/settings'),
    ])
      .then(([projRes, newsRes, blogRes, servRes, skillRes, testRes, settingsRes]) => {
        setProjects(projRes.data.projects || []);
        setNews(newsRes.data.news || []);
        setBlogPosts(blogRes.data.posts || []);
        setServices(servRes.data || []);
        setSkills(skillRes.data || []);
        setTestimonials(testRes.data || []);
        if (settingsRes.data?.site?.enableSections) {
          try {
            const parsed = JSON.parse(settingsRes.data.site.enableSections);
            setSections((prev: any) => ({ ...prev, ...parsed }));
          } catch {}
        }
      })
      .catch((err) => console.error('Failed to load home data:', err));
  }, []);

  const scheduledNews = news.find((n) => n.status === 'SCHEDULED');
  const publishedNews = news.filter((n) => n.status === 'PUBLISHED');
  const publishedTestimonials = testimonials.filter((t) => t.published !== false);

  return (
    <div className="space-y-20 sm:space-y-28 pt-24 sm:pt-28 pb-20 overflow-x-clip w-full max-w-full">
      {/* HERO SECTION */}
      <section className="relative px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle eyramusic lime ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-full h-[350px] bg-[#d6f779]/[0.05] rounded-full blur-[160px] pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-5 sm:space-y-6 min-w-0"
          >
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#191a1a] border border-[#343636] text-[#d6f779] text-[10px] sm:text-xs font-mono max-w-full">
              <span className="w-2 h-2 rounded-full bg-[#d6f779] animate-ping shrink-0" />
              <span className="truncate">AVAILABLE FOR NEW PROJECTS & CONSULTING</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Hi, I'm{' '}
              <span className="text-gradient">
                {profile?.name || 'Shahzod'}
              </span>
              <br />
              <span className="text-xl sm:text-3xl lg:text-5xl font-bold text-gray-300 block mt-2 font-mono break-words">
                {profile?.title || 'Senior Full-Stack Architect'}
              </span>
            </h1>

            {/* Bio Description */}
            <p className="text-sm sm:text-lg text-[#9d9f9e] max-w-2xl leading-relaxed font-normal">
              {profile?.bio ||
                'Engineering enterprise-grade distributed systems, cloud microservices, and pixel-perfect reactive client applications.'}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Link
                to="/projects"
                className="w-full sm:w-auto justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-sm flex items-center gap-2 shadow-2xl shadow-[#d6f779]/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>{profile?.ctaWorkText || 'View My Work'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto justify-center px-6 py-3 sm:py-3.5 rounded-xl glass-panel bg-[#191a1a] hover:bg-[#242626] text-[#eee] font-semibold text-sm border border-[#343636] hover:border-[#d6f779]/40 transition-all flex items-center gap-2"
              >
                <span>{profile?.ctaContactText || 'Contact Me'}</span>
              </Link>

              {profile?.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto justify-center p-3 sm:p-3.5 rounded-xl glass-panel bg-[#191a1a] hover:bg-[#242626] text-[#9d9f9e] hover:text-[#d6f779] border border-[#343636] transition-all flex items-center gap-2"
                  title="Download Resume / CV"
                >
                  <Download className="w-4 h-4" />
                  <span className="sm:hidden text-xs font-mono">Download CV</span>
                </a>
              )}
            </div>

            {/* Quick Terminal Code Snippet */}
            <div className="pt-4 sm:pt-6 w-full max-w-full min-w-0">
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#191a1a] border border-[#343636] font-mono text-xs text-gray-300 max-w-lg backdrop-blur-md overflow-x-auto w-full">
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-[#343636] text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#343636]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a504a]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d6f779]" />
                  <span className="ml-2 text-[10px] text-[#9d9f9e]">shahzod@edge-node-01:~</span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <p className="text-[#9d9f9e] truncate">
                    <span className="text-[#d6f779] font-bold">$</span> const engineer = await hire(&#123; role: 'Architect', level: 'Senior' &#125;);
                  </p>
                  <p className="text-white font-medium">
                    ✔ Ready: distributed backends, React frontends, high concurrency.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Programmer Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 relative min-w-0"
          >
            <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden glass-panel border border-[#343636] p-3 shadow-2xl bg-[#191a1a]">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#101111]">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name || 'Shahzod'}
                    className="w-full h-full object-cover object-center filter grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#151616] text-[#9d9f9e]">
                    <div className="w-20 h-20 rounded-full bg-[#191a1a] border border-[#343636] flex items-center justify-center text-[#d6f779] shadow-inner mb-3">
                      <Terminal className="w-9 h-9" />
                    </div>
                    <span className="text-xs font-mono text-[#9d9f9e]">Engineer Profile</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101111] via-transparent to-transparent opacity-85 pointer-events-none" />

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl glass-panel bg-[#151616]/95 border border-[#343636] backdrop-blur-md">
                  <p className="text-sm font-bold text-white">{profile?.name || 'Shahzod'}</p>
                  <p className="text-xs text-[#d6f779] font-mono">Distributed Systems & Product Engineering</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* METRICS & TELEMETRY COUNTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {stats.yearsExperience}+
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Years Experience</p>
          </div>
          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {stats.projectsCompleted}+
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Projects Shipped</p>
          </div>
          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {stats.happyClients}
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Happy Clients</p>
          </div>
          <div className="p-6 rounded-2xl glass-card text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
              {stats.codeCommits}
            </span>
            <p className="text-xs font-mono uppercase tracking-wider text-gray-400">Git Commits</p>
          </div>
        </div>
      </section>

      {/* SCHEDULED NEWS / COUNTDOWN BANNER (IF SCHEDULED POST EXISTS AND TOGGLED ON) */}
      {sections.upcomingTimer !== false && scheduledNews && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountdownCard item={scheduledNews} />
        </section>
      )}

      {/* FEATURED PROJECTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Portfolio</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Featured Projects</h2>
          </div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-[#d6f779] transition-colors group"
          >
            <span>View all projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            let techs: string[] = [];
            try {
              techs = JSON.parse(project.technologies);
            } catch {
              techs = project.technologies.split(',').map((t) => t.trim());
            }

            return (
              <div
                key={project.id}
                className="group rounded-3xl glass-card overflow-hidden flex flex-col border border-[#343636] hover:border-[#d6f779]/45 transition-all duration-300 bg-[#191a1a]"
              >
                {/* Image Cover */}
                <div className="relative aspect-video overflow-hidden bg-[#101111]">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="white">{project.category}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-zinc-200 transition-colors">
                      <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {project.shortDesc}
                    </p>
                  </div>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {techs.slice(0, 4).map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {techs.length > 4 && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400">
                        +{techs.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-[#343636] flex items-center justify-between">
                    <Link
                      to={`/projects/${project.slug}`}
                      className="text-xs font-semibold text-[#d6f779] hover:text-[#c3e665] flex items-center gap-1"
                    >
                      <span>Explore Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <div className="flex items-center gap-2 text-gray-400">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveDemoUrl && (
                        <a href={project.liveDemoUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>      {/* SERVICES & CORE CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">What I Do</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full-Stack Solutions</h2>
          <p className="text-sm text-[#9d9f9e]">
            From low-level data streaming down to responsive client state orchestration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            let features: string[] = [];
            try {
              features = JSON.parse(service.features);
            } catch {}

            return (
              <div
                key={service.id}
                className="p-8 rounded-3xl glass-card flex flex-col justify-between border border-[#343636] hover:border-[#d6f779]/45 transition-all group bg-[#191a1a]"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#d6f779]/15 border border-[#d6f779]/30 flex items-center justify-center text-[#d6f779] group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#d6f779] transition-colors">{service.title}</h3>
                  <p className="text-sm text-[#9d9f9e] leading-relaxed">{service.description}</p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#343636] space-y-2">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d6f779] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* LATEST NEWS & ANNOUNCEMENTS */}
      {publishedNews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Releases</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Latest Announcements</h2>
            </div>
            <Link
              to="/news"
              className="text-sm font-semibold text-white hover:text-[#d6f779] flex items-center gap-1 transition-colors"
            >
              <span>All News</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publishedNews.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="rounded-3xl glass-card overflow-hidden border border-[#343636] hover:border-[#d6f779]/45 transition-all flex flex-col md:flex-row bg-[#191a1a]"
              >
                <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden bg-[#101111]">
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6 md:w-3/5 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#9d9f9e] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-white hover:text-[#d6f779] transition-colors">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-xs text-[#9d9f9e] line-clamp-2">{item.shortDesc}</p>
                  </div>
                  <Link
                    to={`/news/${item.slug}`}
                    className="text-xs font-semibold text-[#d6f779] hover:text-[#c3e665] flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LATEST ARTICLES FROM BLOG */}
      {blogPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Knowledge</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Technical Articles</h2>
            </div>
            <Link
              to="/blog"
              className="text-sm font-semibold text-white hover:text-[#d6f779] flex items-center gap-1 transition-colors"
            >
              <span>Explore Blog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="p-6 rounded-3xl glass-card border border-[#343636] hover:border-[#d6f779]/45 transition-all flex flex-col justify-between space-y-4 bg-[#191a1a]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#9d9f9e]">
                    <span className="text-white font-semibold">{post.category}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white hover:text-[#d6f779] transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-xs text-[#9d9f9e] leading-relaxed line-clamp-3">{post.excerpt}</p>
                </div>
                <div className="pt-4 border-t border-[#343636] flex items-center justify-between">
                  <span className="text-xs text-[#9d9f9e] font-mono">By {post.author}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-xs font-semibold text-[#d6f779] hover:text-[#c3e665] flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      {sections.testimonials !== false && publishedTestimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-[#d6f779]">Endorsements</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Client Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publishedTestimonials.map((t) => (
              <div key={t.id} className="p-8 rounded-3xl glass-card border border-[#343636] space-y-4 relative bg-[#191a1a]">
                <Quote className="w-8 h-8 text-white/10 absolute top-6 right-6" />
                <div className="flex items-center gap-1 text-[#d6f779]">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">"{t.content}"</p>
                <div className="flex items-center gap-3 pt-2">
                  {t.avatarUrl && (
                    <img src={t.avatarUrl} alt={t.clientName} className="w-10 h-10 rounded-full object-cover border border-[#343636]" />
                  )}
                  <div>
                    <h5 className="text-sm font-bold text-white">{t.clientName}</h5>
                    <p className="text-xs text-[#9d9f9e]">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-[#343636] p-8 sm:p-14 bg-gradient-to-b from-[#191a1a] to-[#101111] shadow-2xl text-center space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-[#d6f779]/15 border border-[#d6f779]/30 text-[#d6f779]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Have a project in mind?
          </h2>
          <p className="text-base text-[#9d9f9e] max-w-xl mx-auto leading-relaxed">
            Let’s engineer something exceptional. Reach out to discuss architectural requirements, cloud deployment, or contracting availability.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-sm shadow-2xl shadow-[#d6f779]/20 hover:scale-105 transition-transform"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
