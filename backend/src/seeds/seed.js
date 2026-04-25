import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import Question from '../models/Question.js';
import Exam from '../models/Exam.js';
import Achievement from '../models/Achievement.js';

const questions = [
  // ── VERBAL: Analogies ────────────────────────────
  { section: 'verbal', category: 'analogies', difficulty: -1, discrimination: 1.2, guessing: 0.2, content: { textAr: 'كتاب : مكتبة :: لوحة : ؟', textEn: 'Book : Library :: Painting : ?', options: [{ id: 'A', textAr: 'متحف', textEn: 'Museum' }, { id: 'B', textAr: 'رسام', textEn: 'Painter' }, { id: 'C', textAr: 'ألوان', textEn: 'Colors' }, { id: 'D', textAr: 'جدار', textEn: 'Wall' }], correctAnswer: 'A', explanation: { textAr: 'العلاقة هي: الشيء ومكان حفظه. الكتاب يُحفظ في المكتبة، واللوحة تُحفظ في المتحف.', textEn: 'The relationship is: item and its storage place.' } } },
  { section: 'verbal', category: 'analogies', difficulty: 0, discrimination: 1.5, guessing: 0.2, content: { textAr: 'طبيب : مستشفى :: معلم : ؟', textEn: 'Doctor : Hospital :: Teacher : ?', options: [{ id: 'A', textAr: 'مدرسة', textEn: 'School' }, { id: 'B', textAr: 'طالب', textEn: 'Student' }, { id: 'C', textAr: 'كتاب', textEn: 'Book' }, { id: 'D', textAr: 'علم', textEn: 'Knowledge' }], correctAnswer: 'A', explanation: { textAr: 'العلاقة: الشخص ومكان عمله.', textEn: 'Relationship: person and workplace.' } } },
  { section: 'verbal', category: 'analogies', difficulty: 1, discrimination: 1.8, guessing: 0.15, content: { textAr: 'عين : إبصار :: أذن : ؟', textEn: 'Eye : Sight :: Ear : ?', options: [{ id: 'A', textAr: 'سمع', textEn: 'Hearing' }, { id: 'B', textAr: 'صوت', textEn: 'Sound' }, { id: 'C', textAr: 'رأس', textEn: 'Head' }, { id: 'D', textAr: 'كلام', textEn: 'Speech' }], correctAnswer: 'A', explanation: { textAr: 'العلاقة: العضو ووظيفته.', textEn: 'Relationship: organ and its function.' } } },
  { section: 'verbal', category: 'analogies', difficulty: 1.5, discrimination: 1.6, guessing: 0.15, content: { textAr: 'جفاف : ماء :: ظلام : ؟', textEn: 'Drought : Water :: Darkness : ?', options: [{ id: 'A', textAr: 'نور', textEn: 'Light' }, { id: 'B', textAr: 'ليل', textEn: 'Night' }, { id: 'C', textAr: 'قمر', textEn: 'Moon' }, { id: 'D', textAr: 'شمس', textEn: 'Sun' }], correctAnswer: 'A', explanation: { textAr: 'العلاقة: الحالة وما يزيلها.', textEn: 'Relationship: state and what removes it.' } } },
  // ── VERBAL: Sentence Completion ────────────────
  { section: 'verbal', category: 'sentence_completion', difficulty: -0.5, discrimination: 1.3, guessing: 0.2, content: { textAr: 'العلم نور و_____ ظلام', textEn: 'Knowledge is light and _____ is darkness', options: [{ id: 'A', textAr: 'الجهل', textEn: 'Ignorance' }, { id: 'B', textAr: 'الليل', textEn: 'Night' }, { id: 'C', textAr: 'النوم', textEn: 'Sleep' }, { id: 'D', textAr: 'الصمت', textEn: 'Silence' }], correctAnswer: 'A', explanation: { textAr: 'الجهل هو نقيض العلم.', textEn: 'Ignorance is the opposite of knowledge.' } } },
  { section: 'verbal', category: 'sentence_completion', difficulty: 0.5, discrimination: 1.4, guessing: 0.2, content: { textAr: 'الصبر مفتاح _____', textEn: 'Patience is the key to _____', options: [{ id: 'A', textAr: 'الفرج', textEn: 'Relief' }, { id: 'B', textAr: 'الباب', textEn: 'Door' }, { id: 'C', textAr: 'النجاح', textEn: 'Success' }, { id: 'D', textAr: 'القوة', textEn: 'Strength' }], correctAnswer: 'A', explanation: { textAr: 'مثل عربي مشهور: الصبر مفتاح الفرج.', textEn: 'Famous Arabic proverb.' } } },
  { section: 'verbal', category: 'reading_comprehension', difficulty: 0, discrimination: 1.3, guessing: 0.2, content: { textAr: 'تعتبر القراءة من أهم الوسائل لاكتساب المعرفة. فهي تنمي العقل وتوسع المدارك وتزيد الثقافة. ما الفكرة الرئيسية؟', textEn: 'Reading is one of the most important means of acquiring knowledge. What is the main idea?', options: [{ id: 'A', textAr: 'أهمية القراءة في اكتساب المعرفة', textEn: 'Importance of reading' }, { id: 'B', textAr: 'طرق القراءة السريعة', textEn: 'Speed reading methods' }, { id: 'C', textAr: 'أنواع الكتب', textEn: 'Types of books' }, { id: 'D', textAr: 'تاريخ الكتابة', textEn: 'History of writing' }], correctAnswer: 'A', explanation: { textAr: 'النص يتحدث بشكل رئيسي عن أهمية القراءة.', textEn: 'The text mainly discusses the importance of reading.' } } },
  // ── QUANTITATIVE: Arithmetic ───────────────────
  { section: 'quantitative', category: 'arithmetic', difficulty: -1.5, discrimination: 1.2, guessing: 0.2, content: { textAr: 'ما ناتج: ١٢ × ١٥ = ؟', textEn: 'What is 12 × 15 = ?', options: [{ id: 'A', textAr: '١٨٠', textEn: '180' }, { id: 'B', textAr: '١٧٠', textEn: '170' }, { id: 'C', textAr: '١٦٠', textEn: '160' }, { id: 'D', textAr: '١٩٠', textEn: '190' }], correctAnswer: 'A', explanation: { textAr: '١٢ × ١٥ = ١٢ × ١٠ + ١٢ × ٥ = ١٢٠ + ٦٠ = ١٨٠', textEn: '12 × 15 = 180' } } },
  { section: 'quantitative', category: 'arithmetic', difficulty: -0.5, discrimination: 1.4, guessing: 0.2, content: { textAr: 'إذا كان ثمن ٥ كتب ١٠٠ ريال، فما ثمن ٨ كتب؟', textEn: 'If 5 books cost 100 SAR, what is the cost of 8 books?', options: [{ id: 'A', textAr: '١٦٠ ريال', textEn: '160 SAR' }, { id: 'B', textAr: '١٤٠ ريال', textEn: '140 SAR' }, { id: 'C', textAr: '١٨٠ ريال', textEn: '180 SAR' }, { id: 'D', textAr: '٢٠٠ ريال', textEn: '200 SAR' }], correctAnswer: 'A', explanation: { textAr: 'ثمن الكتاب = ١٠٠ ÷ ٥ = ٢٠ ريال، ثمن ٨ كتب = ٨ × ٢٠ = ١٦٠ ريال', textEn: 'Price per book = 100/5 = 20, 8 books = 160 SAR' } } },
  // ── QUANTITATIVE: Algebra ──────────────────────
  { section: 'quantitative', category: 'algebra', difficulty: 0, discrimination: 1.5, guessing: 0.2, content: { textAr: 'إذا كان س + ٧ = ١٢، فما قيمة س؟', textEn: 'If x + 7 = 12, what is x?', options: [{ id: 'A', textAr: '٥', textEn: '5' }, { id: 'B', textAr: '٧', textEn: '7' }, { id: 'C', textAr: '١٩', textEn: '19' }, { id: 'D', textAr: '٤', textEn: '4' }], correctAnswer: 'A', explanation: { textAr: 'س = ١٢ - ٧ = ٥', textEn: 'x = 12 - 7 = 5' } } },
  { section: 'quantitative', category: 'algebra', difficulty: 0.5, discrimination: 1.6, guessing: 0.15, content: { textAr: 'إذا كان ٢س - ٣ = ٧، فما قيمة س؟', textEn: 'If 2x - 3 = 7, what is x?', options: [{ id: 'A', textAr: '٥', textEn: '5' }, { id: 'B', textAr: '٢', textEn: '2' }, { id: 'C', textAr: '٤', textEn: '4' }, { id: 'D', textAr: '٣', textEn: '3' }], correctAnswer: 'A', explanation: { textAr: '٢س = ٧ + ٣ = ١٠، س = ٥', textEn: '2x = 10, x = 5' } } },
  { section: 'quantitative', category: 'algebra', difficulty: 1.5, discrimination: 1.8, guessing: 0.15, content: { textAr: 'إذا كان س² - ٩ = ٠، فما القيم الممكنة لـ س؟', textEn: 'If x² - 9 = 0, what are the possible values of x?', options: [{ id: 'A', textAr: '٣ و -٣', textEn: '3 and -3' }, { id: 'B', textAr: '٩ و -٩', textEn: '9 and -9' }, { id: 'C', textAr: '٣ فقط', textEn: 'Only 3' }, { id: 'D', textAr: '٠ و ٣', textEn: '0 and 3' }], correctAnswer: 'A', explanation: { textAr: 'س² = ٩، إذن س = ±٣', textEn: 'x² = 9, so x = ±3' } } },
  // ── QUANTITATIVE: Geometry ─────────────────────
  { section: 'quantitative', category: 'geometry', difficulty: 0, discrimination: 1.3, guessing: 0.2, content: { textAr: 'مساحة مستطيل طوله ٨ سم وعرضه ٥ سم:', textEn: 'Area of rectangle with length 8cm and width 5cm:', options: [{ id: 'A', textAr: '٤٠ سم²', textEn: '40 cm²' }, { id: 'B', textAr: '٢٦ سم²', textEn: '26 cm²' }, { id: 'C', textAr: '١٣ سم²', textEn: '13 cm²' }, { id: 'D', textAr: '٣٥ سم²', textEn: '35 cm²' }], correctAnswer: 'A', explanation: { textAr: 'المساحة = الطول × العرض = ٨ × ٥ = ٤٠ سم²', textEn: 'Area = l × w = 8 × 5 = 40 cm²' } } },
  { section: 'quantitative', category: 'geometry', difficulty: 1, discrimination: 1.5, guessing: 0.2, content: { textAr: 'محيط دائرة نصف قطرها ٧ سم (π ≈ ²²/٧):', textEn: 'Circumference of circle with radius 7cm:', options: [{ id: 'A', textAr: '٤٤ سم', textEn: '44 cm' }, { id: 'B', textAr: '١٥٤ سم', textEn: '154 cm' }, { id: 'C', textAr: '٢٢ سم', textEn: '22 cm' }, { id: 'D', textAr: '٤٩ سم', textEn: '49 cm' }], correctAnswer: 'A', explanation: { textAr: 'المحيط = ٢ × π × نق = ٢ × ²²/٧ × ٧ = ٤٤ سم', textEn: 'C = 2πr = 2 × 22/7 × 7 = 44 cm' } } },
  // ── QUANTITATIVE: Statistics ───────────────────
  { section: 'quantitative', category: 'statistics', difficulty: 0.5, discrimination: 1.4, guessing: 0.2, content: { textAr: 'متوسط الأعداد: ٤، ٨، ١٢، ١٦:', textEn: 'Average of: 4, 8, 12, 16:', options: [{ id: 'A', textAr: '١٠', textEn: '10' }, { id: 'B', textAr: '١٢', textEn: '12' }, { id: 'C', textAr: '٨', textEn: '8' }, { id: 'D', textAr: '٩', textEn: '9' }], correctAnswer: 'A', explanation: { textAr: 'المتوسط = (٤+٨+١٢+١٦) ÷ ٤ = ٤٠ ÷ ٤ = ١٠', textEn: 'Mean = (4+8+12+16)/4 = 10' } } },
  { section: 'quantitative', category: 'percentage', difficulty: 0, discrimination: 1.3, guessing: 0.2, content: { textAr: 'ما هو ٢٥٪ من ٢٠٠؟', textEn: 'What is 25% of 200?', options: [{ id: 'A', textAr: '٥٠', textEn: '50' }, { id: 'B', textAr: '٤٠', textEn: '40' }, { id: 'C', textAr: '٧٥', textEn: '75' }, { id: 'D', textAr: '٢٥', textEn: '25' }], correctAnswer: 'A', explanation: { textAr: '٢٥٪ × ٢٠٠ = ٠.٢٥ × ٢٠٠ = ٥٠', textEn: '25% × 200 = 50' } } },
  { section: 'quantitative', category: 'percentage', difficulty: 1, discrimination: 1.5, guessing: 0.15, content: { textAr: 'زاد سعر منتج من ٨٠ إلى ١٠٠ ريال. ما نسبة الزيادة؟', textEn: 'Price increased from 80 to 100 SAR. What is the percentage increase?', options: [{ id: 'A', textAr: '٢٥٪', textEn: '25%' }, { id: 'B', textAr: '٢٠٪', textEn: '20%' }, { id: 'C', textAr: '٣٠٪', textEn: '30%' }, { id: 'D', textAr: '١٥٪', textEn: '15%' }], correctAnswer: 'A', explanation: { textAr: 'نسبة الزيادة = (١٠٠-٨٠)/٨٠ × ١٠٠ = ٢٥٪', textEn: 'Increase % = (100-80)/80 × 100 = 25%' } } },
  // More verbal questions
  { section: 'verbal', category: 'analogies', difficulty: -0.5, discrimination: 1.3, guessing: 0.2, content: { textAr: 'سيف : محارب :: قلم : ؟', textEn: 'Sword : Warrior :: Pen : ?', options: [{ id: 'A', textAr: 'كاتب', textEn: 'Writer' }, { id: 'B', textAr: 'حبر', textEn: 'Ink' }, { id: 'C', textAr: 'ورقة', textEn: 'Paper' }, { id: 'D', textAr: 'مكتب', textEn: 'Desk' }], correctAnswer: 'A', explanation: { textAr: 'العلاقة: الأداة ومستخدمها.', textEn: 'Relationship: tool and its user.' } } },
  { section: 'verbal', category: 'error_detection', difficulty: 0.5, discrimination: 1.4, guessing: 0.2, content: { textAr: 'حدد الخطأ: "ذهبت الطالبات إلى المدرسة وهم سعيدات"', textEn: 'Find the error in the Arabic sentence', options: [{ id: 'A', textAr: 'هم → هن', textEn: 'هم → هن' }, { id: 'B', textAr: 'ذهبت → ذهب', textEn: 'ذهبت → ذهب' }, { id: 'C', textAr: 'سعيدات → سعيدون', textEn: 'سعيدات → سعيدون' }, { id: 'D', textAr: 'لا يوجد خطأ', textEn: 'No error' }], correctAnswer: 'A', explanation: { textAr: 'الضمير الصحيح لجمع المؤنث هو "هن" وليس "هم".', textEn: 'Correct pronoun for feminine plural is هن not هم.' } } },
];

