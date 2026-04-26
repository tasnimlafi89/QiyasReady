"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { Target, Clock, Lock, Star, ArrowLeft, BookOpen, Zap, Crown } from "lucide-react";
import { getExams, setAuthToken } from "@/lib/api";

export default function ExamsPage() {
  const { getToken } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const res = await getExams();
        setExams(res.data.exams || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [getToken]);

  const filtered = filter === "all" ? exams : exams.filter((e: any) => e.type === filter);
  const typeLabels: any = { diagnostic: "تشخيصي", mock: "محاكاة", practice: "تدريبي", challenge: "تحدي" };
  const typeColors: any = { diagnostic: "badge-purple", mock: "badge-green", practice: "badge-gold", challenge: "badge-red" };
  const sectionLabels: any = { verbal: "لفظي", quantitative: "كمي", full: "شامل" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-1">الاختبارات</h1>
        <p className="text-gray-400 text-sm">اختر اختبار وابدأ التحضير</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[{ key: "all", label: "الكل" }, { key: "diagnostic", label: "تشخيصي" }, { key: "mock", label: "محاكاة" }].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-sm transition ${filter === f.key ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="card-premium p-6 h-48 animate-pulse bg-white/3" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((exam: any, i: number) => (
            <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-premium p-6 relative group">
              {exam.isPremium && (
                <div className="absolute top-3 right-3 badge badge-gold"><Crown className="w-3 h-3" /> مميز</div>
              )}
              <div className="flex flex-col items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <span className={`badge ${typeColors[exam.type] || "badge-purple"} text-xs mb-2`}>{typeLabels[exam.type] || exam.type}</span>
                <h3 className="text-lg font-bold mt-1">{exam.title?.ar || exam.title?.en}</h3>
                <p className="text-sm text-gray-500 mt-1">{exam.description?.ar || ""}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {exam.config?.totalQuestions} سؤال</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {exam.config?.duration} دقيقة</span>
                <span className="badge badge-purple text-xs">{sectionLabels[exam.section]}</span>
              </div>
              {exam.userAttempts && (
                <div className="flex items-center gap-3 text-xs mb-4">
                  <span className="text-gray-400">أفضل نتيجة: <span className="text-emerald-400 font-bold font-mono">{exam.userAttempts.bestScore}%</span></span>
                  <span className="text-gray-500">({exam.userAttempts.attempts} محاولة)</span>
                </div>
              )}
              <Link href={`/dashboard/exams/${exam._id}`} className={`${exam.isPremium ? "btn-secondary" : "btn-primary"} text-sm w-full justify-center`}>
                {exam.isPremium ? <><Lock className="w-4 h-4" /> ترقية للوصول</> : <>ابدأ الاختبار <ArrowLeft className="w-4 h-4" /></>}
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
