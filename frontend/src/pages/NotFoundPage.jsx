import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 rounded-xl bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] mb-4">
        <span className="text-xl font-bold font-mono">404</span>
      </div>
      <h1 className="text-2xl font-semibold text-gs-text-main mb-2">Page Not Found</h1>
      <p className="text-gs-text-muted text-xs max-w-sm mb-6 leading-relaxed">
        This page doesn't exist or has been relocated. Let's get you back to your workspace.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg transition-colors text-xs shadow-xs btn-tactile"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

