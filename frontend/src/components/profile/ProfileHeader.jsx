import React from 'react';
import { Mail, GraduationCap, MapPin, Edit3 } from 'lucide-react';
import Button from '@/components/buttons/Button';

export const ProfileHeader = ({ profile, onEdit, isOwnProfile = false }) => {
  if (!profile) return null;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <img
          src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
          alt={profile.full_name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 shrink-0"
        />
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gs-text-main">{profile.full_name}</h2>
              <p className="text-xs text-gs-text-muted mt-0.5">{profile.bio || 'Student & Passionate Developer'}</p>
            </div>
            {isOwnProfile && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="self-center sm:self-start">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 text-xs text-gs-text-muted">
            {profile.college && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#9182f8]" /> {profile.college}
              </span>
            )}
            {profile.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#9182f8]" /> {profile.email}
              </span>
            )}
            {profile.branch && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#9182f8]" /> {profile.branch}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;


