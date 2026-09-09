/**
 * chatService.js — GroupSync Chat Operations
 * All chat DB operations with auto-retry, error normalization, and offline support.
 *
 * Retry strategy: 3 attempts, exponential backoff (400ms → 800ms → 1600ms)
 * Optimistic updates: callers are responsible for immediate UI updates
 */
import supabase from './supabase';
import { withRetry } from './withRetry';

const MESSAGES_PAGE_SIZE = 50;
const OFFLINE_QUEUE_KEY = 'groupsync_offline_message_queue';

// ─── OFFLINE QUEUE HELPERS ────────────────────────────────────────────────────

/** Load queued offline messages from localStorage */
export function loadOfflineQueue() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Save a message to the offline queue */
export function enqueueOfflineMessage(msg) {
  const queue = loadOfflineQueue();
  queue.push({ ...msg, queuedAt: Date.now() });
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/** Remove a message from the offline queue by its tempId */
export function dequeueOfflineMessage(tempId) {
  const queue = loadOfflineQueue().filter(m => m.tempId !== tempId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/** Clear the entire offline queue */
export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// ─── MESSAGE LOADING ──────────────────────────────────────────────────────────

/**
 * Load a page of messages for a chat group.
 * Returns messages in ascending order (oldest → newest).
 * For page > 1, pass `before` (the created_at of the oldest currently loaded message)
 * to load older messages.
 *
 * @param {number} groupId - The group/chat ID
 * @param {object} [options]
 * @param {string} [options.before] - ISO timestamp: load messages created before this
 * @param {number} [options.limit] - Messages per page (default: 50)
 */
export async function loadMessages(groupId, { before, limit = MESSAGES_PAGE_SIZE } = {}) {
  return withRetry(async () => {
    let query = supabase
      .from('messages')
      .select(`
        id,
        group_id,
        sender_id,
        text,
        media,
        message_type,
        file_url,
        file_name,
        file_size,
        is_edited,
        is_deleted,
        edited_at,
        reply_to_id,
        created_at,
        sender:profiles!sender_id(id, name, avatar, faction)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const result = await query;
    if (result.error) return result;

    // Reverse so messages display oldest → newest
    const messages = (result.data || []).reverse();
    return { data: messages, error: null };
  });
}

// ─── SEND MESSAGE ─────────────────────────────────────────────────────────────

/**
 * Send a text or file message to a group chat.
 * Callers should apply optimistic updates before calling this.
 *
 * @param {object} payload
 * @param {number} payload.groupId - Target group/chat
 * @param {string} payload.senderId - Sender's user ID
 * @param {string} [payload.text] - Message text
 * @param {string} [payload.messageType] - 'text' | 'image' | 'file'
 * @param {string} [payload.fileUrl] - Storage public URL (after upload)
 * @param {string} [payload.fileName] - Original file name
 * @param {number} [payload.fileSize] - File size in bytes
 * @param {object} [payload.media] - Legacy JSONB media (for backward compat)
 * @param {number} [payload.replyToId] - ID of message being replied to
 */
export async function sendMessage(payload) {
  const { groupId, senderId, text, messageType = 'text', fileUrl, fileName, fileSize, media, replyToId } = payload;

  return withRetry(() =>
    supabase.from('messages').insert([{
      group_id: groupId,
      sender_id: senderId,
      text: text || null,
      message_type: messageType,
      file_url: fileUrl || null,
      file_name: fileName || null,
      file_size: fileSize || null,
      media: media || null,
      reply_to_id: replyToId || null,
    }]).select('id').single()
  );
}

// ─── FILE UPLOAD ──────────────────────────────────────────────────────────────

/**
 * Upload a file to Supabase Storage for chat.
 * Shows upload progress via onProgress callback.
 *
 * @param {number} chatId - The chat group ID (for folder structure)
 * @param {string} userId - Uploader's user ID
 * @param {File} file - The File object to upload
 * @param {Function} [onProgress] - (percent: number) => void
 * @returns {{ data: { publicUrl, fileName, fileSize }, error }}
 */
export async function uploadChatFile(chatId, userId, file, onProgress) {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return { data: null, error: { userMessage: 'File too large (10MB max)', retryable: false } };
  }

  const ext = file.name.split('.').pop();
  const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `chat-${chatId}/${userId}/${safeFileName}`;

  try {
    onProgress?.(10); // Start progress

    const { data, error } = await supabase.storage
      .from('chat-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { data: null, error: { userMessage: 'File upload failed. Please try again.', retryable: true, raw: error } };
    }

    onProgress?.(90);
    const { data: urlData } = supabase.storage.from('chat-files').getPublicUrl(path);
    onProgress?.(100);

    return {
      data: {
        publicUrl: urlData.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        isImage: file.type.startsWith('image/'),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: { userMessage: 'Upload failed. Check your connection.', retryable: true, raw: err } };
  }
}

// ─── EDIT MESSAGE ─────────────────────────────────────────────────────────────

/**
 * Edit a message's text content.
 * Only allowed within 5 minutes of original send time.
 *
 * @param {number} messageId - ID of message to edit
 * @param {string} senderId - Must match message's sender_id (enforced by RLS)
 * @param {string} newText - New content
 * @param {string} createdAt - Original message created_at (to enforce 5-min window)
 */
export async function editMessage(messageId, senderId, newText, createdAt) {
  // Enforce 5-minute edit window client-side (RLS enforces ownership)
  const ageMs = Date.now() - new Date(createdAt).getTime();
  if (ageMs > 5 * 60 * 1000) {
    return { data: null, error: { userMessage: 'Messages can only be edited within 5 minutes of sending.', retryable: false } };
  }

  if (!newText?.trim()) {
    return { data: null, error: { userMessage: 'Message cannot be empty.', retryable: false } };
  }

  if (newText.length > 5000) {
    return { data: null, error: { userMessage: 'Message too long (5000 char limit).', retryable: false } };
  }

  return withRetry(() =>
    supabase
      .from('messages')
      .update({ text: newText.trim(), is_edited: true, edited_at: new Date().toISOString() })
      .eq('id', messageId)
      .eq('sender_id', senderId) // RLS double-check
  );
}

// ─── DELETE MESSAGE (soft) ────────────────────────────────────────────────────

/**
 * Soft-delete a message (sets is_deleted=true).
 * Only the sender can delete (RLS enforced).
 *
 * @param {number} messageId
 * @param {string} senderId
 */
export async function deleteMessage(messageId, senderId) {
  return withRetry(() =>
    supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('sender_id', senderId)
  );
}

// ─── REACTIONS ────────────────────────────────────────────────────────────────

/**
 * Fetch all reactions for a list of message IDs.
 * Returns a map: { [messageId]: { [emoji]: [{ user_id, profiles }] } }
 *
 * @param {number[]} messageIds
 */
export async function fetchReactions(messageIds) {
  if (!messageIds.length) return { data: {}, error: null };

  const { data, error } = await supabase
    .from('message_reactions')
    .select('message_id, emoji, user_id, reactor:profiles!user_id(id, name, avatar)')
    .in('message_id', messageIds);

  if (error) return { data: {}, error };

  // Group by messageId → emoji → array of reactors
  const map = {};
  for (const row of (data || [])) {
    if (!map[row.message_id]) map[row.message_id] = {};
    if (!map[row.message_id][row.emoji]) map[row.message_id][row.emoji] = [];
    map[row.message_id][row.emoji].push({ userId: row.user_id, reactor: row.reactor });
  }
  return { data: map, error: null };
}

/**
 * Add a reaction to a message.
 * If duplicate (same user+emoji+message), Supabase will return a 23505 error
 * which is treated as a non-retryable (already reacted).
 */
export async function addReaction(messageId, userId, emoji) {
  return withRetry(() =>
    supabase.from('message_reactions').insert([{ message_id: messageId, user_id: userId, emoji }])
  );
}

/**
 * Remove a reaction from a message.
 */
export async function removeReaction(messageId, userId, emoji) {
  return withRetry(() =>
    supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)
  );
}

// ─── READ RECEIPTS ────────────────────────────────────────────────────────────

/**
 * Mark a chat as read by a user.
 * Upserts a read_receipts record with the latest message ID.
 *
 * @param {number} chatId
 * @param {string} userId
 * @param {number} lastMessageId - ID of the most recent visible message
 */
export async function markChatRead(chatId, userId, lastMessageId) {
  return withRetry(() =>
    supabase.from('read_receipts').upsert({
      chat_id: chatId,
      user_id: userId,
      last_read_message_id: lastMessageId,
      last_read_at: new Date().toISOString(),
    }, { onConflict: 'chat_id,user_id' })
  );
}

/**
 * Get read receipts for a chat.
 * Returns an array of { userId, lastReadMessageId, lastReadAt, profile }
 *
 * @param {number} chatId
 */
export async function getReadReceipts(chatId) {
  const { data, error } = await supabase
    .from('read_receipts')
    .select('user_id, last_read_message_id, last_read_at, reader:profiles!user_id(id, name, avatar)')
    .eq('chat_id', chatId);

  if (error) return { data: [], error };

  return {
    data: (data || []).map(r => ({
      userId: r.user_id,
      lastReadMessageId: r.last_read_message_id,
      lastReadAt: r.last_read_at,
      reader: r.reader,
    })),
    error: null,
  };
}

// ─── MESSAGE SEARCH ───────────────────────────────────────────────────────────

/**
 * Search messages in a chat by keyword (case-insensitive).
 * Returns up to 30 matching messages with context.
 *
 * @param {number} groupId
 * @param {string} query - Search keyword
 */
export async function searchMessages(groupId, query) {
  if (!query?.trim()) return { data: [], error: null };

  return withRetry(async () => {
    const result = await supabase
      .from('messages')
      .select('id, text, created_at, sender_id, sender:profiles!sender_id(id, name, avatar)')
      .eq('group_id', groupId)
      .eq('is_deleted', false)
      .ilike('text', `%${query.trim()}%`)
      .order('created_at', { ascending: false })
      .limit(30);

    return result;
  });
}

// ─── NORMALIZE MESSAGE ────────────────────────────────────────────────────────

/**
 * Normalize a raw Supabase message row to the UI message object shape.
 * Used by both initial load and realtime INSERT handler.
 */
export function normalizeMessage(m) {
  return {
    id: m.id,
    groupId: m.group_id,
    text: m.text,
    senderId: m.sender_id,
    messageType: m.message_type || 'text',
    fileUrl: m.file_url,
    fileName: m.file_name,
    fileSize: m.file_size,
    // Legacy JSONB media field for backward compat
    media: m.media || null,
    isEdited: m.is_edited || false,
    isDeleted: m.is_deleted || false,
    editedAt: m.edited_at,
    replyToId: m.reply_to_id,
    createdAt: m.created_at,
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    reactions: {}, // populated separately by fetchReactions
    sender: m.sender || null,
  };
}
