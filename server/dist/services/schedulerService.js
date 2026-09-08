"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = exports.checkAndPublishScheduledContent = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const config_1 = require("../config");
const checkAndPublishScheduledContent = async () => {
    const now = new Date();
    try {
        // 1. Auto-publish scheduled News
        const scheduledNews = await config_1.prisma.news.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: now },
            },
        });
        for (const item of scheduledNews) {
            await config_1.prisma.news.update({
                where: { id: item.id },
                data: { status: 'PUBLISHED' },
            });
            await config_1.prisma.activityLog.create({
                data: {
                    action: 'PUBLISH',
                    entityType: 'News',
                    entityId: item.id,
                    details: `Auto-published scheduled news: "${item.title}"`,
                },
            });
            console.log(`[SCHEDULER] Auto-published news: "${item.title}"`);
        }
        // 2. Auto-expire News past expiresAt
        const expiredNews = await config_1.prisma.news.findMany({
            where: {
                status: 'PUBLISHED',
                expiresAt: { lte: now },
            },
        });
        for (const item of expiredNews) {
            await config_1.prisma.news.update({
                where: { id: item.id },
                data: { status: 'EXPIRED' },
            });
            console.log(`[SCHEDULER] Auto-expired news: "${item.title}"`);
        }
        // 3. Auto-publish scheduled Projects
        const scheduledProjects = await config_1.prisma.project.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: now },
            },
        });
        for (const item of scheduledProjects) {
            await config_1.prisma.project.update({
                where: { id: item.id },
                data: { status: 'PUBLISHED' },
            });
            await config_1.prisma.activityLog.create({
                data: {
                    action: 'PUBLISH',
                    entityType: 'Project',
                    entityId: item.id,
                    details: `Auto-published scheduled project: "${item.title}"`,
                },
            });
            console.log(`[SCHEDULER] Auto-published project: "${item.title}"`);
        }
        // 4. Auto-publish scheduled Blog posts
        const scheduledBlog = await config_1.prisma.blogPost.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: now },
            },
        });
        for (const item of scheduledBlog) {
            await config_1.prisma.blogPost.update({
                where: { id: item.id },
                data: { status: 'PUBLISHED', publishedAt: now },
            });
            await config_1.prisma.activityLog.create({
                data: {
                    action: 'PUBLISH',
                    entityType: 'BlogPost',
                    entityId: item.id,
                    details: `Auto-published scheduled blog post: "${item.title}"`,
                },
            });
            console.log(`[SCHEDULER] Auto-published blog post: "${item.title}"`);
        }
    }
    catch (error) {
        console.error('[SCHEDULER] Error checking scheduled content:', error);
    }
};
exports.checkAndPublishScheduledContent = checkAndPublishScheduledContent;
const startScheduler = () => {
    console.log('[SCHEDULER] Starting content publication scheduler (every 30 seconds)...');
    // Check every 30 seconds
    node_cron_1.default.schedule('*/30 * * * * *', async () => {
        await (0, exports.checkAndPublishScheduledContent)();
    });
    // Also run immediately on startup
    (0, exports.checkAndPublishScheduledContent)();
};
exports.startScheduler = startScheduler;
