import React from 'react';
import Card from '@/components/cards/Card';
import Button from '@/components/buttons/Button';
import { Award, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

export const QuizResults = ({
  score = 0,
  total = 10,
  passed = false,
  xpEarned = 0,
  onRetry,
  onFinish,
}) => {
  const percentage = Math.round((score / total) * 100);

  return (
    <Card className="max-w-md mx-auto text-center p-8 space-y-6">
      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-white/5 border border-white/10">
        {passed ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        ) : (
          <XCircle className="w-8 h-8 text-rose-400" />
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-gs-text-main mb-1">
          {passed ? 'Verification Passed!' : 'Verification Not Passed'}
        </h3>
        <p className="text-xs text-gs-text-muted">
          {passed
            ? 'Congratulations! You demonstrated proficiency in this skill.'
            : 'You need at least 70% to pass and earn the verified badge.'}
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-around">
        <div>
          <span className="text-[10px] text-gs-text-muted uppercase tracking-wider block">Score</span>
          <span className="text-base font-bold text-gs-text-main">{percentage}%</span>
        </div>
        <div className="h-8 w-px bg-gs-border" />
        <div>
          <span className="text-[10px] text-gs-text-muted uppercase tracking-wider block">XP Earned</span>
          <span className="text-base font-bold text-amber-400">+{xpEarned} XP</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center pt-2">
        {!passed && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Try Again
          </Button>
        )}
        {onFinish && (
          <Button variant="primary" size="sm" onClick={onFinish}>
            Done
          </Button>
        )}
      </div>
    </Card>
  );
};

export default QuizResults;

