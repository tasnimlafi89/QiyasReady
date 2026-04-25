import { callClaude, callClaudeJSON, SYSTEM_PROMPTS } from '../config/ai.js';

/**
 * AI Service - Handles all AI-powered features
 */
class AIService {
  
  /**
   * Generate a personalized study plan
   */
  async generateStudyPlan(user, diagnosticResults = null) {
    const userContext = `
Student Profile:
- Name: ${user.fullName || 'Student'}
- Current Level: ${user.profile.abilityLevel || 'Unknown'}
- Target Score: ${user.profile.targetScore || 80}
- Exam Date: ${user.profile.examDate ? new Date(user.profile.examDate).toLocaleDateString() : 'Not set'}
- Study Hours/Day: ${user.profile.studyHoursPerDay || 2}
- Weak Areas: ${user.profile.weakAreas?.join(', ') || 'Not determined'}
- Strong Areas: ${user.profile.strongAreas?.join(', ') || 'Not determined'}
${diagnosticResults ? `\nDiagnostic Results:\n- Score: ${diagnosticResults.percentage}%\n- Verbal: ${diagnosticResults.verbal}%\n- Quantitative: ${diagnosticResults.quantitative}%` : ''}

Generate a detailed study plan as JSON with this structure:
{
  "overview": {
    "totalWeeks": number,
    "hoursPerDay": number,
    "targetScore": number,
    "currentLevel": "beginner|intermediate|advanced",
    "estimatedImprovement": number
  },
  "weeks": [
    {
      "weekNumber": 1,
      "theme": { "ar": "...", "en": "..." },
      "focus": ["category1", "category2"],
      "days": [
        {
          "dayNumber": 1,
          "isRestDay": false,
          "tasks": [
            {
              "type": "lesson|practice|review|mock_exam",
              "title": { "ar": "...", "en": "..." },
              "section": "verbal|quantitative",
              "category": "...",
              "estimatedMinutes": 30,
              "xpReward": 10
            }
          ]
        }
      ]
    }
  ]
}

Create a 4-week plan. Include 1 rest day per week. Prioritize weak areas.
`;

    return await callClaudeJSON(SYSTEM_PROMPTS.studyPlan, userContext, { maxTokens: 4096 });
  }

  /**
   * AI Tutor chat interaction
   */
  async tutorChat(message, context = {}) {
    const contextStr = context.previousMessages
      ? `\nConversation history:\n${context.previousMessages.map(m => `${m.role}: ${m.content}`).join('\n')}\n`
      : '';

    const userMessage = `${contextStr}
Student ability level: ${context.abilityLevel || 'unknown'}
Current topic: ${context.topic || 'general'}
Language preference: ${context.language || 'ar'}

Student message: ${message}`;

    return await callClaude(SYSTEM_PROMPTS.tutor, userMessage);
  }

  /**
   * Analyze exam performance
   */
  async analyzePerformance(attemptData, userHistory = {}) {
    const analysisRequest = `
Analyze this exam attempt:

Exam Type: ${attemptData.examType || 'mock'}
Score: ${attemptData.score?.percentage || 0}%
Verbal Score: ${attemptData.score?.verbal || 0}%
Quantitative Score: ${attemptData.score?.quantitative || 0}%
Time Used: ${attemptData.timing?.totalTime || 0} seconds
Total Questions: ${attemptData.answers?.length || 0}

Category Performance:
${JSON.stringify(attemptData.categoryBreakdown || {}, null, 2)}

Previous Exam History:
- Total exams taken: ${userHistory.totalExams || 0}
- Average score trend: ${userHistory.scoreTrend || 'N/A'}
- Previous best: ${userHistory.bestScore || 'N/A'}%

Provide analysis as JSON:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."],
  "predictedScore": number,
  "improvementAreas": [
    {
      "category": "...",
      "currentLevel": "weak|average|strong",
      "suggestion": "..."
    }
  ],
  "overallFeedback": "2-3 sentences of personalized feedback"
}`;

    return await callClaudeJSON(SYSTEM_PROMPTS.analyzer, analysisRequest);
  }

  /**
   * Explain a question
   */
  async explainQuestion(question, studentAnswer, language = 'ar') {
    const prompt = `
Explain this Qiyas question in ${language === 'ar' ? 'Arabic' : 'English'}:

Question: ${question.content.textAr}
${question.content.textEn ? `(English: ${question.content.textEn})` : ''}

Options:
${question.content.options.map(o => `${o.id}: ${o.textAr}`).join('\n')}

Correct Answer: ${question.correctAnswer}
Student's Answer: ${studentAnswer || 'Not answered'}

Section: ${question.section}
Category: ${question.category}

Provide a clear, step-by-step explanation. Include:
1. Why the correct answer is correct
2. Why the student's answer (if wrong) is incorrect
3. A tip for similar questions
4. The concept/skill being tested`;

    return await callClaude(SYSTEM_PROMPTS.tutor, prompt);
  }

  /**
   * Predict final Qiyas score
   */
  async predictScore(userData) {
    const prompt = `
Based on this student's data, predict their Qiyas exam score:

Current ability (IRT theta): ${userData.abilityLevel}
Exams completed: ${userData.totalExams}
Average score: ${userData.avgScore}%
Improvement trend: ${userData.trend}
Weak areas: ${userData.weakAreas?.join(', ')}
Strong areas: ${userData.strongAreas?.join(', ')}
Study consistency: ${userData.studyConsistency}
Days until exam: ${userData.daysUntilExam}

Respond as JSON:
{
  "predictedScore": number (30-100),
  "confidence": "low|medium|high",
  "range": { "low": number, "high": number },
  "factors": ["positive or negative factors affecting prediction"],
  "advice": "one paragraph of advice"
}`;

    return await callClaudeJSON(SYSTEM_PROMPTS.analyzer, prompt);
  }

  /**
   * Generate motivational message
   */
  async getMotivation(userData) {
    const prompt = `
Student data:
- Name: ${userData.name}
- Streak: ${userData.streak} days
- Level: ${userData.level}
- Recent score: ${userData.recentScore}%
- XP: ${userData.xp}
- Mood indicator: ${userData.trend} (improving/stable/declining)

Generate a short, warm motivational message (2-3 sentences) in Arabic with an English translation.
Format as JSON:
{
  "messageAr": "...",
  "messageEn": "...",
  "emoji": "relevant emoji"
}`;

    return await callClaudeJSON(SYSTEM_PROMPTS.motivator, prompt);
  }
}

export default new AIService();
