/**
 * teamService.js â€” GroupSync Team Management Operations
 * Handles team creation, member recruitment, applications, invitations,
 * linked team chats, and notification dispatches with retry logic.
 */
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';

// â”€â”€â”€ CREATE TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Create a new team. Automatically provisions a linked chat group,
 * registers the creator as team leader, and configures membership.
 */
export async function createTeam(payload) {
  const {
    name,
    description,
    category = 'hackathon',
    skills = [],
    maxMembers = 4,
    privacy = 'public',
    bannerEmoji = 'ðŸš€',
    bannerUrl = null,
    leaderId
  } = payload;

  if (!name?.trim()) {
    return { data: null, error: { userMessage: 'Team name is required.' } };
  }
  if (!leaderId) {
    return { data: null, error: { userMessage: 'Authentication required to create a team.' } };
  }

  return withRetry(async () => {
    // 1. Create a corresponding Team chat group
    let chatGroupId = null;
    try {
      const { data: chatGroup, error: chatErr } = await supabase
        .from('groups')
        .insert([{
          name: name.trim(),
          type: 'Team',
          description: `Team chat for ${name.trim()}`,
          privacy,
          max_members: maxMembers,
          members: 1,
          admin_id: leaderId
        }])
        .select('id')
        .single();

      if (!chatErr && chatGroup) {
        chatGroupId = chatGroup.id;
        // Add leader to group_members for chat access
        await supabase.from('group_members').insert([{
          group_id: chatGroupId,
          profile_id: leaderId
        }]);
      }
    } catch (e) {
      console.warn('Team chat auto-creation notice:', e);
    }

    // 2. Insert into teams table
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert([{
        name: name.trim(),
        description: description?.trim() || '',
        category,
        skills,
        max_members: Number(maxMembers) || 4,
        current_members: 1,
        privacy,
        status: 'recruiting',
        banner_emoji: bannerEmoji || 'ðŸš€',
        banner_url: bannerUrl || null,
        leader_id: leaderId,
        chat_group_id: chatGroupId
      }])
      .select()
      .single();

    if (teamErr) throw teamErr;

    // 3. Insert leader into team_members
    await supabase.from('team_members').insert([{
      team_id: team.id,
      user_id: leaderId,
      role: 'leader'
    }]);

    return { data: team, error: null };
  });
}

// â”€â”€â”€ GET TEAMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fetch teams with search and filtering capabilities.
 */
