import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import ExamAttempt from '../models/ExamAttempt.js';
import User from '../models/User.js';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    const attempts = await ExamAttempt.find({ userId: user._id, status: 'completed' }).sort({ createdAt: -1 }).lean();
    const totalExams = attempts.length;
    const avgScore = totalExams > 0 ? Math.round(attempts.reduce((s, a) => s + a.score.percentage, 0) / totalExams) : 0;
    const bestScore = totalExams > 0 ? Math.max(...attempts.map(a => a.score.percentage)) : 0;
    const totalTime = attempts.reduce((s, a) => s + (a.timing.totalTime || 0), 0);
    const recentScores = attempts.slice(0, 10).map(a => ({ score: a.score.percentage, date: a.createdAt, verbal: a.score.verbal, quantitative: a.score.quantitative }));

    res.json({
      success: true,
      overview: {
        totalExams, avgScore, bestScore, totalStudyMinutes: Math.round(totalTime / 60),
        totalQuestions: user.gamification.totalQuestionsAnswered,
        accuracy: user.accuracy,
        streak: user.gamification.streak,
        level: user.gamification.level,
        xp: user.gamification.xp,
        rank: user.gamification.rank,
        abilityLevel: user.profile.abilityLevel,
        recentScores,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// GET /api/analytics/progress
router.get('/progress', requireAuthentication, async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ userId: req.dbUser._id, status: 'completed' }).sort({ createdAt: 1 }).select('score.percentage score.verbal score.quantitative createdAt').lean();
    res.json({ success: true, progress: attempts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// GET /api/analytics/weaknesses
router.get('/weaknesses', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    res.json({
      success: true,
      weaknesses: {
        weakAreas: user.profile.weakAreas || [],
        strongAreas: user.profile.strongAreas || [],
        abilityLevel: user.profile.abilityLevel,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get weakness data' });
  }
});

export default router;
