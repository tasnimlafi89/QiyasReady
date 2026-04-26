import React from 'react';
import { motion } from 'framer-motion';

export default function QuestionCard({ question, currentSelected, onSelectOption }: { question: any, currentSelected: any, onSelectOption: any }) {
  if (!question) return null;

  return (
    <div className="card-premium p-6 md:p-10 text-center w-full max-w-4xl mx-auto">
      <div className="badge badge-purple mb-6 mx-auto inline-flex">
        موضوع: {question.topic}
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-relaxed">
        {question.text}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['A', 'B', 'C', 'D'].map((key) => {
          const isSelected = currentSelected === key;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectOption(key)}
              className={`p-5 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
                isSelected 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-500'
              }`}>
                {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
              </div>
              <span className="font-bold text-gray-400 w-6">{key}.</span>
              <span className="text-lg flex-1">{question.options[key]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
