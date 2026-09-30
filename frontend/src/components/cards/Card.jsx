import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  onClick,
  ...props
}) => {
  const classes = `rounded-xl p-5 border border-gs-border bg-gs-card ${
    hover ? 'glass-card-hover cursor-pointer' : ''
  } ${glass ? 'glass-card' : ''} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
