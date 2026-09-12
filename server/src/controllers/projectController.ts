import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, featured, search, limit, page } = req.query;
    const where: any = {};

    // Check if user is authenticated admin
    const isAdmin = (req as AuthRequest).user?.role === 'ADMIN';

    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { shortDesc: { contains: search } },
        { technologies: { contains: search } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = page ? (parseInt(page as string, 10) - 1) * take : 0;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({ projects, total, page: page ? parseInt(page as string, 10) : 1, limit: take });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
};

export const getProjectBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const project = await prisma.project.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error: any) {
    try {
      const fallback = await prisma.project.findUnique({
        where: { slug: req.params.slug },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      if (fallback) {
        res.json(fallback);
        return;
      }
    } catch {}
    res.status(404).json({ error: 'Project not found' });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      shortDesc,
      fullDesc,
      coverImage,
      videoUrl,
      audioUrl,
      technologies,
      githubUrl,
      liveDemoUrl,
      client,
      date,
      category,
      featured,
      status,
      scheduledAt,
      sortOrder,
      images,
    } = req.body;

    if (!title || !slug || !shortDesc || !fullDesc || !coverImage) {
      res.status(400).json({ error: 'Title, slug, descriptions, and cover image are required' });
      return;
    }

    const existing = await prisma.project.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'A project with this slug already exists' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        shortDesc,
        fullDesc,
        coverImage,
        videoUrl,
        audioUrl,
        technologies: typeof technologies === 'string' ? technologies : JSON.stringify(technologies || []),
        githubUrl,
        liveDemoUrl,
        client,
        date,
        category: category || 'Web Application',
        featured: Boolean(featured),
        status: status || 'PUBLISHED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        images: images && Array.isArray(images)
          ? {
              create: images.map((img: any, idx: number) => ({
                url: typeof img === 'string' ? img : img.url,
                caption: typeof img === 'object' ? img.caption : '',
                sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Project',
        entityId: project.id,
        details: `Created project: "${project.title}"`,
      },
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      shortDesc,
      fullDesc,
      coverImage,
      videoUrl,
      audioUrl,
      technologies,
      githubUrl,
      liveDemoUrl,
      client,
      date,
      category,
      featured,
      status,
      scheduledAt,
      sortOrder,
      images,
    } = req.body;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (slug && slug !== existing.slug) {
      const slugConflict = await prisma.project.findUnique({ where: { slug } });
      if (slugConflict) {
        res.status(400).json({ error: 'Slug is already used by another project' });
        return;
      }
    }

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.projectImage.deleteMany({ where: { projectId: id } });
      await prisma.projectImage.createMany({
        data: images.map((img: any, idx: number) => ({
          projectId: id,
          url: typeof img === 'string' ? img : img.url,
          caption: typeof img === 'object' ? img.caption : '',
          sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
        })),
      });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title,
        slug,
        shortDesc,
        fullDesc,
        coverImage,
        videoUrl,
        audioUrl,
        technologies: technologies ? (typeof technologies === 'string' ? technologies : JSON.stringify(technologies)) : undefined,
        githubUrl,
        liveDemoUrl,
        client,
        date,
        category,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        viewCount: req.body.viewCount !== undefined ? Math.max(0, parseInt(req.body.viewCount, 10)) : undefined,
        likeCount: req.body.likeCount !== undefined ? Math.max(0, parseInt(req.body.likeCount, 10)) : undefined,
      },
      include: { images: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Project',
        entityId: updated.id,
        details: `Updated project: "${updated.title}"`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.project.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Project',
        entityId: id,
        details: `Deleted project: "${project.title}"`,
      },
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
};

// Public reaction endpoint
export const reactToProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const delta = typeof req.body.delta === 'number' ? req.body.delta : 1;

    const project = await prisma.project.update({
      where: { id },
      data: {
        likeCount: {
          increment: delta,
        },
      },
      select: {
        id: true,
        likeCount: true,
        viewCount: true,
      },
    });

    res.json({ success: true, likeCount: project.likeCount, viewCount: project.viewCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to record reaction' });
  }
};

// Admin stats adjustment endpoint (add, subtract, or override)
export const updateProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { viewCount, likeCount, deltaViews, deltaLikes } = req.body;

    const current = await prisma.project.findUnique({ where: { id } });
    if (!current) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    let newViews = current.viewCount;
    if (typeof viewCount === 'number') {
      newViews = Math.max(0, viewCount);
    } else if (typeof deltaViews === 'number') {
      newViews = Math.max(0, current.viewCount + deltaViews);
    }

    let newLikes = current.likeCount;
    if (typeof likeCount === 'number') {
      newLikes = Math.max(0, likeCount);
    } else if (typeof deltaLikes === 'number') {
      newLikes = Math.max(0, current.likeCount + deltaLikes);
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        viewCount: newViews,
        likeCount: newLikes,
      },
      include: { images: true },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update project stats' });
  }
};
