import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-semibold text-gs-text-main mb-2">Access Denied</h1>
      <p className="text-gs-text-muted text-xs max-w-sm mb-6 leading-relaxed">
        You do not have the required permissions or authentication level to view this resource.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium rounded-lg transition-colors text-xs shadow-xs btn-tactile"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default UnauthorizedPage;

