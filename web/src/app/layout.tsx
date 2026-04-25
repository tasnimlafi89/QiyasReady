import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "QiyasReady | منصة التحضير لاختبارات قياس بالذكاء الاصطناعي",
  description: "منصة ذكية ومتقدمة للتحضير لاختبارات قياس - تعلم تكيفي، مدرس ذكاء اصطناعي، واختبارات محاكاة واقعية. AI-powered Qiyas exam preparation platform.",
  keywords: ["qiyas", "قياس", "exam prep", "Saudi Arabia", "university admission", "AI tutor"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ar" dir="rtl" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
        </head>
        <body className="min-h-screen bg-[hsl(240,10%,4%)] text-white antialiased text-right" dir="rtl" style={{ direction: 'rtl', textAlign: 'right' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
