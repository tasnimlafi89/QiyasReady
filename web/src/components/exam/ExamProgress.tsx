import React from 'react';
import { Clock } from 'lucide-react';

export default function ExamProgress({ currentQuestion, totalQuestions, globalTimeRemaining }: { currentQuestion: number, totalQuestions: number, globalTimeRemaining: number }) {
  const percentage = (currentQuestion / totalQuestions) * 100;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full glass p-4 rounded-2xl flex items-center justify-between">
      <div className="flex-1 max-w-xl mx-auto flex items-center gap-6">
        <span className="font-bold whitespace-nowrap">السؤال {currentQuestion} من {totalQuestions}</span>
        
        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex items-center gap-2 font-mono text-lg text-emerald-400">
          <Clock className="w-5 h-5" />
          {formatTime(globalTimeRemaining)}
        </div>
      </div>
    </div>
  );
}
