import React from 'react';

export const RadioButton = ({ label, name, value, checked, onChange, className = '' }) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none text-xs text-gs-text-main ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded-full bg-[#14141a] border-gs-border text-[#9182f8] focus:ring-0 focus:ring-offset-0 cursor-pointer"
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default RadioButton;

