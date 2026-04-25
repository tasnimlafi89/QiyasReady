import { Router } from 'express';
import { requireAuthentication, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';

const router = Router();

// GET /api/admin/stats - Platform statistics
router.get('/stats', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalExams, totalAttempts] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments({ isActive: true }),
      Exam.countDocuments({ isPublished: true }),
      ExamAttempt.countDocuments({ status: 'completed' }),
    ]);
    const activeToday = await User.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 86400000) } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 604800000) } });
    const avgScore = await ExamAttempt.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, avg: { $avg: '$score.percentage' } } },
    ]);
    const subStats = await User.aggregate([
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]);
    res.json({
      success: true,
      stats: { totalUsers, totalQuestions, totalExams, totalAttempts, activeToday, newUsersThisWeek, avgScore: avgScore[0]?.avg || 0, subscriptions: subStats },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/admin/users
router.get('/users', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).select('-__v').lean();
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// CRUD /api/admin/questions
router.get('/questions', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, section, category } = req.query;
    const filter = {};
    if (section) filter.section = section;
    if (category) filter.category = category;
    const questions = await Question.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).lean();
    const total = await Question.countDocuments(filter);
    res.json({ success: true, questions, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

router.post('/questions', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const question = new Question({ ...req.body, createdBy: req.dbUser._id });
    await question.save();
    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/questions/:id', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/questions/:id', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// CRUD /api/admin/exams
router.get('/exams', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get exams' });
  }
});

router.post('/exams', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const exam = new Exam({ ...req.body, createdBy: req.dbUser._id });
    await exam.save();
    res.status(201).json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

router.put('/exams/:id', requireAuthentication, requireRole('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exam' });
  }
});

export default router;
