import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, Shield, Crown, MessageSquare, Plus, Check,
  X, Trash2, LogOut, Edit3, Send, AlertCircle, Loader2, Sparkles,
  ExternalLink, UserCheck, UserX, Mail, Globe, Lock, Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import {
  getTeamDetails, applyToTeam, reviewApplication,
  inviteMember, removeMember, leaveTeam, updateTeam, deleteTeam
} from '../lib/teamService';
import supabase from '../lib/supabase';

export default function TeamDetailPage() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { user, showToast, factions, students } = useAppContext();

  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster'); // roster | applications | invite

  // Modals
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '', maxMembers: 4, skills: [] });
  const [isUpdating, setIsUpdating] = useState(false);

  // Invite state
  const [inviteSearch, setInviteSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const channelRef = useRef(null);

  const loadTeam = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    const { data, error } = await getTeamDetails(teamId, user?.id);
    if (error || !data?.team) {
      showToast('Could not load team details', 'error');
    } else {
      setTeamData(data);
      setEditForm({
        name: data.team.name,
        description: data.team.description,
        maxMembers: data.team.max_members,
        skills: data.team.skills || []
      });
    }
    setLoading(false);
  }, [teamId, user?.id]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  // Realtime subscription for team changes
  useEffect(() => {
    if (!teamId) return;
    const channel = supabase
      .channel(`team-detail-${teamId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `team_id=eq.${teamId}` }, () => {
        loadTeam();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_applications', filter: `team_id=eq.${teamId}` }, () => {
        loadTeam();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${teamId}` }, () => {
        loadTeam();
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [teamId, loadTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-[var(--color-gs-cyan)]" />
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="p-16 text-center space-y-4">
        <AlertCircle size={48} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Team Not Found</h2>
        <button onClick={() => navigate('/teams')} className="px-6 py-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-xl font-bold">
          Back to Teams
        </button>
      </div>
    );
  }

  const { team, members, applications, invitations } = teamData;
  const isLeader = user?.id === team.leader_id;
  const isMember = members.some(m => m.user_id === user?.id);
  const userApplication = applications.find(a => a.applicant_id === user?.id);
  const spotsLeft = Math.max(0, (team.max_members || 4) - (team.current_members || 1));

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleApply = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      showToast('Please log in to apply', 'error');
      return;
    }
    setIsApplying(true);
    const { error } = await applyToTeam(
      team.id,
      user.id,
      applyMessage,
      user.skills || [],
      team.leader_id,
      team.name
    );
    setIsApplying(false);

    if (error) {
      showToast(error.userMessage || 'Failed to submit application', 'error');
    } else {
      showToast('Application sent to team leader! 🚀', 'success');
      setShowApplyModal(false);
      setApplyMessage('');
      loadTeam();
    }
  };

  const handleReviewApp = async (appId, applicantId, status) => {
    const { error } = await reviewApplication(
      appId,
      team.id,
      applicantId,
      status,
      team.name,
      team.chat_group_id
    );
    if (error) {
      showToast('Action failed. Please retry.', 'error');
    } else {
      showToast(status === 'accepted' ? 'Candidate accepted into team! 🎉' : 'Application rejected', 'success');
      loadTeam();
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    const { error } = await removeMember(team.id, memberUserId, team.name, team.chat_group_id);
    if (error) {
      showToast('Could not remove member', 'error');
    } else {
      showToast('Member removed from team', 'success');
      loadTeam();
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    const { error } = await leaveTeam(team.id, user.id, team.leader_id, team.name, team.chat_group_id);
    if (error) {
      showToast('Could not leave team', 'error');
    } else {
      showToast('You have left the team', 'success');
      navigate('/teams');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this team?')) return;
    const { error } = await deleteTeam(team.id, team.chat_group_id);
    if (error) {
      showToast('Could not delete team', 'error');
    } else {
      showToast('Team deleted', 'success');
      navigate('/teams');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const { error } = await updateTeam(team.id, {
      name: editForm.name,
      description: editForm.description,
      max_members: Number(editForm.maxMembers)
    });
    setIsUpdating(false);

    if (error) {
      showToast('Failed to update team', 'error');
    } else {
      showToast('Team updated successfully', 'success');
      setShowEditModal(false);
      loadTeam();
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsInviting(true);
    const { error } = await inviteMember(
      team.id,
      user.id,
      selectedStudent.id,
      team.name,
      inviteMessage
    );
    setIsInviting(false);

    if (error) {
      showToast('Failed to send invitation', 'error');
    } else {
      showToast(`Invitation sent to ${selectedStudent.name}! 📩`, 'success');
      setSelectedStudent(null);
      setInviteMessage('');
      setInviteSearch('');
      loadTeam();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-[load-fade-up_0.3s_ease-out]">
      {/* Back button */}
      <button
        onClick={() => navigate('/teams')}
        className="flex items-center gap-2 text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Team Finder
      </button>

      {/* ── Team Header Card ──────────────────────────────────────── */}
      <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--color-gs-cyan)]/20 to-[var(--color-gs-secondary)]/20 border border-white/10 flex items-center justify-center text-4xl shrink-0 shadow-lg">
              {team.banner_emoji || '🚀'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 text-[var(--color-gs-cyan)]">
                  {team.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  spotsLeft > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {spotsLeft > 0 ? `${spotsLeft} Open Spot${spotsLeft > 1 ? 's' : ''}` : 'Team Full'}
                </span>
                {team.privacy === 'private' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-[var(--color-gs-text-muted)] flex items-center gap-1">
                    <Lock size={10} /> Private
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-heading text-white">{team.name}</h1>
              <p className="text-xs text-[var(--color-gs-text-muted)] flex items-center gap-1.5">
                Led by <span className="text-white font-bold">{team.leader?.name}</span> · Created {new Date(team.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {isLeader && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                >
                  <Edit3 size={14} /> Edit Team
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors"
                  title="Delete Team"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}

            {isMember && !isLeader && (
              <button
                onClick={handleLeaveTeam}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <LogOut size={14} /> Leave Team
              </button>
            )}

            {!isMember && (
              userApplication ? (
                <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock size={14} /> Application {userApplication.status}
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  disabled={spotsLeft === 0}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-[0_4px_15px_rgba(0,240,255,0.25)] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} /> Apply to Join
                </button>
              )
            )}

            {/* Chat shortcut */}
            {isMember && (
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2.5 rounded-2xl bg-[var(--color-gs-cyan)] text-[#0f172a] text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={14} /> Team Chat
              </button>
            )}
          </div>
        </div>

        {/* Description & skills bar */}
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <p className="text-sm text-[var(--color-gs-text-main)] leading-relaxed">{team.description}</p>
          {team.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-[var(--color-gs-text-muted)]">Skills Sought:</span>
              {team.skills.map(s => (
                <span
                  key={s}
                  className="px-3 py-1 bg-[var(--color-gs-cyan)]/10 border border-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)] rounded-xl text-xs font-bold"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
            activeTab === 'roster'
              ? 'bg-[var(--color-gs-cyan)] text-[#0f172a]'
              : 'text-[var(--color-gs-text-muted)] hover:text-white'
          }`}
        >
          <Users size={14} /> Team Roster ({members.length}/{team.max_members})
        </button>

        {isLeader && (
          <>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors relative ${
                activeTab === 'applications'
                  ? 'bg-[var(--color-gs-cyan)] text-[#0f172a]'
                  : 'text-[var(--color-gs-text-muted)] hover:text-white'
              }`}
            >
              <UserCheck size={14} /> Candidate Applications
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invite')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                activeTab === 'invite'
                  ? 'bg-[var(--color-gs-cyan)] text-[#0f172a]'
                  : 'text-[var(--color-gs-text-muted)] hover:text-white'
              }`}
            >
              <Mail size={14} /> Invite Students
            </button>
          </>
        )}
      </div>

      {/* ── TAB 1: Member Roster ──────────────────────────────────── */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(m => {
            const memberProfile = m.profile || {};
            const isMe = memberProfile.id === user?.id;
            const isLeaderRole = m.role === 'leader';
            const badges = memberProfile.badges || [];

            return (
              <div
                key={m.id}
                className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-5 flex items-start justify-between gap-4 backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-gs-bg)] border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {memberProfile.avatar || '🎓'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{memberProfile.name}</h3>
                      {isLeaderRole && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center gap-1">
                          <Crown size={10} /> Leader
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-gs-text-muted)] mt-0.5">
                      Joined {new Date(m.joined_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>

                    {/* Verified Badges Pill */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {badges.slice(0, 3).map(b => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 bg-[var(--color-gs-cyan)]/10 text-[var(--color-gs-cyan)] rounded-md text-[9px] font-bold border border-[var(--color-gs-cyan)]/20"
                          >
                            🏅 {b.badge_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Leader can remove non-leaders */}
                {isLeader && !isLeaderRole && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="p-2 text-[var(--color-gs-text-muted)] hover:text-rose-400 transition-colors"
                    title="Remove Member"
                  >
                    <UserX size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: Candidate Applications (Leader) ────────────────── */}
      {activeTab === 'applications' && isLeader && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="p-12 text-center bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl text-[var(--color-gs-text-muted)] text-sm">
              No applications submitted yet.
            </div>
          ) : (
            applications.map(app => {
              const applicant = app.applicant || {};
              const isPending = app.status === 'pending';
              const badges = applicant.badges || [];

              return (
                <div
                  key={app.id}
                  className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-gs-bg)] border border-white/10 flex items-center justify-center text-2xl shrink-0">
                      {applicant.avatar || '🎓'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{applicant.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400' :
                          app.status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-gs-text-main)] italic">"{app.message || 'No pitch provided.'}"</p>
                      {badges.length > 0 && (
                        <div className="flex gap-1.5 pt-1">
                          {badges.map(b => (
                            <span key={b.id} className="text-[10px] text-[var(--color-gs-cyan)] font-bold">
                              ✓ {b.badge_name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleReviewApp(app.id, app.applicant_id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 text-xs font-bold text-[var(--color-gs-text-muted)] hover:text-rose-400 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleReviewApp(app.id, app.applicant_id, 'accepted')}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
                      >
                        <Check size={14} /> Accept Candidate
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB 3: Invite Students (Leader) ───────────────────────── */}
      {activeTab === 'invite' && isLeader && (
        <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-heading text-white">Send Team Invitations</h3>
            <p className="text-xs text-[var(--color-gs-text-muted)]">Search fellow students and send direct invitations to join your team.</p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Search Student</label>
              <input
                type="text"
                placeholder="Type name to filter students..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
              />
            </div>

            {/* Matching students list */}
            {inviteSearch.trim() && (
              <div className="max-h-48 overflow-y-auto bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl p-2 space-y-1">
                {(students || [])
                  .filter(s => s.id !== user?.id && s.name.toLowerCase().includes(inviteSearch.toLowerCase()))
                  .map(s => {
                    const isSelected = selectedStudent?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-[var(--color-gs-cyan)]/20 text-white font-bold' : 'text-[var(--color-gs-text-muted)] hover:bg-white/5'
                        }`}
                      >
                        <span className="text-lg">{s.avatar || '🎓'}</span>
                        <div className="flex-1 min-w-0 truncate">
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-[10px] text-[var(--color-gs-text-muted)]">{s.college || 'GroupSync Scholar'}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-[var(--color-gs-cyan)]" />}
                      </div>
                    );
                  })}
              </div>
            )}

            {selectedStudent && (
              <div className="p-3 bg-[var(--color-gs-cyan)]/10 border border-[var(--color-gs-cyan)]/30 rounded-xl text-xs text-[var(--color-gs-cyan)] flex items-center justify-between">
                <span>Selected: <strong>{selectedStudent.name}</strong></span>
                <button type="button" onClick={() => setSelectedStudent(null)} className="text-red-400">✕</button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Invitation Message (Optional)</label>
              <textarea
                rows={2}
                placeholder="Hey, we'd love for you to join our hackathon squad..."
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-3 text-xs text-white outline-none focus:border-[var(--color-gs-cyan)] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedStudent || isInviting}
              className="px-6 py-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] text-xs font-bold rounded-xl hover:bg-cyan-400 transition-colors flex items-center gap-2 disabled:opacity-40"
            >
              {isInviting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Invitation
            </button>
          </form>
        </div>
      )}

      {/* ── Modal: Apply to Team ──────────────────────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">Apply to Join {team.name}</h3>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Share your pitch and skills with the team leader</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Motivation / Pitch *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Why do you want to join this team and what can you contribute?"
                  value={applyMessage}
                  onChange={e => setApplyMessage(e.target.value)}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-gs-border)] text-xs font-bold text-[var(--color-gs-text-muted)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-gs-cyan)] text-[#0f172a] text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isApplying ? <Loader2 size={14} className="animate-spin" /> : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Team ──────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">Edit Team Details</h3>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Update name, description, and team capacity</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl p-3 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-gs-text-muted)] mb-1">Max Team Size ({editForm.maxMembers})</label>
                <input
                  type="range"
                  min={members.length}
                  max={10}
                  value={editForm.maxMembers}
                  onChange={e => setEditForm({ ...editForm, maxMembers: Number(e.target.value) })}
                  className="w-full accent-[var(--color-gs-cyan)]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--color-gs-border)] text-xs font-bold text-[var(--color-gs-text-muted)] hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-gs-cyan)] text-[#0f172a] text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
