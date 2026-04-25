import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import aiService from '../services/ai.service.js';

const router = Router();

// POST /api/ai/tutor - AI tutor chat
router.post('/tutor', requireAuthentication, async (req, res) => {
  try {
    const { message, previousMessages, topic } = req.body;
    const response = await aiService.tutorChat(message, {
      previousMessages,
      topic,
      abilityLevel: req.dbUser.profile.abilityLevel,
      language: req.dbUser.language,
    });
    res.json({ success: true, response });
  } catch (error) {
    console.error('AI tutor error:', error);
    res.status(500).json({ error: 'AI tutor unavailable' });
  }
});

// POST /api/ai/explain - Explain a question
router.post('/explain', requireAuthentication, async (req, res) => {
  try {
    const { question, studentAnswer } = req.body;
    const explanation = await aiService.explainQuestion(question, studentAnswer, req.dbUser.language);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// POST /api/ai/predict-score
router.post('/predict-score', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    const prediction = await aiService.predictScore({
      abilityLevel: user.profile.abilityLevel,
      totalExams: user.gamification.totalExamsCompleted,
      avgScore: user.accuracy,
      trend: 'stable',
      weakAreas: user.profile.weakAreas,
      strongAreas: user.profile.strongAreas,
      studyConsistency: `${user.gamification.streak} day streak`,
      daysUntilExam: user.profile.examDate ? Math.ceil((new Date(user.profile.examDate) - new Date()) / 86400000) : 'unknown',
    });
    res.json({ success: true, prediction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict score' });
  }
});

// POST /api/ai/motivate
router.post('/motivate', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    const motivation = await aiService.getMotivation({
      name: user.fullNameAr || user.fullName,
      streak: user.gamification.streak,
      level: user.gamification.level,
      recentScore: user.accuracy,
      xp: user.gamification.xp,
      trend: 'improving',
    });
    res.json({ success: true, motivation });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get motivation' });
  }
});

export default router;
