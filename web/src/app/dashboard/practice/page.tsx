"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, ArrowLeft, Zap } from "lucide-react";
import { getCategories, getPracticeQuestions, submitAnswer, setAuthToken } from "@/lib/api";

export default function PracticePage() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<"select" | "practice">("select");
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState({ correct: 0, total: 0, xp: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const res = await getCategories();
        setCategories(res.data.sections || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [getToken]);

  const startPractice = async (section?: string, category?: string) => {
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await getPracticeQuestions({ section, category, count: 10 });
      setQuestions(res.data.questions || []);
      setCurrentQ(0);
      setSelected(null);
      setResult(null);
      setScore({ correct: 0, total: 0, xp: 0 });
      setMode("practice");
    } catch (e) { console.error(e); }
  };

  const handleAnswer = async (optionId: string) => {
    if (result) return;
    setSelected(optionId);
    try {
      const res = await submitAnswer({ questionId: questions[currentQ]._id, selectedOption: optionId, timeSpent: 30 });
      setResult(res.data);
      setScore(prev => ({
        correct: prev.correct + (res.data.isCorrect ? 1 : 0),
        total: prev.total + 1,
        xp: prev.xp + (res.data.xpAwarded || 0),
      }));
    } catch (e) { console.error(e); }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setResult(null);
    } else {
      setMode("select");
    }
  };

  const sectionNames: any = { verbal: "لفظي", quantitative: "كمي" };

  if (mode === "select") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div><h1 className="text-2xl font-bold mb-1">التدريب</h1><p className="text-gray-400 text-sm">اختر القسم والموضوع للتدريب</p></div>
        {score.total > 0 && (
          <div className="card-premium p-4 flex items-center gap-4">
            <span className="text-2xl">🎯</span>
            <div>
              <div className="font-bold">{score.correct}/{score.total} صحيح • +{score.xp} XP</div>
              <div className="text-xs text-gray-400">أحسنت! استمر في التدريب</div>
            </div>
          </div>
        )}
        <button onClick={() => startPractice()} className="btn-primary w-full md:w-auto justify-center text-lg py-3 px-8">
          <Zap className="w-5 h-5" /> تدريب سريع عشوائي
        </button>
        {categories.map((section: any, si: number) => (
          <div key={si}>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" /> القسم {sectionNames[section._id] || section._id}
              <span className="text-xs text-gray-500 font-normal">({section.totalQuestions} سؤال)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {section.categories?.map((cat: any, ci: number) => (
                <motion.button key={ci} whileHover={{ y: -2 }} onClick={() => startPractice(section._id, cat.name)}
                  className="card-premium p-4 text-right group cursor-pointer">
                  <div className="font-semibold text-sm mb-1">{cat.name}</div>
                  <div className="text-xs text-gray-500">{cat.count} سؤال</div>
                  <div className="progress-bar mt-2"><div className="progress-bar-fill" style={{ width: "0%" }} /></div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  // Practice mode
  const question = questions[currentQ];
  if (!question) return <div className="text-center py-20 text-gray-400">لا توجد أسئلة متاحة</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode("select")} className="btn-secondary text-sm">← رجوع</button>
        <div className="flex items-center gap-3">
          <span className="badge badge-purple font-mono">{currentQ + 1}/{questions.length}</span>
          <span className="badge badge-green">+{score.xp} XP</span>
        </div>
      </div>
      <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
        <span className="badge badge-purple text-xs mb-3">{question.section === "verbal" ? "لفظي" : "كمي"} • {question.category}</span>
        <h2 className="text-lg font-bold mb-6 leading-relaxed">{question.content.textAr}</h2>
        <div className="space-y-3">
          {question.content.options.map((opt: any) => {
            let cls = "border-white/5 bg-white/3 text-gray-300 hover:border-white/20";
            if (result) {
              if (opt.id === result.correctAnswer) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
              else if (opt.id === selected && !result.isCorrect) cls = "border-red-500 bg-red-500/10 text-red-400";
            } else if (opt.id === selected) {
              cls = "border-purple-500 bg-purple-500/10 text-white";
            }
            return (
              <button key={opt.id} onClick={() => handleAnswer(opt.id)} disabled={!!result}
                className={`w-full text-right p-4 rounded-xl border transition-all flex items-center gap-3 ${cls}`}>
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold shrink-0">{opt.id}</span>
                <span className="flex-1">{opt.textAr}</span>
                {result && opt.id === result.correctAnswer && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {result && opt.id === selected && !result.isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
              </button>
            );
          })}
        </div>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <div className={`p-4 rounded-xl ${result.isCorrect ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="font-bold text-sm mb-1">{result.isCorrect ? "✅ إجابة صحيحة!" : "❌ إجابة خاطئة"}</div>
              {result.explanation?.textAr && <p className="text-sm text-gray-300">{result.explanation.textAr}</p>}
            </div>
            <button onClick={nextQuestion} className="btn-primary w-full mt-3 justify-center">
              {currentQ < questions.length - 1 ? <>السؤال التالي <ArrowLeft className="w-4 h-4" /></> : "إنهاء التدريب"}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
