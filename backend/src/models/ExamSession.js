import mongoose from 'mongoose';

const examSessionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
  educationLevel: { type: String },
  totalTimeUsed: { type: Number, default: 0 }, // in seconds
  
  responses: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: { type: Boolean, default: false },
    timeSpent: { type: Number, default: 0 },
    timeExpired: { type: Boolean, default: false },
    wasSkipped: { type: Boolean, default: false },
    topic: { type: String, default: '' },
    difficulty: { type: Number, default: 2 }
  }],
  
  scorePerTopic: {
    'التناظر اللفظي': { type: Number, default: 0 },
    'إكمال الجمل': { type: Number, default: 0 },
    'الاستيعاب المقروء': { type: Number, default: 0 },
    'الاستدلال الكمي': { type: Number, default: 0 },
    'الهندسة والجبر': { type: Number, default: 0 }
  },
  
  totalScore: { type: Number, default: 0 }, // 0-100
  levelBefore: { type: Number, default: 0 },
  levelAfter: { type: Number, default: 0 },
  improvementPercentage: { type: Number, default: 0 },
  improvementDirection: { type: String, enum: ['improvement', 'decrease', 'stable'], default: 'stable' }
}, {
  timestamps: true
});

export default mongoose.model('ExamSession', examSessionSchema);
