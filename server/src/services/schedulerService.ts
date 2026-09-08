import cron from 'node-cron';
import { prisma } from '../config';

export const checkAndPublishScheduledContent = async () => {
  const now = new Date();

  try {
    // 1. Auto-publish scheduled News
    const scheduledNews = await prisma.news.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
    });

    for (const item of scheduledNews) {
      await prisma.news.update({
        where: { id: item.id },
        data: { status: 'PUBLISHED' },
      });
      await prisma.activityLog.create({
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
    const expiredNews = await prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lte: now },
      },
    });

    for (const item of expiredNews) {
      await prisma.news.update({
        where: { id: item.id },
        data: { status: 'EXPIRED' },
      });
      console.log(`[SCHEDULER] Auto-expired news: "${item.title}"`);
    }

    // 3. Auto-publish scheduled Projects
    const scheduledProjects = await prisma.project.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
    });

    for (const item of scheduledProjects) {
      await prisma.project.update({
        where: { id: item.id },
        data: { status: 'PUBLISHED' },
      });
      await prisma.activityLog.create({
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
    const scheduledBlog = await prisma.blogPost.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
    });

    for (const item of scheduledBlog) {
      await prisma.blogPost.update({
        where: { id: item.id },
        data: { status: 'PUBLISHED', publishedAt: now },
      });
      await prisma.activityLog.create({
        data: {
          action: 'PUBLISH',
          entityType: 'BlogPost',
          entityId: item.id,
          details: `Auto-published scheduled blog post: "${item.title}"`,
        },
      });
      console.log(`[SCHEDULER] Auto-published blog post: "${item.title}"`);
    }
  } catch (error) {
    console.error('[SCHEDULER] Error checking scheduled content:', error);
  }
};

export const startScheduler = () => {
  console.log('[SCHEDULER] Starting content publication scheduler (every 30 seconds)...');
  // Check every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    await checkAndPublishScheduledContent();
  });
  // Also run immediately on startup
  checkAndPublishScheduledContent();
};
