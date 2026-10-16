/**
 * teamService.js — GroupSync Team Management Operations
 * Handles team creation, member recruitment, applications, invitations,
 * linked team chats, and notification dispatches with offline/resilient fallback.
 */
import supabase from '@/lib/supabase';
import { withRetry } from '@/lib/withRetry';
import storage from '@/lib/utils/localStorage';

export const isTableMissingError = (err) => {
  if (!err) return false;
  const msg = String(err.message || err.userMessage || '').toLowerCase();
  const code = String(err.code || '');
  return code === 'PGRST205' || msg.includes('schema cache') || (msg.includes('table') && msg.includes('teams'));
};

export const SAMPLE_TEAMS = [
  {
    id: 'team-neural-knights',
    name: 'Neural Knights',
    description: 'Building an autonomous computer vision system for real-time traffic obstacle avoidance in edge IoT devices.',
    category: 'hackathon',
    skills: ['Python', 'PyTorch', 'OpenCV', 'FastAPI'],
    max_members: 4,
    current_members: 2,
    privacy: 'public',
    status: 'recruiting',
    banner_emoji: '🤖',
    banner_url: null,
    leader_id: 'sample-leader-1',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    leader: { id: 'sample-leader-1', name: 'Aarav Patel', avatar: '🎓', faction: 'innovators', college: 'Engineering' },
    members: [
      { id: 'mem-1', role: 'leader', user_id: 'sample-leader-1', profile: { id: 'sample-leader-1', name: 'Aarav Patel', avatar: '🎓', faction: 'innovators' } },
      { id: 'mem-2', role: 'member', user_id: 'sample-user-2', profile: { id: 'sample-user-2', name: 'Priya Sharma', avatar: '💻', faction: 'creatives' } }
    ]
  },
  {
    id: 'team-defi-matrix',
    name: 'DeFi Matrix',
    description: 'Developing a gas-optimized algorithmic yield aggregator and cross-chain liquidity bridge on Layer-2 networks.',
    category: 'project',
    skills: ['Solidity', 'React', 'Node.js', 'Web3.js'],
    max_members: 5,
    current_members: 3,
    privacy: 'public',
    status: 'recruiting',
    banner_emoji: '⚡',
    banner_url: null,
    leader_id: 'sample-leader-2',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    leader: { id: 'sample-leader-2', name: 'Rohan Gupta', avatar: '⚡', faction: 'titans', college: 'Computer Science' },
    members: [
      { id: 'mem-3', role: 'leader', user_id: 'sample-leader-2', profile: { id: 'sample-leader-2', name: 'Rohan Gupta', avatar: '⚡', faction: 'titans' } },
      { id: 'mem-4', role: 'member', user_id: 'sample-user-4', profile: { id: 'sample-user-4', name: 'Ananya Roy', avatar: '🎨', faction: 'innovators' } }
    ]
  },
  {
    id: 'team-ecosphere-campus',
    name: 'EcoSphere Campus',
    description: 'Deploying campus-wide smart bin sensor arrays with predictive recycling analytics and live gamified leaderboards.',
    category: 'competition',
    skills: ['IoT', 'React Native', 'Data Visualization', 'Python'],
    max_members: 4,
    current_members: 3,
    privacy: 'public',
    status: 'recruiting',
    banner_emoji: '🌱',
    banner_url: null,
    leader_id: 'sample-leader-3',
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    leader: { id: 'sample-leader-3', name: 'Devendra K', avatar: '🌱', faction: 'vanguards', college: 'Environmental Tech' },
    members: [
      { id: 'mem-5', role: 'leader', user_id: 'sample-leader-3', profile: { id: 'sample-leader-3', name: 'Devendra K', avatar: '🌱', faction: 'vanguards' } }
    ]
  },
  {
    id: 'team-quantum-code',
    name: 'Quantum Code',
    description: 'High-performance distributed algorithm benchmarking for next-gen cryptography and edge systems.',
    category: 'research',
    skills: ['Rust', 'C++', 'Algorithms', 'Go'],
    max_members: 4,
    current_members: 1,
    privacy: 'public',
    status: 'recruiting',
    banner_emoji: '🚀',
    banner_url: null,
    leader_id: 'sample-leader-4',
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    leader: { id: 'sample-leader-4', name: 'Ishaan Verma', avatar: '🚀', faction: 'innovators', college: 'Mathematics' },
    members: [
      { id: 'mem-6', role: 'leader', user_id: 'sample-leader-4', profile: { id: 'sample-leader-4', name: 'Ishaan Verma', avatar: '🚀', faction: 'innovators' } }
    ]
  }
];

