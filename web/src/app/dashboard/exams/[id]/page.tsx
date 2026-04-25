"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, Flag, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Eye } from "lucide-react";
import { startExam, submitExam, setAuthToken } from "@/lib/api";

export default function ExamSessionPage() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const router = useRouter();
  const [exam, setExam] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load exam
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const res = await startExam(id as string);
        setExam(res.data.exam);
        setAttempt(res.data.attempt);
        setTimeLeft((res.data.exam.config?.duration || 60) * 60);
        setAnswers(res.data.exam.questions.map((q: any) => ({ questionId: q._id, selectedOption: null, timeSpent: 0, flagged: false })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id, getToken]);

  // Timer
  useEffect(() => {
    if (submitted || !exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, exam]);

  // Anti-cheat: tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submitted) {
        setTabSwitches(p => p + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [submitted]);

  const selectAnswer = (optionId: string) => {
    const updated = [...answers];
    updated[currentQ] = { ...updated[currentQ], selectedOption: optionId };
    setAnswers(updated);
  };

  const toggleFlag = () => {
    const updated = [...answers];
    updated[currentQ] = { ...updated[currentQ], flagged: !updated[currentQ].flagged };
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await submitExam(id as string, { attemptId: attempt._id, answers, antiCheatData: { tabSwitches, suspiciousActivity: [] } });
      setResults(res.data.results);
      setSubmitted(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400">جاري تحميل الاختبار...</div></div>;
  if (!exam) return <div className="text-center py-20 text-gray-400">لم يتم العثور على الاختبار</div>;

  // ── Results View ──────────────────────────────
  if (submitted && results) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 text-right">
        <div className="text-center">
          <div className="text-6xl mb-4">{results.score.percentage >= 80 ? "🎉" : results.score.percentage >= 60 ? "👍" : "💪"}</div>
          <h1 className="text-3xl font-bold mb-2">نتيجة الاختبار</h1>
        </div>
        <div className="card-premium p-8 text-center">
          <div className="text-6xl font-black font-mono gradient-text mb-2">{results.score.percentage}%</div>
          <p className="text-gray-400">
            {results.score.correct} صحيح من {results.score.total} سؤال
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="stat-card text-center"><div className="text-sm text-gray-400">لفظي</div><div className="text-2xl font-bold font-mono text-purple-400">{results.score.verbal}%</div></div>
          <div className="stat-card text-center"><div className="text-sm text-gray-400">كمي</div><div className="text-2xl font-bold font-mono text-emerald-400">{results.score.quantitative}%</div></div>
        </div>
        {results.gamification && (
          <div className="card-premium p-4 flex items-center gap-4">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-bold">+{results.gamification.xpAwarded} XP</div>
              <div className="text-xs text-gray-400">المستوى {results.gamification.level} • {results.gamification.rank}</div>
            </div>
          </div>
        )}
        {results.aiAnalysis?.overallFeedback && (
          <div className="card-premium p-5 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2"><span>🤖</span><span className="font-bold text-sm">تحليل الذكاء الاصطناعي</span></div>
            <p className="text-sm text-gray-300">{results.aiAnalysis.overallFeedback}</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={() => router.push("/dashboard/exams")} className="btn-secondary flex-1 justify-center">العودة للاختبارات</button>
          <button onClick={() => router.push("/dashboard/analytics")} className="btn-primary flex-1 justify-center">عرض التحليلات</button>
        </div>
      </motion.div>
    );
  }

  // ── Exam View ─────────────────────────────────
  const question = exam.questions[currentQ];
  const answered = answers.filter((a: any) => a.selectedOption).length;

  return (
    <div className="max-w-3xl mx-auto text-right">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 glass rounded-xl p-3">
        <div className="flex items-center gap-3">
          <span className="badge badge-purple font-mono">{currentQ + 1}/{exam.questions.length}</span>
          <span className="text-xs text-gray-500">{answered} تمت الإجابة</span>
        </div>
        <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft < 300 ? "text-red-400 animate-pulse" : "text-gray-300"}`}>
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
        {tabSwitches > 0 && <span className="badge badge-red text-xs"><AlertTriangle className="w-3 h-3" /> {tabSwitches} تحذير</span>}
      </div>

      {/* Question */}
      <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card-premium p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <span className="badge badge-purple text-xs">{question.section === "verbal" ? "لفظي" : "كمي"} • {question.category}</span>
          <button onClick={toggleFlag} className={`p-1.5 rounded-lg transition ${answers[currentQ]?.flagged ? "bg-yellow-500/20 text-yellow-400" : "text-gray-500 hover:text-gray-300"}`}>
            <Flag className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-lg font-bold mb-6 leading-relaxed">{question.content.textAr}</h2>
        {question.content.textEn && <p className="text-sm text-gray-500 mb-4">{question.content.textEn}</p>}
        <div className="space-y-3">
          {question.content.options.map((opt: any) => (
            <button key={opt.id} onClick={() => selectAnswer(opt.id)}
              className={`w-full text-right p-4 rounded-xl border transition-all flex items-center gap-3 ${
                answers[currentQ]?.selectedOption === opt.id
                  ? "border-purple-500 bg-purple-500/10 text-white"
                  : "border-white/5 bg-white/3 text-gray-300 hover:border-white/20 hover:bg-white/5"
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                answers[currentQ]?.selectedOption === opt.id ? "bg-purple-500 text-white" : "bg-white/5 text-gray-400"
              }`}>{opt.id}</span>
              <span>{opt.textAr}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-secondary text-sm disabled:opacity-30">
          <ArrowRight className="w-4 h-4" /> السابق
        </button>
        {/* Question dots */}
        <div className="hidden md:flex gap-1 flex-wrap max-w-md justify-center">
          {answers.map((a: any, i: number) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-lg text-xs font-mono transition ${
                i === currentQ ? "bg-purple-500 text-white" :
                a.flagged ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                a.selectedOption ? "bg-emerald-500/20 text-emerald-400" :
                "bg-white/5 text-gray-500"
              }`}
            >{i + 1}</button>
          ))}
        </div>
        {currentQ < exam.questions.length - 1 ? (
          <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary text-sm">
            التالي <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary text-sm bg-gradient-to-r from-emerald-500 to-teal-600">
            {submitting ? "جاري التسليم..." : <>تسليم <CheckCircle className="w-4 h-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
}
