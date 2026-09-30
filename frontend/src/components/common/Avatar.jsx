import React from 'react';
import { getInitials } from '@/lib/utils/stringUtils';

export const Avatar = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
  fallbackName,
}) => {
  const sizes = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  if (!src && fallbackName) {
    return (
      <div
        className={`rounded-full bg-[#6D6AF6]/20 text-[#6D6AF6] font-bold flex items-center justify-center shrink-0 border border-white/10 ${
          sizes[size] || sizes.md
        } ${className}`}
      >
        {getInitials(fallbackName)}
      </div>
    );
  }

  return (
    <img
      src={src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
      alt={alt}
      className={`rounded-full object-cover shrink-0 border border-white/10 ${
        sizes[size] || sizes.md
      } ${className}`}
    />
  );
};

export default Avatar;

