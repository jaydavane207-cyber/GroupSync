import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ title, message, type = 'info', className = '' }) => {
  const styles = {
    info: 'bg-[#6D6AF6]/10 border-[#7c6af6]/20 text-gs-text-main',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
  };

  const icons = {
    info: <Info className="w-4 h-4 text-[#9182f8] shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  };

  return (
    <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${styles[type]} ${className}`}>
      {icons[type]}
      <div>
        {title && <h5 className="font-semibold mb-0.5">{title}</h5>}
        <p className="opacity-90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default Alert;

