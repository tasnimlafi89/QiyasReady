"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Circle, Sparkles, Loader2, BookOpen, Target, RefreshCw } from "lucide-react";
import { getStudyPlan, generateStudyPlan, completeTask, setAuthToken } from "@/lib/api";

export default function StudyPlanPage() {
  const { getToken } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeWeek, setActiveWeek] = useState(0);

  const loadPlan = async () => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await getStudyPlan();
      setPlan(res.data.plan);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPlan(); }, [getToken]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await generateStudyPlan();
      setPlan(res.data.plan);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  const handleComplete = async (wi: number, di: number, ti: number) => {
    try {
      const res = await completeTask({ weekIndex: wi, dayIndex: di, taskIndex: ti });
      setPlan(res.data.plan);
    } catch (e) { console.error(e); }
  };

  const taskIcons: any = { lesson: "📖", practice: "✏️", review: "🔄", mock_exam: "📝", revision: "📚" };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;

  if (!plan) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center mb-6 animate-pulse-glow">
          <Calendar className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">خطة دراسية مخصصة</h1>
        <p className="text-gray-400 mb-8 max-w-md">سيقوم الذكاء الاصطناعي بإنشاء خطة دراسية يومية مخصصة لك بناءً على مستواك وأهدافك</p>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary text-lg px-8 py-3">
          {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإنشاء...</> : <><Sparkles className="w-5 h-5" /> أنشئ خطتي</>}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">خطة الدراسة</h1><p className="text-gray-400 text-sm">خطة مخصصة بالذكاء الاصطناعي</p></div>
        <button onClick={handleGenerate} disabled={generating} className="btn-secondary text-sm">
          <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} /> تحديث
        </button>
      </div>

      {/* Progress */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">التقدم الكلي</span>
          <span className="font-mono font-bold text-purple-400">{plan.progress?.adherenceRate || 0}%</span>
        </div>
        <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${plan.progress?.adherenceRate || 0}%` }} /></div>
        <div className="text-xs text-gray-500 mt-1">{plan.progress?.completedTasks || 0} من {plan.progress?.totalTasks || 0} مهمة</div>
      </div>

      {/* Week tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {plan.weeks?.map((_: any, i: number) => (
          <button key={i} onClick={() => setActiveWeek(i)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${activeWeek === i ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400"}`}>
            الأسبوع {i + 1}
          </button>
        ))}
      </div>

      {/* Days */}
      {plan.weeks?.[activeWeek]?.days?.map((day: any, di: number) => (
        <div key={di} className="card-premium p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold">اليوم {day.dayNumber || di + 1}</span>
            {day.isRestDay && <span className="badge badge-green text-xs">يوم راحة 🌴</span>}
          </div>
          {!day.isRestDay && day.tasks?.map((task: any, ti: number) => (
            <motion.div key={ti} whileHover={{ x: -4 }} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 cursor-pointer"
              onClick={() => !task.completed && handleComplete(activeWeek, di, ti)}>
              {task.completed ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-gray-600 shrink-0" />}
              <span className="text-lg">{taskIcons[task.type] || "📄"}</span>
              <div className="flex-1">
                <div className={`text-sm font-medium ${task.completed ? "line-through text-gray-500" : ""}`}>{task.title?.ar || task.title?.en || task.type}</div>
                <div className="text-xs text-gray-500">{task.section} • {task.category} • {task.estimatedMinutes} دقيقة</div>
              </div>
              <span className="badge badge-purple text-xs">+{task.xpReward || 10} XP</span>
            </motion.div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}
