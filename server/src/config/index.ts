import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load .env from current directory or server directory
dotenv.config();
const serverEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}

// Auto-resolve SQLite database file path
const candidateDbPaths = [
  path.resolve(__dirname, '../../prisma/dev.db'),
  path.resolve(__dirname, '../prisma/dev.db'),
  path.resolve(process.cwd(), 'server/prisma/dev.db'),
  path.resolve(process.cwd(), 'prisma/dev.db'),
  path.resolve(process.cwd(), 'dev.db'),
];
const foundDb = candidateDbPaths.find((p) => fs.existsSync(p)) || path.resolve(__dirname, '../../prisma/dev.db');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${foundDb}`;
}

// Auto-resolve uploads directory
const candidateUploadDirs = [
  path.resolve(__dirname, '../../uploads'),
  path.resolve(__dirname, '../uploads'),
  path.resolve(process.cwd(), 'server/uploads'),
  path.resolve(process.cwd(), 'uploads'),
];
const foundUploadDir = candidateUploadDirs.find((p) => fs.existsSync(p)) || path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(foundUploadDir)) {
  try {
    fs.mkdirSync(foundUploadDir, { recursive: true });
  } catch {}
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-portfolio-cms-2026-production',
  adminEmail: process.env.ADMIN_EMAIL || 'shahuztech@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Shahzod177',
  nodeEnv: process.env.NODE_ENV || 'production',
  clientUrl: process.env.CLIENT_URL || '*',
  uploadDir: foundUploadDir,
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
