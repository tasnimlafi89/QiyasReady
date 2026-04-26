"use client";
import { useState } from "react";
import { useAuth, useUser, UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Settings, Moon, Globe, Bell, Crown, Check, Star, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("profile");

  const plans = [
    { id: "free", name: "مجاني", price: "0", features: ["اختبار تشخيصي", "20 سؤال/يوم", "تحليلات أساسية"] },
    { id: "pro", name: "احترافي", price: "49", popular: true, features: ["تدريب غير محدود", "مدرس ذكاء اصطناعي", "تحليلات متقدمة", "خطة دراسية"] },
    { id: "premium", name: "مميز", price: "99", features: ["كل مميزات الاحترافي", "اختبارات محاكاة", "مكافحة الغش", "تقارير PDF", "توقع النتيجة"] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 text-center">
      <div><h1 className="text-2xl font-bold">الإعدادات</h1></div>

      <div className="flex gap-2 flex-wrap justify-center">
        {[
          { key: "profile", label: "الملف الشخصي", icon: Settings },
          { key: "subscription", label: "الاشتراك", icon: Crown },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${activeTab === t.key ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-gray-400"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="card-premium p-6">
          <UserProfile appearance={{ elements: { rootBox: "w-full", card: "bg-transparent shadow-none border-0 w-full" } }} />
        </div>
      )}

      {activeTab === "subscription" && (
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <div key={i} className={`card-premium p-6 relative ${plan.popular ? "border-purple-500/50 glow-purple" : ""}`}>
              {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-purple"><Star className="w-3 h-3" /> الأكثر شعبية</div>}
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1 my-3 justify-center">
                <span className="text-3xl font-black font-mono gradient-text">{plan.price}</span>
                <span className="text-gray-500 text-sm">ريال/شهر</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-300"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> {f}</li>
                ))}
              </ul>
              <button className={plan.popular ? "btn-primary w-full justify-center" : "btn-secondary w-full justify-center"}>
                {plan.id === "free" ? "الخطة الحالية" : "ترقية"}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
