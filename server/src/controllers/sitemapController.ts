import { Request, Response } from 'express';
import { prisma } from '../config';

export const getSitemap = async (_req: Request, res: Response): Promise<void> => {
  try {
    const seo = await prisma.seoSettings.findFirst();
    const siteUrl = seo?.canonicalUrl?.replace(/\/$/, '') || 'https://shahuz.dev';

    const [projects, news, blog] = await Promise.all([
      prisma.project.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.news.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const staticRoutes = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/projects', priority: '0.9', changefreq: 'weekly' },
      { url: '/news', priority: '0.8', changefreq: 'daily' },
      { url: '/blog', priority: '0.8', changefreq: 'weekly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}${route.url}</loc>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const item of projects) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/projects/${item.slug}</loc>\n`;
      xml += `    <lastmod>${item.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const item of news) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/news/${item.slug}</loc>\n`;
      xml += `    <lastmod>${item.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const item of blog) {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/blog/${item.slug}</loc>\n`;
      xml += `    <lastmod>${item.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    res.status(500).send('Error generating sitemap');
  }
};
