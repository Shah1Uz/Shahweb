import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const uploadMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided for upload' });
      return;
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}/uploads`;

    const savedMedia = [];

    for (const file of files) {
      let base64Data: string | null = null;
      try {
        if (file.path && fs.existsSync(file.path)) {
          base64Data = fs.readFileSync(file.path).toString('base64');
        }
      } catch (err) {
        console.warn('Could not read file for DB backup:', err);
      }

      const fileUrl = `${baseUrl}/${file.filename}`;
      const media = await prisma.media.create({
        data: {
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: fileUrl,
          path: file.path,
          data: base64Data,
        },
      });

      // Omit bulky base64 data from response
      const { data: _, ...mediaMeta } = media as any;
      savedMedia.push(mediaMeta);
    }

    await prisma.activityLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Media',
        details: `Uploaded ${files.length} file(s)`,
      },
    });

    res.status(201).json({
      message: 'Files uploaded successfully',
      media: savedMedia,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Media upload failed' });
  }
};

export const getMediaList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, search, page, limit } = req.query;
    const where: any = {};

    if (type && typeof type === 'string' && type !== 'ALL') {
      if (type === 'image') where.mimeType = { startsWith: 'image/' };
      else if (type === 'video') where.mimeType = { startsWith: 'video/' };
      else if (type === 'audio') where.mimeType = { startsWith: 'audio/' };
      else if (type === 'document') where.mimeType = 'application/pdf';
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { originalName: { contains: search } },
        { fileName: { contains: search } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = page ? (parseInt(page as string, 10) - 1) * take : 0;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        select: {
          id: true,
          fileName: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          path: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.media.count({ where }),
    ]);

    // Compute disk stats
    const totalBytes = await prisma.media.aggregate({
      _sum: { size: true },
    });

    res.json({
      media,
      total,
      totalBytes: totalBytes._sum.size || 0,
      page: page ? parseInt(page as string, 10) : 1,
      limit: take,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch media' });
  }
};

export const serveMediaFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { id: identifier },
          { fileName: identifier },
        ],
      },
    });

    if (!media) {
      res.status(404).send('Media not found');
      return;
    }

    // If file physically exists on disk, stream it
    if (media.path && fs.existsSync(media.path)) {
      res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      fs.createReadStream(media.path).pipe(res);
      return;
    }

    // If file was wiped on ephemeral container restart, restore from DB
    if (!media.data) {
      res.status(404).send('Media content not found in database');
      return;
    }

    const buffer = Buffer.from(media.data, 'base64');

    // Restore to disk cache
    try {
      if (media.path) {
        const dir = path.dirname(media.path);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(media.path, buffer);
      }
    } catch {}

    const totalSize = buffer.length;
    const range = req.headers.range;

    res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.setHeader('Content-Length', chunkSize);
      res.end(buffer.slice(start, end + 1));
    } else {
      res.setHeader('Content-Length', totalSize);
      res.end(buffer);
    }
  } catch (error: any) {
    res.status(500).send('Error serving media file');
  }
};

export const deleteMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const item = await prisma.media.findUnique({ where: { id } });
    if (!item) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }

    // Try deleting file from disk
    if (fs.existsSync(item.path)) {
      try {
        fs.unlinkSync(item.path);
      } catch (err) {
        console.warn('Failed to delete physical file from disk:', err);
      }
    }

    await prisma.media.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Media',
        entityId: id,
        details: `Deleted media file: ${item.originalName}`,
      },
    });

    res.json({ message: 'Media deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete media' });
  }
};

export const renameMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const item = await prisma.media.update({
      where: { id },
      data: { originalName: name },
    });

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to rename media' });
  }
};
