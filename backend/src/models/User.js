import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, default: '' },
  fullNameAr: { type: String, default: '' },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['student', 'parent', 'tutor', 'admin'], default: 'student' },
  language: { type: String, enum: ['ar', 'en'], default: 'ar' },

  // Student Profile
  profile: {
    educationLevel: { type: String, default: '' },
    gradeYear: { type: Number, default: 12 },
    currentLevel: { type: Number, default: 0 },
    tier: { type: String, default: 'مبتدئ' },
    examCount: { type: Number, default: 0 },
    topicScores: { type: mongoose.Schema.Types.Mixed, default: {} },
    examHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ExamSession' }],
    weakTopics: [{ type: String }],
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    
    // Legacy fields
    targetScore: { type: Number, default: 80 },
    examDate: { type: Date },
    studyHoursPerDay: { type: Number, default: 2 },
  },

  // Gamification
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    badges: [{
      id: String,
      earnedAt: { type: Date, default: Date.now },
    }],
    rank: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
    totalQuestionsAnswered: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    totalExamsCompleted: { type: Number, default: 0 },
    totalStudyMinutes: { type: Number, default: 0 },
  },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired', 'trial'], default: 'active' },
    startedAt: { type: Date },
    expiresAt: { type: Date },
  },

  // Settings
  settings: {
    notifications: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: true },
    language: { type: String, default: 'ar' },
    soundEffects: { type: Boolean, default: true },
  },

  // Parent link (if role is 'parent')
  linkedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  lastActiveAt: { type: Date, default: Date.now },
  onboardingCompleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ 'gamification.xp': -1 }); // Leaderboard
userSchema.index({ role: 1, 'subscription.plan': 1 });
userSchema.index({ lastActiveAt: -1 });

// Virtual: accuracy percentage
userSchema.virtual('accuracy').get(function() {
  if (this.gamification.totalQuestionsAnswered === 0) return 0;
  return Math.round((this.gamification.totalCorrectAnswers / this.gamification.totalQuestionsAnswered) * 100);
});

// Method: add XP and check level up
userSchema.methods.addXP = function(amount) {
  this.gamification.xp += amount;
  const newLevel = Math.floor(this.gamification.xp / 500) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }
  // Update rank based on level
  if (newLevel >= 50) this.gamification.rank = 'diamond';
  else if (newLevel >= 30) this.gamification.rank = 'platinum';
  else if (newLevel >= 20) this.gamification.rank = 'gold';
  else if (newLevel >= 10) this.gamification.rank = 'silver';
  else this.gamification.rank = 'bronze';
};

// Method: update streak
userSchema.methods.updateStreak = function() {
  const today = new Date().toDateString();
  const lastActive = this.gamification.lastActivityDate?.toDateString();
  
  if (lastActive === today) return; // Already counted today
  
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastActive === yesterday) {
    this.gamification.streak += 1;
  } else {
    this.gamification.streak = 1;
  }
  
  if (this.gamification.streak > this.gamification.longestStreak) {
    this.gamification.longestStreak = this.gamification.streak;
  }
  
  this.gamification.lastActivityDate = new Date();
};

userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
