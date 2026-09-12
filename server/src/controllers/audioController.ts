import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAudioTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = (req as AuthRequest).user?.role === 'ADMIN';
    const where: any = {};
    if (!isAdmin) {
      where.published = true;
    }

    const tracks = await prisma.audioTrack.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch audio tracks' });
  }
};

export const createAudioTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Support batch creation when array of tracks is passed
    if (Array.isArray(req.body)) {
      const created = [];
      for (const item of req.body) {
        if (!item.title || !item.audioUrl) continue;
        const track = await prisma.audioTrack.create({
          data: {
            title: item.title,
            artist: item.artist || 'Shahzod Beats',
            coverUrl: item.coverUrl || null,
            audioUrl: item.audioUrl,
            duration: item.duration || '3:00',
            description: item.description || null,
            published: item.published !== undefined ? Boolean(item.published) : true,
            sortOrder: item.sortOrder !== undefined ? parseInt(item.sortOrder, 10) : 0,
          },
        });
        created.push(track);
      }
      res.status(201).json(created);
      return;
    }

    const { title, artist, coverUrl, audioUrl, duration, description, published, sortOrder } = req.body;

    if (!title || !audioUrl) {
      res.status(400).json({ error: 'Title and audioUrl are required' });
      return;
    }

    const track = await prisma.audioTrack.create({
      data: {
        title,
        artist: artist || 'Shahzod Beats',
        coverUrl,
        audioUrl,
        duration: duration || '3:00',
        description,
        published: published !== undefined ? Boolean(published) : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    });

    res.status(201).json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create audio track' });
  }
};

export const updateAudioTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sortOrder, published, ...rest } = req.body;

    const track = await prisma.audioTrack.update({
      where: { id },
      data: {
        ...rest,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        published: published !== undefined ? Boolean(published) : undefined,
      },
    });

    res.json(track);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update audio track' });
  }
};

export const deleteAudioTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.audioTrack.delete({ where: { id } });
    res.json({ message: 'Audio track deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete audio track' });
  }
};

// ------------------- AUDIO SETTINGS (MODE, AUTOPLAY, 30S PREVIEW) -------------------
export const getAudioSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let site = await prisma.siteSettings.findFirst();
    if (!site) {
      site = await prisma.siteSettings.create({ data: {} });
    }
    let parsed = {
      enabled: true,
      mode: 'normal', // 'normal' | 'preview30'
      autoplay: false,
      duration: 30,
      action: 'next', // 'next' | 'pause'
      volume: 0.7,
    };
    if ((site as any).audioSettings) {
      try {
        parsed = { ...parsed, ...JSON.parse((site as any).audioSettings) };
      } catch {}
    }
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to get audio settings' });
  }
};

export const updateAudioSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentSite = await prisma.siteSettings.findFirst();
    let currentSettings = {
      enabled: true,
      mode: 'normal',
      autoplay: false,
      duration: 30,
      action: 'next',
      volume: 0.7,
    };

    if ((currentSite as any)?.audioSettings) {
      try {
        currentSettings = { ...currentSettings, ...JSON.parse((currentSite as any).audioSettings) };
      } catch {}
    }

    const newSettings = {
      ...currentSettings,
      ...req.body,
    };

    let updatedSite;
    if (currentSite) {
      updatedSite = await prisma.siteSettings.update({
        where: { id: currentSite.id },
        data: { audioSettings: JSON.stringify(newSettings) } as any,
      });
    } else {
      updatedSite = await prisma.siteSettings.create({
        data: { audioSettings: JSON.stringify(newSettings) } as any,
      });
    }

    res.json(JSON.parse((updatedSite as any).audioSettings));
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update audio settings' });
  }
};

