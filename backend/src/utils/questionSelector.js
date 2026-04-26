import Question from '../models/Question.js';

const DISTRIBUTIONS = {
  'Grade 7-9': { 1: 0.60, 2: 0.30, 3: 0.10 },
  'Grade 10':  { 1: 0.40, 2: 0.45, 3: 0.15 },
  'Grade 11':  { 1: 0.25, 2: 0.50, 3: 0.25 },
  'Grade 12':  { 1: 0.15, 2: 0.50, 3: 0.35 },
  'Graduate':  { 1: 0.10, 2: 0.45, 3: 0.45 },
};

const TOPICS = [
  'التناظر اللفظي',
  'إكمال الجمل',
  'الاستيعاب المقروء',
  'الاستدلال الكمي',
  'الهندسة والجبر'
];

function getGradeCategory(gradeYear) {
  if (gradeYear >= 7 && gradeYear <= 9) return 'Grade 7-9';
  if (gradeYear === 10) return 'Grade 10';
  if (gradeYear === 11) return 'Grade 11';
  if (gradeYear === 12) return 'Grade 12';
  return 'Graduate'; // 13+
}

export async function generateExamQuestions(gradeYear) {
  const category = getGradeCategory(gradeYear);
  const dist = DISTRIBUTIONS[category];
  
  const selectedQuestions = [];
  
  for (const topic of TOPICS) {
    const easyCount = Math.round(20 * dist[1]);
    const mediumCount = Math.round(20 * dist[2]);
    const hardCount = 20 - easyCount - mediumCount; // ensure exact 20
    
    // Pick questions for this topic
    const easyQs = await Question.aggregate([
      { $match: { topic, difficulty: 1, gradeLevel: gradeYear } },
      { $sample: { size: easyCount } }
    ]);
    
    // If not enough questions for exact grade, fallback to any grade
    let easyFallback = [];
    if (easyQs.length < easyCount) {
      easyFallback = await Question.aggregate([
        { $match: { topic, difficulty: 1, _id: { $nin: easyQs.map(q => q._id) } } },
        { $sample: { size: easyCount - easyQs.length } }
      ]);
    }

    const medQs = await Question.aggregate([
      { $match: { topic, difficulty: 2, gradeLevel: gradeYear } },
      { $sample: { size: mediumCount } }
    ]);
    let medFallback = [];
    if (medQs.length < mediumCount) {
      medFallback = await Question.aggregate([
        { $match: { topic, difficulty: 2, _id: { $nin: medQs.map(q => q._id) } } },
        { $sample: { size: mediumCount - medQs.length } }
      ]);
    }

    const hardQs = await Question.aggregate([
      { $match: { topic, difficulty: 3, gradeLevel: gradeYear } },
      { $sample: { size: hardCount } }
    ]);
    let hardFallback = [];
    if (hardQs.length < hardCount) {
      hardFallback = await Question.aggregate([
        { $match: { topic, difficulty: 3, _id: { $nin: hardQs.map(q => q._id) } } },
        { $sample: { size: hardCount - hardQs.length } }
      ]);
    }

    selectedQuestions.push(
      ...easyQs, ...easyFallback,
      ...medQs, ...medFallback,
      ...hardQs, ...hardFallback
    );
  }

  // Shuffle the final 100 questions
  return selectedQuestions.sort(() => Math.random() - 0.5);
}
