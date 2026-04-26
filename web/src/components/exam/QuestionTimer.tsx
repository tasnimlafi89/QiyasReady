import React from 'react';
import { motion } from 'framer-motion';

export default function QuestionTimer({ timeRemaining, totalTime = 60 }: { timeRemaining: number, totalTime?: number }) {
  const isWarning = timeRemaining <= 30;
  const isCritical = timeRemaining <= 10;

  const colorClass = isCritical 
    ? 'text-red-500' 
    : isWarning 
      ? 'text-orange-500' 
      : 'text-emerald-500';

  const strokeColor = isCritical 
    ? '#ef4444' 
    : isWarning 
      ? '#f59e0b' 
      : '#10b981';

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeRemaining / totalTime) * circumference;

  return (
    <div className={`relative flex items-center justify-center w-24 h-24 ${isCritical ? 'animate-pulse' : ''}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-white/10 stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
        />
        <motion.circle
          className="stroke-current"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "linear" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className={`text-2xl font-bold font-mono ${colorClass}`}>
        {timeRemaining}
      </div>
    </div>
  );
}
