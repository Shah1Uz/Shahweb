import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const getNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, search, includeScheduled, limit, page } = req.query;
    const where: any = {};

    const isAdmin = (req as AuthRequest).user?.role === 'ADMIN';

    if (!isAdmin) {
      if (includeScheduled === 'true') {
        where.status = { in: ['PUBLISHED', 'SCHEDULED'] };
      } else {
        where.status = 'PUBLISHED';
      }
    } else if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = category;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { shortDesc: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = page ? (parseInt(page as string, 10) - 1) * take : 0;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ featured: 'desc' }, { scheduledAt: 'asc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      prisma.news.count({ where }),
    ]);

    res.json({ news, total, page: page ? parseInt(page as string, 10) : 1, limit: take });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch news' });
  }
};

export const getNewsBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const item = await prisma.news.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!item) {
      res.status(404).json({ error: 'News item not found' });
      return;
    }

    // Increment view count in background
    await prisma.news.update({
      where: { id: item.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch news article' });
  }
};

export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      shortDesc,
      fullContent,
      coverImage,
      videoUrl,
      audioUrl,
      category,
      tags,
      author,
      featured,
      status,
      scheduledAt,
      expiresAt,
      images,
    } = req.body;

    if (!title || !slug || !shortDesc || !coverImage) {
      res.status(400).json({ error: 'Title, slug, description, and cover image are required' });
      return;
    }

    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'A news item with this slug already exists' });
      return;
    }

    const item = await prisma.news.create({
      data: {
        title,
        slug,
        shortDesc,
        fullContent: fullContent || shortDesc,
        coverImage,
        videoUrl,
        audioUrl,
        category: category || 'Announcement',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        author: author || req.user?.name || 'Admin',
        featured: Boolean(featured),
        status: status || 'PUBLISHED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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
        entityType: 'News',
        entityId: item.id,
        details: `Created news: "${item.title}" with status ${item.status}`,
      },
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create news' });
  }
};

export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      shortDesc,
      fullContent,
      coverImage,
      videoUrl,
      audioUrl,
      category,
      tags,
      author,
      featured,
      status,
      scheduledAt,
      expiresAt,
      images,
    } = req.body;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'News item not found' });
      return;
    }

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.news.findUnique({ where: { slug } });
      if (conflict) {
        res.status(400).json({ error: 'Slug is already used' });
        return;
      }
    }

    if (images && Array.isArray(images)) {
      await prisma.newsImage.deleteMany({ where: { newsId: id } });
      await prisma.newsImage.createMany({
        data: images.map((img: any, idx: number) => ({
          newsId: id,
          url: typeof img === 'string' ? img : img.url,
          caption: typeof img === 'object' ? img.caption : '',
          sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
        })),
      });
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title,
        slug,
        shortDesc,
        fullContent,
        coverImage,
        videoUrl,
        audioUrl,
        category,
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined,
        author,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: { images: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'News',
        entityId: updated.id,
        details: `Updated news: "${updated.title}"`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update news' });
  }
};

export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.news.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'News item not found' });
      return;
    }

    await prisma.news.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entityType: 'News',
        entityId: id,
        details: `Deleted news: "${item.title}"`,
      },
    });

    res.json({ message: 'News item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete news' });
  }
};
