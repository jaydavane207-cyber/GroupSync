import React from 'react';
import ProgressBar from '@/components/loaders/ProgressBar';

export const QuizProgress = ({ current = 1, total = 10 }) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[11px] text-gs-text-muted">
        <span>Progress</span>
        <span>{Math.round((current / total) * 100)}%</span>
      </div>
      <ProgressBar progress={current} max={total} height="h-2" />
    </div>
  );
};

export default QuizProgress;

