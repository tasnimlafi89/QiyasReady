import User from '../models/User.js';
import Achievement from '../models/Achievement.js';

/**
 * Gamification Service - Handles XP, levels, streaks, and achievements
 */
class GamificationService {
  
  // XP rewards for different actions
  static XP_REWARDS = {
    ANSWER_CORRECT: 10,
    ANSWER_WRONG: 2,
    COMPLETE_EXAM: 50,
    COMPLETE_PRACTICE: 20,
    DAILY_LOGIN: 5,
    STREAK_BONUS: 15, // per streak day
    STUDY_PLAN_TASK: 10,
    PERFECT_EXAM: 100,
    FIRST_EXAM: 30,
  };

  /**
   * Award XP to user and check achievements
   */
  async awardXP(userId, amount, reason) {
    const user = await User.findById(userId);
    if (!user) return null;

    user.addXP(amount);
    user.updateStreak();
    await user.save();

    // Check for new achievements
    const newAchievements = await this.checkAchievements(user);

    return {
      xpAwarded: amount,
      reason,
      totalXP: user.gamification.xp,
      level: user.gamification.level,
      rank: user.gamification.rank,
      streak: user.gamification.streak,
      newAchievements,
    };
  }

  /**
   * Process exam completion rewards
   */
  async processExamCompletion(userId, examResult) {
    const user = await User.findById(userId);
    if (!user) return null;

    let totalXP = GamificationService.XP_REWARDS.COMPLETE_EXAM;

    // Bonus for correct answers
    totalXP += examResult.correct * GamificationService.XP_REWARDS.ANSWER_CORRECT;
    totalXP += examResult.incorrect * GamificationService.XP_REWARDS.ANSWER_WRONG;

    // Perfect score bonus
    if (examResult.percentage === 100) {
      totalXP += GamificationService.XP_REWARDS.PERFECT_EXAM;
    }

    // First exam bonus
    if (user.gamification.totalExamsCompleted === 0) {
      totalXP += GamificationService.XP_REWARDS.FIRST_EXAM;
    }

    // Streak bonus
    if (user.gamification.streak > 0) {
      totalXP += Math.min(user.gamification.streak, 30) * GamificationService.XP_REWARDS.STREAK_BONUS;
    }

    // Update stats
    user.gamification.totalQuestionsAnswered += (examResult.correct + examResult.incorrect);
    user.gamification.totalCorrectAnswers += examResult.correct;
    user.gamification.totalExamsCompleted += 1;
    
    user.addXP(totalXP);
    user.updateStreak();
    await user.save();

    const newAchievements = await this.checkAchievements(user);

    return {
      xpAwarded: totalXP,
      totalXP: user.gamification.xp,
      level: user.gamification.level,
      rank: user.gamification.rank,
      streak: user.gamification.streak,
      newAchievements,
    };
  }

  /**
   * Check and award achievements
   */
  async checkAchievements(user) {
    const achievements = await Achievement.find({ isActive: true });
    const earnedIds = user.gamification.badges.map(b => b.id);
    const newAchievements = [];

    for (const achievement of achievements) {
      if (earnedIds.includes(achievement.achievementId)) continue;

      let earned = false;
      const { type, threshold } = achievement.condition || {};

      switch (type) {
        case 'exam_count':
          earned = user.gamification.totalExamsCompleted >= threshold;
          break;
        case 'streak':
          earned = user.gamification.streak >= threshold;
          break;
        case 'questions':
          earned = user.gamification.totalQuestionsAnswered >= threshold;
          break;
        case 'xp':
          earned = user.gamification.xp >= threshold;
          break;
        case 'level':
          earned = user.gamification.level >= threshold;
          break;
        case 'accuracy':
          const accuracy = user.gamification.totalQuestionsAnswered > 0
            ? (user.gamification.totalCorrectAnswers / user.gamification.totalQuestionsAnswered) * 100
            : 0;
          earned = accuracy >= threshold && user.gamification.totalQuestionsAnswered >= 50;
          break;
      }

      if (earned) {
        user.gamification.badges.push({
          id: achievement.achievementId,
          earnedAt: new Date(),
        });
        user.addXP(achievement.xpReward);
        newAchievements.push(achievement);
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    return newAchievements;
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 50, timeframe = 'all') {
    const query = { role: 'student' };
    
    const users = await User.find(query)
      .sort({ 'gamification.xp': -1 })
      .limit(limit)
      .select('fullName fullNameAr avatar gamification.xp gamification.level gamification.rank gamification.streak')
      .lean();

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: user.fullNameAr || user.fullName || 'طالب',
      avatar: user.avatar,
      xp: user.gamification.xp,
      level: user.gamification.level,
      playerRank: user.gamification.rank,
      streak: user.gamification.streak,
    }));
  }
}

export default new GamificationService();
