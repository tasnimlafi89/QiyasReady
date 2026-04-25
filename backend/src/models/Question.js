import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  section: { 
    type: String, 
    required: true, 
    enum: ['verbal', 'quantitative'],
    index: true,
  },
  category: { 
    type: String, 
    required: true,
    index: true,
  },
  subcategory: { type: String, default: '' },
  
  // IRT Parameters (Item Response Theory - 3PL Model)
  difficulty: { type: Number, default: 0, min: -3, max: 3 },      // b parameter
  discrimination: { type: Number, default: 1, min: 0.5, max: 2.5 }, // a parameter
  guessing: { type: Number, default: 0.2, min: 0, max: 0.35 },     // c parameter

  content: {
    textAr: { type: String, required: true },
    textEn: { type: String, default: '' },
    image: { type: String, default: '' },
    options: [{
      id: { type: String, required: true },
      textAr: { type: String, required: true },
      textEn: { type: String, default: '' },
    }],
    correctAnswer: { type: String, required: true },
    explanation: {
      textAr: { type: String, default: '' },
      textEn: { type: String, default: '' },
    },
  },

  metadata: {
    timesAnswered: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    avgTimeSpent: { type: Number, default: 0 },
    tags: [{ type: String }],
    source: { type: String, default: '' },
    year: { type: Number },
  },

  isActive: { type: Boolean, default: true },
  isPremium: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

// Indexes
questionSchema.index({ section: 1, category: 1, difficulty: 1 });
questionSchema.index({ isActive: 1, isPremium: 1 });

// Virtual: success rate
questionSchema.virtual('successRate').get(function() {
  if (this.metadata.timesAnswered === 0) return 0;
  return Math.round((this.metadata.timesCorrect / this.metadata.timesAnswered) * 100);
});

questionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Question', questionSchema);
