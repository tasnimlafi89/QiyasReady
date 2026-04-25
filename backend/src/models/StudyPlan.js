import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  generatedBy: { type: String, default: 'ai' },
  
  overview: {
    totalDays: { type: Number },
    totalWeeks: { type: Number },
    hoursPerDay: { type: Number },
    targetScore: { type: Number },
    examDate: { type: Date },
    currentLevel: { type: String },
    estimatedImprovement: { type: Number },
  },
  
  weeks: [{
    weekNumber: { type: Number },
    theme: {
      ar: { type: String },
      en: { type: String },
    },
    focus: [{ type: String }],
    days: [{
      dayNumber: { type: Number },
      date: { type: Date },
      isRestDay: { type: Boolean, default: false },
      tasks: [{
        type: { type: String, enum: ['lesson', 'practice', 'review', 'mock_exam', 'revision'] },
        title: {
          ar: { type: String },
          en: { type: String },
        },
        section: { type: String },
        category: { type: String },
        estimatedMinutes: { type: Number },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        xpReward: { type: Number, default: 10 },
      }],
    }],
  }],
  
  adaptations: [{
    date: { type: Date, default: Date.now },
    reason: { type: String },
    changes: [{ type: String }],
  }],
  
  progress: {
    completedTasks: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    adherenceRate: { type: Number, default: 0 },
    currentWeek: { type: Number, default: 1 },
    currentDay: { type: Number, default: 1 },
  },
  
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export default mongoose.model('StudyPlan', studyPlanSchema);
