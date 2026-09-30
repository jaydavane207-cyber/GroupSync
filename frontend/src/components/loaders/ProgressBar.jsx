import React from 'react';

export const ProgressBar = ({ progress = 0, max = 100, height = 'h-1.5', className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (progress / max) * 100));

  return (
    <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="bg-[#6D6AF6] h-full transition-all duration-300 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
