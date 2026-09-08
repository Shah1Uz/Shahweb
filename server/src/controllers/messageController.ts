import { Request, Response } from 'express';
import { prisma } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

export const submitMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, valid email, and message are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

    const newMsg = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject: subject || 'New Project Inquiry',
        message,
        ipAddress,
      },
    });

    res.status(201).json({
      message: 'Thank you! Your message has been received. I will get back to you soon.',
      id: newMsg.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit contact message' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filter, search, page, limit } = req.query;
    const where: any = {};

    if (filter === 'unread') {
      where.isRead = false;
      where.isArchived = false;
    } else if (filter === 'read') {
      where.isRead = true;
      where.isArchived = false;
    } else if (filter === 'archived') {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const take = limit ? parseInt(limit as string, 10) : 50;
    const skip = page ? (parseInt(page as string, 10) - 1) * take : 0;

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
    ]);

    res.json({
      messages,
      total,
      unreadCount,
      page: page ? parseInt(page as string, 10) : 1,
      limit: take,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
};

export const updateMessageStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isRead, isArchived } = req.body;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        isRead: isRead !== undefined ? Boolean(isRead) : undefined,
        isArchived: isArchived !== undefined ? Boolean(isArchived) : undefined,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update message status' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
};
