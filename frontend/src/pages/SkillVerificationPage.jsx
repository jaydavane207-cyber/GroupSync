import React from 'react';
import SkillVerificationModule from '../components/profile/SkillVerificationModule';
import { Award } from 'lucide-react';

export const SkillVerificationPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-page-load">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#6D6AF6]/15 text-[#6D6AF6]">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gs-text-main">Skill Verification Hub</h1>
          <p className="text-xs text-gs-text-muted mt-0.5">
            Take timed quizzes and upload certifications to earn verified badges and elevate your Credibility Score.
          </p>
        </div>
      </div>

      <SkillVerificationModule />
    </div>
  );
};

export default SkillVerificationPage;