const achievements = [
  { achievementId: 'first_exam', title: { ar: 'البداية', en: 'First Step' }, description: { ar: 'أكمل أول اختبار', en: 'Complete your first exam' }, icon: '🎯', category: 'milestone', xpReward: 50, condition: { type: 'exam_count', threshold: 1 }, rarity: 'common' },
  { achievementId: 'five_exams', title: { ar: 'المثابر', en: 'Persistent' }, description: { ar: 'أكمل ٥ اختبارات', en: 'Complete 5 exams' }, icon: '📝', category: 'milestone', xpReward: 100, condition: { type: 'exam_count', threshold: 5 }, rarity: 'common' },
  { achievementId: 'streak_3', title: { ar: 'ثلاثة أيام', en: '3 Day Streak' }, description: { ar: 'حافظ على سلسلة ٣ أيام', en: 'Maintain a 3-day streak' }, icon: '🔥', category: 'streak', xpReward: 75, condition: { type: 'streak', threshold: 3 }, rarity: 'common' },
  { achievementId: 'streak_7', title: { ar: 'أسبوع كامل', en: 'Full Week' }, description: { ar: 'حافظ على سلسلة ٧ أيام', en: 'Maintain a 7-day streak' }, icon: '⚡', category: 'streak', xpReward: 150, condition: { type: 'streak', threshold: 7 }, rarity: 'rare' },
  { achievementId: 'streak_30', title: { ar: 'شهر التميز', en: 'Month of Excellence' }, description: { ar: 'حافظ على سلسلة ٣٠ يوم', en: '30-day streak' }, icon: '👑', category: 'streak', xpReward: 500, condition: { type: 'streak', threshold: 30 }, rarity: 'legendary' },
  { achievementId: 'questions_100', title: { ar: 'المئة الأولى', en: 'First Hundred' }, description: { ar: 'أجب على ١٠٠ سؤال', en: 'Answer 100 questions' }, icon: '💯', category: 'milestone', xpReward: 200, condition: { type: 'questions', threshold: 100 }, rarity: 'rare' },
  { achievementId: 'accuracy_90', title: { ar: 'القناص', en: 'Sharpshooter' }, description: { ar: 'حقق دقة ٩٠٪ أو أعلى', en: '90%+ accuracy' }, icon: '🎯', category: 'performance', xpReward: 300, condition: { type: 'accuracy', threshold: 90 }, rarity: 'epic' },
  { achievementId: 'level_10', title: { ar: 'المتقدم', en: 'Advanced' }, description: { ar: 'وصل إلى المستوى ١٠', en: 'Reach level 10' }, icon: '⭐', category: 'milestone', xpReward: 250, condition: { type: 'level', threshold: 10 }, rarity: 'rare' },
];

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Seeding database...');

    // Clear existing data
    await Question.deleteMany({});
    await Exam.deleteMany({});
    await Achievement.deleteMany({});
    console.log('  Cleared existing data');

    // Insert questions
    const insertedQuestions = await Question.insertMany(questions);
    console.log(`  ✅ Inserted ${insertedQuestions.length} questions`);

    // Insert achievements
    await Achievement.insertMany(achievements);
    console.log(`  ✅ Inserted ${achievements.length} achievements`);

    // Create exams
    const verbalQs = insertedQuestions.filter(q => q.section === 'verbal');
    const quantQs = insertedQuestions.filter(q => q.section === 'quantitative');

    const exams = [
      { title: { ar: 'اختبار تشخيصي شامل', en: 'Comprehensive Diagnostic Test' }, type: 'diagnostic', section: 'full', config: { totalQuestions: insertedQuestions.length, duration: 45, passingScore: 65, shuffleQuestions: true, shuffleOptions: true, showResults: 'after_submit', allowReview: true, antiCheat: { enabled: false } }, questions: insertedQuestions.map(q => q._id), difficulty: 'adaptive', isPublished: true, order: 0 },
      { title: { ar: 'اختبار محاكاة - لفظي', en: 'Mock Exam - Verbal' }, type: 'mock', section: 'verbal', config: { totalQuestions: verbalQs.length, duration: 25, passingScore: 65, shuffleQuestions: true, shuffleOptions: true, showResults: 'after_submit', allowReview: true, antiCheat: { enabled: true, tabSwitchLimit: 3, copyPasteBlocked: true } }, questions: verbalQs.map(q => q._id), difficulty: 'medium', isPublished: true, order: 1 },
      { title: { ar: 'اختبار محاكاة - كمي', en: 'Mock Exam - Quantitative' }, type: 'mock', section: 'quantitative', config: { totalQuestions: quantQs.length, duration: 25, passingScore: 65, shuffleQuestions: true, shuffleOptions: true, showResults: 'after_submit', allowReview: true, antiCheat: { enabled: true, tabSwitchLimit: 3, copyPasteBlocked: true } }, questions: quantQs.map(q => q._id), difficulty: 'medium', isPublished: true, order: 2 },
      { title: { ar: 'اختبار محاكاة كامل', en: 'Full Mock Exam' }, type: 'mock', section: 'full', config: { totalQuestions: insertedQuestions.length, duration: 60, passingScore: 65, shuffleQuestions: true, shuffleOptions: true, showResults: 'after_submit', allowReview: true, antiCheat: { enabled: true, tabSwitchLimit: 3, copyPasteBlocked: true } }, questions: insertedQuestions.map(q => q._id), difficulty: 'medium', isPublished: true, isPremium: true, order: 3 },
    ];

    await Exam.insertMany(exams);
    console.log(`  ✅ Inserted ${exams.length} exams`);

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
