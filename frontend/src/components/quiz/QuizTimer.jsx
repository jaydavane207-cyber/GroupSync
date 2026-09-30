import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

export const QuizTimer = ({ totalSeconds = 300, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
        isUrgent
          ? 'bg-rose-500/15 text-rose-400 border-rose-500/25 animate-pulse'
          : 'bg-white/5 text-gs-text-secondary border-white/10'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default QuizTimer;
