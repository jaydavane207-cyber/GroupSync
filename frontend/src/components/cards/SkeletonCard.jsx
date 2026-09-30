import React from 'react';
import Card from './Card';

export const SkeletonCard = ({ className = '' }) => {
  return (
    <Card className={`animate-pulse space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-lg bg-white/10" />
        <div className="w-16 h-4 rounded-md bg-white/10" />
      </div>
      <div className="w-3/4 h-4 rounded-md bg-white/10" />
      <div className="w-full h-3 rounded-md bg-white/5" />
      <div className="w-2/3 h-3 rounded-md bg-white/5" />
      <div className="pt-3 border-t border-gs-border flex justify-between">
        <div className="w-20 h-3 rounded-md bg-white/5" />
        <div className="w-12 h-3 rounded-md bg-white/10" />
      </div>
    </Card>
  );
};

export default SkeletonCard;
