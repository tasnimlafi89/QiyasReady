import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';
import User from '../models/User.js';

const router = Router();

// POST /api/auth/sync - Sync Clerk user to MongoDB
router.post('/sync', requireAuthentication, async (req, res) => {
  try {
    const { clerkUserId } = req;
    const { email, fullName, fullNameAr, avatar, language } = req.body;

    let user = await User.findOne({ clerkId: clerkUserId });

    if (!user) {
      user = new User({
        clerkId: clerkUserId,
        email: email || '',
        fullName: fullName || '',
        fullNameAr: fullNameAr || '',
        avatar: avatar || '',
        language: language || 'ar',
      });
      await user.save();
      console.log(`✅ New user synced: ${email}`);
    } else {
      // Update fields if provided
      if (email) user.email = email;
      if (fullName) user.fullName = fullName;
      if (fullNameAr) user.fullNameAr = fullNameAr;
      if (avatar) user.avatar = avatar;
      user.lastActiveAt = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        fullName: user.fullName,
        fullNameAr: user.fullNameAr,
        avatar: user.avatar,
        role: user.role,
        language: user.language,
        onboardingCompleted: user.onboardingCompleted,
        subscription: user.subscription,
        gamification: user.gamification,
        profile: user.profile,
        settings: user.settings,
      },
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', requireAuthentication, async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(404).json({ error: 'User not found. Please complete registration.' });
    }
    res.json({ success: true, user: req.dbUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PUT /api/auth/onboarding - Complete onboarding
router.put('/onboarding', requireAuthentication, async (req, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { grade, targetScore, examDate, studyHoursPerDay, fullNameAr, language } = req.body;

    const gradeYear = parseInt(grade) || 12;
    let baselineLevel = 10;
    let edLevel = 'الصف الأول متوسط';

    if (gradeYear >= 7 && gradeYear <= 9) {
      baselineLevel = 10;
      edLevel = gradeYear === 7 ? 'الصف الأول متوسط' : gradeYear === 8 ? 'الصف الثاني متوسط' : 'الصف الثالث متوسط';
    } else if (gradeYear === 10) {
      baselineLevel = 25;
      edLevel = 'الصف الأول ثانوي';
    } else if (gradeYear === 11) {
      baselineLevel = 40;
      edLevel = 'الصف الثاني ثانوي';
    } else if (gradeYear === 12) {
      baselineLevel = 55;
      edLevel = 'الصف الثالث ثانوي';
    } else {
      baselineLevel = 60;
      edLevel = 'خريج';
    }

    user.profile.educationLevel = edLevel;
    user.profile.gradeYear = gradeYear;
    user.profile.currentLevel = baselineLevel;
    user.profile.tier = baselineLevel >= 60 ? 'متقدم' : baselineLevel >= 40 ? 'متوسط' : 'مبتدئ';

    user.profile.targetScore = targetScore || user.profile.targetScore;
    user.profile.examDate = examDate || user.profile.examDate;
    user.profile.studyHoursPerDay = studyHoursPerDay || user.profile.studyHoursPerDay;
    if (fullNameAr) user.fullNameAr = fullNameAr;
    if (language) user.language = language;
    user.onboardingCompleted = true;

    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
