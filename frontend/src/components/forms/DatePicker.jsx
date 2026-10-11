import React from 'react';

export const DatePicker = ({ value, onChange, error, className = '', ...props }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className={`w-full bg-[#14141a] border ${
        error ? 'border-rose-500/50' : 'border-gs-border'
      } focus:border-[#7c6af6] rounded-lg px-3 py-2 text-xs text-gs-text-main transition-colors outline-hidden ${className}`}
      {...props}
    />
  );
};

export default DatePicker;

