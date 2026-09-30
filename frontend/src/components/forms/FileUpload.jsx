import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export const FileUpload = ({ onFileSelect, accept = '*/*', label = 'Upload File', className = '' }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed border-gs-border hover:border-[#6D6AF6]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/2 ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      <UploadCloud className="w-8 h-8 text-[#6D6AF6] mb-2" />
      <span className="text-xs font-medium text-gs-text-main">{label}</span>
      <span className="text-[10px] text-gs-text-muted mt-1">Click to browse or drag & drop</span>
    </div>
  );
};

export default FileUpload;
