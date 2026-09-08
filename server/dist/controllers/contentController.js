"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.updateSettings = exports.getSettings = exports.deleteNavigationItem = exports.updateNavigation = exports.getNavigation = exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.getTestimonials = exports.deleteService = exports.updateService = exports.createService = exports.getServices = exports.deleteExperience = exports.updateExperience = exports.createExperience = exports.getExperiences = exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkills = exports.updateProfile = exports.getProfile = void 0;
const config_1 = require("../config");
// ------------------- PROFILE -------------------
const getProfile = async (_req, res) => {
    try {
        let profile = await config_1.prisma.profile.findFirst();
        if (!profile) {
            profile = await config_1.prisma.profile.create({ data: {} });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        let profile = await config_1.prisma.profile.findFirst();
        if (!profile) {
            profile = await config_1.prisma.profile.create({ data: req.body });
        }
        else {
            profile = await config_1.prisma.profile.update({
                where: { id: profile.id },
                data: req.body,
            });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
};
exports.updateProfile = updateProfile;
// ------------------- SKILLS -------------------
const getSkills = async (_req, res) => {
    try {
        const skills = await config_1.prisma.skill.findMany({
            orderBy: [{ sortOrder: 'asc' }, { category: 'asc' }],
        });
        res.json(skills);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get skills' });
    }
};
exports.getSkills = getSkills;
const createSkill = async (req, res) => {
    try {
        const { name, icon, category, percentage, description, sortOrder, published } = req.body;
        const skill = await config_1.prisma.skill.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create skill' });
    }
};
exports.createSkill = createSkill;
const updateSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const skill = await config_1.prisma.skill.update({
            where: { id },
            data: {
                ...req.body,
                percentage: req.body.percentage !== undefined ? parseInt(req.body.percentage, 10) : undefined,
                sortOrder: req.body.sortOrder !== undefined ? parseInt(req.body.sortOrder, 10) : undefined,
            },
        });
        res.json(skill);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update skill' });
    }
};
exports.updateSkill = updateSkill;
const deleteSkill = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.skill.delete({ where: { id } });
        res.json({ message: 'Skill deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete skill' });
    }
};
exports.deleteSkill = deleteSkill;
// ------------------- EXPERIENCE & EDUCATION -------------------
const getExperiences = async (_req, res) => {
    try {
        const experiences = await config_1.prisma.experience.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
        res.json(experiences);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get experiences' });
    }
};
exports.getExperiences = getExperiences;
const createExperience = async (req, res) => {
    try {
        const item = await config_1.prisma.experience.create({ data: req.body });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create experience' });
    }
};
exports.createExperience = createExperience;
const updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await config_1.prisma.experience.update({
            where: { id },
            data: req.body,
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update experience' });
    }
};
exports.updateExperience = updateExperience;
const deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.experience.delete({ where: { id } });
        res.json({ message: 'Experience item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete experience' });
    }
};
exports.deleteExperience = deleteExperience;
// ------------------- SERVICES -------------------
const getServices = async (_req, res) => {
    try {
        const services = await config_1.prisma.service.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get services' });
    }
};
exports.getServices = getServices;
const createService = async (req, res) => {
    try {
        const { title, description, icon, features, sortOrder, published } = req.body;
        const service = await config_1.prisma.service.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create service' });
    }
};
exports.createService = createService;
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { features, sortOrder, ...rest } = req.body;
        const service = await config_1.prisma.service.update({
            where: { id },
            data: {
                ...rest,
                features: features ? (typeof features === 'string' ? features : JSON.stringify(features)) : undefined,
                sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
            },
        });
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update service' });
    }
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.service.delete({ where: { id } });
        res.json({ message: 'Service deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete service' });
    }
};
exports.deleteService = deleteService;
// ------------------- TESTIMONIALS -------------------
const getTestimonials = async (_req, res) => {
    try {
        const list = await config_1.prisma.testimonial.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json(list);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get testimonials' });
    }
};
exports.getTestimonials = getTestimonials;
const createTestimonial = async (req, res) => {
    try {
        const item = await config_1.prisma.testimonial.create({ data: req.body });
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create testimonial' });
    }
};
exports.createTestimonial = createTestimonial;
const updateTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await config_1.prisma.testimonial.update({
            where: { id },
            data: req.body,
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update testimonial' });
    }
};
exports.updateTestimonial = updateTestimonial;
const deleteTestimonial = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.testimonial.delete({ where: { id } });
        res.json({ message: 'Testimonial deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete testimonial' });
    }
};
exports.deleteTestimonial = deleteTestimonial;
// ------------------- NAVIGATION -------------------
const getNavigation = async (_req, res) => {
    try {
        const items = await config_1.prisma.navigationItem.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get navigation' });
    }
};
exports.getNavigation = getNavigation;
const updateNavigation = async (req, res) => {
    try {
        const { items } = req.body;
        if (Array.isArray(items)) {
            for (const item of items) {
                if (item.id) {
                    await config_1.prisma.navigationItem.update({
                        where: { id: item.id },
                        data: {
                            label: item.label,
                            url: item.url,
                            isExternal: Boolean(item.isExternal),
                            isVisible: Boolean(item.isVisible),
                            sortOrder: item.sortOrder !== undefined ? parseInt(item.sortOrder, 10) : 0,
                        },
                    });
                }
                else {
                    await config_1.prisma.navigationItem.create({
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
        const updated = await config_1.prisma.navigationItem.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update navigation' });
    }
};
exports.updateNavigation = updateNavigation;
const deleteNavigationItem = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.navigationItem.delete({ where: { id } });
        res.json({ message: 'Navigation item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete navigation item' });
    }
};
exports.deleteNavigationItem = deleteNavigationItem;
// ------------------- SEO & SITE SETTINGS -------------------
const getSettings = async (_req, res) => {
    try {
        let site = await config_1.prisma.siteSettings.findFirst();
        if (!site) {
            site = await config_1.prisma.siteSettings.create({ data: {} });
        }
        let seo = await config_1.prisma.seoSettings.findFirst();
        if (!seo) {
            seo = await config_1.prisma.seoSettings.create({ data: {} });
        }
        res.json({ site, seo });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to get settings' });
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res) => {
    try {
        const { site, seo } = req.body;
        let updatedSite;
        if (site) {
            const currentSite = await config_1.prisma.siteSettings.findFirst();
            if (currentSite) {
                updatedSite = await config_1.prisma.siteSettings.update({
                    where: { id: currentSite.id },
                    data: site,
                });
            }
            else {
                updatedSite = await config_1.prisma.siteSettings.create({ data: site });
            }
        }
        let updatedSeo;
        if (seo) {
            const currentSeo = await config_1.prisma.seoSettings.findFirst();
            if (currentSeo) {
                updatedSeo = await config_1.prisma.seoSettings.update({
                    where: { id: currentSeo.id },
                    data: seo,
                });
            }
            else {
                updatedSeo = await config_1.prisma.seoSettings.create({ data: seo });
            }
        }
        res.json({ site: updatedSite, seo: updatedSeo });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
};
exports.updateSettings = updateSettings;
// ------------------- DASHBOARD STATS & RECENT ACTIVITY -------------------
const getDashboardStats = async (_req, res) => {
    try {
        const [totalProjects, publishedProjects, draftProjects, scheduledProjects, totalNews, publishedNews, scheduledNews, totalBlogPosts, publishedBlogPosts, totalMessages, unreadMessages, totalMedia, mediaSizeAgg, recentActivity,] = await Promise.all([
            config_1.prisma.project.count(),
            config_1.prisma.project.count({ where: { status: 'PUBLISHED' } }),
            config_1.prisma.project.count({ where: { status: 'DRAFT' } }),
            config_1.prisma.project.count({ where: { status: 'SCHEDULED' } }),
            config_1.prisma.news.count(),
            config_1.prisma.news.count({ where: { status: 'PUBLISHED' } }),
            config_1.prisma.news.count({ where: { status: 'SCHEDULED' } }),
            config_1.prisma.blogPost.count(),
            config_1.prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
            config_1.prisma.contactMessage.count(),
            config_1.prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
            config_1.prisma.media.count(),
            config_1.prisma.media.aggregate({ _sum: { size: true } }),
            config_1.prisma.activityLog.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
