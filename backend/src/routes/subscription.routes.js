import { Router } from 'express';
import { requireAuthentication } from '../middleware/auth.js';

const router = Router();

const PLANS = [
  { id: 'free', name: { ar: 'مجاني', en: 'Free' }, price: 0, currency: 'SAR', features: { ar: ['اختبار تشخيصي واحد', '20 سؤال تدريبي يومياً', 'تحليلات أساسية'], en: ['1 diagnostic test', '20 practice questions/day', 'Basic analytics'] } },
  { id: 'pro', name: { ar: 'احترافي', en: 'Pro' }, price: 49, currency: 'SAR', popular: true, features: { ar: ['تدريب غير محدود', 'مدرس ذكاء اصطناعي', 'تحليلات متقدمة', 'خطة دراسية مخصصة', 'لوحة تحكم كاملة'], en: ['Unlimited practice', 'AI tutor', 'Advanced analytics', 'Personalized study plan', 'Full dashboard'] } },
  { id: 'premium', name: { ar: 'مميز', en: 'Premium' }, price: 99, currency: 'SAR', features: { ar: ['كل مميزات الاحترافي', 'اختبارات محاكاة كاملة', 'نظام مكافحة الغش', 'تقارير PDF', 'أولوية الدعم', 'توقع النتيجة بالذكاء الاصطناعي'], en: ['Everything in Pro', 'Full mock exams', 'Anti-cheat system', 'PDF reports', 'Priority support', 'AI score prediction'] } },
];

// GET /api/subscriptions/plans
router.get('/plans', async (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// POST /api/subscriptions/subscribe
router.post('/subscribe', requireAuthentication, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });
    const user = req.dbUser;
    user.subscription.plan = planId;
    user.subscription.status = 'active';
    user.subscription.startedAt = new Date();
    user.subscription.expiresAt = new Date(Date.now() + 30 * 86400000);
    await user.save();
    res.json({ success: true, subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

export default router;
