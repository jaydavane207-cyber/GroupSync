import React from 'react';

export const Checkbox = ({ label, checked, onChange, name, className = '' }) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none text-xs text-gs-text-main ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded bg-[#14141a] border-gs-border text-[#6D6AF6] focus:ring-0 focus:ring-offset-0 cursor-pointer"
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Checkbox;
