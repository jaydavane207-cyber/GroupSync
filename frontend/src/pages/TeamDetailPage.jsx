import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users, ArrowLeft, Crown, MessageSquare, Check,
  Trash2, LogOut, Edit3, Send, AlertCircle, Loader2,
  UserCheck, UserX, Mail, Lock, Clock
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  getTeamDetails, applyToTeam, reviewApplication,
  inviteMember, removeMember, leaveTeam, updateTeam, deleteTeam
} from '@/lib/services/teamService';
import supabase from '@/lib/supabase';

export default function TeamDetailPage() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { user, showToast, students } = useAppContext();

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
  }, [teamId, user?.id, showToast]);

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!teamData?.team) {
    return (
      <div className="p-12 text-center space-y-3 max-w-md mx-auto">
        <AlertCircle size={32} className="text-red-500 mx-auto" />
        <h2 className="text-lg font-semibold text-gs-text-main">Team not found</h2>
        <p className="text-xs text-gs-text-muted">This team may have been disbanded or merged.</p>
        <button
          onClick={() => navigate('/teams')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-xs hover:bg-blue-700 transition-colors"
        >
          Return to teams
        </button>
      </div>
    );
  }

  const { team, members, applications } = teamData;
  const isLeader = user?.id === team.leader_id;
  const isMember = members.some(m => m.user_id === user?.id);
  const userApplication = applications.find(a => a.applicant_id === user?.id);
  const spotsLeft = Math.max(0, (team.max_members || 4) - (team.current_members || 1));

  // Actions
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
      showToast('Application sent to squad leader', 'success');
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
      showToast(status === 'accepted' ? 'Candidate welcomed to squad!' : 'Application declined', 'success');
      loadTeam();
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Are you sure you want to remove this member from the squad?')) return;
    const { error } = await removeMember(team.id, memberUserId, team.name, team.chat_group_id);
    if (error) {
      showToast('Could not remove member', 'error');
    } else {
      showToast('Member removed from squad', 'success');
      loadTeam();
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to step down from this squad?')) return;
    const { error } = await leaveTeam(team.id, user.id, team.leader_id, team.name, team.chat_group_id);
    if (error) {
      showToast('Could not leave squad', 'error');
    } else {
      showToast('You left the squad', 'success');
      navigate('/teams');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to permanently disband this squad?')) return;
    const { error } = await deleteTeam(team.id, team.chat_group_id);
    if (error) {
      showToast('Could not delete squad', 'error');
    } else {
      showToast('Squad disbanded', 'success');
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
      showToast('Failed to update squad', 'error');
    } else {
      showToast('Squad profile updated', 'success');
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
      showToast(`Invitation sent to ${selectedStudent.name}`, 'success');
      setSelectedStudent(null);
      setInviteMessage('');
      setInviteSearch('');
      loadTeam();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/teams')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gs-text-muted hover:text-gs-text-main transition-colors"
      >
        <ArrowLeft size={14} /> Back to teams
      </button>

      {/* Team Header Card */}
      <div className="glass-card rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gs-border">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-2xl shrink-0">
              {team.banner_emoji || 'ðŸ‘¥'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/5 dark:bg-white/[0.04] text-gs-text-muted">
                  {team.category}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                  spotsLeft > 0
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {spotsLeft > 0 ? `${spotsLeft} open seat${spotsLeft > 1 ? 's' : ''}` : 'Squad full'}
                </span>
                {team.privacy === 'private' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/5 dark:bg-white/[0.04] text-gs-text-muted flex items-center gap-1">
                    <Lock size={10} /> Private
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-gs-text-main">
                {team.name}
              </h1>
              <p className="text-xs text-gs-text-muted">
                Organized by {team.leader?.name || 'Campus Student'} · Formed {new Date(team.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {isLeader && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-gs-border hover:bg-black/5 dark:hover:bg-white/[0.04] text-xs font-medium text-gs-text-main transition-colors flex items-center gap-1.5"
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={handleDeleteTeam}
                  className="p-1.5 rounded-lg text-gs-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Disband squad"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}

            {isMember && !isLeader && (
              <button
                onClick={handleLeaveTeam}
                className="px-3 py-1.5 rounded-lg border border-gs-border text-gs-text-muted hover:text-red-500 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <LogOut size={13} /> Leave team
              </button>
            )}

            {!isMember && (
              userApplication ? (
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-500 flex items-center gap-1.5">
                  <Clock size={13} /> Application {userApplication.status}
                </div>
              ) : (
                <button
                  onClick={() => setShowApplyModal(true)}
                  disabled={spotsLeft === 0}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer btn-tactile"
                >
                  Apply to join
                </button>
              )
            )}

            {isMember && (
              <button
                onClick={() => navigate('/chat')}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs btn-tactile"
              >
                <MessageSquare size={13} /> Team chat
              </button>
            )}
          </div>
        </div>

        {/* Description & skills */}
        <div className="pt-4 space-y-3">
          <p className="text-xs text-gs-text-muted leading-relaxed max-w-2xl">
            {team.description}
          </p>
          {team.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[11px] text-gs-text-muted mr-1">Required:</span>
              {team.skills.map(s => (
                <span
                  key={s}
                  className="tag-skill"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gs-border pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
            activeTab === 'roster'
              ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
              : 'border-transparent text-gs-text-muted hover:text-gs-text-main'
          }`}
        >
          <Users size={13} /> Active roster ({members.length}/{team.max_members})
        </button>

        {isLeader && (
          <>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border relative ${
                activeTab === 'applications'
                  ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
                  : 'border-transparent text-gs-text-muted hover:text-gs-text-main'
              }`}
            >
              <UserCheck size={13} /> Applications
              {applications.filter(a => a.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {applications.filter(a => a.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('invite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                activeTab === 'invite'
                  ? 'bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30'
                  : 'border-transparent text-gs-text-muted hover:text-gs-text-main'
              }`}
            >
              <Mail size={13} /> Invite peers
            </button>
          </>
        )}
      </div>

      {/* TAB 1: Member Roster */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {members.map(m => {
            const memberProfile = m.profile || {};
            const isLeaderRole = m.role === 'leader';
            const badges = memberProfile.badges || [];

            return (
              <div
                key={m.id}
                className="glass-card rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-lg shrink-0">
                    {memberProfile.avatar || 'ðŸ‘¤'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-xs text-gs-text-main">{memberProfile.name}</h3>
                      {isLeaderRole && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center gap-1">
                          <Crown size={9} /> Lead
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gs-text-muted mt-0.5">
                      Joined {new Date(m.joined_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {badges.slice(0, 3).map(b => (
                          <span
                            key={b.id}
                            className="px-1.5 py-0.2 bg-blue-500/10 text-blue-500 rounded text-[10px] font-medium border border-blue-500/20"
                          >
                            {b.badge_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isLeader && !isLeaderRole && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    className="p-1 text-gs-text-muted hover:text-red-500 rounded transition-colors"
                    title="Remove member"
                  >
                    <UserX size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Candidate Applications */}
      {activeTab === 'applications' && isLeader && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="p-8 text-center glass-card rounded-xl text-gs-text-muted text-xs">
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
                  className="glass-card rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-lg shrink-0">
                      {applicant.avatar || 'ðŸ‘¤'}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gs-text-main text-xs">{applicant.name}</h4>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium uppercase ${
                          app.status === 'accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                          app.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-gs-text-muted">"{app.message || 'No note provided.'}"</p>
                      {badges.length > 0 && (
                        <div className="flex gap-1 pt-1">
                          {badges.map(b => (
                            <span key={b.id} className="text-[10px] text-blue-500 font-medium">
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
                        className="px-3 py-1 rounded-lg border border-gs-border hover:bg-white/[0.04] text-xs font-medium text-gs-text-muted hover:text-rose-400 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleReviewApp(app.id, app.applicant_id, 'accepted')}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-xs btn-tactile"
                      >
                        <Check size={13} /> Accept
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: Invite Students */}
      {activeTab === 'invite' && isLeader && (
        <div className="glass-card rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-gs-text-main">Invite campus peers</h3>
            <p className="text-xs text-gs-text-muted mt-0.5">Search verified students and send invitations.</p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-3.5 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Search student directory</label>
              <input
                type="text"
                placeholder="Type name to search..."
                value={inviteSearch}
                onChange={e => setInviteSearch(e.target.value)}
                className="w-full glass-elevated rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6]"
              />
            </div>

            {/* Matching students list */}
            {inviteSearch.trim() && (
              <div className="max-h-40 overflow-y-auto glass-elevated rounded-lg p-1.5 space-y-1">
                {(students || [])
                  .filter(s => s.id !== user?.id && s.name.toLowerCase().includes(inviteSearch.toLowerCase()))
                  .map(s => {
                    const isSelected = selectedStudent?.id === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className={`flex items-center gap-2.5 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                          isSelected ? 'bg-[#6D6AF6]/10 text-[#9182f8] font-medium' : 'text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-sm">{s.avatar || 'ðŸ‘¤'}</span>
                        <div className="flex-1 min-w-0 truncate">
                          <p className="font-medium text-gs-text-main">{s.name}</p>
                          <p className="text-[10px] text-gs-text-muted">{s.college || 'Student'}</p>
                        </div>
                        {isSelected && <Check size={13} className="text-[#9182f8]" />}
                      </div>
                    );
                  })}
              </div>
            )}

            {selectedStudent && (
              <div className="p-2.5 bg-[#7c6af6]/15 border border-[#7c6af6]/30 rounded-lg text-xs text-[#9182f8] flex items-center justify-between">
                <span>Selected: <strong>{selectedStudent.name}</strong></span>
                <button type="button" onClick={() => setSelectedStudent(null)} className="text-gs-text-muted hover:text-gs-text-main">✕</button>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gs-text-main mb-1">Message (optional)</label>
              <textarea
                rows={2}
                placeholder="We'd love to have your frontend expertise on our upcoming hackathon team..."
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                className="w-full glass-elevated rounded-lg p-2 text-xs text-gs-text-main outline-none focus:border-[#7c6af6] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedStudent || isInviting}
              className="px-4 py-2 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-xs btn-tactile"
            >
              {isInviting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Send invitation
            </button>
          </form>
        </div>
      )}

      {/* Modal: Apply to Team */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-card rounded-xl p-5 max-w-md w-full shadow-xl space-y-3.5">
            <div className="border-b border-gs-border pb-2.5">
              <h3 className="text-base font-semibold text-gs-text-main">Apply to {team.name}</h3>
              <p className="text-xs text-gs-text-muted mt-0.5">Share how your skills and background fit this squad.</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Your message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why you're interested and what you can contribute..."
                  value={applyMessage}
                  onChange={e => setApplyMessage(e.target.value)}
                  className="w-full glass-elevated rounded-lg p-2.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6] resize-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-1.5 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs btn-tactile"
                >
                  {isApplying ? <Loader2 size={13} className="animate-spin" /> : 'Send application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Team */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-card rounded-xl p-5 max-w-md w-full shadow-xl space-y-3.5">
            <div className="border-b border-gs-border pb-2.5">
              <h3 className="text-base font-semibold text-gs-text-main">Edit squad details</h3>
              <p className="text-xs text-gs-text-muted mt-0.5">Update squad name, goals, and capacity.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Squad name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full glass-elevated rounded-lg px-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full glass-elevated rounded-lg p-2.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gs-text-main mb-1">Max capacity ({editForm.maxMembers})</label>
                <input
                  type="range"
                  min={members.length}
                  max={10}
                  value={editForm.maxMembers}
                  onChange={e => setEditForm({ ...editForm, maxMembers: Number(e.target.value) })}
                  className="w-full accent-[#6D6AF6]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-1.5 rounded-lg border border-gs-border text-xs font-medium text-gs-text-muted hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs btn-tactile"
                >
                  {isUpdating ? <Loader2 size={13} className="animate-spin" /> : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


