"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNews = exports.updateNews = exports.createNews = exports.getNewsBySlug = exports.getNews = void 0;
const config_1 = require("../config");
const getNews = async (req, res) => {
    try {
        const { status, category, search, includeScheduled, limit, page } = req.query;
        const where = {};
        const isAdmin = req.user?.role === 'ADMIN';
        if (!isAdmin) {
            if (includeScheduled === 'true') {
                where.status = { in: ['PUBLISHED', 'SCHEDULED'] };
            }
            else {
                where.status = 'PUBLISHED';
            }
        }
        else if (status && typeof status === 'string' && status !== 'ALL') {
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
        const take = limit ? parseInt(limit, 10) : 50;
        const skip = page ? (parseInt(page, 10) - 1) * take : 0;
        const [news, total] = await Promise.all([
            config_1.prisma.news.findMany({
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
            config_1.prisma.news.count({ where }),
        ]);
        res.json({ news, total, page: page ? parseInt(page, 10) : 1, limit: take });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch news' });
    }
};
exports.getNews = getNews;
const getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const item = await config_1.prisma.news.findUnique({
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
        await config_1.prisma.news.update({
            where: { id: item.id },
            data: { viewCount: { increment: 1 } },
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch news article' });
    }
};
exports.getNewsBySlug = getNewsBySlug;
const createNews = async (req, res) => {
    try {
        const { title, slug, shortDesc, fullContent, coverImage, videoUrl, audioUrl, category, tags, author, featured, status, scheduledAt, expiresAt, images, } = req.body;
        if (!title || !slug || !shortDesc || !coverImage) {
            res.status(400).json({ error: 'Title, slug, description, and cover image are required' });
            return;
        }
        const existing = await config_1.prisma.news.findUnique({ where: { slug } });
        if (existing) {
            res.status(400).json({ error: 'A news item with this slug already exists' });
            return;
        }
        const item = await config_1.prisma.news.create({
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
                        create: images.map((img, idx) => ({
                            url: typeof img === 'string' ? img : img.url,
                            caption: typeof img === 'object' ? img.caption : '',
                            sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
                        })),
                    }
                    : undefined,
            },
            include: { images: true },
        });
        await config_1.prisma.activityLog.create({
            data: {
                action: 'CREATE',
                entityType: 'News',
                entityId: item.id,
                details: `Created news: "${item.title}" with status ${item.status}`,
            },
        });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create news' });
    }
};
exports.createNews = createNews;
const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, shortDesc, fullContent, coverImage, videoUrl, audioUrl, category, tags, author, featured, status, scheduledAt, expiresAt, images, } = req.body;
        const existing = await config_1.prisma.news.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'News item not found' });
            return;
        }
        if (slug && slug !== existing.slug) {
            const conflict = await config_1.prisma.news.findUnique({ where: { slug } });
            if (conflict) {
                res.status(400).json({ error: 'Slug is already used' });
                return;
            }
        }
        if (images && Array.isArray(images)) {
            await config_1.prisma.newsImage.deleteMany({ where: { newsId: id } });
            await config_1.prisma.newsImage.createMany({
                data: images.map((img, idx) => ({
                    newsId: id,
                    url: typeof img === 'string' ? img : img.url,
                    caption: typeof img === 'object' ? img.caption : '',
                    sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
                })),
            });
        }
        const updated = await config_1.prisma.news.update({
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
        await config_1.prisma.activityLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'News',
                entityId: updated.id,
                details: `Updated news: "${updated.title}"`,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update news' });
    }
};
exports.updateNews = updateNews;
const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await config_1.prisma.news.findUnique({ where: { id } });
        if (!item) {
            res.status(404).json({ error: 'News item not found' });
            return;
        }
        await config_1.prisma.news.delete({ where: { id } });
        await config_1.prisma.activityLog.create({
            data: {
                action: 'DELETE',
                entityType: 'News',
                entityId: id,
                details: `Deleted news: "${item.title}"`,
            },
        });
        res.json({ message: 'News item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete news' });
    }
};
exports.deleteNews = deleteNews;
