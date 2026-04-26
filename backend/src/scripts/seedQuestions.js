import 'dotenv/config';
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Question from '../models/Question.js';
import { connectDB } from '../config/database.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TOPICS = [
  'التناظر اللفظي',
  'إكمال الجمل',
  'الاستيعاب المقروء',
  'الاستدلال الكمي',
  'الهندسة والجبر'
];

async function generateBatch(topic, gradeLevel, difficulty) {
  const diffLabel = difficulty === 1 ? 'سهل' : difficulty === 2 ? 'متوسط' : 'صعب';
  const prompt = `
أنت خبير في اختبار القدرات العامة (قياس) السعودي.
قم بتوليد 15 سؤالاً لموضوع: ${topic}
المستوى الدراسي: الصف ${gradeLevel === 13 ? 'خريج' : gradeLevel}
مستوى الصعوبة: ${diffLabel}

لكل سؤال، أعطني JSON بالتنسيق التالي:
{
  "text": "نص السؤال باللغة العربية",
  "options": { "A": "الخيار أ", "B": "الخيار ب", "C": "الخيار ج", "D": "الخيار د" },
  "correctAnswer": "A",
  "explanation": "الشرح خطوة بخطوة باللغة العربية",
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "gradeLevel": [${gradeLevel}]
}

مهم جداً:
- الأسئلة يجب أن تكون متنوعة وغير متكررة
- كل سؤال يجب أن يكون واضحاً ومناسباً للمستوى
- الإجابة الصحيحة يجب أن تكون واحدة فقط من A, B, C, D
- اجعل الخيارات الخاطئة منطقية وليست واضحة
- أعطني فقط JSON array يحتوي على 15 عنصراً، بدون أي نص آخر أو تنسيق Markdown
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Retry up to 3 times on failure
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const questions = JSON.parse(text);
        // Validate
        return questions.filter(q => 
          q.text && q.options && q.options.A && q.options.B && q.options.C && q.options.D &&
          ['A','B','C','D'].includes(q.correctAnswer) && q.explanation &&
          q.text.length > 5
        );
      } catch (err) {
        lastError = err;
        if (err.message?.includes('429')) {
          console.log(`     ⏳ Rate limited, waiting ${(attempt + 1) * 15}s...`);
          await new Promise(r => setTimeout(r, (attempt + 1) * 15000));
        } else {
          throw err;
        }
      }
    }
    throw lastError;
  } catch (error) {
    console.error(`  ❌ Failed: ${topic} Grade ${gradeLevel} Diff ${difficulty}: ${error.message}`);
    return [];
  }
}

async function seedQuick() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  await connectDB();
  
  const existingCount = await Question.countDocuments();
  console.log(`📊 Current questions in DB: ${existingCount}`);
  
  if (existingCount >= 500) {
    console.log('✅ Already have enough questions! Exiting.');
    process.exit(0);
  }

  console.log('🚀 Quick Seed: Generating questions for all grade levels...\n');

  // Generate for grades most commonly used: 10, 11, 12, 13 (Graduate)
  // Plus a smaller set for grades 7-9
  const PRIORITY_GRADES = [12, 11, 10, 13, 9, 8, 7];
  
  let totalInserted = 0;
  
  for (const grade of PRIORITY_GRADES) {
    for (const topic of TOPICS) {
      for (const diff of [1, 2, 3]) {
        // Check if we already have questions for this combo
        const existing = await Question.countDocuments({ topic, difficulty: diff, gradeLevel: grade });
        if (existing >= 10) {
          console.log(`  ⏭️  Skip: ${topic} | Grade ${grade} | Diff ${diff} (already ${existing} questions)`);
          continue;
        }
        
        console.log(`  📝 Generating: ${topic} | Grade ${grade} | Diff ${diff}...`);
        
        const qs = await generateBatch(topic, grade, diff);
        if (qs.length > 0) {
          await Question.insertMany(qs.map(q => ({
            ...q,
            timeLimit: 60
          })));
          totalInserted += qs.length;
          console.log(`     ✅ Saved ${qs.length} questions (total: ${totalInserted})`);
        }
        
        // Rate limit: wait 4s between calls
        await new Promise(r => setTimeout(r, 4000));
      }
    }
    
    // Status update after each grade
    const total = await Question.countDocuments();
    console.log(`\n  📊 Grade ${grade} done. Total in DB: ${total}\n`);
  }

  const finalCount = await Question.countDocuments();
  console.log(`\n🎉 Seeding complete! Total questions: ${finalCount}`);
  
  // Print breakdown
  for (const topic of TOPICS) {
    const count = await Question.countDocuments({ topic });
    console.log(`  ${topic}: ${count} questions`);
  }
  
  process.exit(0);
}

seedQuick();
