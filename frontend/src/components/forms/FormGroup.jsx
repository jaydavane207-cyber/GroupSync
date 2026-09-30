import React from 'react';

export const FormGroup = ({ label, error, children, className = '', required = false }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gs-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      {children}
      {error && <span className="text-[11px] text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
};

export default FormGroup;
