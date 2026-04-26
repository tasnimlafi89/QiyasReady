"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Brain, Send, Sparkles, User, Loader2 } from "lucide-react";
import { aiTutor, setAuthToken } from "@/lib/api";

interface Message { role: "user" | "assistant"; content: string; }

export default function AITutorPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    "اشرح لي التناظر اللفظي",
    "كيف أحل مسائل النسبة المئوية؟",
    "أعطني نصائح للقسم الكمي",
    "ما هي استراتيجية حل أسئلة الاستيعاب؟",
  ];

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const token = await getToken();
      if (token) setAuthToken(token);
      const res = await aiTutor({ message: msg, previousMessages: newMessages.slice(-6), topic: "general" });
      setMessages([...newMessages, { role: "assistant", content: res.data.response }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "عذراً، حدث خطأ. حاول مرة أخرى." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div><h1 className="text-xl font-bold">المدرس الذكي</h1><p className="text-xs text-gray-500">مدعوم بالذكاء الاصطناعي • متاح 24/7</p></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pl-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">مرحباً! أنا مدرسك الذكي 🤖</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md">اسألني أي شيء عن اختبار قياس وسأساعدك في فهم المفاهيم وحل الأسئلة</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="btn-secondary text-sm text-center justify-start">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === "user" ? "bg-purple-500/20" : "bg-gradient-to-br from-purple-500 to-pink-500"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4 text-purple-400" /> : <Brain className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" ? "bg-purple-500/10 border border-purple-500/20" : "glass"
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="glass p-4 rounded-2xl"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="اكتب سؤالك هنا..."
          className="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition"
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary px-4 disabled:opacity-30">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
