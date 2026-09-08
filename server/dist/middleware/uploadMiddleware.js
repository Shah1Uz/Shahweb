"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.config.uploadDir)) {
    fs_1.default.mkdirSync(config_1.config.uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, config_1.config.uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const cleanName = path_1.default.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = [
        // Images
        '.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.ico',
        // Videos
        '.mp4', '.webm', '.mov', '.avi', '.mkv',
        // Audio
        '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.weba', '.wma', '.mid', '.midi',
        // Documents
        '.pdf',
    ];
    if (file.mimetype.startsWith('audio/') ||
        file.mimetype.startsWith('image/') ||
        file.mimetype.startsWith('video/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/octet-stream' && allowedExtensions.includes(ext) ||
        allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File format "${ext || file.mimetype}" is not supported`));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit for video/audio/high-res assets
    },
    fileFilter,
});
