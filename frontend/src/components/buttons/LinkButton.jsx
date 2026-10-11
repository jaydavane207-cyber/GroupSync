import React from 'react';
import { Link } from 'react-router-dom';

export const LinkButton = ({
  to,
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white',
    outline: 'border border-gs-border hover:border-gs-border-hover text-gs-text-main',
    ghost: 'text-gs-text-secondary hover:text-gs-text-main',
  };

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-lg transition-colors btn-tactile ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LinkButton;

