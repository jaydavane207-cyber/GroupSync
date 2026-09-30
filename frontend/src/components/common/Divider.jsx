import React from 'react';

export const Divider = ({ label, className = '' }) => {
  if (label) {
    return (
      <div className={`flex items-center gap-3 my-4 ${className}`}>
        <div className="flex-1 h-px bg-gs-border" />
        <span className="text-[11px] text-gs-text-muted uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-gs-border" />
      </div>
    );
  }

  return <hr className={`border-gs-border my-4 ${className}`} />;
};

export default Divider;
