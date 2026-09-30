import React from 'react';

export const IconButton = ({
  icon: Icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const variants = {
    ghost: 'text-gs-text-secondary hover:text-gs-text-main hover:bg-white/5',
    secondary: 'bg-white/5 hover:bg-white/10 text-gs-text-main border border-white/10',
    primary: 'bg-[#6D6AF6] text-white hover:bg-[#5C59EC]',
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-lg transition-colors btn-tactile ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
    </button>
  );
};

export default IconButton;
