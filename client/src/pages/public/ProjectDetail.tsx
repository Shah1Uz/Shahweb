import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, UserCheck, Tag, Music, Video } from 'lucide-react';
import { api } from '../../lib/api';
import { Project } from '../../types';
import { ImageCarousel } from '../../components/public/ImageCarousel';
import { MarkdownRenderer } from '../../components/ui/MarkdownRenderer';
import { Badge } from '../../components/ui/Badge';

export const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/projects/${slug}`)
      .then((res) => {
        setProject(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project details');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-36 pb-20 text-center text-sm font-mono text-[#9d9f9e]">
        Loading project case study...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-36 pb-20 max-w-xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Project Not Found</h2>
        <p className="text-sm text-[#9d9f9e]">{error || 'The requested project could not be found.'}</p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d6f779] text-[#101111] hover:bg-[#c3e665] text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  let techs: string[] = [];
  try {
    techs = JSON.parse(project.technologies);
  } catch {
    techs = project.technologies.split(',').map((t) => t.trim());
  }

  const carouselImages = project.images && project.images.length > 0
    ? project.images.map((img) => ({ url: img.url, caption: img.caption }))
    : [{ url: project.coverImage, caption: project.title }];

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb navigation */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#9d9f9e] hover:text-[#d6f779] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all projects</span>
      </Link>

      {/* Hero Header */}
      <div className="space-y-4 max-w-4xl">
        <div className="flex items-center gap-3">
          <Badge variant="white">{project.category}</Badge>
          {project.date && (
            <span className="text-xs font-mono text-[#9d9f9e] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {project.date}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {project.title}
        </h1>
        <p className="text-base sm:text-lg text-[#9d9f9e] leading-relaxed">
          {project.shortDesc}
        </p>
      </div>

      {/* Main Grid: Media & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Visual Media Gallery & Case Study */}
        <div className="lg:col-span-8 space-y-10">
          {/* Image Carousel */}
          <div className="rounded-2xl overflow-hidden glass-panel border border-[#343636] bg-[#191a1a] p-2">
            <ImageCarousel images={carouselImages} autoplay interval={5000} />
          </div>

          {/* Video Player (if provided) */}
          {project.videoUrl && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-[#d6f779]" />
                <span>Architecture Demo Video</span>
              </h3>
              <div className="rounded-2xl overflow-hidden glass-panel border border-[#343636] aspect-video bg-[#101111]">
                <video src={project.videoUrl} controls className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* Audio Track snippet (if provided) */}
          {project.audioUrl && (
            <div className="p-4 rounded-2xl glass-card border border-[#343636] bg-[#191a1a] flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#d6f779]/15 text-[#d6f779] border border-[#d6f779]/30">
                <Music className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">Project Soundscape / Audio Demo</h4>
                <audio src={project.audioUrl} controls className="w-full mt-2 h-8" />
              </div>
            </div>
          )}

          {/* Full Markdown Case Study */}
          <div className="p-8 rounded-3xl glass-card border border-[#343636] bg-[#191a1a]">
            <MarkdownRenderer content={project.fullDesc} />
          </div>
        </div>

        {/* Right Sidebar: Tech Stack, Links, Specs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-[#343636] bg-[#191a1a] space-y-6">
            <h3 className="text-sm font-mono uppercase tracking-widest text-[#d6f779]">
              Project Specification
            </h3>

            {/* Quick action buttons */}
            <div className="flex flex-col gap-3">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d6f779] hover:bg-[#c3e665] text-[#101111] font-extrabold text-xs shadow-lg shadow-[#d6f779]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span>Launch Live Platform</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl glass-panel bg-[#101111] hover:bg-[#151616] border border-[#343636] text-white font-medium text-xs transition-all"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source Repository</span>
                </a>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-[#343636] text-xs">
              {project.client && (
                <div className="flex items-center justify-between">
                  <span className="text-[#9d9f9e] flex items-center gap-1.5 font-mono">
                    <UserCheck className="w-3.5 h-3.5" /> Client / Organization
                  </span>
                  <span className="text-white font-semibold">{project.client}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[#9d9f9e] flex items-center gap-1.5 font-mono">
                  <Tag className="w-3.5 h-3.5" /> Category
                </span>
                <span className="text-white font-semibold">{project.category}</span>
              </div>
              {project.date && (
                <div className="flex items-center justify-between">
                  <span className="text-[#9d9f9e] flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> Release Date
                  </span>
                  <span className="text-white font-semibold">{project.date}</span>
                </div>
              )}
            </div>

            {/* Technologies */}
            <div className="pt-4 border-t border-[#343636] space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#9d9f9e] block">
                Technologies Employed
              </span>
              <div className="flex flex-wrap gap-2">
                {techs.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#101111] border border-[#343636] text-xs font-mono text-[#EEEEEE]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
