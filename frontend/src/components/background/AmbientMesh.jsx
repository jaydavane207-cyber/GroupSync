import React from 'react';

export const AmbientMesh = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-[#6D6AF6]/5 blur-[120px]" />
      <div className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-[#7C6FF0]/5 blur-[140px]" />
    </div>
  );
};

export default AmbientMesh;
