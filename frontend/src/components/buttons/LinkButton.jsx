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
    primary: 'bg-[#6D6AF6] hover:bg-[#5C59EC] text-white',
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
