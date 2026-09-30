import React from 'react';
import SkillBadge from '@/components/badges/SkillBadge';

export const SkillShowcase = ({ skills = [], onAddSkill }) => {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-semibold text-gs-text-main">Verified Skills</h4>
        {onAddSkill && (
          <button onClick={onAddSkill} className="text-xs text-[#6D6AF6] hover:underline">
            + Verify Skill
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <p className="text-xs text-gs-text-muted">No verified skills yet.</p>
        ) : (
          skills.map((skill, idx) => (
            <SkillBadge key={idx} skill={typeof skill === 'string' ? skill : skill.name} />
          ))
        )}
      </div>
    </div>
  );
};

export default SkillShowcase;

