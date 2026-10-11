import React from 'react';

export const TextInput = ({
  icon: Icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gs-text-muted">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        className={`w-full bg-[#14141a] border ${
          error ? 'border-rose-500/50' : 'border-gs-border'
        } focus:border-[#7c6af6] rounded-lg px-3.5 py-2 text-xs text-gs-text-main placeholder-gs-text-muted transition-colors outline-hidden ${
          Icon ? 'pl-9' : ''
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default TextInput;

