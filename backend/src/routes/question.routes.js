import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import Question from '../models/Question.js';
import adaptiveService from '../services/adaptive.service.js';

const router = Router();

// GET /api/questions/categories
router.get('/categories', requireAuthentication, async (req, res) => {
  try {
    const categories = await Question.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: { section: '$section', category: '$category' }, count: { $sum: 1 }, avgDifficulty: { $avg: '$difficulty' } } },
      { $group: { _id: '$_id.section', categories: { $push: { name: '$_id.category', count: '$count', avgDifficulty: { $round: ['$avgDifficulty', 2] } } }, totalQuestions: { $sum: '$count' } } },
    ]);
    res.json({ success: true, sections: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// POST /api/questions/practice
router.post('/practice', requireAuthentication, async (req, res) => {
  try {
    const { section, category, count = 10 } = req.body;
    const user = req.dbUser;
    const questions = await adaptiveService.getAdaptiveQuestions(user.profile.abilityLevel || 0, section, category, count);
    const sanitized = questions.map(q => ({
      _id: q._id, section: q.section, category: q.category, difficulty: q.difficulty,
      content: { textAr: q.content.textAr, textEn: q.content.textEn, image: q.content.image, options: q.content.options },
    }));
    res.json({ success: true, questions: sanitized, total: sanitized.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get practice questions' });
  }
});

// POST /api/questions/answer
router.post('/answer', requireAuthentication, async (req, res) => {
  try {
    const { questionId, selectedOption, timeSpent } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const isCorrect = selectedOption === question.content.correctAnswer;
    question.metadata.timesAnswered += 1;
    if (isCorrect) question.metadata.timesCorrect += 1;
    await question.save();
    const user = req.dbUser;
    user.gamification.totalQuestionsAnswered += 1;
    if (isCorrect) user.gamification.totalCorrectAnswers += 1;
    const xp = isCorrect ? 10 : 2;
    user.addXP(xp);
    user.updateStreak();
    await user.save();
    res.json({ success: true, isCorrect, correctAnswer: question.content.correctAnswer, explanation: question.content.explanation, xpAwarded: xp, totalXP: user.gamification.xp, streak: user.gamification.streak });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

export default router;
