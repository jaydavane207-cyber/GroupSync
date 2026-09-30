import React from 'react';
import Spinner from './Spinner';

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4">
      <Spinner size="lg" />
      {message && <p className="text-xs text-gs-text-secondary mt-3 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingOverlay;
