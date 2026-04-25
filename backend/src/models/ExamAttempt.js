import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: String, default: null },
    isCorrect: { type: Boolean, default: false },
    timeSpent: { type: Number, default: 0 }, // seconds
    flagged: { type: Boolean, default: false },
  }],
  
  score: {
    total: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    unanswered: { type: Number, default: 0 },
    verbal: { type: Number, default: 0 },
    quantitative: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    percentile: { type: Number, default: 0 },
  },
  
  timing: {
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    totalTime: { type: Number, default: 0 }, // seconds
    avgTimePerQuestion: { type: Number, default: 0 },
  },
  
  // Anti-cheat monitoring
  antiCheat: {
    tabSwitches: { type: Number, default: 0 },
    suspiciousActivity: [{ type: String }],
    proctorScore: { type: Number, default: 100 }, // 0-100 trust score
    screenExits: { type: Number, default: 0 },
  },
  
  // AI analysis (populated after completion)
  aiAnalysis: {
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    predictedScore: { type: Number },
    improvementAreas: [{
      category: String,
      currentLevel: String,
      suggestion: String,
    }],
    overallFeedback: { type: String },
  },

  // IRT ability estimate after this attempt
  abilityEstimate: { type: Number }, // theta
  
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'abandoned', 'flagged'],
    default: 'in_progress',
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes
examAttemptSchema.index({ userId: 1, examId: 1 });
examAttemptSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model('ExamAttempt', examAttemptSchema);
