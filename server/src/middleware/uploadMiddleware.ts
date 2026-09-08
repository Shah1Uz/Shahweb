import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
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

  if (
    file.mimetype.startsWith('audio/') ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/octet-stream' && allowedExtensions.includes(ext) ||
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error(`File format "${ext || file.mimetype}" is not supported`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for video/audio/high-res assets
  },
  fileFilter,
});
