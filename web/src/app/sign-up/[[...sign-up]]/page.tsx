import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(240,10%,4%)] bg-grid relative">
      <div className="absolute inset-0 bg-radial" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">أنشئ حسابك</h1>
          <p className="text-gray-400">ابدأ رحلتك نحو أعلى درجة في قياس</p>
        </div>
        <SignUp afterSignUpUrl="/onboarding" appearance={{ elements: { rootBox: "mx-auto", card: "bg-[#12121a] border border-white/10 shadow-2xl" } }} />
      </div>
    </div>
  );
}
