"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToMessage = exports.deleteMessage = exports.updateMessageStatus = exports.getMessages = exports.submitMessage = void 0;
const config_1 = require("../config");
const emailService_1 = require("../services/emailService");
const submitMessage = async (req, res) => {
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
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const newMsg = await config_1.prisma.contactMessage.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to submit contact message' });
    }
};
exports.submitMessage = submitMessage;
const getMessages = async (req, res) => {
    try {
        const { filter, search, page, limit } = req.query;
        const where = {};
        if (filter === 'unread') {
            where.isRead = false;
            where.isArchived = false;
        }
        else if (filter === 'read') {
            where.isRead = true;
            where.isArchived = false;
        }
        else if (filter === 'archived') {
            where.isArchived = true;
        }
        else {
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
        const take = limit ? parseInt(limit, 10) : 50;
        const skip = page ? (parseInt(page, 10) - 1) * take : 0;
        const [messages, total, unreadCount] = await Promise.all([
            config_1.prisma.contactMessage.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take,
                skip,
            }),
            config_1.prisma.contactMessage.count({ where }),
            config_1.prisma.contactMessage.count({ where: { isRead: false, isArchived: false } }),
        ]);
        res.json({
            messages,
            total,
            unreadCount,
            page: page ? parseInt(page, 10) : 1,
            limit: take,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch messages' });
    }
};
exports.getMessages = getMessages;
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isRead, isArchived } = req.body;
        const updated = await config_1.prisma.contactMessage.update({
            where: { id },
            data: {
                isRead: isRead !== undefined ? Boolean(isRead) : undefined,
                isArchived: isArchived !== undefined ? Boolean(isArchived) : undefined,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update message status' });
    }
};
exports.updateMessageStatus = updateMessageStatus;
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.contactMessage.delete({ where: { id } });
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete message' });
    }
};
exports.deleteMessage = deleteMessage;
const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { replySubject, replyText } = req.body;
        if (!replyText || !replyText.trim()) {
            res.status(400).json({ error: 'Javob matni (replyText) kiritilishi shart' });
            return;
        }
        const message = await config_1.prisma.contactMessage.findUnique({ where: { id } });
        if (!message) {
            res.status(404).json({ error: 'Xabar topilmadi' });
            return;
        }
        const subject = replySubject?.trim() || `Re: ${message.subject}`;
        // Send the email via Nodemailer
        const result = await (0, emailService_1.sendReplyEmail)({
            toEmail: message.email,
            toName: message.name,
            subject,
            replyText: replyText.trim(),
            originalSubject: message.subject,
            originalMessage: message.message,
        });
        // Update the database record
        const updated = await config_1.prisma.contactMessage.update({
            where: { id },
            data: {
                isRead: true,
                replySent: true,
                replyText: replyText.trim(),
                repliedAt: new Date(),
            },
        });
        if (result.isTest) {
            res.json({
                message: 'Xat saqlandi. Ammo serverda SMTP_PASS sozlanmagani uchun test rejimida saqlab qolindi. Real xat pochtaga borishi uchun Render Environment sozlamalariga SMTP_PASS ni qo\'shing.',
                contactMessage: updated,
                isTest: true,
            });
            return;
        }
        res.json({
            message: 'Javob xati mijozning elektron pochtasiga muvaffaqiyatli yetkazildi!',
            contactMessage: updated,
            isTest: false,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Javob yuborishda xatolik yuz berdi' });
    }
};
exports.replyToMessage = replyToMessage;
