"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, Flame, Star } from "lucide-react";
import { getLeaderboard, setAuthToken } from "@/lib/api";

export default function LeaderboardPage() {
  const { getToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
        const res = await getLeaderboard(50);
        setLeaderboard(res.data.leaderboard || []);
        setUserRank(res.data.userRank);
      } catch (e) { console.error(e); }
    };
    load();
  }, [getToken]);

  const rankIcons = ["👑", "🥈", "🥉"];
  const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-right">
      <div><h1 className="text-2xl font-bold">لوحة المتصدرين</h1><p className="text-gray-400 text-sm">تنافس مع الطلاب الآخرين</p></div>

      {userRank && (
        <div className="card-premium p-4 border-purple-500/20 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-purple-400" />
          <span className="font-bold">ترتيبك الحالي: <span className="gradient-text font-mono text-xl">#{userRank}</span></span>
        </div>
      )}

      {/* Top 3 */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-6">
          {[1, 0, 2].map((idx) => {
            const p = leaderboard[idx];
            if (!p) return null;
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                className={`card-premium p-5 text-center ${idx === 0 ? "md:-mt-4 glow-purple" : ""}`}>
                <div className="text-3xl mb-2">{rankIcons[idx]}</div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 mx-auto mb-3 flex items-center justify-center text-xl font-bold">
                  {p.name?.charAt(0) || "?"}
                </div>
                <div className="font-bold text-sm truncate">{p.name}</div>
                <div className={`text-xl font-black font-mono mt-1 ${rankColors[idx]}`}>{p.xp.toLocaleString()}</div>
                <div className="text-xs text-gray-500">XP</div>
                <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
                  <Star className="w-3 h-3" /> Lvl {p.level}
                  <Flame className="w-3 h-3 text-orange-400" /> {p.streak}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="card-premium divide-y divide-white/5">
        {leaderboard.slice(3).map((p: any, i: number) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 hover:bg-white/3 transition">
            <span className="w-8 text-center font-mono text-sm text-gray-500">{p.rank}</span>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm">{p.name?.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-xs text-gray-500">المستوى {p.level} • {p.playerRank}</div>
            </div>
            <div className="text-right">
              <div className="font-bold font-mono text-sm text-purple-400">{p.xp.toLocaleString()} XP</div>
              {p.streak > 0 && <div className="text-xs text-orange-400 flex items-center gap-1"><Flame className="w-3 h-3" />{p.streak}</div>}
            </div>
          </motion.div>
        ))}
        {leaderboard.length === 0 && <div className="p-8 text-center text-gray-500">لا توجد بيانات بعد. كن أول المتصدرين!</div>}
      </div>
    </motion.div>
  );
}
