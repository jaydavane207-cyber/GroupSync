import React from 'react';

export const FloatingActionButton = ({
  icon: Icon,
  onClick,
  label = 'Action',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#6D6AF6] text-white shadow-lg flex items-center justify-center hover:bg-[#5C59EC] transition-transform hover:scale-105 active:scale-95 z-40 ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
    </button>
  );
};

export default FloatingActionButton;
