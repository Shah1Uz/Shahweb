import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

// ------------------- PROFILE -------------------
export const getProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({ data: {} });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let profile = await prisma.profile.findFirst();
    if (!profile) {
      profile = await prisma.profile.create({ data: req.body });
    } else {
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: req.body,
      });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
};

// ------------------- SKILLS -------------------
export const getSkills = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
    });
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get skills' });
  }
};

export const createSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, icon, category, percentage, description, sortOrder, published } = req.body;
    const skill = await prisma.skill.create({
      data: {
        name,
        icon: icon || 'Code',
        category: category || 'Frontend',
        percentage: percentage !== undefined ? parseInt(percentage, 10) : 90,
        description,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        published: published !== undefined ? Boolean(published) : true,
      },
    });
    res.status(201).json(skill);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create skill' });
  }
};

export const updateSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.update({
      where: { id },
      data: {
        ...req.body,
        percentage: req.body.percentage !== undefined ? parseInt(req.body.percentage, 10) : undefined,
        sortOrder: req.body.sortOrder !== undefined ? parseInt(req.body.sortOrder, 10) : undefined,
      },
    });
    res.json(skill);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update skill' });
  }
};

export const deleteSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.skill.delete({ where: { id } });
    res.json({ message: 'Skill deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete skill' });
  }
};

// ------------------- EXPERIENCE & EDUCATION -------------------
export const getExperiences = async (_req: Request, res: Response): Promise<void> => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(experiences);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get experiences' });
  }
};

export const createExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.experience.create({ data: req.body });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create experience' });
  }
};

export const updateExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.experience.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update experience' });
  }
};

export const deleteExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.experience.delete({ where: { id } });
    res.json({ message: 'Experience item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete experience' });
  }
};

// ------------------- SERVICES -------------------
export const getServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get services' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, icon, features, sortOrder, published } = req.body;
    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon: icon || 'Code',
        features: typeof features === 'string' ? features : JSON.stringify(features || []),
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        published: published !== undefined ? Boolean(published) : true,
      },
    });
    res.status(201).json(service);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create service' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { features, sortOrder, ...rest } = req.body;
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...rest,
        features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
      },
    });
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update service' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete service' });
  }
};

// ------------------- TESTIMONIALS -------------------
export const getTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    const list = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get testimonials' });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await prisma.testimonial.create({ data: req.body });
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create testimonial' });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.testimonial.update({
      where: { id },
      data: req.body,
    });
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update testimonial' });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.testimonial.delete({ where: { id } });
    res.json({ message: 'Testimonial deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete testimonial' });
  }
};

// ------------------- NAVIGATION -------------------
export const getNavigation = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.navigationItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get navigation' });
  }
};

export const updateNavigation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          await prisma.navigationItem.update({
            where: { id: item.id },
            data: {
              label: item.label,
              url: item.url,
              isExternal: Boolean(item.isExternal),
              isVisible: Boolean(item.isVisible),
              sortOrder: item.sortOrder !== undefined ? parseInt(item.sortOrder, 10) : 0,
            },
          });
        } else {
          await prisma.navigationItem.create({
            data: {
              label: item.label,
              url: item.url,
              isExternal: Boolean(item.isExternal),
              isVisible: item.isVisible !== undefined ? Boolean(item.isVisible) : true,
              sortOrder: item.sortOrder !== undefined ? parseInt(item.sortOrder, 10) : 0,
            },
          });
        }
      }
    }
    const updated = await prisma.navigationItem.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update navigation' });
  }
};

export const deleteNavigationItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.navigationItem.delete({ where: { id } });
    res.json({ message: 'Navigation item deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete navigation item' });
  }
};

// ------------------- SEO & SITE SETTINGS -------------------
export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let site = await prisma.siteSettings.findFirst();
    if (!site) {
      site = await prisma.siteSettings.create({ data: {} });
    }

    let seo = await prisma.seoSettings.findFirst();
    if (!seo) {
      seo = await prisma.seoSettings.create({ data: {} });
    }

    res.json({ site, seo });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get settings' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { site, seo } = req.body;

    let updatedSite;
    if (site) {
      const currentSite = await prisma.siteSettings.findFirst();
      if (currentSite) {
        updatedSite = await prisma.siteSettings.update({
          where: { id: currentSite.id },
          data: site,
        });
      } else {
        updatedSite = await prisma.siteSettings.create({ data: site });
      }
    }

    let updatedSeo;
    if (seo) {
      const currentSeo = await prisma.seoSettings.findFirst();
      if (currentSeo) {
        updatedSeo = await prisma.seoSettings.update({
          where: { id: currentSeo.id },
          data: seo,
        });
      } else {
        updatedSeo = await prisma.seoSettings.create({ data: seo });
      }
    }

    res.json({ site: updatedSite, seo: updatedSeo });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
};

// ------------------- DASHBOARD STATS & RECENT ACTIVITY -------------------
export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalProjects,
      publishedProjects,
      draftProjects,
      scheduledProjects,
      totalNews,
      publishedNews,
      scheduledNews,
      totalBlogPosts,
      publishedBlogPosts,
      totalMessages,
      unreadMessages,
      totalMedia,
      mediaSizeAgg,
      recentActivity,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PUBLISHED' } }),
      prisma.project.count({ where: { status: 'DRAFT' } }),
      prisma.project.count({ where: { status: 'SCHEDULED' } }),
      prisma.news.count(),
      prisma.news.count({ where: { status: 'PUBLISHED' } }),
      prisma.news.count({ where: { status: 'SCHEDULED' } }),
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
      prisma.media.count(),
      prisma.media.aggregate({ _sum: { size: true } }),
      prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      counts: {
        projects: {
          total: totalProjects,
          published: publishedProjects,
          draft: draftProjects,
          scheduled: scheduledProjects,
        },
        news: {
          total: totalNews,
          published: publishedNews,
          scheduled: scheduledNews,
        },
        blog: {
          total: totalBlogPosts,
          published: publishedBlogPosts,
        },
        messages: {
          total: totalMessages,
          unread: unreadMessages,
        },
        media: {
          total: totalMedia,
          totalBytes: mediaSizeAgg._sum.size || 0,
        },
      },
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
};
