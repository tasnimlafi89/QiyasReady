"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Target, Brain, Zap, AlertTriangle } from "lucide-react";
import { getAnalyticsOverview, getWeaknesses, setAuthToken } from "@/lib/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [weaknesses, setWeaknesses] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const [anaRes, weakRes] = await Promise.all([getAnalyticsOverview(), getWeaknesses()]);
        setData(anaRes.data.overview);
        setWeaknesses(weakRes.data.weaknesses);
      } catch (e) { console.error(e); }
    };
    load();
  }, [getToken]);

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}><h1 className="text-2xl font-bold">التحليلات</h1><p className="text-gray-400 text-sm">تتبع تقدمك بالتفصيل</p></motion.div>

      {/* Overview Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الاختبارات", value: data?.totalExams || 0, icon: Target, color: "text-purple-400" },
          { label: "متوسط الدرجات", value: `${data?.avgScore || 0}%`, icon: BarChart3, color: "text-emerald-400" },
          { label: "أعلى درجة", value: `${data?.bestScore || 0}%`, icon: TrendingUp, color: "text-yellow-400" },
          { label: "وقت الدراسة", value: `${data?.totalStudyMinutes || 0}د`, icon: Zap, color: "text-blue-400" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={fadeUp} className="card-premium p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" /> تطور الأداء</h3>
        {data?.recentScores?.length > 0 ? (
          <div className="flex items-end gap-3 h-40">
            {data.recentScores.map((s: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-mono">{s.score}%</span>
                <div className="w-full rounded-t-xl transition-all" style={{
                  height: `${Math.max(s.score, 5)}%`,
                  background: `linear-gradient(to top, hsl(${120 * s.score / 100}, 70%, 45%), hsl(${120 * s.score / 100}, 70%, 60%))`,
                }} />
              </div>
            ))}
          </div>
        ) : <div className="h-40 flex items-center justify-center text-gray-500">ابدأ اختباراً لرؤية البيانات</div>}
      </motion.div>

      {/* Verbal vs Quantitative */}
      <motion.div variants={fadeUp} className="grid md:grid-cols-2 gap-4">
        <div className="card-premium p-6">
          <h3 className="font-bold mb-4">📝 القسم اللفظي</h3>
          <div className="text-4xl font-black font-mono text-purple-400 mb-2">{data?.recentScores?.[0]?.verbal || 0}%</div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${data?.recentScores?.[0]?.verbal || 0}%` }} /></div>
        </div>
        <div className="card-premium p-6">
          <h3 className="font-bold mb-4">🔢 القسم الكمي</h3>
          <div className="text-4xl font-black font-mono text-emerald-400 mb-2">{data?.recentScores?.[0]?.quantitative || 0}%</div>
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${data?.recentScores?.[0]?.quantitative || 0}%`, background: "linear-gradient(90deg, #10b981, #14b8a6)" }} /></div>
        </div>
      </motion.div>

      {/* Weaknesses */}
      <motion.div variants={fadeUp} className="card-premium p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" /> نقاط الضعف</h3>
        {weaknesses?.weakAreas?.length > 0 ? (
          <div className="space-y-3">
            {weaknesses.weakAreas.map((area: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="text-red-400 text-xl">⚠️</span>
                <span className="text-sm">{area}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">أكمل بعض الاختبارات لتحليل نقاط ضعفك</p>}
        {weaknesses?.strongAreas?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-bold text-emerald-400 mb-2">نقاط القوة ✅</h4>
            <div className="flex flex-wrap gap-2">
              {weaknesses.strongAreas.map((area: string, i: number) => (
                <span key={i} className="badge badge-green">{area}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
