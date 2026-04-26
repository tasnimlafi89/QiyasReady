"use client";
import { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, GraduationCap, Clock, Calendar, ArrowLeft, Rocket } from "lucide-react";
import { completeOnboarding, syncUser, setAuthToken } from "@/lib/api";

const GRADE_OPTIONS = [
  { value: "7",  label: "الصف الأول متوسط",  sublabel: "Grade 7" },
  { value: "8",  label: "الصف الثاني متوسط", sublabel: "Grade 8" },
  { value: "9",  label: "الصف الثالث متوسط", sublabel: "Grade 9" },
  { value: "10", label: "الصف الأول ثانوي",  sublabel: "Grade 10" },
  { value: "11", label: "الصف الثاني ثانوي", sublabel: "Grade 11" },
  { value: "12", label: "الصف الثالث ثانوي", sublabel: "Grade 12", popular: true },
  { value: "13", label: "خريج",              sublabel: "Graduate" },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ fullNameAr: "", grade: "12", targetScore: 80, examDate: "", studyHoursPerDay: 2, language: "ar" });

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      await syncUser({ email: user?.primaryEmailAddress?.emailAddress, fullName: user?.fullName, avatar: user?.imageUrl });
      await completeOnboarding(data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
        <Target className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-3xl font-bold mb-3">مرحباً بك في <span className="gradient-text">QiyasReady</span></h1>
      <p className="text-gray-400 mb-8">دعنا نتعرف عليك لنقدم لك أفضل تجربة تعلم مخصصة</p>
      <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-3">هيا نبدأ <ArrowLeft className="w-5 h-5" /></button>
    </motion.div>,

    // Step 1: Name & Grade (Radio Buttons)
    <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg mx-auto">
      <div className="flex justify-center mb-4"><GraduationCap className="w-12 h-12 text-purple-400" /></div>
      <h2 className="text-2xl font-bold mb-6">معلوماتك الأساسية</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">الاسم بالعربية</label>
          <input type="text" value={data.fullNameAr} onChange={e => setData({ ...data, fullNameAr: e.target.value })} placeholder="أدخل اسمك" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-3 block">المرحلة الدراسية</label>
          <div className="space-y-2">
            {GRADE_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.grade === opt.value
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-purple-500/40 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.grade === opt.value ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
                }`}>
                  {data.grade === opt.value && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  name="grade"
                  value={opt.value}
                  checked={data.grade === opt.value}
                  onChange={() => setData({ ...data, grade: opt.value })}
                  className="sr-only"
                />
                <div className="flex-1 text-right">
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-gray-500 text-sm mr-2">({opt.sublabel})</span>
                </div>
                {opt.popular && (
                  <span className="badge badge-purple text-xs px-2 py-0.5">الأكثر شيوعاً</span>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-8 justify-center">
        <button onClick={() => setStep(0)} className="btn-secondary flex-1">رجوع</button>
        <button onClick={() => setStep(2)} className="btn-primary flex-1">التالي</button>
      </div>
    </motion.div>,

    // Step 2: Goals
    <motion.div key="goals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto">
      <div className="flex justify-center mb-4"><Target className="w-12 h-12 text-emerald-400" /></div>
      <h2 className="text-2xl font-bold mb-6">أهدافك</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">الدرجة المستهدفة (من 100)</label>
          <input type="range" min={50} max={100} value={data.targetScore} onChange={e => setData({ ...data, targetScore: Number(e.target.value) })} className="w-full accent-purple-500" />
          <div className="text-center text-3xl font-bold font-mono gradient-text mt-2">{data.targetScore}</div>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block"><Calendar className="w-4 h-4 inline ml-1" /> تاريخ الاختبار المتوقع</label>
          <input type="date" value={data.examDate} onChange={e => setData({ ...data, examDate: e.target.value })} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 outline-none" />
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1 block"><Clock className="w-4 h-4 inline ml-1" /> ساعات الدراسة يومياً</label>
          <select value={data.studyHoursPerDay} onChange={e => setData({ ...data, studyHoursPerDay: Number(e.target.value) })} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 outline-none">
            <option value={1}>ساعة واحدة</option>
            <option value={2}>ساعتان</option>
            <option value={3}>3 ساعات</option>
            <option value={4}>4 ساعات</option>
            <option value={5}>5+ ساعات</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 mt-8 justify-center">
        <button onClick={() => setStep(1)} className="btn-secondary flex-1">رجوع</button>
        <button onClick={handleComplete} disabled={loading} className="btn-primary flex-1">
          {loading ? "جاري الحفظ..." : <>ابدأ التعلم <Rocket className="w-4 h-4" /></>}
        </button>
      </div>
    </motion.div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,10%,4%)] bg-grid relative px-6 text-center">
      <div className="absolute inset-0 bg-radial" />
      <div className="relative z-10 w-full">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-12">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all ${step >= i ? 'bg-purple-500 w-8' : 'bg-white/10'}`} />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}
