"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Target, Zap, Trophy, BarChart3, Brain, BookOpen,
  Flame, Star, TrendingUp, Clock, ArrowLeft, Sparkles
} from "lucide-react";
import { getAnalyticsOverview, getUserStats, setAuthToken } from "@/lib/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const res = await getUserStats();
        setStats(res.data.stats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [getToken]);

  const quickActions = [
    { href: "/exam/new", label: "اختبار محاكاة", icon: Target, color: "from-purple-500 to-violet-600", desc: "ابدأ اختبار 100 سؤال" },
    { href: "/dashboard/practice", label: "تدريب سريع", icon: BookOpen, color: "from-emerald-500 to-teal-600", desc: "تدرب على أسئلة" },
    { href: "/dashboard/ai-tutor", label: "المدرس الذكي", icon: Brain, color: "from-blue-500 to-cyan-600", desc: "اسأل الذكاء الاصطناعي" },
    { href: "/dashboard/study-plan", label: "خطة الدراسة", icon: Clock, color: "from-orange-500 to-amber-600", desc: "خطتك اليومية" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-10 text-center">
      {/* ── Welcome Header ───────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">مرحباً! 👋</h1>
        <p className="text-gray-400 mt-1">لنكمل رحلتك نحو التميز في قياس</p>
        <div className="flex items-center gap-2 badge badge-purple mt-2">
          <Flame className="w-4 h-4" />
          <span className="font-mono">{stats?.streak || 0} يوم متتالي</span>
        </div>
      </motion.div>

      {/* ── Stat Cards ───────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "المستوى", value: stats?.level || 1, icon: Star, color: "text-yellow-400", bg: "from-yellow-500/10 to-orange-500/10" },
          { label: "نقاط الخبرة", value: stats?.xp || 0, icon: Zap, color: "text-purple-400", bg: "from-purple-500/10 to-violet-500/10" },
          { label: "الدقة", value: `${stats?.accuracy || 0}%`, icon: Target, color: "text-emerald-400", bg: "from-emerald-500/10 to-teal-500/10" },
          { label: "الاختبارات", value: stats?.totalExams || 0, icon: Trophy, color: "text-blue-400", bg: "from-blue-500/10 to-cyan-500/10" },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className={`stat-card bg-gradient-to-br ${stat.bg} border-white/5 text-center`}>
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Actions ────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <motion.div whileHover={{ y: -4 }} className="card-premium p-5 text-center cursor-pointer group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Performance Chart & Weaknesses ────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div variants={fadeUp} className="card-premium p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold">تقدم الأداء</h3>
          </div>
          {stats?.recentScores && stats.recentScores.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {stats.recentScores.map((s: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-mono">{s.score}%</span>
                  <div className="w-full rounded-t-lg" style={{
                    height: `${s.score}%`,
                    background: `linear-gradient(to top, #8b4dff, #10b981)`,
                    opacity: 0.4 + (i * 0.06),
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
              <p>ابدأ أول اختبار لرؤية تقدمك</p>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="card-premium p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold">حالتك الحالية</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">التصنيف</span>
              <span className="badge badge-gold font-mono">{stats?.rank || 'bronze'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">أسئلة تمت الإجابة عليها</span>
              <span className="font-mono font-bold">{stats?.totalQuestions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">أعلى سلسلة</span>
              <span className="font-mono font-bold flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400" />{stats?.longestStreak || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">متوسط الدرجات</span>
              <span className="font-mono font-bold text-purple-400">{stats?.avgScore || 0}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AI Suggestion ────────────────────────────── */}
      <motion.div variants={fadeUp} className="card-premium p-6 border-purple-500/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-bold mb-1">نصيحة الذكاء الاصطناعي</h3>
            <p className="text-sm text-gray-400">
              بناءً على أدائك، ننصحك بالتركيز على أسئلة التناظر اللفظي والهندسة اليوم. 
              جرب جلسة تدريب سريعة على هذه المواضيع لتحسين نتيجتك.
            </p>
            <Link href="/dashboard/practice" className="btn-primary text-xs mt-3 py-2 mx-auto">
              ابدأ التدريب <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
