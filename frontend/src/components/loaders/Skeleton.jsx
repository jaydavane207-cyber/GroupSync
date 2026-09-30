import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return <div className={`animate-pulse bg-white/5 ${rounded} ${className}`} />;
};

export default Skeleton;
