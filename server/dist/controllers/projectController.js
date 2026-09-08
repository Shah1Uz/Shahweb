"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectBySlug = exports.getProjects = void 0;
const config_1 = require("../config");
const getProjects = async (req, res) => {
    try {
        const { status, category, featured, search, limit, page } = req.query;
        const where = {};
        // Check if user is authenticated admin
        const isAdmin = req.user?.role === 'ADMIN';
        if (!isAdmin) {
            where.status = 'PUBLISHED';
        }
        else if (status && typeof status === 'string' && status !== 'ALL') {
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
        const take = limit ? parseInt(limit, 10) : 50;
        const skip = page ? (parseInt(page, 10) - 1) * take : 0;
        const [projects, total] = await Promise.all([
            config_1.prisma.project.findMany({
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
            config_1.prisma.project.count({ where }),
        ]);
        res.json({ projects, total, page: page ? parseInt(page, 10) : 1, limit: take });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch projects' });
    }
};
exports.getProjects = getProjects;
const getProjectBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const project = await config_1.prisma.project.findUnique({
            where: { slug },
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch project' });
    }
};
exports.getProjectBySlug = getProjectBySlug;
const createProject = async (req, res) => {
    try {
        const { title, slug, shortDesc, fullDesc, coverImage, videoUrl, audioUrl, technologies, githubUrl, liveDemoUrl, client, date, category, featured, status, scheduledAt, sortOrder, images, } = req.body;
        if (!title || !slug || !shortDesc || !fullDesc || !coverImage) {
            res.status(400).json({ error: 'Title, slug, descriptions, and cover image are required' });
            return;
        }
        const existing = await config_1.prisma.project.findUnique({ where: { slug } });
        if (existing) {
            res.status(400).json({ error: 'A project with this slug already exists' });
            return;
        }
        const project = await config_1.prisma.project.create({
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
                entityType: 'Project',
                entityId: project.id,
                details: `Created project: "${project.title}"`,
            },
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create project' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, shortDesc, fullDesc, coverImage, videoUrl, audioUrl, technologies, githubUrl, liveDemoUrl, client, date, category, featured, status, scheduledAt, sortOrder, images, } = req.body;
        const existing = await config_1.prisma.project.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        if (slug && slug !== existing.slug) {
            const slugConflict = await config_1.prisma.project.findUnique({ where: { slug } });
            if (slugConflict) {
                res.status(400).json({ error: 'Slug is already used by another project' });
                return;
            }
        }
        // Update images if provided
        if (images && Array.isArray(images)) {
            await config_1.prisma.projectImage.deleteMany({ where: { projectId: id } });
            await config_1.prisma.projectImage.createMany({
                data: images.map((img, idx) => ({
                    projectId: id,
                    url: typeof img === 'string' ? img : img.url,
                    caption: typeof img === 'object' ? img.caption : '',
                    sortOrder: typeof img === 'object' && img.sortOrder !== undefined ? img.sortOrder : idx,
                })),
            });
        }
        const updated = await config_1.prisma.project.update({
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
            },
            include: { images: true },
        });
        await config_1.prisma.activityLog.create({
            data: {
                action: 'UPDATE',
                entityType: 'Project',
                entityId: updated.id,
                details: `Updated project: "${updated.title}"`,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update project' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await config_1.prisma.project.findUnique({ where: { id } });
        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }
        await config_1.prisma.project.delete({ where: { id } });
        await config_1.prisma.activityLog.create({
            data: {
                action: 'DELETE',
                entityType: 'Project',
                entityId: id,
                details: `Deleted project: "${project.title}"`,
            },
        });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete project' });
    }
};
exports.deleteProject = deleteProject;
