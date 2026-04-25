import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import StudyPlan from '../models/StudyPlan.js';
import aiService from '../services/ai.service.js';

const router = Router();

// GET /api/study-plans - Get user's active study plan
router.get('/', requireAuthentication, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ userId: req.dbUser._id, isActive: true }).lean();
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get study plan' });
  }
});

// POST /api/study-plans/generate - Generate AI study plan
router.post('/generate', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    // Deactivate existing plans
    await StudyPlan.updateMany({ userId: user._id, isActive: true }, { isActive: false });
    const aiPlan = await aiService.generateStudyPlan(user, req.body.diagnosticResults);
    const plan = new StudyPlan({
      userId: user._id,
      overview: aiPlan.overview,
      weeks: aiPlan.weeks,
      progress: { totalTasks: aiPlan.weeks.reduce((sum, w) => sum + w.days.reduce((s, d) => s + (d.tasks?.length || 0), 0), 0) },
    });
    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// PUT /api/study-plans/task/:taskIndex - Mark task complete
router.put('/task/complete', requireAuthentication, async (req, res) => {
  try {
    const { weekIndex, dayIndex, taskIndex } = req.body;
    const plan = await StudyPlan.findOne({ userId: req.dbUser._id, isActive: true });
    if (!plan) return res.status(404).json({ error: 'No active study plan' });
    if (plan.weeks[weekIndex]?.days[dayIndex]?.tasks[taskIndex]) {
      plan.weeks[weekIndex].days[dayIndex].tasks[taskIndex].completed = true;
      plan.weeks[weekIndex].days[dayIndex].tasks[taskIndex].completedAt = new Date();
      plan.progress.completedTasks += 1;
      plan.progress.adherenceRate = Math.round((plan.progress.completedTasks / plan.progress.totalTasks) * 100);
      await plan.save();
    }
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
