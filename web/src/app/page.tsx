"use client";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { 
  Brain, Target, Trophy, BarChart3, Zap, Shield, 
  Sparkles, BookOpen, Clock, Users, Star, ArrowLeft,
  ChevronDown, Check, GraduationCap, Rocket
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[hsl(240,10%,4%)] overflow-hidden">
      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">QiyasReady</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">المميزات</a>
            <a href="#ai" className="hover:text-white transition">الذكاء الاصطناعي</a>
            <a href="#pricing" className="hover:text-white transition">الأسعار</a>
          </div>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-primary text-sm">
                لوحة التحكم <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="btn-secondary text-sm">دخول</Link>
                <Link href="/sign-up" className="btn-primary text-sm">
                  ابدأ مجاناً <Sparkles className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-radial" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        
        {/* Floating orbs */}
        <div className="absolute top-40 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-500/8 rounded-full blur-[150px] animate-float" style={{ animationDelay: '3s' }} />
        
        <motion.div 
          className="relative max-w-5xl mx-auto text-center"
          initial="hidden" animate="visible" variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="badge badge-purple text-sm">
              <Sparkles className="w-3.5 h-3.5" /> منصة مدعومة بالذكاء الاصطناعي
            </span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="block">استعد لاختبار</span>
            <span className="gradient-text">قياس</span>
            <span className="block text-3xl md:text-5xl mt-2 font-bold text-gray-300">بذكاء وثقة</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            منصة متقدمة تستخدم الذكاء الاصطناعي لتقديم تجربة تعلم تكيفية مخصصة لكل طالب. 
            اختبارات محاكاة، مدرس ذكي، وتحليلات متقدمة لضمان أفضل نتيجة.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up" className="btn-primary text-lg px-8 py-4 animate-pulse-glow">
              ابدأ رحلتك مجاناً <Rocket className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-secondary text-lg px-8 py-4">
              اكتشف المميزات <ChevronDown className="w-5 h-5" />
            </a>
          </motion.div>
          
          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> +10,000 طالب</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> تقييم 4.9/5</div>
            <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-500" /> نسبة نجاح 94%</div>
          </motion.div>
        </motion.div>

        {/* ── Dashboard Preview ──────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative max-w-5xl mx-auto mt-16"
        >
          <div className="card-premium p-1 rounded-2xl glow-purple">
            <div className="rounded-xl bg-gradient-to-br from-[#0f0f1a] to-[#12121f] p-6 md:p-8">
              {/* Mock Dashboard */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-500 mr-4">QiyasReady Dashboard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'النتيجة المتوقعة', value: '87', icon: '🎯', color: 'text-purple-400' },
                  { label: 'سلسلة الأيام', value: '12', icon: '🔥', color: 'text-orange-400' },
                  { label: 'المستوى', value: '8', icon: '⭐', color: 'text-yellow-400' },
                  { label: 'الدقة', value: '78%', icon: '📊', color: 'text-emerald-400' },
                ].map((stat, i) => (
                  <div key={i} className="stat-card text-center">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="stat-card">
                  <div className="text-sm text-gray-400 mb-3">تقدم الأداء</div>
                  <div className="flex items-end gap-1 h-20">
                    {[40,55,45,65,70,60,75,80,72,85,82,87].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(to top, #8b4dff, #10b981)`, opacity: 0.3 + (i * 0.05) }} />
                    ))}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-sm text-gray-400 mb-3">نقاط الضعف</div>
                  {['التناظر اللفظي', 'الهندسة', 'استيعاب المقروء'].map((area, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{area}</span>
                        <span className="text-gray-500">{[45, 52, 60][i]}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${[45, 52, 60][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              كل ما تحتاجه <span className="gradient-text">للنجاح</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-xl mx-auto">
              أدوات متقدمة مصممة خصيصاً لمساعدتك في تحقيق أعلى درجة في اختبار قياس
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: 'مدرس ذكاء اصطناعي', desc: 'مدرس شخصي يعمل بالذكاء الاصطناعي متاح 24/7 للإجابة على أسئلتك', color: 'from-purple-500 to-violet-600' },
              { icon: Target, title: 'تعلم تكيفي', desc: 'الأسئلة تتكيف مع مستواك تلقائياً باستخدام نظرية الاستجابة للسؤال IRT', color: 'from-emerald-500 to-teal-600' },
              { icon: BarChart3, title: 'تحليلات متقدمة', desc: 'تتبع تقدمك بالتفصيل واكتشف نقاط ضعفك وقوتك', color: 'from-blue-500 to-cyan-600' },
              { icon: Clock, title: 'اختبارات محاكاة', desc: 'اختبارات تحاكي الاختبار الحقيقي بنفس التوقيت والصيغة', color: 'from-orange-500 to-amber-600' },
              { icon: Trophy, title: 'نظام التحفيز', desc: 'نقاط خبرة، مستويات، شارات، ولوحة متصدرين لتبقيك متحمساً', color: 'from-yellow-500 to-orange-600' },
              { icon: Shield, title: 'نظام مكافحة الغش', desc: 'مراقبة ذكية أثناء الاختبارات لضمان نتائج حقيقية', color: 'from-red-500 to-pink-600' },
              { icon: BookOpen, title: 'خطة دراسية مخصصة', desc: 'خطة يومية مولدة بالذكاء الاصطناعي مبنية على أدائك', color: 'from-indigo-500 to-purple-600' },
              { icon: Zap, title: 'توقع النتيجة', desc: 'الذكاء الاصطناعي يتوقع نتيجتك المحتملة بناءً على أدائك', color: 'from-pink-500 to-rose-600' },
              { icon: GraduationCap, title: 'محتوى شامل', desc: 'أسئلة تغطي جميع أقسام اختبار قياس: لفظي وكمي', color: 'from-teal-500 to-green-600' },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="card-premium p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI Section ───────────────────────────────── */}
      <section id="ai" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-radial opacity-50" />
        <div className="max-w-6xl mx-auto relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="badge badge-green text-sm mb-4">
              <Brain className="w-3.5 h-3.5" /> تقنية متقدمة
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              مدعوم بـ <span className="gradient-text">ذكاء اصطناعي متقدم</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeUp} className="card-premium p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">المدرس الذكي</span>
              </div>
              <div className="space-y-4">
                <div className="glass rounded-xl p-4 max-w-[80%]">
                  <p className="text-sm text-gray-300">لم أفهم كيف أحل سؤال التناظر اللفظي؟ 🤔</p>
                </div>
                <div className="glass rounded-xl p-4 max-w-[85%] mr-auto border-purple-500/20">
                  <p className="text-sm text-gray-300">
                    <span className="text-purple-400 font-medium">🤖 QiyasReady AI:</span><br />
                    التناظر اللفظي يعتمد على إيجاد العلاقة بين زوج من الكلمات. مثلاً: كتاب:مكتبة كالعلاقة بين لوحة:متحف. 
                    العلاقة هنا هي &quot;الشيء ومكان حفظه&quot;. دعني أعطيك مثالاً آخر للتدريب... ✨
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeUp} className="space-y-4">
              {[
                { title: 'تحليل الأداء الذكي', desc: 'تحليل فوري لنقاط ضعفك بعد كل اختبار مع توصيات مخصصة', icon: '📊' },
                { title: 'خطة دراسية تكيفية', desc: 'خطة يومية تتكيف مع تقدمك وتركز على المجالات الأضعف', icon: '📋' },
                { title: 'توقع النتيجة', desc: 'تقدير ذكي لنتيجتك في الاختبار الحقيقي بناءً على بياناتك', icon: '🎯' },
                { title: 'تحفيز مخصص', desc: 'رسائل تحفيزية مخصصة بناءً على تقدمك ونشاطك', icon: '💪' },
              ].map((item, i) => (
                <div key={i} className="card-premium p-5 flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Section ──────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">
              خطط <span className="gradient-text">بسيطة وشفافة</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'مجاني', price: '0', features: ['اختبار تشخيصي واحد', '20 سؤال يومياً', 'تحليلات أساسية', 'لوحة متصدرين'] },
              { name: 'احترافي', price: '49', popular: true, features: ['تدريب غير محدود', 'مدرس ذكاء اصطناعي', 'تحليلات متقدمة', 'خطة دراسية مخصصة', 'جميع الاختبارات'] },
              { name: 'مميز', price: '99', features: ['كل مميزات الاحترافي', 'اختبارات محاكاة كاملة', 'نظام مكافحة الغش', 'تقارير PDF', 'توقع النتيجة', 'أولوية الدعم'] },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} className={`card-premium p-8 relative ${plan.popular ? 'border-purple-500/50 glow-purple' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-purple">
                    <Star className="w-3 h-3" /> الأكثر شعبية
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black font-mono gradient-text">{plan.price}</span>
                  <span className="text-gray-500 text-sm">ريال/شهر</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up" className={plan.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
                  ابدأ الآن
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-6">
              جاهز لتحقيق <span className="gradient-text">أعلى درجة</span>؟
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-400 text-lg mb-10">
              انضم لآلاف الطلاب الذين حسّنوا نتائجهم مع QiyasReady
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/sign-up" className="btn-primary text-lg px-10 py-4 animate-pulse-glow">
                ابدأ مجاناً الآن <Rocket className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">QiyasReady</span>
          </div>
          <p className="text-sm text-gray-500">© 2026 QiyasReady. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