export const getLocalTeams = () => {
  const custom = storage.get('groupsync_local_teams', []);
  return [...custom, ...SAMPLE_TEAMS];
};

export const saveLocalTeams = (teams) => {
  storage.set('groupsync_local_teams', teams);
};

const filterLocalTeams = (allTeams, filters = {}) => {
  const { category, status, search, skill } = filters;
  let filtered = [...allTeams];

  if (category && category !== 'all') {
    filtered = filtered.filter(t => t.category === category);
  }
  if (status && status !== 'all') {
    filtered = filtered.filter(t => t.status === status);
  }
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(t =>
      (t.name || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }
  if (skill?.trim()) {
    const targetSkill = skill.trim().toLowerCase();
    filtered = filtered.filter(t =>
      (t.skills || []).some(s => s.toLowerCase().includes(targetSkill))
    );
  }
  return filtered;
};

// ─── DEDUPLICATE TEAMS HELPER ───────────────────────────────────────────────

/**
 * Filter out duplicate squads based on ID and (name + leader_id).
 * Retains the primary/newest entry for each squad.
 */
export const deduplicateTeams = (teamsList = []) => {
  if (!Array.isArray(teamsList)) return [];
  const seenIds = new Set();
  const seenKeys = new Set();
  const result = [];

  for (const t of teamsList) {
    if (!t || !t.id) continue;
    if (seenIds.has(t.id)) continue;

    const normName = (t.name || '').trim().toLowerCase();
    const leaderKey = t.leader_id || t.admin_id || 'unknown';
    const uniqueKey = `${normName}::${leaderKey}`;

    if (seenKeys.has(uniqueKey)) {
      continue;
    }

    seenIds.add(t.id);
    seenKeys.add(uniqueKey);
    result.push(t);
  }

  return result;
};

// ─── CLEANUP DUPLICATE SQUADS ────────────────────────────────────────────────

/**
 * Deletes replicate squads in Supabase belonging to the given leader,
 * keeping only the single newest squad for each unique team name.
 */
export async function cleanupDuplicateSquadsForLeader(leaderId) {
  if (!leaderId) return { cleanedCount: 0 };
  try {
    const { data: userTeams, error } = await supabase
      .from('teams')
      .select('id, name, chat_group_id, created_at')
      .eq('leader_id', leaderId)
      .order('created_at', { ascending: false });

    if (error || !userTeams || userTeams.length <= 1) return { cleanedCount: 0 };

    const grouped = {};
    for (const t of userTeams) {
      const norm = (t.name || '').trim().toLowerCase();
      if (!grouped[norm]) grouped[norm] = [];
      grouped[norm].push(t);
    }

    const teamIdsToDelete = [];
    const groupIdsToDelete = [];

    for (const norm in grouped) {
      const list = grouped[norm];
      if (list.length > 1) {
        // Keep index 0 (newest / primary), mark remainder for deletion
        for (let i = 1; i < list.length; i++) {
          teamIdsToDelete.push(list[i].id);
          if (list[i].chat_group_id) {
            groupIdsToDelete.push(list[i].chat_group_id);
          }
        }
      }
    }

    if (teamIdsToDelete.length > 0) {
      console.info(`[teamService] Auto-cleaning ${teamIdsToDelete.length} duplicate squad(s)...`);
      await supabase.from('teams').delete().in('id', teamIdsToDelete);
      if (groupIdsToDelete.length > 0) {
        await supabase.from('groups').delete().in('id', groupIdsToDelete);
      }
      return { cleanedCount: teamIdsToDelete.length };
    }
    return { cleanedCount: 0 };
  } catch (err) {
    console.warn('[teamService] cleanupDuplicateSquadsForLeader notice:', err);
    return { cleanedCount: 0 };
  }
}

// ─── CREATE TEAM ─────────────────────────────────────────────────────────────

/**
 * Create a new team. Provisions a linked chat group if possible,
 * registers creator as leader, and saves with fallback support.
 * (Note: We do NOT wrap insertions in withRetry to prevent accidental duplicates)
 */
export async function createTeam(payload) {
  const {
    name,
    description,
    category = 'hackathon',
    skills = [],
    maxMembers = 4,
    privacy = 'public',
    bannerEmoji = '🚀',
    bannerUrl = null,
    leaderId
  } = payload;

  const trimmedName = (name || '').trim();

  if (!trimmedName) {
    return { data: null, error: { userMessage: 'Team name is required.' } };
  }
  if (!leaderId) {
    return { data: null, error: { userMessage: 'Authentication required to create a team.' } };
  }

  // 1. Prevent duplicate team creation with identical name for this leader
  try {
    const { data: existingTeams } = await supabase
      .from('teams')
      .select('id, name')
      .eq('leader_id', leaderId)
      .ilike('name', trimmedName)
      .limit(1);

    if (existingTeams && existingTeams.length > 0) {
      return {
        data: null,
        error: { userMessage: `You already have an active squad named "${trimmedName}". Please choose a distinct name.` }
      };
    }
  } catch (dupCheckErr) {
    console.warn('Duplicate pre-check notice:', dupCheckErr);
  }

  let chatGroupId = null;
  try {
    const { data: chatGroup, error: chatErr } = await supabase
      .from('groups')
      .insert([{
        name: trimmedName,
        type: 'Team',
        description: `Team chat for ${trimmedName}`,
        privacy,
        max_members: maxMembers,
        members: 1,
        admin_id: leaderId
      }])
      .select('id')
      .single();

    if (!chatErr && chatGroup) {
      chatGroupId = chatGroup.id;
      try {
        await supabase.from('group_members').insert([{
          group_id: chatGroupId,
          profile_id: leaderId
        }]);
      } catch (gmErr) {
        console.warn('Team leader chat membership link notice:', gmErr);
      }
    }
  } catch (e) {
    console.warn('Team chat group provision notice:', e);
  }

  try {
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .insert([{
        name: trimmedName,
        description: description?.trim() || '',
        category,
        skills,
        max_members: Number(maxMembers) || 4,
        current_members: 1,
        privacy,
        status: 'recruiting',
        banner_emoji: bannerEmoji || '🚀',
        banner_url: bannerUrl || null,
        leader_id: leaderId,
        chat_group_id: chatGroupId
      }])
      .select()
      .single();

    if (teamErr) {
      // Rollback chat group if team creation fails
      if (chatGroupId) {
        try {
          await supabase.from('groups').delete().eq('id', chatGroupId);
        } catch (_) {}
      }
      throw teamErr;
    }

    try {
      await supabase.from('team_members').insert([{
        team_id: team.id,
        user_id: leaderId,
        role: 'leader'
      }]);
    } catch (tmErr) {
      console.warn('Team leader link notice:', tmErr);
    }

    return { data: team, error: null };
  } catch (teamErr) {
    if (isTableMissingError(teamErr)) {
      const localTeam = {
        id: `local_team_${Date.now()}`,
        name: trimmedName,
        description: description?.trim() || '',
        category,
        skills,
        max_members: Number(maxMembers) || 4,
        current_members: 1,
        privacy,
        status: 'recruiting',
        banner_emoji: bannerEmoji || '🚀',
        banner_url: bannerUrl || null,
        leader_id: leaderId,
        created_at: new Date().toISOString(),
        chat_group_id: chatGroupId,
        leader: { id: leaderId, name: payload.leaderName || 'You', avatar: '🎓' },
        members: [
          { id: `mem_${Date.now()}`, role: 'leader', user_id: leaderId, profile: { id: leaderId, name: payload.leaderName || 'You', avatar: '🎓' } }
        ]
      };
      const custom = storage.get('groupsync_local_teams', []);
      storage.set('groupsync_local_teams', deduplicateTeams([localTeam, ...custom]));
      return { data: localTeam, error: null, isOffline: true };
    }
    return { data: null, error: teamErr };
  }
}

// ─── GET TEAMS ───────────────────────────────────────────────────────────────

/**
 * Fetch teams with search, filtering, and automated deduplication.
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

    try {
      const { data, error } = await query;
      if (error) {
        if (isTableMissingError(error)) {
          const filtered = filterLocalTeams(getLocalTeams(), filters);
          return { data: deduplicateTeams(filtered), error: null, isOffline: true };
        }
        throw error;
      }

      let filtered = data || [];
      if (skill?.trim()) {
        const targetSkill = skill.trim().toLowerCase();
        filtered = filtered.filter(t => 
          (t.skills || []).some(s => s.toLowerCase().includes(targetSkill))
        );
      }

      // Always deduplicate returned squads so duplicate/replicate groups are never shown
      const deduplicated = deduplicateTeams(filtered);

      return { data: deduplicated, error: null, isOffline: false };
    } catch (err) {
      if (isTableMissingError(err)) {
        const filtered = filterLocalTeams(getLocalTeams(), filters);
        return { data: deduplicateTeams(filtered), error: null, isOffline: true };
      }
      throw err;
    }
  });
}

// ─── GET SINGLE TEAM DETAILS ─────────────────────────────────────────────────

/**
 * Fetch full details for a team: members with badges, applications, invitations.
 */
export async function getTeamDetails(teamId, currentUserId) {
  return withRetry(async () => {
    // If team is local or known sample
    const localTeams = getLocalTeams();
    const foundLocal = localTeams.find(t => t.id === teamId);

    if (String(teamId).startsWith('local_') || (foundLocal && String(teamId).startsWith('team-'))) {
      const team = foundLocal || localTeams[0];
      const members = team.members || [
        { id: 'mem_1', role: 'leader', user_id: team.leader_id, profile: team.leader || { id: team.leader_id, name: 'Leader', avatar: '🎓' } }
      ];
      const applications = storage.get(`groupsync_team_apps_${teamId}`, []);
      const invitations = storage.get(`groupsync_team_invs_${teamId}`, []);
      return {
        data: {
          team,
          members,
          applications,
          invitations
        },
        error: null,
        isOffline: true
      };
    }

    try {
      // 1. Fetch team metadata and leader
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .select(`
          *,
          leader:profiles!leader_id(id, name, avatar, faction, college, branch)
        `)
        .eq('id', teamId)
        .single();

      if (teamErr) {
        if (isTableMissingError(teamErr)) {
          const fallback = foundLocal || localTeams[0];
          return {
            data: {
              team: fallback,
              members: fallback.members || [],
              applications: [],
              invitations: []
            },
            error: null,
            isOffline: true
          };
        }
        throw teamErr;
      }

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

      if (memErr && !isTableMissingError(memErr)) throw memErr;

      // 3. Fetch applications
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

        let apps = [];
        try {
          const { data: fetchedApps } = await appQuery.order('created_at', { ascending: false });
          apps = fetchedApps || [];
        } catch (_) {}
        applications = apps;
      }

      // 4. Fetch invitations
      let invitations = [];
      if (currentUserId && team.leader_id === currentUserId) {
        try {
          const { data: invs } = await supabase
            .from('team_invitations')
            .select(`
              *,
              invitee:profiles!invitee_id(id, name, avatar, faction)
            `)
            .eq('team_id', teamId);
          invitations = invs || [];
        } catch (_) {}
      }

      return {
        data: {
          team,
          members: members || [],
          applications,
          invitations
        },
        error: null,
        isOffline: false
      };
    } catch (err) {
      if (isTableMissingError(err)) {
        const fallback = foundLocal || localTeams[0];
        return {
          data: {
            team: fallback,
            members: fallback.members || [],
            applications: [],
            invitations: []
          },
          error: null,
          isOffline: true
        };
      }
      throw err;
    }
  });
}

