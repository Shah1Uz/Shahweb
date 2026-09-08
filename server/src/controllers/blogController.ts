import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const getBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, tag, search, featured, limit, page } = req.query;
    const where: any = {};

    const isAdmin = (req as AuthRequest).user?.role === 'ADMIN';

    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = category;
    }

    if (tag && typeof tag === 'string') {
      where.tags = { contains: tag };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = page ? (parseInt(page as string, 10) - 1) * take : 0;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        take,
        skip,
      }),
      prisma.blogPost.count({ where }),
    ]);

    res.json({ posts, total, page: page ? parseInt(page as string, 10) : 1, limit: take });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch blog posts' });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch blog post' });
  }
};

export const createBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      videoUrl,
      audioUrl,
      category,
      tags,
      author,
      readingTime,
      seoTitle,
      seoDesc,
      seoKeywords,
      ogImage,
      featured,
      status,
      scheduledAt,
      images,
    } = req.body;

    if (!title || !slug || !excerpt || !content || !coverImage) {
      res.status(400).json({ error: 'Title, slug, excerpt, content, and cover image are required' });
      return;
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'A blog post with this slug already exists' });
      return;
    }

    // Compute approximate reading time if not provided
    const words = content.split(/\s+/).length;
    const calculatedReadingTime = readingTime || `${Math.max(1, Math.ceil(words / 200))} min read`;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        videoUrl,
        audioUrl,
        category: category || 'Engineering',
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        author: author || req.user?.name || 'Shahzod',
        readingTime: calculatedReadingTime,
        seoTitle: seoTitle || title,
        seoDesc: seoDesc || excerpt,
        seoKeywords,
        ogImage: ogImage || coverImage,
        featured: Boolean(featured),
        status: status || 'PUBLISHED',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
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
        entityType: 'BlogPost',
        entityId: post.id,
        details: `Created blog post: "${post.title}"`,
      },
    });

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create blog post' });
  }
};

export const updateBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      videoUrl,
      audioUrl,
      category,
      tags,
      author,
      readingTime,
      seoTitle,
      seoDesc,
      seoKeywords,
      ogImage,
      featured,
      status,
      scheduledAt,
      images,
    } = req.body;

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    if (slug && slug !== existing.slug) {
      const conflict = await prisma.blogPost.findUnique({ where: { slug } });
      if (conflict) {
        res.status(400).json({ error: 'Slug is already used' });
        return;
      }
    }

    if (images && Array.isArray(images)) {
      await prisma.blogImage.deleteMany({ where: { blogPostId: id } });
      await prisma.blogImage.createMany({
        data: images.map((img: any, idx: number) => ({
          blogPostId: id,
          url: typeof img === 'string' ? img : img.url,
          caption: typeof img === 'object' ? img.caption : '',
          sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
        })),
      });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        videoUrl,
        audioUrl,
        category,
        tags: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined,
        author,
        readingTime,
        seoTitle,
        seoDesc,
        seoKeywords,
        ogImage,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: status === 'PUBLISHED' && !existing.publishedAt ? new Date() : undefined,
      },
      include: { images: true },
    });

    await prisma.activityLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'BlogPost',
        entityId: updated.id,
        details: `Updated blog post: "${updated.title}"`,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update blog post' });
  }
};

export const deleteBlogPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.blogPost.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    await prisma.blogPost.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entityType: 'BlogPost',
        entityId: id,
        details: `Deleted blog post: "${item.title}"`,
      },
    });

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete blog post' });
  }
};
