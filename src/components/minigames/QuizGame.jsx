import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function QuizGame({ onBack, onReward }) {
  const [questions] = useState([
    { q: '龟龟冒险岛中最终Boss是谁？', a: ['广智', '小黄龙', '中大林', '海星'], correct: 0 },
    { q: 'What key is used to shoot?', a: ['K', 'J', 'L', 'H'], correct: 0 },
    { q: '塔模式有多少层？', a: ['50', '100', '200', '150'], correct: 1 },
    { q: 'Which weapon summons allies?', a: ['图腾', '赤潮', '电巢', '龟龟之手'], correct: 0 },
    { q: '每击败多少Boss获胜？', a: ['10', '15', '20', '25'], correct: 2 }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (index) => {
    if (answered) return;
    
    setAnswered(true);
    const correct = index === questions[currentIndex].correct;
    
    if (correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setAnswered(false);
      } else {
        const reward = score * 50 + (correct ? 50 : 0);
        onReward(reward);
        alert(`测验完成！答对${correct ? score + 1 : score}题，获得${reward}金币！`);
        onBack();
      }
    }, 1000);
  };

  const current = questions[currentIndex];

  return (
    <div className="text-center">
      <Button onClick={onBack} variant="outline" className="mb-4">返回</Button>
      
      <div className="bg-slate-800 p-8 rounded-xl max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">🧠 知识问答</h2>
        <p className="text-white/60 mb-6">题目 {currentIndex + 1}/{questions.length} | 得分: {score}</p>
        
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="mb-8"
        >
          <h3 className="text-2xl text-white mb-6">{current.q}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {current.a.map((answer, idx) => (
              <Button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className={`py-6 text-lg ${
                  answered
                    ? idx === current.correct
                      ? 'bg-green-600'
                      : 'bg-red-600 opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {answer}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}