// ─── APPLY TO TEAM ───────────────────────────────────────────────────────────

export async function applyToTeam(teamId, applicantId, message, skills = [], leaderId, teamName) {
  return withRetry(async () => {
    try {
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

      if (error) {
        if (isTableMissingError(error)) {
          const apps = storage.get(`groupsync_team_apps_${teamId}`, []);
          const newApp = {
            id: `app_${Date.now()}`,
            team_id: teamId,
            applicant_id: applicantId,
            message: message?.trim() || '',
            skills,
            status: 'pending',
            created_at: new Date().toISOString()
          };
          storage.set(`groupsync_team_apps_${teamId}`, [newApp, ...apps]);
          return { data: newApp, error: null };
        }
        throw error;
      }

      if (leaderId) {
        try {
          await supabase.from('notifications').insert([{
            user_id: leaderId,
            type: 'teams',
            title: 'New Team Application',
            message: `A candidate has applied to join ${teamName || 'your team'}.`,
            icon: 'ℹ️',
            action_label: 'View Application',
            action_path: `/teams/${teamId}`,
            reference_id: teamId
          }]);
        } catch (_) {}
      }

      return { data, error: null };
    } catch (err) {
      if (isTableMissingError(err)) {
        const apps = storage.get(`groupsync_team_apps_${teamId}`, []);
        const newApp = {
          id: `app_${Date.now()}`,
          team_id: teamId,
          applicant_id: applicantId,
          message: message?.trim() || '',
          skills,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        storage.set(`groupsync_team_apps_${teamId}`, [newApp, ...apps]);
        return { data: newApp, error: null };
      }
      throw err;
    }
  });
}

// ─── REVIEW APPLICATION ──────────────────────────────────────────────────────

export async function reviewApplication(applicationId, teamId, applicantId, status, teamName, chatGroupId) {
  return withRetry(async () => {
    try {
      const { error: appErr } = await supabase
        .from('team_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (appErr && !isTableMissingError(appErr)) throw appErr;

      if (status === 'accepted') {
        try {
          await supabase.from('team_members').upsert([{
            team_id: teamId,
            user_id: applicantId,
            role: 'member'
          }], { onConflict: 'team_id,user_id' });
        } catch (_) {}

        if (chatGroupId) {
          try {
            await supabase.from('group_members').upsert([{
              group_id: chatGroupId,
              profile_id: applicantId
            }], { onConflict: 'group_id,profile_id' });
          } catch (_) {}
        }
      }

      return { data: { status }, error: null };
    } catch (err) {
      if (isTableMissingError(err)) {
        const apps = storage.get(`groupsync_team_apps_${teamId}`, []);
        const updated = apps.map(a => a.id === applicationId ? { ...a, status, reviewed_at: new Date().toISOString() } : a);
        storage.set(`groupsync_team_apps_${teamId}`, updated);
        return { data: { status }, error: null };
      }
      throw err;
    }
  });
}

// ─── INVITE MEMBER ───────────────────────────────────────────────────────────

export async function inviteMember(teamId, inviterId, inviteeId, teamName, message) {
  return withRetry(async () => {
    try {
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

      if (error && !isTableMissingError(error)) throw error;
      return { data, error: null };
    } catch (err) {
      if (isTableMissingError(err)) {
        const invs = storage.get(`groupsync_team_invs_${teamId}`, []);
        const newInv = {
          id: `inv_${Date.now()}`,
          team_id: teamId,
          inviter_id: inviterId,
          invitee_id: inviteeId,
          message: message?.trim() || `You're invited to join ${teamName || 'our team'}!`,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        storage.set(`groupsync_team_invs_${teamId}`, [newInv, ...invs]);
        return { data: newInv, error: null };
      }
      throw err;
    }
  });
}

// ─── REMOVE MEMBER ───────────────────────────────────────────────────────────

export async function removeMember(teamId, memberUserId, teamName, chatGroupId) {
  return withRetry(async () => {
    try {
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', memberUserId);

      return { success: true, error: null };
    } catch (e) {
      return { success: true, error: null };
    }
  });
}

// ─── LEAVE TEAM ──────────────────────────────────────────────────────────────

export async function leaveTeam(teamId, userId, leaderId, teamName, chatGroupId) {
  return withRetry(async () => {
    try {
      await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      return { success: true, error: null };
    } catch (e) {
      return { success: true, error: null };
    }
  });
}

// ─── UPDATE TEAM ─────────────────────────────────────────────────────────────

export async function updateTeam(teamId, updates) {
  return withRetry(async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error && !isTableMissingError(error)) throw error;
      return { data, error: null };
    } catch (err) {
      if (isTableMissingError(err)) {
        const localTeams = storage.get('groupsync_local_teams', []);
        const updated = localTeams.map(t => t.id === teamId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t);
        storage.set('groupsync_local_teams', updated);
        return { data: updates, error: null };
      }
      throw err;
    }
  });
}

// ─── DELETE TEAM ─────────────────────────────────────────────────────────────

export async function deleteTeam(teamId, chatGroupId) {
  try {
    try {
      await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
    } catch (_) {}

    if (chatGroupId) {
      try {
        await supabase
          .from('groups')
          .delete()
          .eq('id', chatGroupId);
      } catch (_) {}
    }

    const localTeams = storage.get('groupsync_local_teams', []);
    const remaining = localTeams.filter(t => t.id !== teamId);
    storage.set('groupsync_local_teams', remaining);

    return { success: true, error: null };
  } catch (e) {
    return { success: true, error: null };
  }
}

export default {
  createTeam,
  getTeams,
  getTeamDetails,
  applyToTeam,
  reviewApplication,
  inviteMember,
  removeMember,
  leaveTeam,
  updateTeam,
  deleteTeam,
  deduplicateTeams,
  cleanupDuplicateSquadsForLeader,
  SAMPLE_TEAMS,
  getLocalTeams
};
