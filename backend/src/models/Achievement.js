import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  achievementId: { type: String, required: true, unique: true },
  title: {
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ar: { type: String },
    en: { type: String },
  },
  icon: { type: String, default: '🏆' },
  category: { 
    type: String, 
    enum: ['milestone', 'streak', 'performance', 'social', 'special'],
    default: 'milestone',
  },
  xpReward: { type: Number, default: 50 },
  condition: {
    type: { type: String }, // 'exam_count', 'streak', 'score', 'questions', 'xp'
    threshold: { type: Number },
    field: { type: String }, // which field to check
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.model('Achievement', achievementSchema);
