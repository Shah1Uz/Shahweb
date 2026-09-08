import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { startScheduler } from './services/schedulerService';

// Routes
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import newsRoutes from './routes/newsRoutes';
import blogRoutes from './routes/blogRoutes';
import mediaRoutes from './routes/mediaRoutes';
import messageRoutes from './routes/messageRoutes';
import contentRoutes from './routes/contentRoutes';
import audioRoutes from './routes/audioRoutes';
import { getSitemap } from './controllers/sitemapController';

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost and any local Vite origin
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads serving
app.use('/uploads', express.static(config.uploadDir));

// Sitemap route
app.get('/sitemap.xml', getSitemap);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/audio', audioRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// Serve frontend in production if client/dist exists
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'dist/public'),
  path.resolve(__dirname, './public'),
];

let clientDistPath: string | null = null;
for (const p of clientDistCandidates) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    clientDistPath = p;
    break;
  }
}

if (clientDistPath) {
  console.log(`⚡ Serving React frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/sitemap.xml') {
      return next();
    }
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`⚡ Full-Stack Portfolio CMS API running on port ${PORT}`);
  console.log(`⚡ Environment: ${config.nodeEnv}`);
  console.log(`⚡ Admin Email: ${config.adminEmail}`);
  console.log(`⚡ Static Uploads: ${config.uploadDir}`);
  console.log(`====================================================`);

  // Start background content scheduler
  startScheduler();
});

export default app;
