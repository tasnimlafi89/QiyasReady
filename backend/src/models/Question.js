import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true }
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  topic: { 
    type: String, 
    enum: ['التناظر اللفظي', 'إكمال الجمل', 'الاستيعاب المقروء', 'الاستدلال الكمي', 'الهندسة والجبر'],
    required: true
  },
  difficulty: { type: Number, enum: [1, 2, 3], required: true }, // 1=easy, 2=medium, 3=hard
  gradeLevel: [{ type: Number }], // e.g. [10, 11, 12]
  explanation: { type: String, required: true },
  timeLimit: { type: Number, default: 60 } // fixed at 60s per question
}, {
  timestamps: true
});

// Indexes for fast generation
questionSchema.index({ topic: 1, difficulty: 1, gradeLevel: 1 });

export default mongoose.model('Question', questionSchema);