export async function getTeams(filters = {}) {
  const { category, status, search, skill } = filters;

  return withRetry(async () => {
    let query = supabase
      .from('teams')
      .select(`
        *,
        leader:profiles!leader_id(id, name, avatar, faction),
        members:team_members(
          id, role, user_id,
          profile:profiles!user_id(id, name, avatar, faction)
        )
      `)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (search?.trim()) {
      query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (skill?.trim()) {
      const targetSkill = skill.trim().toLowerCase();
      filtered = filtered.filter(t => 
        (t.skills || []).some(s => s.toLowerCase().includes(targetSkill))
      );
    }

    return { data: filtered, error: null };
  });
}

// â”€â”€â”€ GET SINGLE TEAM DETAILS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fetch full details for a team: members with badges, applications, invitations.
 */
export async function getTeamDetails(teamId, currentUserId) {
  return withRetry(async () => {
    // 1. Fetch team metadata and leader
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .select(`
        *,
        leader:profiles!leader_id(id, name, avatar, faction, college, branch)
      `)
      .eq('id', teamId)
      .single();

    if (teamErr) throw teamErr;

    // 2. Fetch team members with profile details and verified badges
    const { data: members, error: memErr } = await supabase
      .from('team_members')
      .select(`
        id, role, joined_at, user_id,
        profile:profiles!user_id(
          id, name, avatar, faction, skills,
          badges:skill_badges(id, badge_name, badge_tier, skill_name)
        )
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: true });

    if (memErr) throw memErr;

    // 3. Fetch applications (if leader, fetch all; if applicant, fetch own)
    let applications = [];
    if (currentUserId) {
      let appQuery = supabase
        .from('team_applications')
        .select(`
          *,
          applicant:profiles!applicant_id(
            id, name, avatar, faction, skills,
            badges:skill_badges(id, badge_name, badge_tier, skill_name)
          )
        `)
        .eq('team_id', teamId);

      if (team.leader_id !== currentUserId) {
        appQuery = appQuery.eq('applicant_id', currentUserId);
      }

      const { data: apps } = await appQuery.order('created_at', { ascending: false });
      applications = apps || [];
    }

    // 4. Fetch invitations
    let invitations = [];
    if (currentUserId && team.leader_id === currentUserId) {
      const { data: invs } = await supabase
        .from('team_invitations')
        .select(`
          *,
          invitee:profiles!invitee_id(id, name, avatar, faction)
        `)
        .eq('team_id', teamId);
      invitations = invs || [];
    }

    return {
      data: {
        team,
        members: members || [],
        applications,
        invitations
      },
      error: null
    };
  });
}

// â”€â”€â”€ APPLY TO TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Submit an application to join a team.
 */
export async function applyToTeam(teamId, applicantId, message, skills = [], leaderId, teamName) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('team_applications')
      .insert([{
        team_id: teamId,
        applicant_id: applicantId,
        message: message?.trim() || '',
        skills,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Send notification to team leader
    if (leaderId) {
      await supabase.from('notifications').insert([{
        user_id: leaderId,
        type: 'teams',
        title: 'New Team Application',
        message: `A candidate has applied to join ${teamName || 'your team'}.`,
        icon: 'ðŸ‘¥',
        action_label: 'View Application',
        action_path: `/teams/${teamId}`,
        reference_id: teamId
      }]).catch(() => {});
    }

    return { data, error: null };
  });
}

// â”€â”€â”€ REVIEW APPLICATION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Leader accepts or rejects an application.
 */
export async function reviewApplication(applicationId, teamId, applicantId, status, teamName, chatGroupId) {
  return withRetry(async () => {
    // 1. Update application status
    const { error: appErr } = await supabase
      .from('team_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (appErr) throw appErr;

    if (status === 'accepted') {
      // 2. Add applicant to team_members
      await supabase.from('team_members').upsert([{
        team_id: teamId,
        user_id: applicantId,
        role: 'member'
      }], { onConflict: 'team_id,user_id' });

      // 3. Add to chat group if chat exists
      if (chatGroupId) {
        await supabase.from('group_members').upsert([{
          group_id: chatGroupId,
          profile_id: applicantId
        }], { onConflict: 'group_id,profile_id' }).catch(() => {});
      }

      // 4. Update team member count
      const { data: curTeam } = await supabase
        .from('teams')
        .select('current_members, max_members')
        .eq('id', teamId)
        .single();

      if (curTeam) {
        const nextCount = (curTeam.current_members || 1) + 1;
        const newStatus = nextCount >= curTeam.max_members ? 'full' : 'recruiting';
        await supabase
          .from('teams')
          .update({ current_members: nextCount, status: newStatus })
          .eq('id', teamId);
      }

      // 5. Notify applicant
      await supabase.from('notifications').insert([{
        user_id: applicantId,
        type: 'teams',
        title: 'Application Accepted! ðŸŽ‰',
        message: `Welcome aboard! You have been accepted into ${teamName || 'the team'}.`,
        icon: 'ðŸŽ‰',
        action_label: 'Open Team',
        action_path: `/teams/${teamId}`,
        reference_id: teamId
      }]).catch(() => {});
    } else if (status === 'rejected') {
      // Notify applicant of decline
      await supabase.from('notifications').insert([{
        user_id: applicantId,
        type: 'teams',
        title: 'Application Update',
        message: `Your application to join ${teamName || 'the team'} was declined.`,
        icon: 'â„¹ï¸',
        action_label: 'Browse Teams',
        action_path: '/teams',
        reference_id: teamId
      }]).catch(() => {});
    }

    return { data: { status }, error: null };
  });
}

// â”€â”€â”€ INVITE MEMBER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Team leader sends an invitation to another student.
 */
export async function inviteMember(teamId, inviterId, inviteeId, teamName, message) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('team_invitations')
      .insert([{
        team_id: teamId,
        inviter_id: inviterId,
        invitee_id: inviteeId,
        message: message?.trim() || `You're invited to join ${teamName || 'our team'}!`,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Dispatch notification
    await supabase.from('notifications').insert([{
      user_id: inviteeId,
      type: 'teams',
      title: 'Team Invitation ðŸ“©',
      message: `You have been invited to join ${teamName || 'a team'}.`,
      icon: 'âœ‰ï¸',
      action_label: 'View Team',
      action_path: `/teams/${teamId}`,
      reference_id: teamId
    }]).catch(() => {});

    return { data, error: null };
  });
}

// â”€â”€â”€ REMOVE MEMBER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Team leader removes a member from the roster.
 */
export async function removeMember(teamId, memberUserId, teamName, chatGroupId) {
  return withRetry(async () => {
    // 1. Remove from team_members
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', memberUserId);

    if (error) throw error;

    // 2. Remove from chat group
    if (chatGroupId) {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', chatGroupId)
        .eq('profile_id', memberUserId)
        .catch(() => {});
    }

    // 3. Decrement member count
    const { data: curTeam } = await supabase
      .from('teams')
      .select('current_members')
      .eq('id', teamId)
      .single();

    if (curTeam) {
      const nextCount = Math.max(1, (curTeam.current_members || 2) - 1);
      await supabase
        .from('teams')
        .update({ current_members: nextCount, status: 'recruiting' })
        .eq('id', teamId);
    }

    // 4. Notify removed member
    await supabase.from('notifications').insert([{
      user_id: memberUserId,
      type: 'teams',
      title: 'Team Roster Update',
      message: `You were removed from ${teamName || 'the team'}.`,
      icon: 'ðŸ‘‹',
      action_label: 'Browse Teams',
      action_path: '/teams',
      reference_id: teamId
    }]).catch(() => {});

    return { success: true, error: null };
  });
}

// â”€â”€â”€ LEAVE TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Regular member voluntary departure from a team.
 */
export async function leaveTeam(teamId, userId, leaderId, teamName, chatGroupId) {
  return withRetry(async () => {
    // 1. Remove from team_members
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;

    // 2. Remove from chat
    if (chatGroupId) {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', chatGroupId)
        .eq('profile_id', userId)
        .catch(() => {});
    }

    // 3. Decrement count
    const { data: curTeam } = await supabase
      .from('teams')
      .select('current_members')
      .eq('id', teamId)
      .single();

    if (curTeam) {
      const nextCount = Math.max(1, (curTeam.current_members || 2) - 1);
      await supabase
        .from('teams')
        .update({ current_members: nextCount, status: 'recruiting' })
        .eq('id', teamId);
    }

    // 4. Notify leader
    if (leaderId) {
      await supabase.from('notifications').insert([{
        user_id: leaderId,
        type: 'teams',
        title: 'Teammate Departed',
        message: `A member has left ${teamName || 'your team'}.`,
        icon: 'ðŸšª',
        action_label: 'View Team',
        action_path: `/teams/${teamId}`,
        reference_id: teamId
      }]).catch(() => {});
    }

    return { success: true, error: null };
  });
}

// â”€â”€â”€ UPDATE TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Update team metadata (Leader only).
 */
export async function updateTeam(teamId, updates) {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  });
}

// â”€â”€â”€ DELETE TEAM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Delete a team and its associated chat group.
 */
export async function deleteTeam(teamId, chatGroupId) {
  return withRetry(async () => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;

    if (chatGroupId) {
      await supabase
        .from('groups')
        .delete()
        .eq('id', chatGroupId)
        .catch(() => {});
    }

    return { success: true, error: null };
  });
}

