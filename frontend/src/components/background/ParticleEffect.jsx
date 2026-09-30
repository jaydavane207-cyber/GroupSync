import React from 'react';

export const ParticleEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
      <div className="absolute inset-0 bg-[radial-gradient(#6d6af6_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
};

export default ParticleEffect;
