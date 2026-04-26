"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Target, Brain, BarChart3,
  Trophy, Calendar, Settings, Menu, X, Sparkles,
  GraduationCap, Zap, Crown
} from "lucide-react";
import { syncUser, setAuthToken } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", labelEn: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/exams", label: "الاختبارات", labelEn: "Exams", icon: Target },
  { href: "/dashboard/practice", label: "التدريب", labelEn: "Practice", icon: BookOpen },
  { href: "/dashboard/ai-tutor", label: "المدرس الذكي", labelEn: "AI Tutor", icon: Brain },
  { href: "/dashboard/study-plan", label: "خطة الدراسة", labelEn: "Study Plan", icon: Calendar },
  { href: "/dashboard/analytics", label: "التحليلات", labelEn: "Analytics", icon: BarChart3 },
  { href: "/dashboard/leaderboard", label: "المتصدرين", labelEn: "Leaderboard", icon: Trophy },
  { href: "/dashboard/settings", label: "الإعدادات", labelEn: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const sync = async () => {
      if (synced || !user) return;
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
          await syncUser({
            email: user.primaryEmailAddress?.emailAddress,
            fullName: user.fullName,
            avatar: user.imageUrl,
          });
          setSynced(true);
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    };
    sync();
  }, [user, getToken, synced]);

  return (
    <div className="min-h-screen flex bg-[hsl(240,10%,4%)]">
      {/* ── Sidebar (Desktop) ────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 border-l border-white/5 bg-[#0a0a12] p-4 sticky top-0 h-screen">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-4 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">QiyasReady</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Pro Badge */}
        <div className="card-premium p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-bold">ترقية للاحترافي</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">احصل على مميزات الذكاء الاصطناعي الكاملة</p>
          <Link href="/dashboard/settings" className="btn-primary text-xs w-full justify-center py-2">
            <Sparkles className="w-3.5 h-3.5" /> ترقية الآن
          </Link>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-white/3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.fullName || "طالب"}</div>
            <div className="text-xs text-gray-500 truncate text-right" dir="ltr">{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass h-14 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">QiyasReady</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Sidebar ───────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: 100 }} animate={{ x: 0 }} exit={{ x: 100 }} className="fixed right-0 top-0 bottom-0 w-72 bg-[#0a0a12] z-50 p-4 pt-16 lg:hidden border-l border-white/5">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-purple-500/10 text-purple-400" : "text-gray-400 hover:text-white"}`}>
                      <item.icon className="w-5 h-5" /><span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 lg:pr-0 pt-14 lg:pt-0">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
