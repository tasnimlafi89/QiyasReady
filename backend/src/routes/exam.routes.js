import { Router } from 'express';
import { requireAuthentication, requirePremium } from '../middleware/auth.js';
import Exam from '../models/Exam.js';
import ExamAttempt from '../models/ExamAttempt.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import adaptiveService from '../services/adaptive.service.js';
import gamificationService from '../services/gamification.service.js';
import aiService from '../services/ai.service.js';

const router = Router();

// GET /api/exams - List available exams
router.get('/', requireAuthentication, async (req, res) => {
  try {
    const { type, section, difficulty } = req.query;
    const user = req.dbUser;
    
    const filter = { isPublished: true };
    if (type) filter.type = type;
    if (section) filter.section = section;
    if (difficulty) filter.difficulty = difficulty;

    // If free user, exclude premium exams
    if (user?.subscription.plan === 'free') {
      filter.isPremium = false;
    }

    const exams = await Exam.find(filter)
      .select('-questions')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Add user's attempt info
    const examIds = exams.map(e => e._id);
    const attempts = await ExamAttempt.find({
      userId: user._id,
      examId: { $in: examIds },
    }).select('examId score.percentage status').lean();

    const attemptMap = {};
    attempts.forEach(a => {
      if (!attemptMap[a.examId] || a.score.percentage > attemptMap[a.examId].bestScore) {
        attemptMap[a.examId] = {
          attempts: (attemptMap[a.examId]?.attempts || 0) + 1,
          bestScore: a.score.percentage,
          lastStatus: a.status,
        };
      } else {
        attemptMap[a.examId].attempts += 1;
      }
    });

    const enrichedExams = exams.map(exam => ({
      ...exam,
      userAttempts: attemptMap[exam._id] || null,
    }));

    res.json({ success: true, exams: enrichedExams });
  } catch (error) {
    console.error('List exams error:', error);
    res.status(500).json({ error: 'Failed to list exams' });
  }
});

// GET /api/exams/diagnostic - Get/create diagnostic test
router.get('/diagnostic', requireAuthentication, async (req, res) => {
  try {
    let diagnosticExam = await Exam.findOne({ type: 'diagnostic', isPublished: true })
      .populate('questions')
      .lean();

    if (!diagnosticExam) {
      // Generate diagnostic from available questions
      const questions = await adaptiveService.generateDiagnosticTest();
      if (questions.length === 0) {
        return res.status(404).json({ error: 'No questions available for diagnostic' });
      }
      
      diagnosticExam = {
        title: { ar: 'اختبار تشخيصي', en: 'Diagnostic Test' },
        type: 'diagnostic',
        section: 'full',
        config: {
          totalQuestions: questions.length,
          duration: 45,
          showResults: 'after_submit',
          allowReview: true,
          antiCheat: { enabled: false },
        },
        questions,
      };
    }

    // Remove correct answers from response
    const sanitizedQuestions = diagnosticExam.questions.map(q => ({
      _id: q._id,
      section: q.section,
      category: q.category,
      content: {
        textAr: q.content.textAr,
        textEn: q.content.textEn,
        image: q.content.image,
        options: q.content.options,
      },
    }));

    res.json({
      success: true,
      exam: {
        ...diagnosticExam,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: 'Failed to get diagnostic test' });
  }
});

// GET /api/exams/:id - Get exam details
router.get('/:id', requireAuthentication, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Check premium access
    if (exam.isPremium && req.dbUser?.subscription.plan === 'free') {
      return res.status(403).json({ 
        error: 'Premium exam', 
        code: 'UPGRADE_REQUIRED',
      });
    }

    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get exam' });
  }
});

