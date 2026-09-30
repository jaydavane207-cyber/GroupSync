import React from 'react';
import Toast from './Toast';

export const ToastContainer = ({ toasts = [], onRemove }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast message={t.message} type={t.type} onClose={() => onRemove?.(t.id)} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
