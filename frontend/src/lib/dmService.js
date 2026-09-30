/**
 * dmService.js — GroupSync Direct Messaging Service
 * Manages 1-on-1 conversation lifecycles, user discovery, last-message previews,
 * and unread counters, reusing the existing groups (type='DM') and messages infrastructure.
 */
import supabase from './supabase';
import { withRetry } from './withRetry';

// ─── GET OR CREATE DM CONVERSATION ───────────────────────────────────────────

/**
 * Finds an existing DM group between two users or creates a new one.
 * @param {string} currentUserId
 * @param {string} targetUserId
 * @returns {{ data: { groupId, targetUser }, error }}
 */
export async function getOrCreateDM(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) {
    return { data: null, error: { userMessage: 'Invalid participant IDs.' } };
  }

  return withRetry(async () => {
    // 1. Check if a DM group already exists between currentUserId and targetUserId
    const { data: myMemberships, error: myMemErr } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('profile_id', currentUserId);

    if (myMemErr) throw myMemErr;

    if (myMemberships && myMemberships.length > 0) {
      const myGroupIds = myMemberships.map(m => m.group_id);

      const { data: shared, error: sharedErr } = await supabase
        .from('group_members')
        .select('group_id, groups!inner(id, type)')
        .eq('profile_id', targetUserId)
        .eq('groups.type', 'DM')
        .in('group_id', myGroupIds);

      if (!sharedErr && shared && shared.length > 0) {
        const existingGroupId = shared[0].group_id;
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('id, name, avatar, avatar_url, faction, college, branch, location, availability')
          .eq('id', targetUserId)
          .single();

        return {
          data: {
            groupId: existingGroupId,
            targetUser: targetProfile
          },
          error: null
        };
      }
    }

    // 2. No existing DM conversation found — create a new one
    const { data: newGroup, error: grpErr } = await supabase
      .from('groups')
      .insert([{
        name: 'Direct Message',
        type: 'DM',
        description: '1-on-1 conversation',
        privacy: 'private',
        max_members: 2,
        members: 2,
        admin_id: currentUserId
      }])
      .select()
      .single();

    if (grpErr) throw grpErr;

    // 3. Add both participants to group_members
    await supabase.from('group_members').insert([
      { group_id: newGroup.id, profile_id: currentUserId },
      { group_id: newGroup.id, profile_id: targetUserId }
    ]);

    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, name, avatar, avatar_url, faction, college, branch, location, availability')
      .eq('id', targetUserId)
      .single();

    return {
      data: {
        groupId: newGroup.id,
        targetUser: targetProfile
      },
      error: null
    };
  });
}

// ─── GET CONVERSATIONS LIST ──────────────────────────────────────────────────

/**
 * Fetches all DM conversations for a user with last message preview and other participant details.
 * @param {string} currentUserId
 */
export async function getDMConversations(currentUserId) {
  if (!currentUserId) return { data: [], error: null };

  return withRetry(async () => {
    // 1. Find all DM groups currentUserId belongs to
    const { data: memberships, error: memErr } = await supabase
      .from('group_members')
      .select(`
        group_id,
        groups!inner(id, type, created_at, group_members(profile_id, profile:profiles(id, name, avatar, avatar_url, faction, availability)))
      `)
      .eq('profile_id', currentUserId)
      .eq('groups.type', 'DM');

    if (memErr) throw memErr;

    const conversations = [];

    // 2. For each conversation, get other user & last message
    for (const item of (memberships || [])) {
      const grp = item.groups;
      if (!grp) continue;

      const otherMember = (grp.group_members || []).find(m => m.profile_id !== currentUserId);
      const otherUser = otherMember?.profile || { name: 'Student', avatar: '🎓' };

      // Fetch last message
      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('id, text, created_at, sender_id, message_type, is_deleted')
        .eq('group_id', grp.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const lastMsg = lastMsgs?.[0] || null;

      // Check read receipts for unread indicator
      let isUnread = false;
      if (lastMsg && lastMsg.sender_id !== currentUserId) {
        const { data: readRec } = await supabase
          .from('read_receipts')
          .select('last_read_message_id')
          .eq('chat_id', grp.id)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (!readRec || (readRec.last_read_message_id && readRec.last_read_message_id < lastMsg.id)) {
          isUnread = true;
        }
      }

      conversations.push({
        groupId: grp.id,
        targetUser: otherUser,
        lastMessage: lastMsg?.is_deleted ? 'Message deleted' : (lastMsg?.text || (lastMsg?.message_type === 'image' ? '📷 Image' : (lastMsg?.message_type === 'file' ? '📎 File' : 'No messages yet'))),
        lastMessageTime: lastMsg?.created_at || grp.created_at,
        lastMessageSenderId: lastMsg?.sender_id,
        isUnread
      });
    }

    // Sort by latest activity
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return { data: conversations, error: null };
  });
}

// ─── SEARCH USERS FOR DM ─────────────────────────────────────────────────────

/**
 * Search active students to start a new direct message conversation.
 * @param {string} currentUserId
 * @param {string} search
 */
export async function searchUsersForDM(currentUserId, search) {
  if (!search?.trim()) return { data: [], error: null };

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, avatar_url, faction, college, branch, availability')
      .neq('id', currentUserId)
      .ilike('name', `%${search.trim()}%`)
      .limit(10);

    if (error) throw error;
    return { data: data || [], error: null };
  });
}
