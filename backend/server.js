import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './src/config/database.js';
import { errorHandler } from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import examRoutes from './src/routes/exam.routes.js';
import questionRoutes from './src/routes/question.routes.js';
import studyPlanRoutes from './src/routes/studyPlan.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import leaderboardRoutes from './src/routes/leaderboard.routes.js';
import subscriptionRoutes from './src/routes/subscription.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
    'exp://*', // Expo dev
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'QiyasReady API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// ── Error Handling ───────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║     🎯 QiyasReady API Server            ║
║     Port: ${PORT}                          ║
║     Env:  ${process.env.NODE_ENV || 'development'}               ║
║     Status: ✅ Running                   ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
