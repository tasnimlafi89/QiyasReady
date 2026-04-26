/**
 * Calculates the raw exam score based on difficulty and speed.
 * @param {Array} responses Array of response objects { difficulty, isCorrect, timeSpent, timeExpired, wasSkipped }
 * @returns {Number} Score 0-100
 */
export function calculateExamScore(responses) {
  let earned = 0;
  let possible = 0;

  responses.forEach(r => {
    const weight = r.difficulty || 2; // default to medium if not populated
    possible += weight * 10;

    if (r.isCorrect) {
      // Speed bonus: faster = more points
      const speedBonus = r.timeSpent <= 20 ? 1.3 :  // very fast
                         r.timeSpent <= 40 ? 1.1 :  // normal
                         r.timeSpent <= 55 ? 1.0 :  // slow
                         0.8;                        // almost expired
      earned += weight * 10 * speedBonus;
    } else if (r.timeExpired || r.wasSkipped) {
      earned += 0; // no penalty for skipped/expired
    } else {
      earned -= weight * 2; // penalty for wrong answer
    }
  });

  return Math.max(0, Math.min(100, Math.round((earned / possible) * 100)));
}

/**
 * Calculates new student level based on new exam score.
 */
export function calculateNewLevel(previousLevel, examScore, examCount) {
  const examWeight = examCount <= 3 ? 0.8 :   // new student: big changes
                     examCount <= 10 ? 0.6 :  // mid: moderate changes
                     0.4;                     // experienced: stable
  
  const newLevel = (previousLevel * (1 - examWeight)) + (examScore * examWeight);
  
  return Math.max(0, Math.min(100, Math.round(newLevel)));
}

/**
 * Calculates improvement percentage.
 */
export function calculateImprovement(previousLevel, newLevel) {
  const change = newLevel - previousLevel;
  const percentage = previousLevel > 0 
    ? ((change / previousLevel) * 100).toFixed(1)
    : 0;
  
  return {
    previousLevel,
    newLevel,
    change,
    percentage: Number(percentage),
    direction: change > 0 ? "improvement" : change < 0 ? "decrease" : "stable",
  };
}

/**
 * Returns tier string based on level.
 */
export function getTier(level) {
  if (level <= 20) return "مبتدئ";
  if (level <= 40) return "متوسط";
  if (level <= 60) return "متقدم";
  if (level <= 80) return "محترف";
  return "خبير";
}