// POST /api/exams/:id/start - Start exam attempt
router.post('/:id/start', requireAuthentication, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('questions').lean();
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Check if user has an in-progress attempt
    const existingAttempt = await ExamAttempt.findOne({
      userId: req.dbUser._id,
      examId: exam._id,
      status: 'in_progress',
    });

    if (existingAttempt) {
      return res.json({
        success: true,
        attempt: existingAttempt,
        exam: {
          ...exam,
          questions: exam.questions.map(q => ({
            _id: q._id,
            section: q.section,
            category: q.category,
            content: {
              textAr: q.content.textAr,
              textEn: q.content.textEn,
              image: q.content.image,
              options: q.content.options,
            },
          })),
        },
        resuming: true,
      });
    }

    // Shuffle questions and options if configured
    let questions = [...exam.questions];
    if (exam.config.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Create new attempt
    const attempt = new ExamAttempt({
      userId: req.dbUser._id,
      examId: exam._id,
      answers: questions.map(q => ({
        questionId: q._id,
        selectedOption: null,
        isCorrect: false,
        timeSpent: 0,
        flagged: false,
      })),
      timing: {
        startedAt: new Date(),
      },
      status: 'in_progress',
    });

    await attempt.save();

    // Sanitize questions (remove correct answers)
    const sanitizedQuestions = questions.map(q => ({
      _id: q._id,
      section: q.section,
      category: q.category,
      content: {
        textAr: q.content.textAr,
        textEn: q.content.textEn,
        image: q.content.image,
        options: exam.config.shuffleOptions
          ? q.content.options.sort(() => Math.random() - 0.5)
          : q.content.options,
      },
    }));

    res.json({
      success: true,
      attempt: {
        _id: attempt._id,
        examId: exam._id,
        status: 'in_progress',
        timing: attempt.timing,
      },
      exam: {
        title: exam.title,
        config: exam.config,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    console.error('Start exam error:', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
});

// POST /api/exams/:id/submit - Submit exam answers
router.post('/:id/submit', requireAuthentication, async (req, res) => {
  try {
    const { attemptId, answers, antiCheatData } = req.body;
    
    const attempt = await ExamAttempt.findOne({
      _id: attemptId,
      userId: req.dbUser._id,
      status: 'in_progress',
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Exam attempt not found' });
    }

    // Get questions with correct answers
    const exam = await Exam.findById(req.params.id).populate('questions').lean();
    const questionMap = {};
    exam.questions.forEach(q => { questionMap[q._id.toString()] = q; });

    // Score the answers
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let verbalCorrect = 0;
    let verbalTotal = 0;
    let quantCorrect = 0;
    let quantTotal = 0;

    const scoredAnswers = answers.map(answer => {
      const question = questionMap[answer.questionId];
      if (!question) return answer;

      const isCorrect = answer.selectedOption === question.content.correctAnswer;
      
      if (!answer.selectedOption) {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      if (question.section === 'verbal') {
        verbalTotal++;
        if (isCorrect) verbalCorrect++;
      } else {
        quantTotal++;
        if (isCorrect) quantCorrect++;
      }

      // Update question statistics
      Question.updateOne(
        { _id: question._id },
        {
          $inc: {
            'metadata.timesAnswered': 1,
            'metadata.timesCorrect': isCorrect ? 1 : 0,
          },
        }
      ).exec();

      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
        timeSpent: answer.timeSpent || 0,
        flagged: answer.flagged || false,
      };
    });

    const totalQuestions = correct + incorrect + unanswered;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    // Update attempt
    attempt.answers = scoredAnswers;
    attempt.score = {
      total: totalQuestions,
      correct,
      incorrect,
      unanswered,
      verbal: verbalTotal > 0 ? Math.round((verbalCorrect / verbalTotal) * 100) : 0,
      quantitative: quantTotal > 0 ? Math.round((quantCorrect / quantTotal) * 100) : 0,
      percentage,
      percentile: 0, // Will be calculated
    };
    attempt.timing.completedAt = new Date();
    attempt.timing.totalTime = Math.round((attempt.timing.completedAt - attempt.timing.startedAt) / 1000);
    attempt.timing.avgTimePerQuestion = totalQuestions > 0 
      ? Math.round(attempt.timing.totalTime / totalQuestions) 
      : 0;
    
    // Anti-cheat data
    if (antiCheatData) {
      attempt.antiCheat = {
        tabSwitches: antiCheatData.tabSwitches || 0,
        suspiciousActivity: antiCheatData.suspiciousActivity || [],
        proctorScore: Math.max(0, 100 - (antiCheatData.tabSwitches || 0) * 10),
        screenExits: antiCheatData.screenExits || 0,
      };
    }

    // Update ability estimate using IRT
    const irtResponses = scoredAnswers.map(a => {
      const q = questionMap[a.questionId];
      return q ? {
        a: q.discrimination || 1,
        b: q.difficulty || 0,
        c: q.guessing || 0.2,
        correct: a.isCorrect,
      } : null;
    }).filter(Boolean);

    if (irtResponses.length > 0) {
      const { estimateAbility } = await import('../utils/irt.js');
      attempt.abilityEstimate = estimateAbility(irtResponses, req.dbUser.profile.abilityLevel || 0);
      
      // Update user's ability level
      req.dbUser.profile.abilityLevel = attempt.abilityEstimate;
    }

    attempt.status = 'completed';
    await attempt.save();

    // Update user stats and gamification
    const gamificationResult = await gamificationService.processExamCompletion(
      req.dbUser._id,
      { correct, incorrect, percentage }
    );

    // Analyze categories
    const categoryAnalysis = adaptiveService.analyzeCategories(
      scoredAnswers,
      scoredAnswers.map(a => questionMap[a.questionId]).filter(Boolean)
    );

    // Update user weak/strong areas
    const weakAreas = categoryAnalysis.filter(c => c.level === 'weak').map(c => c.category);
    const strongAreas = categoryAnalysis.filter(c => c.level === 'strong').map(c => c.category);
    req.dbUser.profile.weakAreas = [...new Set([...req.dbUser.profile.weakAreas, ...weakAreas])];
    req.dbUser.profile.strongAreas = [...new Set(strongAreas)];
    await req.dbUser.save();

    // Update exam stats
    await Exam.updateOne(
      { _id: exam._id },
      {
        $inc: { 'stats.totalAttempts': 1 },
        $set: {
          'stats.avgScore': await ExamAttempt.aggregate([
            { $match: { examId: exam._id, status: 'completed' } },
            { $group: { _id: null, avg: { $avg: '$score.percentage' } } },
          ]).then(r => r[0]?.avg || 0),
        },
      }
    );

    // Generate AI analysis (async, don't wait)
    try {
      const aiAnalysis = await aiService.analyzePerformance({
        examType: exam.type,
        score: attempt.score,
        timing: attempt.timing,
        categoryBreakdown: categoryAnalysis,
        answers: scoredAnswers,
      });
      
      attempt.aiAnalysis = aiAnalysis;
      await attempt.save();
    } catch (aiError) {
      console.error('AI analysis error (non-critical):', aiError.message);
    }

    res.json({
      success: true,
      results: {
        score: attempt.score,
        timing: attempt.timing,
        abilityEstimate: attempt.abilityEstimate,
        categoryAnalysis,
        gamification: gamificationResult,
        aiAnalysis: attempt.aiAnalysis || null,
        antiCheat: attempt.antiCheat,
      },
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// GET /api/exams/:id/results - Get exam results
router.get('/:id/results', requireAuthentication, async (req, res) => {
  try {
    const { attemptId } = req.query;
    
    const query = {
      userId: req.dbUser._id,
      status: 'completed',
    };
    if (attemptId) query._id = attemptId;
    else query.examId = req.params.id;

    const attempt = await ExamAttempt.findOne(query)
      .sort({ createdAt: -1 })
      .populate('examId', 'title type section')
      .lean();

    if (!attempt) {
      return res.status(404).json({ error: 'No completed attempt found' });
    }

    res.json({ success: true, results: attempt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;
