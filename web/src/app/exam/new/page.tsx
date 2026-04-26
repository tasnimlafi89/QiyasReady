"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import QuestionCard from "@/components/exam/QuestionCard";
import QuestionTimer from "@/components/exam/QuestionTimer";
import ExamProgress from "@/components/exam/ExamProgress";

export default function ExamScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timers
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [globalTimeRemaining, setGlobalTimeRemaining] = useState(100 * 60);
  
  // Interaction
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  // Anti-cheat
  const [blurWarning, setBlurWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  
  // Auto-save tracking
  const lastSaveIndexRef = useRef(0);

  useEffect(() => {
    // Fetch 100 questions
    api.get("/qiyas-exam/generate").then(res => {
      setQuestions(res.data.questions);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      alert("فشل في تحميل الاختبار");
    });
  }, []);

  const submitExam = useCallback(async (finalResponses: any) => {
    setLoading(true);
    try {
      const totalTimeUsed = 6000 - globalTimeRemaining; // 100 mins in seconds
      const res = await api.post("/qiyas-exam/submit", {
        responses: finalResponses,
        totalTimeUsed
      });
      router.push(`/exam/${res.data.sessionId}/results`);
    } catch (e) {
      console.error("Submit error", e);
      alert("حدث خطأ أثناء حفظ النتيجة");
    }
  }, [globalTimeRemaining, router]);

  // Auto-save every 10 questions
  const autoSave = useCallback(async (allResponses: any[]) => {
    const answeredCount = allResponses.length;
    // Save at 10, 20, 30, etc.
    if (answeredCount > 0 && answeredCount % 10 === 0 && answeredCount !== lastSaveIndexRef.current) {
      lastSaveIndexRef.current = answeredCount;
      try {
        await api.post("/qiyas-exam/autosave", {
          responses: allResponses,
          currentIndex: answeredCount,
          globalTimeRemaining
        });
        console.log(`Auto-saved at question ${answeredCount}`);
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }
  }, [globalTimeRemaining]);

  const handleNext = useCallback((isExpired = false, isSkipped = false) => {
    const q: any = questions[currentIndex];
    const timeSpent = 60 - timeRemaining;
    
    const newResponse = {
      questionId: q._id,
      selectedAnswer: selectedOption,
      timeSpent: isExpired ? 60 : timeSpent,
      timeExpired: isExpired,
      wasSkipped: isSkipped && !selectedOption
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    
    // Auto-save check
    autoSave(updatedResponses);
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimeRemaining(60);
    } else {
      submitExam(updatedResponses);
    }
  }, [currentIndex, questions, selectedOption, timeRemaining, responses, submitExam, autoSave]);

  // Timers Effect
  useEffect(() => {
    if (loading || questions.length === 0) return;

    const timerId = setInterval(() => {
      setGlobalTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          submitExam(responses);
          return 0;
        }
        return prev - 1;
      });

      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleNext(true, false); // Expired
          return 60; // reset visually
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading, currentIndex, questions.length, handleNext, responses, submitExam]);

  // Anti-cheat: Focus Detection + Right-click + Copy
  useEffect(() => {
    const handleBlur = () => {
      setBlurWarning(true);
      setTabSwitchCount(prev => prev + 1);
    };
    const handleFocus = () => setBlurWarning(false);
    const handleCopy = (e: Event) => e.preventDefault();
    const handleContextMenu = (e: Event) => e.preventDefault();
    
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a12] text-white gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-lg">جاري تحضير الاختبار...</span>
        <span className="text-sm text-gray-500">يتم اختيار 100 سؤال بناءً على مستواك</span>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col items-center select-none" onContextMenu={e => e.preventDefault()}>
      {/* Anti-cheat blur overlay */}
      <AnimatePresence>
        {blurWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="card-premium p-8 max-w-md text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">تحذير النظام</h2>
              <p className="text-gray-400 mb-2">لقد خرجت من شاشة الاختبار. الرجاء البقاء في هذه الشاشة لضمان دقة نتيجتك.</p>
              <p className="text-sm text-red-400 mb-4">عدد مرات الخروج: {tabSwitchCount}</p>
              <button onClick={() => setBlurWarning(false)} className="btn-primary mt-2 w-full">العودة للاختبار</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 flex-1 flex flex-col relative">
        <ExamProgress currentQuestion={currentIndex + 1} totalQuestions={questions.length} globalTimeRemaining={globalTimeRemaining} />

        <div className="flex-1 flex flex-col items-center justify-center w-full py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full relative"
            >
              <QuestionCard
                question={currentQ}
                currentSelected={selectedOption}
                onSelectOption={setSelectedOption}
              />
              
              <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto mt-8 gap-6">
                <div className="flex gap-4">
                  <button onClick={() => handleNext(false, true)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-gray-400">
                    تخطي السؤال
                  </button>
                  <button onClick={() => handleNext(false, false)} disabled={!selectedOption} className="btn-primary px-10 disabled:opacity-50 disabled:cursor-not-allowed">
                    التالي &larr;
                  </button>
                </div>

                <QuestionTimer timeRemaining={timeRemaining} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
