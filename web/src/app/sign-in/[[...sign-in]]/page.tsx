import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Target } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[hsl(240,10%,4%)] bg-grid relative flex flex-col">
      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">QiyasReady</span>
          </Link>
          <Link href="/" className="btn-secondary text-sm">العودة للرئيسية</Link>
        </div>
      </nav>

      <div className="absolute inset-0 bg-radial" />
      
      {/* Content Area - Centered but with top margin for Navbar + 50px */}
      <div className="flex-1 flex items-center justify-center pt-[130px] pb-12">
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">مرحباً بعودتك</h1>
            <p className="text-gray-400">سجل دخولك لمتابعة رحلتك</p>
          </div>
          <SignIn fallbackRedirectUrl="/dashboard" appearance={{ elements: { rootBox: "mx-auto", card: "bg-[#12121a] border border-white/10 shadow-2xl" } }} />
        </div>
      </div>
    </div>
  );
}
