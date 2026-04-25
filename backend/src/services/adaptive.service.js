import Question from '../models/Question.js';
import { estimateAbility, selectNextQuestions, thetaToQiyasScore, thetaToPercentile } from '../utils/irt.js';

/**
 * Adaptive Learning Service
 * Uses IRT (Item Response Theory) to adapt question difficulty
 */
class AdaptiveService {

  /**
   * Generate adaptive question set for a practice session
   * @param {number} theta - Current ability estimate
   * @param {string} section - 'verbal' or 'quantitative'
   * @param {string} category - Specific category (optional)
   * @param {number} count - Number of questions
   * @param {Array} excludeIds - Questions already answered
   */
  async getAdaptiveQuestions(theta, section, category, count = 10, excludeIds = []) {
    const filter = {
      isActive: true,
      _id: { $nin: excludeIds },
    };
    
    if (section) filter.section = section;
    if (category) filter.category = category;

    const questions = await Question.find(filter).lean();
    
    if (questions.length === 0) {
      return [];
    }

    // Use IRT to select most informative questions
    return selectNextQuestions(theta, questions, Math.min(count, questions.length));
  }

  /**
   * Update ability estimate after answering a question
   * @param {number} currentTheta - Current ability
   * @param {Object} question - Question document
   * @param {boolean} isCorrect - Whether answer was correct
   * @param {Array} history - Previous responses in session
   */
  updateAbility(currentTheta, question, isCorrect, history = []) {
    const responses = [
      ...history.map(h => ({
        a: h.discrimination || 1,
        b: h.difficulty || 0,
        c: h.guessing || 0.2,
        correct: h.isCorrect,
      })),
      {
        a: question.discrimination || 1,
        b: question.difficulty || 0,
        c: question.guessing || 0.2,
        correct: isCorrect,
      },
    ];

    return estimateAbility(responses, currentTheta);
  }

  /**
   * Generate diagnostic test questions
   * Selects questions across difficulty spectrum for initial assessment
   */
  async generateDiagnosticTest() {
    const sections = ['verbal', 'quantitative'];
    const allQuestions = [];

    for (const section of sections) {
      // Get questions at different difficulty levels
      const difficulties = [-2, -1, 0, 1, 2];
      
      for (const diff of difficulties) {
        const questions = await Question.find({
          section,
          isActive: true,
          difficulty: { $gte: diff - 0.5, $lte: diff + 0.5 },
        }).limit(3).lean();

        allQuestions.push(...questions);
      }
    }

    // Shuffle
    return allQuestions.sort(() => Math.random() - 0.5);
  }

  /**
   * Analyze category-level performance
   */
  analyzeCategories(answers, questions) {
    const categories = {};

    answers.forEach((answer, i) => {
      const question = questions[i];
      if (!question) return;

      const key = `${question.section}:${question.category}`;
      if (!categories[key]) {
        categories[key] = {
          section: question.section,
          category: question.category,
          total: 0,
          correct: 0,
          totalTime: 0,
        };
      }
      categories[key].total += 1;
      if (answer.isCorrect) categories[key].correct += 1;
      categories[key].totalTime += answer.timeSpent || 0;
    });

    return Object.values(categories).map(cat => ({
      ...cat,
      accuracy: cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0,
      avgTime: cat.total > 0 ? Math.round(cat.totalTime / cat.total) : 0,
      level: cat.total > 0 
        ? (cat.correct / cat.total >= 0.8 ? 'strong' : cat.correct / cat.total >= 0.5 ? 'average' : 'weak')
        : 'unknown',
    }));
  }

  /**
   * Get score conversion
   */
  getScoreDetails(theta) {
    return {
      theta: Math.round(theta * 100) / 100,
      estimatedScore: thetaToQiyasScore(theta),
      percentile: thetaToPercentile(theta),
      level: theta >= 1.5 ? 'advanced' 
        : theta >= 0.5 ? 'intermediate-high'
        : theta >= -0.5 ? 'intermediate'
        : theta >= -1.5 ? 'intermediate-low'
        : 'beginner',
    };
  }
}

export default new AdaptiveService();
