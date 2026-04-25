import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  title: {
    ar: { type: String, required: true },
    en: { type: String, default: '' },
  },
  description: {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  type: { 
    type: String, 
    enum: ['diagnostic', 'mock', 'practice', 'challenge', 'weekly'],
    required: true,
    index: true,
  },
  section: { 
    type: String, 
    enum: ['verbal', 'quantitative', 'full'],
    default: 'full',
  },
  
  config: {
    totalQuestions: { type: Number, required: true },
    duration: { type: Number, required: true }, // minutes
    passingScore: { type: Number, default: 65 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    showResults: { type: String, enum: ['immediate', 'after_submit'], default: 'after_submit' },
    allowReview: { type: Boolean, default: true },
    negativeMarking: { type: Boolean, default: false },
    antiCheat: {
      enabled: { type: Boolean, default: false },
      tabSwitchLimit: { type: Number, default: 3 },
      webcamRequired: { type: Boolean, default: false },
      copyPasteBlocked: { type: Boolean, default: true },
    },
  },

  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'medium',
  },
  
  isPublished: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  order: { type: Number, default: 0 },

  stats: {
    totalAttempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

examSchema.index({ type: 1, isPublished: 1 });
examSchema.index({ isPremium: 1 });

export default mongoose.model('Exam', examSchema);
