export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  avatarUrl?: string | null;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string | null;
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
  cvUrl?: string | null;
  ctaWorkText: string;
  ctaContactText: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  telegramUrl?: string | null;
  instagramUrl?: string | null;
  statsJson: string; // JSON parsed as { yearsExperience, projectsCompleted, happyClients, codeCommits }
}

export interface ProjectImage {
  id: string;
  projectId: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  coverImage: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  technologies: string; // JSON array or comma separated
  githubUrl?: string | null;
  liveDemoUrl?: string | null;
  client?: string | null;
  date?: string | null;
  category: string;
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  scheduledAt?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images?: ProjectImage[];
}

export interface NewsImage {
  id: string;
  newsId: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullContent: string;
  coverImage: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  category: string;
  tags?: string | null;
  author: string;
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | 'EXPIRED';
  scheduledAt?: string | null;
  expiresAt?: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  images?: NewsImage[];
}

export interface BlogImage {
  id: string;
  blogPostId: string;
  url: string;
  caption?: string | null;
  sortOrder: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  category: string;
  tags?: string | null;
  author: string;
  readingTime: string;
  seoTitle?: string | null;
  seoDesc?: string | null;
  seoKeywords?: string | null;
  ogImage?: string | null;
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  scheduledAt?: string | null;
  publishedAt?: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  images?: BlogImage[];
}

export interface Skill {
  id: string;
  name: string;
  icon?: string | null;
  category: string; // Frontend, Backend, DevOps, Databases, Tools
  percentage: number;
  description?: string | null;
  sortOrder: number;
  published: boolean;
}

export interface Experience {
  id: string;
  type: 'WORK' | 'EDUCATION';
  role: string;
  organization: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
  description: string;
  sortOrder: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string; // JSON array of string
  sortOrder: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  company: string;
  avatarUrl?: string | null;
  content: string;
  rating: number;
  sortOrder: number;
  published: boolean;
}

export interface Media {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
  createdAt: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string | null;
  audioUrl: string;
  duration: string;
  description?: string | null;
  published: boolean;
  sortOrder: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  isVisible: boolean;
  sortOrder: number;
}

export interface SiteSettings {
  id: string;
  theme: 'dark' | 'oled' | 'light';
  accentColor: string;
  enableSections: string; // JSON: { hero, about, skills, projects, news, blog, services, stats, testimonials, contact }
}

export interface SeoSettings {
  id: string;
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  favicon?: string | null;
  ogImage?: string | null;
  twitterCard: string;
  robots: string;
  canonicalUrl: string;
}

export interface DashboardStats {
  counts: {
    projects: { total: number; published: number; draft: number; scheduled: number };
    news: { total: number; published: number; scheduled: number };
    blog: { total: number; published: number };
    messages: { total: number; unread: number };
    media: { total: number; totalBytes: number };
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: string;
    createdAt: string;
  }>;
}
