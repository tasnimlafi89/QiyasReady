import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import { generateExamQuestions } from '../utils/questionSelector.js';
import { calculateExamScore, calculateNewLevel, calculateImprovement, getTier } from '../utils/levelCalculator.js';
import ExamSession from '../models/ExamSession.js';
import User from '../models/User.js';
import Question from '../models/Question.js';

const router = Router();

// GET /api/qiyas-exam/generate
router.get('/generate', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    const gradeYear = user.profile.gradeYear || 12;
    
    const questions = await generateExamQuestions(gradeYear);
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        topic: q.topic,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit
        // correct answer and explanation are NOT sent to frontend during exam
      }))
    });
  } catch (error) {
    console.error('Generate exam error:', error);
    res.status(500).json({ error: 'Failed to generate exam' });
  }
});

// POST /api/qiyas-exam/submit
router.post('/submit', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    const { responses, totalTimeUsed } = req.body; // responses: [{ questionId, selectedAnswer, timeSpent, timeExpired, wasSkipped }]

    // Fetch questions to score
    const questionIds = responses.map(r => r.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const qMap = {};
    questions.forEach(q => qMap[q._id.toString()] = q);

    const scoredResponses = responses.map(r => {
      const q = qMap[r.questionId.toString()];
      return {
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        isCorrect: q ? (r.selectedAnswer === q.correctAnswer) : false,
        timeSpent: r.timeSpent || 0,
        timeExpired: r.timeExpired || false,
        wasSkipped: r.wasSkipped || false,
        topic: q ? q.topic : 'Unknown',
        difficulty: q ? q.difficulty : 2
      };
    });

    // Score per topic
    const topicScoresRaw = {
      'التناظر اللفظي': { earned: 0, possible: 0, correct: 0, total: 0 },
      'إكمال الجمل': { earned: 0, possible: 0, correct: 0, total: 0 },
      'الاستيعاب المقروء': { earned: 0, possible: 0, correct: 0, total: 0 },
      'الاستدلال الكمي': { earned: 0, possible: 0, correct: 0, total: 0 },
      'الهندسة والجبر': { earned: 0, possible: 0, correct: 0, total: 0 }
    };

    scoredResponses.forEach(r => {
      if (topicScoresRaw[r.topic]) {
        topicScoresRaw[r.topic].total += 1;
        topicScoresRaw[r.topic].possible += r.difficulty * 10;
        
        if (r.isCorrect) {
          topicScoresRaw[r.topic].correct += 1;
          const speedBonus = r.timeSpent <= 20 ? 1.3 : r.timeSpent <= 40 ? 1.1 : r.timeSpent <= 55 ? 1.0 : 0.8;
          topicScoresRaw[r.topic].earned += r.difficulty * 10 * speedBonus;
        } else if (!r.timeExpired && !r.wasSkipped) {
          topicScoresRaw[r.topic].earned -= r.difficulty * 2;
        }
      }
    });

    const scorePerTopic = {};
    Object.keys(topicScoresRaw).forEach(t => {
      const ts = topicScoresRaw[t];
      scorePerTopic[t] = ts.possible > 0 ? Math.max(0, Math.min(100, Math.round((ts.earned / ts.possible) * 100))) : 0;
    });

    // Global Exam Score
    const totalScore = calculateExamScore(scoredResponses);

    // Update Student Level
    const previousLevel = user.profile.currentLevel || 0;
    const examCount = (user.profile.examCount || 0) + 1;
    const newLevel = calculateNewLevel(previousLevel, totalScore, examCount);
    const improvement = calculateImprovement(previousLevel, newLevel);

    // Save Session
    const session = new ExamSession({
      studentId: user._id,
      educationLevel: user.profile.educationLevel,
      totalTimeUsed,
      responses: scoredResponses,
      scorePerTopic,
      totalScore,
      levelBefore: previousLevel,
      levelAfter: newLevel,
      improvementPercentage: improvement.percentage,
      improvementDirection: improvement.direction
    });
    await session.save();

    // Update User Profile
    user.profile.currentLevel = newLevel;
    user.profile.tier = getTier(newLevel);
    user.profile.examCount = examCount;
    user.profile.examHistory.push(session._id);
    
    // Average score update
    const previousAvg = user.profile.averageScore || 0;
    user.profile.averageScore = Math.round(((previousAvg * (examCount - 1)) + totalScore) / examCount);
    
    if (totalScore > (user.profile.bestScore || 0)) {
      user.profile.bestScore = totalScore;
    }

    // Weak topics update
    const weak = Object.keys(scorePerTopic).filter(t => scorePerTopic[t] < 65);
    user.profile.weakTopics = weak;

    await user.save();

    res.json({
      success: true,
      sessionId: session._id,
      results: {
        totalScore,
        levelBefore: previousLevel,
        levelAfter: newLevel,
        improvement,
        tier: user.profile.tier,
        scorePerTopic,
        scoredResponses
      }
    });

  } catch (error) {
    console.error('Submit exam error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
});

// GET /api/qiyas-exam/results/:sessionId
router.get('/results/:sessionId', requireAuthentication, async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId).lean();
    if (!session || session.studentId.toString() !== req.dbUser._id.toString()) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Attach explanations and correct answers to responses
    const questionIds = session.responses.map(r => r.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const qMap = {};
    questions.forEach(q => qMap[q._id.toString()] = q);

    session.responses = session.responses.map(r => ({
      ...r,
      questionText: qMap[r.questionId.toString()]?.text,
      options: qMap[r.questionId.toString()]?.options,
      correctAnswer: qMap[r.questionId.toString()]?.correctAnswer,
      explanation: qMap[r.questionId.toString()]?.explanation,
      topic: r.topic || qMap[r.questionId.toString()]?.topic || '',
      difficulty: r.difficulty || qMap[r.questionId.toString()]?.difficulty || 2
    }));

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get results' });
  }
});

// POST /api/qiyas-exam/autosave — Save progress every 10 questions
router.post('/autosave', requireAuthentication, async (req, res) => {
  try {
    const { responses, currentIndex, globalTimeRemaining } = req.body;
    // Just acknowledge — actual scoring happens on full submit
    // Could store partial progress in a temp collection if desired
    console.log(`Auto-save: User ${req.dbUser._id} saved ${responses?.length || 0} responses at question ${currentIndex}`);
    res.json({ success: true, savedCount: responses?.length || 0 });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ error: 'Auto-save failed' });
  }
});

export default router;
