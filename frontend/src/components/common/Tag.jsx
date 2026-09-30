import React from 'react';

export const Tag = ({ children, className = '' }) => {
  return (
    <span className={`tag-skill ${className}`}>
      {children}
    </span>
  );
};

export default Tag;
