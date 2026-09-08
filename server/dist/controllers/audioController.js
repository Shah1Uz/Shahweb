"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAudioTrack = exports.updateAudioTrack = exports.createAudioTrack = exports.getAudioTracks = void 0;
const config_1 = require("../config");
const getAudioTracks = async (req, res) => {
    try {
        const isAdmin = req.user?.role === 'ADMIN';
        const where = {};
        if (!isAdmin) {
            where.published = true;
        }
        const tracks = await config_1.prisma.audioTrack.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
        res.json(tracks);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch audio tracks' });
    }
};
exports.getAudioTracks = getAudioTracks;
const createAudioTrack = async (req, res) => {
    try {
        // Support batch creation when array of tracks is passed
        if (Array.isArray(req.body)) {
            const created = [];
            for (const item of req.body) {
                if (!item.title || !item.audioUrl)
                    continue;
                const track = await config_1.prisma.audioTrack.create({
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
        const track = await config_1.prisma.audioTrack.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create audio track' });
    }
};
exports.createAudioTrack = createAudioTrack;
const updateAudioTrack = async (req, res) => {
    try {
        const { id } = req.params;
        const { sortOrder, published, ...rest } = req.body;
        const track = await config_1.prisma.audioTrack.update({
            where: { id },
            data: {
                ...rest,
                sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
                published: published !== undefined ? Boolean(published) : undefined,
            },
        });
        res.json(track);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to update audio track' });
    }
};
exports.updateAudioTrack = updateAudioTrack;
const deleteAudioTrack = async (req, res) => {
    try {
        const { id } = req.params;
        await config_1.prisma.audioTrack.delete({ where: { id } });
        res.json({ message: 'Audio track deleted' });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete audio track' });
    }
};
exports.deleteAudioTrack = deleteAudioTrack;
