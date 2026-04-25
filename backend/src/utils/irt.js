/**
 * Item Response Theory (IRT) - 3 Parameter Logistic Model
 * Used for adaptive testing and ability estimation
 * 
 * P(θ) = c + (1-c) / (1 + e^(-a(θ-b)))
 * 
 * Where:
 * θ (theta) = student ability (-3 to +3)
 * a = discrimination parameter (0.5 to 2.5)
 * b = difficulty parameter (-3 to +3)
 * c = guessing parameter (0 to 0.35)
 */

/**
 * Calculate probability of correct answer
 */
export function probability(theta, a, b, c) {
  const exponent = -a * (theta - b);
  return c + (1 - c) / (1 + Math.exp(exponent));
}

/**
 * Calculate information function for a question at given ability
 * Higher information = more useful for estimating ability at that level
 */
export function information(theta, a, b, c) {
  const p = probability(theta, a, b, c);
  const q = 1 - p;
  const numerator = Math.pow(a, 2) * Math.pow(p - c, 2) * q;
  const denominator = Math.pow(1 - c, 2) * p;
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Estimate ability (theta) using Maximum Likelihood Estimation
 * Based on a set of responses
 * 
 * @param {Array} responses - [{a, b, c, correct: boolean}]
 * @param {number} initialTheta - Starting estimate
 * @returns {number} Estimated theta
 */
export function estimateAbility(responses, initialTheta = 0) {
  let theta = initialTheta;
  const maxIterations = 50;
  const convergence = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    let numerator = 0;
    let denominator = 0;

    for (const r of responses) {
      const p = probability(theta, r.a, r.b, r.c);
      const q = 1 - p;
      const u = r.correct ? 1 : 0;
      
      const pStar = (p - r.c) / (1 - r.c);
      
      numerator += r.a * (u - p) * pStar / p;
      denominator += Math.pow(r.a, 2) * pStar * q * (u * (p - r.c) / Math.pow(p, 2) + (1 - u) / q);
    }

    if (denominator === 0) break;
    
    const delta = numerator / denominator;
    theta += delta;

    // Clamp theta to valid range
    theta = Math.max(-3, Math.min(3, theta));

    if (Math.abs(delta) < convergence) break;
  }

  return Math.round(theta * 100) / 100;
}

/**
 * Select the next best question for adaptive testing
 * Picks the question with maximum information at current ability level
 * 
 * @param {number} theta - Current ability estimate
 * @param {Array} availableQuestions - Questions not yet asked
 * @param {number} count - Number of questions to select
 * @returns {Array} Selected questions
 */
export function selectNextQuestions(theta, availableQuestions, count = 1) {
  const scored = availableQuestions.map(q => ({
    question: q,
    info: information(theta, q.discrimination, q.difficulty, q.guessing),
  }));

  scored.sort((a, b) => b.info - a.info);

  return scored.slice(0, count).map(s => s.question);
}

/**
 * Convert IRT theta to approximate Qiyas score (out of 100)
 */
export function thetaToQiyasScore(theta) {
  // Map -3..+3 to roughly 30..100
  const score = 65 + (theta * 11.67);
  return Math.max(30, Math.min(100, Math.round(score)));
}

/**
 * Calculate percentile from theta
 * Using normal distribution approximation
 */
export function thetaToPercentile(theta) {
  // Approximation of CDF for standard normal
  const t = 1 / (1 + 0.2316419 * Math.abs(theta));
  const d = 0.3989422804014327;
  const p = d * Math.exp(-theta * theta / 2) * 
    (0.3193815 * t - 0.3565638 * t * t + 1.781478 * Math.pow(t, 3) - 
     1.821256 * Math.pow(t, 4) + 1.330274 * Math.pow(t, 5));
  
  const percentile = theta > 0 ? (1 - p) * 100 : p * 100;
  return Math.max(1, Math.min(99, Math.round(percentile)));
}
