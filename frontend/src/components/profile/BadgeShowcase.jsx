import React from 'react';
import AchievementBadge from '@/components/badges/AchievementBadge';

export const BadgeShowcase = ({ badges = [] }) => {
  return (
    <div className="glass-card p-5">
      <h4 className="text-xs font-semibold text-gs-text-main mb-4">Milestone Badges</h4>
      <div className="flex flex-wrap gap-3">
        {badges.length === 0 ? (
          <p className="text-xs text-gs-text-muted">Take quizzes and join hackathons to earn badges.</p>
        ) : (
          badges.map((b, idx) => (
            <AchievementBadge key={idx} title={b.title} xp={b.xp} />
          ))
        )}
      </div>
    </div>
  );
};

export default BadgeShowcase;

