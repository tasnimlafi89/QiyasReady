import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import User from '../models/User.js';
import ExamAttempt from '../models/ExamAttempt.js';

const router = Router();

// GET /api/users/profile
router.get('/profile', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allowedFields = ['fullName', 'fullNameAr', 'avatar', 'language', 'settings'];
    const profileFields = ['grade', 'targetScore', 'examDate', 'studyHoursPerDay'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    profileFields.forEach(field => {
      if (req.body[field] !== undefined) user.profile[field] = req.body[field];
    });

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/stats
router.get('/stats', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Get recent exam attempts
    const recentAttempts = await ExamAttempt.find({
      userId: user._id,
      status: 'completed',
    }).sort({ createdAt: -1 }).limit(10).lean();

    const avgScore = recentAttempts.length > 0
      ? Math.round(recentAttempts.reduce((sum, a) => sum + a.score.percentage, 0) / recentAttempts.length)
      : 0;

    // Score trend (compare last 5 with previous 5)
    let trend = 'stable';
    if (recentAttempts.length >= 4) {
      const recent = recentAttempts.slice(0, Math.ceil(recentAttempts.length / 2));
      const older = recentAttempts.slice(Math.ceil(recentAttempts.length / 2));
      const recentAvg = recent.reduce((s, a) => s + a.score.percentage, 0) / recent.length;
      const olderAvg = older.reduce((s, a) => s + a.score.percentage, 0) / older.length;
      if (recentAvg > olderAvg + 3) trend = 'improving';
      else if (recentAvg < olderAvg - 3) trend = 'declining';
    }

    res.json({
      success: true,
      stats: {
        xp: user.gamification.xp,
        level: user.gamification.level,
        rank: user.gamification.rank,
        streak: user.gamification.streak,
        longestStreak: user.gamification.longestStreak,
        totalExams: user.gamification.totalExamsCompleted,
        totalQuestions: user.gamification.totalQuestionsAnswered,
        accuracy: user.accuracy,
        avgScore,
        trend,
        abilityLevel: user.profile.abilityLevel,
        recentScores: recentAttempts.map(a => ({
          score: a.score.percentage,
          date: a.createdAt,
          type: a.examType,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/users/achievements
router.get('/achievements', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      success: true,
      badges: user.gamification.badges,
      totalXP: user.gamification.xp,
      level: user.gamification.level,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

export default router;
