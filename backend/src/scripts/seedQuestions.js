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

const GRADE_LEVELS = [7, 8, 9, 10, 11, 12, 13];
const DIFFICULTIES = [1, 2, 3];

async function generateQuestionsBatch(topic, gradeLevel, difficulty) {
  const prompt = `
أنت خبير في اختبار القدرات العامة (قياس) السعودي.
قم بتوليد 10 أسئلة لموضوع: ${topic}
المستوى الدراسي: الصف ${gradeLevel} (إذا كان 13 فهو خريج)
مستوى الصعوبة: ${difficulty} (1=سهل، 2=متوسط، 3=صعب)

لكل سؤال، أعطني JSON بالتنسيق التالي:
{
  "text": "نص السؤال",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correctAnswer": "A" or "B" or "C" or "D",
  "explanation": "الشرح خطوة بخطوة",
  "topic": "${topic}",
  "difficulty": ${difficulty},
  "gradeLevel": [${gradeLevel}]
}

أعطني فقط JSON array يحتوي على 10 عناصر، بدون أي نص آخر أو تنسيق Markdown، فقط المصفوفة.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const questions = JSON.parse(text);
    return questions.filter(q => 
      q.text && q.options && q.options.A && q.options.B && q.options.C && q.options.D &&
      ['A','B','C','D'].includes(q.correctAnswer) && q.explanation
    );
  } catch (error) {
    console.error(`Failed to generate batch for ${topic} Grade ${gradeLevel} Diff ${difficulty}:`, error.message);
    return [];
  }
}

async function seed() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('Error: GEMINI_API_KEY is not set in .env');
    process.exit(1);
  }

  await connectDB();
  console.log('Connected to DB. Starting generation...');

  for (const topic of TOPICS) {
    for (const diff of DIFFICULTIES) {
      for (const grade of GRADE_LEVELS) {
        console.log(`Generating: ${topic} | Grade ${grade} | Diff ${diff}...`);
        
        // Generate 3 batches of 10 = 30 questions per combo
        for (let i = 0; i < 3; i++) {
          const qs = await generateQuestionsBatch(topic, grade, diff);
          if (qs.length > 0) {
            await Question.insertMany(qs.map(q => ({
              ...q,
              timeLimit: 60
            })));
            console.log(`Saved ${qs.length} questions.`);
          }
          await new Promise(r => setTimeout(r, 2000)); // avoid rate limit
        }
      }
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed();
