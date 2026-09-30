import React from 'react';

export const TextArea = ({
  error,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <textarea
      rows={rows}
      className={`w-full bg-[#14141a] border ${
        error ? 'border-rose-500/50' : 'border-gs-border'
      } focus:border-[#6D6AF6] rounded-lg p-3 text-xs text-gs-text-main placeholder-gs-text-muted transition-colors outline-hidden resize-none ${className}`}
      {...props}
    />
  );
};

export default TextArea;
