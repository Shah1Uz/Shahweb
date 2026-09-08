"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-portfolio-cms-2026',
    adminEmail: process.env.ADMIN_EMAIL || 'shahuztech@gmail.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Shahzod177',
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    uploadDir: path_1.default.resolve(process.env.UPLOAD_DIR || './uploads'),
};
exports.prisma = new client_1.PrismaClient();
