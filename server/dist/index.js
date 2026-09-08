"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("./config");
const schedulerService_1 = require("./services/schedulerService");
// Routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const newsRoutes_1 = __importDefault(require("./routes/newsRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const audioRoutes_1 = __importDefault(require("./routes/audioRoutes"));
const sitemapController_1 = require("./controllers/sitemapController");
const app = (0, express_1.default)();
// Security and middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow localhost and any local Vite origin
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, morgan_1.default)('dev'));
// Static uploads serving
app.use('/uploads', express_1.default.static(config_1.config.uploadDir));
// Sitemap route
app.get('/sitemap.xml', sitemapController_1.getSitemap);
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/projects', projectRoutes_1.default);
app.use('/api/news', newsRoutes_1.default);
app.use('/api/blog', blogRoutes_1.default);
app.use('/api/media', mediaRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/content', contentRoutes_1.default);
app.use('/api/audio', audioRoutes_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config_1.config.nodeEnv });
});
// Serve frontend in production if client/dist exists
const clientDistCandidates = [
    path_1.default.resolve(__dirname, '../../client/dist'),
    path_1.default.resolve(__dirname, '../client/dist'),
    path_1.default.resolve(process.cwd(), '../client/dist'),
    path_1.default.resolve(process.cwd(), 'client/dist'),
    path_1.default.resolve(process.cwd(), 'dist/public'),
    path_1.default.resolve(__dirname, './public'),
];
let clientDistPath = null;
for (const p of clientDistCandidates) {
    if (fs_1.default.existsSync(path_1.default.join(p, 'index.html'))) {
        clientDistPath = p;
        break;
    }
}
if (clientDistPath) {
    console.log(`⚡ Serving React frontend from: ${clientDistPath}`);
    app.use(express_1.default.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/sitemap.xml') {
            return next();
        }
        res.sendFile(path_1.default.join(clientDistPath, 'index.html'));
    });
}
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
process.on('uncaughtException', (err) => {
    console.error('FATAL UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('FATAL UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
const PORT = config_1.config.port;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`⚡ Full-Stack Portfolio CMS API running on port ${PORT} (0.0.0.0)`);
    console.log(`⚡ Environment: ${config_1.config.nodeEnv}`);
    console.log(`⚡ Admin Email: ${config_1.config.adminEmail}`);
    console.log(`⚡ Static Uploads: ${config_1.config.uploadDir}`);
    console.log(`====================================================`);
    // Start background content scheduler safely
    try {
        (0, schedulerService_1.startScheduler)();
    }
    catch (err) {
        console.warn('[SCHEDULER] Could not start background scheduler:', err);
    }
});
exports.default = app;
