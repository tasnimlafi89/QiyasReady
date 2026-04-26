"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Clock, TrendingUp, TrendingDown, Minus, Filter } from "lucide-react";

const TIER_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  'مبتدئ': { emoji: '🥉', label: 'Bronze', color: 'text-orange-400' },
  'متوسط': { emoji: '🥈', label: 'Silver', color: 'text-gray-300' },
  'متقدم': { emoji: '🥇', label: 'Gold', color: 'text-yellow-400' },
  'محترف': { emoji: '💎', label: 'Platinum', color: 'text-cyan-400' },
  'خبير': { emoji: '👑', label: 'Diamond', color: 'text-purple-400' },
};

function getTierFromLevel(level: number) {
  if (level <= 20) return 'مبتدئ';
  if (level <= 40) return 'متوسط';
  if (level <= 60) return 'متقدم';
  if (level <= 80) return 'محترف';
  return 'خبير';
}

type FilterTab = 'all' | 'correct' | 'wrong' | 'skipped';

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId || params.examId;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  useEffect(() => {
    api.get(`/qiyas-exam/results/${sessionId}`)
      .then(res => {
        setSession(res.data.session);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) return <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center text-xl">جاري تحميل النتائج...</div>;
  if (!session) return <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center text-xl">لم يتم العثور على النتيجة</div>;

  const impDir = session.improvementDirection;
  const impColor = impDir === 'improvement' ? 'text-emerald-500' : impDir === 'decrease' ? 'text-red-500' : 'text-gray-400';
  const ImpIcon = impDir === 'improvement' ? TrendingUp : impDir === 'decrease' ? TrendingDown : Minus;

  const tier = getTierFromLevel(session.levelAfter);
  const tierInfo = TIER_INFO[tier];

  const topics = [
    { name: 'التناظر اللفظي', key: 'التناظر اللفظي' },
    { name: 'إكمال الجمل', key: 'إكمال الجمل' },
    { name: 'الاستيعاب المقروء', key: 'الاستيعاب المقروء' },
    { name: 'الاستدلال الكمي', key: 'الاستدلال الكمي' },
    { name: 'الهندسة والجبر', key: 'الهندسة والجبر' }
  ];

  const weakTopics = topics.filter(t => (session.scorePerTopic[t.key] || 0) < 65);

  // Calculate per-topic stats from responses
  const topicStats: Record<string, { correct: number; wrong: number; skipped: number; totalTime: number; total: number }> = {};
  topics.forEach(t => { topicStats[t.key] = { correct: 0, wrong: 0, skipped: 0, totalTime: 0, total: 0 }; });
  
  session.responses.forEach((r: any) => {
    const topicKey = r.topic || 'Unknown';
    if (!topicStats[topicKey]) return;
    topicStats[topicKey].total += 1;
    topicStats[topicKey].totalTime += r.timeSpent || 0;
    if (r.isCorrect) {
      topicStats[topicKey].correct += 1;
    } else if (r.timeExpired || r.wasSkipped) {
      topicStats[topicKey].skipped += 1;
    } else {
      topicStats[topicKey].wrong += 1;
    }
  });

  // Filter responses for Section 6
  const filteredResponses = session.responses.filter((r: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'correct') return r.isCorrect;
    if (activeFilter === 'wrong') return !r.isCorrect && !r.timeExpired && !r.wasSkipped;
    if (activeFilter === 'skipped') return r.timeExpired || r.wasSkipped;
    return true;
  });

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'الكل', count: session.responses.length },
    { key: 'correct', label: 'صحيح', count: session.responses.filter((r: any) => r.isCorrect).length },
    { key: 'wrong', label: 'خاطئ', count: session.responses.filter((r: any) => !r.isCorrect && !r.timeExpired && !r.wasSkipped).length },
    { key: 'skipped', label: 'متخطي', count: session.responses.filter((r: any) => r.timeExpired || r.wasSkipped).length },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ═══ SECTION 1: MAIN SCORE CARD ═══ */}
        <div className="card-premium p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <h1 className="text-3xl font-bold mb-8">نتيجة اختبارك</h1>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-8">
            {/* Score */}
            <div>
              <div className="text-7xl font-black font-mono gradient-text">{session.totalScore}</div>
              <div className="text-gray-400 mt-2 text-lg">من 100</div>
            </div>
            
            <div className="h-24 w-px bg-white/10 hidden md:block" />
            
            {/* Level + Tier */}
            <div className="text-right space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">المستوى السابق:</span>
                <span className="font-bold">{session.levelBefore}</span>
                <span>&rarr;</span>
                <span className="text-purple-400 font-bold">{session.levelAfter}</span>
              </div>
              <div className={`flex items-center gap-2 font-bold ${impColor}`}>
                <ImpIcon className="w-5 h-5" />
                {impDir === 'improvement' ? 'تحسن' : impDir === 'decrease' ? 'تراجع' : 'استقرار'} بنسبة {session.improvementPercentage}%
              </div>
              <div className={`flex items-center gap-2 text-2xl font-bold ${tierInfo.color}`}>
                <span className="text-3xl">{tierInfo.emoji}</span>
                <span>{tier}</span>
                <span className="text-sm text-gray-500">({tierInfo.label})</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" /> أكملت في {Math.round(session.totalTimeUsed / 60)} دقيقة
              </div>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 5: WEAK TOPICS ALERT ═══ */}
        {weakTopics.length > 0 && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">🔴</span> نقاط تحتاج للتحسين:
            </h3>
            <ul className="space-y-2">
              {weakTopics.map(t => (
                <li key={t.key} className="flex justify-between items-center text-sm">
                  <span>{t.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-red-400">{session.scorePerTopic[t.key]}%</span>
                    <span className="text-gray-400">ننصحك بمراجعة هذا الموضوع</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ═══ SECTION 2: TOPIC BREAKDOWN BARS ═══ */}
        <div className="card-premium p-8">
          <h2 className="text-xl font-bold mb-6">تفاصيل الأقسام</h2>
          <div className="space-y-6">
            {topics.map(t => {
              const score = session.scorePerTopic[t.key] || 0;
              const stats = topicStats[t.key];
              return (
                <div key={t.key}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-medium">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{stats.correct}/{stats.total}</span>
                      <span className="font-mono font-bold text-purple-400">{score}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-orange-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ SECTION 3: PERFORMANCE STATS TABLE ═══ */}
        <div className="card-premium p-8">
          <h2 className="text-xl font-bold mb-6">إحصائيات الأداء</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-3 px-2 font-bold text-gray-400">الموضوع</th>
                  <th className="py-3 px-2 font-bold text-emerald-400">✅ صح</th>
                  <th className="py-3 px-2 font-bold text-red-400">❌ خطأ</th>
                  <th className="py-3 px-2 font-bold text-gray-400">⏭️ متخطي</th>
                  <th className="py-3 px-2 font-bold text-blue-400">⏱️ متوسط وقت</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(t => {
                  const s = topicStats[t.key];
                  const avgTime = s.total > 0 ? Math.round(s.totalTime / s.total) : 0;
                  return (
                    <tr key={t.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="text-right py-3 px-2 font-medium">{t.name}</td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-400">{s.correct}</td>
                      <td className="py-3 px-2 text-center font-mono text-red-400">{s.wrong}</td>
                      <td className="py-3 px-2 text-center font-mono text-gray-400">{s.skipped}</td>
                      <td className="py-3 px-2 text-center font-mono text-blue-400">{avgTime} ثا</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-white/10 font-bold">
                  <td className="text-right py-3 px-2">المجموع</td>
                  <td className="py-3 px-2 text-center font-mono text-emerald-400">{Object.values(topicStats).reduce((a: number, s: any) => a + s.correct, 0)}</td>
                  <td className="py-3 px-2 text-center font-mono text-red-400">{Object.values(topicStats).reduce((a: number, s: any) => a + s.wrong, 0)}</td>
                  <td className="py-3 px-2 text-center font-mono text-gray-400">{Object.values(topicStats).reduce((a: number, s: any) => a + s.skipped, 0)}</td>
                  <td className="py-3 px-2 text-center font-mono text-blue-400">
                    {session.responses.length > 0 ? Math.round(session.responses.reduce((a: number, r: any) => a + (r.timeSpent || 0), 0) / session.responses.length) : 0} ثا
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ═══ SECTION 6: QUESTION REVIEW WITH FILTER TABS ═══ */}
        <div className="card-premium p-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" /> مراجعة الأسئلة
            </h2>
            <div className="flex gap-2">
              {filterTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeFilter === tab.key
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredResponses.length === 0 && (
              <div className="text-center text-gray-500 py-8">لا توجد أسئلة في هذا التصنيف</div>
            )}
            {filteredResponses.map((r: any, idx: number) => {
              const globalIdx = session.responses.indexOf(r);
              return (
                <details key={idx} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <summary className="p-4 cursor-pointer flex items-center gap-4 select-none hover:bg-white/5 transition-colors">
                    <span className="text-sm text-gray-500 font-mono w-8 shrink-0">#{globalIdx + 1}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${r.isCorrect ? 'bg-emerald-500/20 text-emerald-500' : r.timeExpired || r.wasSkipped ? 'bg-gray-500/20 text-gray-500' : 'bg-red-500/20 text-red-500'}`}>
                      {r.isCorrect ? '✓' : r.timeExpired || r.wasSkipped ? '⏭️' : '✕'}
                    </div>
                    <div className="flex-1 truncate text-right">{r.questionText}</div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">{r.timeSpent} ثا</div>
                  </summary>
                  <div className="p-4 border-t border-white/10 bg-black/20 text-right space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const isCorrectAnswer = opt === r.correctAnswer;
                        const isSelected = opt === r.selectedAnswer;
                        return (
                          <div key={opt} className={`p-3 rounded-lg border flex gap-3 ${isCorrectAnswer ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : isSelected && !r.isCorrect ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/5 text-gray-400'}`}>
                            <span className="font-bold">{opt}.</span>
                            <span>{r.options?.[opt]}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <h4 className="font-bold text-purple-400 mb-2">الشرح:</h4>
                      <p className="text-gray-300 leading-relaxed">{r.explanation}</p>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/exam/new" className="btn-secondary px-8 py-3 inline-block">اختبار جديد</Link>
          <Link href="/dashboard" className="btn-primary px-8 py-3 inline-block">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
