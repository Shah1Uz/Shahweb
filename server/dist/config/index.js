"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
// Load .env from current directory or server directory
dotenv_1.default.config();
const serverEnvPath = path_1.default.resolve(__dirname, '../../.env');
if (fs_1.default.existsSync(serverEnvPath)) {
    dotenv_1.default.config({ path: serverEnvPath });
}
// Auto-resolve SQLite database file path
const candidateDbPaths = [
    path_1.default.resolve(__dirname, '../../prisma/dev.db'),
    path_1.default.resolve(__dirname, '../prisma/dev.db'),
    path_1.default.resolve(process.cwd(), 'server/prisma/dev.db'),
    path_1.default.resolve(process.cwd(), 'prisma/dev.db'),
    path_1.default.resolve(process.cwd(), 'dev.db'),
];
const foundDb = candidateDbPaths.find((p) => fs_1.default.existsSync(p)) || path_1.default.resolve(__dirname, '../../prisma/dev.db');
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = `file:${foundDb}`;
}
// Auto-resolve uploads directory
const candidateUploadDirs = [
    path_1.default.resolve(__dirname, '../../uploads'),
    path_1.default.resolve(__dirname, '../uploads'),
    path_1.default.resolve(process.cwd(), 'server/uploads'),
    path_1.default.resolve(process.cwd(), 'uploads'),
];
const foundUploadDir = candidateUploadDirs.find((p) => fs_1.default.existsSync(p)) || path_1.default.resolve(__dirname, '../../uploads');
if (!fs_1.default.existsSync(foundUploadDir)) {
    try {
        fs_1.default.mkdirSync(foundUploadDir, { recursive: true });
    }
    catch { }
}
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-portfolio-cms-2026-production',
    adminEmail: process.env.ADMIN_EMAIL || 'shahuztech@gmail.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Shahzod177',
    nodeEnv: process.env.NODE_ENV || 'production',
    clientUrl: process.env.CLIENT_URL || '*',
    uploadDir: foundUploadDir,
};
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});
