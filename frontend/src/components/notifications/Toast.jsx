import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle className="text-emerald-400 w-4 h-4 shrink-0" />,
    error: <XCircle className="text-rose-400 w-4 h-4 shrink-0" />,
    warning: <AlertCircle className="text-amber-400 w-4 h-4 shrink-0" />,
    info: <Info className="text-[#6D6AF6] w-4 h-4 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/20',
    error: 'border-rose-500/30 text-rose-300',
    warning: 'border-amber-500/30 text-amber-300',
    info: 'border-[#6D6AF6]/30 text-gs-text-main',
  };

  return (
    <div
      className={`bg-gs-elevated p-3.5 rounded-xl shadow-lg flex items-center gap-3 border ${
        borders[type] || borders.info
      } animate-[slideIn_0.15s_ease-out]`}
    >
      {icons[type] || icons.info}
      <p className="text-xs font-medium">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-gs-text-muted hover:text-gs-text-main ml-auto">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
