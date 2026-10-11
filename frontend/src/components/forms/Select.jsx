import React from 'react';

export const Select = ({
  options = [],
  error,
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <select
      className={`w-full bg-[#14141a] border ${
        error ? 'border-rose-500/50' : 'border-gs-border'
      } focus:border-[#7c6af6] rounded-lg px-3 py-2 text-xs text-gs-text-main transition-colors outline-hidden ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt, idx) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={idx} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

export default Select;

