import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import gamificationService from '../services/gamification.service.js';

const router = Router();

// GET /api/leaderboard
router.get('/', requireAuthentication, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(Number(limit));
    // Find current user's rank
    const userRank = leaderboard.findIndex(e => e.userId.toString() === req.dbUser._id.toString()) + 1;
    res.json({ success: true, leaderboard, userRank: userRank || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;
