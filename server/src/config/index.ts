import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-portfolio-cms-2026',
  adminEmail: process.env.ADMIN_EMAIL || 'shahuztech@gmail.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Shahzod177',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || './uploads'),
};

export const prisma = new PrismaClient();
