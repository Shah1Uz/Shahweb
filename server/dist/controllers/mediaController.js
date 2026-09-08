"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameMedia = exports.deleteMedia = exports.serveMediaFile = exports.getMediaList = exports.uploadMedia = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const uploadMedia = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files provided for upload' });
            return;
        }
        const host = req.get('host');
        const protocol = req.protocol;
        const baseUrl = `${protocol}://${host}/uploads`;
        const savedMedia = [];
        for (const file of files) {
            let base64Data = null;
            try {
                if (file.path && fs_1.default.existsSync(file.path)) {
                    base64Data = fs_1.default.readFileSync(file.path).toString('base64');
                }
            }
            catch (err) {
                console.warn('Could not read file for DB backup:', err);
            }
            const fileUrl = `${baseUrl}/${file.filename}`;
            const media = await config_1.prisma.media.create({
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
            const { data: _, ...mediaMeta } = media;
            savedMedia.push(mediaMeta);
        }
        await config_1.prisma.activityLog.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Media upload failed' });
    }
};
exports.uploadMedia = uploadMedia;
const getMediaList = async (req, res) => {
    try {
        const { type, search, page, limit } = req.query;
        const where = {};
        if (type && typeof type === 'string' && type !== 'ALL') {
            if (type === 'image')
                where.mimeType = { startsWith: 'image/' };
            else if (type === 'video')
                where.mimeType = { startsWith: 'video/' };
            else if (type === 'audio')
                where.mimeType = { startsWith: 'audio/' };
            else if (type === 'document')
                where.mimeType = 'application/pdf';
        }
        if (search && typeof search === 'string') {
            where.OR = [
                { originalName: { contains: search } },
                { fileName: { contains: search } },
            ];
        }
        const take = limit ? parseInt(limit, 10) : 50;
        const skip = page ? (parseInt(page, 10) - 1) * take : 0;
        const [media, total] = await Promise.all([
            config_1.prisma.media.findMany({
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
            config_1.prisma.media.count({ where }),
        ]);
        // Compute disk stats
        const totalBytes = await config_1.prisma.media.aggregate({
            _sum: { size: true },
        });
        res.json({
            media,
            total,
            totalBytes: totalBytes._sum.size || 0,
            page: page ? parseInt(page, 10) : 1,
            limit: take,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch media' });
    }
};
exports.getMediaList = getMediaList;
const serveMediaFile = async (req, res) => {
    try {
        const { identifier } = req.params;
        const media = await config_1.prisma.media.findFirst({
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
        if (media.path && fs_1.default.existsSync(media.path)) {
            res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            fs_1.default.createReadStream(media.path).pipe(res);
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
                const dir = path_1.default.dirname(media.path);
                if (!fs_1.default.existsSync(dir))
                    fs_1.default.mkdirSync(dir, { recursive: true });
                fs_1.default.writeFileSync(media.path, buffer);
            }
        }
        catch { }
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
        }
        else {
            res.setHeader('Content-Length', totalSize);
            res.end(buffer);
        }
    }
    catch (error) {
        res.status(500).send('Error serving media file');
    }
};
exports.serveMediaFile = serveMediaFile;
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await config_1.prisma.media.findUnique({ where: { id } });
        if (!item) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }
        // Try deleting file from disk
        if (fs_1.default.existsSync(item.path)) {
            try {
                fs_1.default.unlinkSync(item.path);
            }
            catch (err) {
                console.warn('Failed to delete physical file from disk:', err);
            }
        }
        await config_1.prisma.media.delete({ where: { id } });
        await config_1.prisma.activityLog.create({
            data: {
                action: 'DELETE',
                entityType: 'Media',
                entityId: id,
                details: `Deleted media file: ${item.originalName}`,
            },
        });
        res.json({ message: 'Media deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete media' });
    }
};
exports.deleteMedia = deleteMedia;
const renameMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        const item = await config_1.prisma.media.update({
            where: { id },
            data: { originalName: name },
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to rename media' });
    }
};
exports.renameMedia = renameMedia;
