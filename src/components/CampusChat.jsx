import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Hash, Paperclip, Smile, Archive, Slash, Send, Reply,
  X, ChevronDown, Image, File, Search, Loader2, User, Edit2, Trash2,
  Check, CheckCheck, AlertCircle, RefreshCw, WifiOff, ChevronUp, MoreHorizontal
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import supabase from '../lib/supabase';
import PublicProfileView from './PublicProfileView';
import {
  loadMessages, sendMessage, editMessage, deleteMessage,
  addReaction, removeReaction, fetchReactions, markChatRead,
  getReadReceipts, searchMessages, normalizeMessage,
  uploadChatFile, enqueueOfflineMessage, dequeueOfflineMessage,
  loadOfflineQueue
} from '../lib/chatService';

// ─── Constants ────────────────────────────────────────────────────────────────
const MESSAGES_PAGE_SIZE = 50;
const MAX_MESSAGE_LENGTH = 5000;
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '😢', '🔥'];

// ─── Temp ID helper ────────────────────────────────────────────────────────────
const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Emoji Categories ─────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = {
  '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤔','🤐','😐','😑','😶','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','😈'],
  '👋 Gestures': ['👋','🤚','🖐️','✋','🖖','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🤝','🙏'],
  '❤️ Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'],
  '🎉 Celebration': ['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🥈','🥉','🎖️','🏅','🎭','🎨','🎬','🎤'],
  '💻 Tech': ['💻','🖥️','📱','⌨️','🖱️','💾','📀','📊','📈','📉','🔭','🔬','💡','🔋','🔌'],
};

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = search
    ? Object.values(EMOJI_CATEGORIES).flat().filter(e => e.includes(search)).slice(0, 40)
    : EMOJI_CATEGORIES[activeCategory] || [];

  return (
    <div ref={ref} className="absolute bottom-full left-0 mb-2 w-80 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl shadow-2xl z-30 overflow-hidden">
      <div className="p-3 border-b border-[var(--color-gs-border)]">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search emoji..." autoFocus
          className="w-full bg-[var(--color-gs-bg)] rounded-xl px-3 py-2 text-sm outline-none text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]" />
      </div>
      {!search && (
        <div className="flex gap-1 px-3 py-2 border-b border-[var(--color-gs-border)] overflow-x-auto">
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={"px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors " +
                (activeCategory === cat ? 'bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)]' : 'text-[var(--color-gs-text-muted)] hover:bg-[var(--color-gs-bg)]')}>
              {cat.split(' ')[0]}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-8 gap-0.5 p-3 max-h-48 overflow-y-auto">
        {filtered.map((emoji, i) => (
          <button key={i} onClick={() => { onSelect(emoji); onClose(); }}
            className="text-xl p-1.5 rounded-lg hover:bg-[var(--color-gs-bg)] transition-colors hover:scale-125">
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Read Receipt Ticks ────────────────────────────────────────────────────────
function ReadTicks({ msgId, senderId, currentUserId, readReceipts, isOptimistic }) {
  if (senderId !== currentUserId) return null; // Only show for own messages
  if (isOptimistic) return <Check size={12} className="text-[var(--color-gs-text-muted)]" />;

  const readers = readReceipts.filter(r => r.userId !== currentUserId && r.lastReadMessageId >= msgId);
  const isRead = readers.length > 0;
  const readAt = isRead ? new Date(readers[0].lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  if (isRead) {
    return (
      <span title={`Read at ${readAt}`} className="cursor-default">
        <CheckCheck size={12} className="text-[var(--color-gs-cyan)]" />
      </span>
    );
  }
  return <CheckCheck size={12} className="text-[var(--color-gs-text-muted)]" />;
}

// ─── Message Context Menu ──────────────────────────────────────────────────────
function MessageMenu({ msg, currentUserId, onEdit, onDelete, onReply, onClose }) {
  const isOwn = msg.senderId === currentUserId;
  const ageMs = Date.now() - new Date(msg.createdAt).getTime();
  const canEdit = isOwn && ageMs <= 5 * 60 * 1000 && !msg.isDeleted;
  const canDelete = isOwn && !msg.isDeleted;
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-40 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl shadow-2xl py-1 min-w-[140px]"
      style={{ top: '100%', right: 0 }}>
      <button onClick={() => { onReply(); onClose(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-gs-text-main)] hover:bg-[var(--color-gs-bg)] transition-colors">
        <Reply size={14} /> Reply
      </button>
      {canEdit && (
        <button onClick={() => { onEdit(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-gs-text-main)] hover:bg-[var(--color-gs-bg)] transition-colors">
          <Edit2 size={14} /> Edit
        </button>
      )}
      {canDelete && (
        <button onClick={() => { onDelete(); onClose(); }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={14} /> Delete
        </button>
      )}
    </div>
  );
}

// ─── File Upload Progress ─────────────────────────────────────────────────────
function UploadProgress({ progress, error, onRetry }) {
  return (
    <div className="mb-2 px-3 py-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl text-xs">
      {error ? (
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle size={12} />
          <span>{error}</span>
          {onRetry && <button onClick={onRetry} className="ml-auto flex items-center gap-1 hover:text-red-300"><RefreshCw size={10} /> Retry</button>}
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-[var(--color-gs-text-muted)] mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-[var(--color-gs-border)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-gs-cyan)] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Search Results Panel ─────────────────────────────────────────────────────
function SearchPanel({ results, query, onJumpTo, onClose, isLoading }) {
  const highlight = (text) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-[var(--color-gs-cyan)]/30 text-[var(--color-gs-cyan)] rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-gs-border)] sticky top-0 bg-[var(--color-gs-card)]">
        <span className="text-xs text-[var(--color-gs-text-muted)]">
          {isLoading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
        </span>
        <button onClick={onClose} className="text-[var(--color-gs-text-muted)] hover:text-red-400 transition-colors">
          <X size={14} />
        </button>
      </div>
      {isLoading && <div className="p-4 flex justify-center"><Loader2 size={20} className="animate-spin text-[var(--color-gs-cyan)]" /></div>}
      {!isLoading && results.length === 0 && query && (
        <div className="p-4 text-center text-sm text-[var(--color-gs-text-muted)]">No messages found for "{query}"</div>
      )}
      {results.map(r => (
        <button key={r.id} onClick={() => onJumpTo(r.id)}
          className="w-full text-left px-4 py-3 hover:bg-[var(--color-gs-bg)] transition-colors border-b border-[var(--color-gs-border)]/50 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[var(--color-gs-cyan)]">{r.sender?.name || 'Unknown'}</span>
            <span className="text-[10px] text-[var(--color-gs-text-muted)]">
              {new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-sm text-[var(--color-gs-text-main)] line-clamp-2">{highlight(r.text)}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Offline Banner ────────────────────────────────────────────────────────────
function OfflineBanner({ queuedCount }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-amber-400 text-xs">
      <WifiOff size={12} />
      <span>You are offline.{queuedCount > 0 ? ` ${queuedCount} message${queuedCount > 1 ? 's' : ''} queued.` : ' Messages will be sent when you reconnect.'}</span>
    </div>
  );
}

// ─── Main CampusChat ───────────────────────────────────────────────────────────
export default function CampusChat() {
  const { user, students, factions, showToast, groups, refreshGroups } = useAppContext();
  const [activeChat, setActiveChat] = useState('general');
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [typingTimer, setTypingTimer] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ general: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileViewUser, setProfileViewUser] = useState(null);

  // ── Message state ────────────────────────────────────────────────────────────
  const [generalMessages, setGeneralMessages] = useState([]);
  const [dmMessages, setDmMessages] = useState({});
  const [dmGroupMap, setDmGroupMap] = useState({}); // { groupId: otherUserId }

  // ── Pagination ───────────────────────────────────────────────────────────────
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [contextMenuMsgId, setContextMenuMsgId] = useState(null);

  // ── Reactions (DB-backed) ─────────────────────────────────────────────────────
  const [reactions, setReactions] = useState({}); // { messageId: { emoji: [{ userId, reactor }] } }

  // ── Read receipts ────────────────────────────────────────────────────────────
  const [readReceipts, setReadReceipts] = useState([]); // [{ userId, lastReadMessageId, lastReadAt }]

  // ── File upload ──────────────────────────────────────────────────────────────
  const [uploadProgress, setUploadProgress] = useState(null); // null | { progress, error }

  // ── Search ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const searchDebounceRef = useRef(null);

  // ── Offline ──────────────────────────────────────────────────────────────────
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(loadOfflineQueue());

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const editInputRef = useRef(null);
  const messageRefs = useRef({}); // { msgId: DOM element }
  const oldestMsgCreatedAtRef = useRef(null);

  // ─── Online/Offline detection ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-send queued messages
      const queue = loadOfflineQueue();
      if (queue.length > 0 && activeGroupId && user?.id) {
        queue.forEach(async (qMsg) => {
          const { error } = await sendMessage({
            groupId: qMsg.groupId,
            senderId: user.id,
            text: qMsg.text,
          });
          if (!error) dequeueOfflineMessage(qMsg.tempId);
        });
        setOfflineQueue([]);
      }
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeGroupId, user?.id]);

  // ─── Resolve general group ID ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const resolveGeneralGroupId = async () => {
      if (activeChat !== 'general') return;
      let generalGroupId = null;
      let g = (groups || []).find(g => g.type === 'General' || g.name === 'Campus General');
      if (g) {
        generalGroupId = g.id;
      } else {
        const { data } = await supabase.from('groups').select('id').eq('type', 'General').maybeSingle();
        if (data) {
          generalGroupId = data.id;
        } else {
          const { data: newG } = await supabase.from('groups').insert({
            name: 'Campus General', type: 'General', description: 'Global campus chat',
            privacy: 'public', max_members: 9999, members: 0, admin_id: user?.id
          }).select().single();
          if (newG) generalGroupId = newG.id;
        }
      }
      if (!isMounted || !generalGroupId) return;
      setActiveGroupId(generalGroupId);
      if (user?.id) {
        await supabase.from('group_members').upsert(
          { group_id: generalGroupId, profile_id: user.id },
          { onConflict: 'group_id,profile_id', ignoreDuplicates: true }
        );
      }
    };
    if (user && groups) resolveGeneralGroupId();
    return () => { isMounted = false; };
  }, [activeChat, groups, user]);

  // ─── Handle selecting a DM chat ───────────────────────────────────────────────
  const handleSelectChat = async (targetId) => {
    setActiveChat(targetId);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setHasMoreMessages(true);
    oldestMsgCreatedAtRef.current = null;

    if (targetId === 'general') return;

    try {
      const { data: myMemberships } = await supabase
        .from('group_members').select('group_id').eq('profile_id', user?.id);
      if (myMemberships?.length > 0) {
        const myGroupIds = myMemberships.map(m => m.group_id);
        const { data: sharedGroups } = await supabase
          .from('group_members')
          .select('group_id, groups!inner(id, type)')
          .eq('profile_id', targetId)
          .eq('groups.type', 'DM')
          .in('group_id', myGroupIds);
        if (sharedGroups?.length > 0) {
          const existingGroupId = sharedGroups[0].group_id;
          setActiveGroupId(existingGroupId);
          setDmGroupMap(prev => ({ ...prev, [existingGroupId]: targetId }));
          return;
        }
      }
      const { data: insertedGroup, error: groupErr } = await supabase
        .from('groups').insert({
          name: 'DM', type: 'DM', description: 'Direct Message',
          privacy: 'private', max_members: 2, members: 2, admin_id: user?.id
        }).select().single();
      if (groupErr) throw groupErr;
      if (insertedGroup) {
        await supabase.from('group_members').insert([
          { group_id: insertedGroup.id, profile_id: user?.id },
          { group_id: insertedGroup.id, profile_id: targetId }
        ]);
        setDmGroupMap(prev => ({ ...prev, [insertedGroup.id]: targetId }));
        setActiveGroupId(insertedGroup.id);
        if (refreshGroups) refreshGroups();
      }
    } catch (err) {
      console.error('[Chat] Error resolving DM group:', err);
    }
  };

  // ─── Typing Presence Channel ──────────────────────────────────────────────────
  useEffect(() => {
    if (!activeGroupId || !user?.id) return;
    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
      presenceChannelRef.current = null;
    }
    const channel = supabase.channel(`typing:${activeGroupId}`, {
      config: { presence: { key: user.id } },
    });
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typingNow = [];
      for (const [uid, presences] of Object.entries(state)) {
        if (uid === user.id) continue;
        const latest = presences[presences.length - 1];
        if (latest?.typing) typingNow.push({ userId: uid, name: latest.name || 'Someone' });
      }
      setTypingUsers(typingNow);
    }).subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ typing: false, name: user.name });
      }
    });
    presenceChannelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      presenceChannelRef.current = null;
      setTypingUsers([]);
    };
  }, [activeGroupId, user?.id, user?.name]);

  const broadcastTyping = useCallback((isTyping) => {
    if (!presenceChannelRef.current) return;
    presenceChannelRef.current.track({ typing: isTyping, name: user?.name || 'Someone' });
  }, [user?.name]);

  // ─── DM Group Map Builder ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    const buildDmGroupMap = async () => {
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id, groups(id, type, group_members(profile_id))')
        .eq('profile_id', user.id);
      if (!isMounted || !memberRows) return;
      const map = {};
      for (const row of memberRows) {
        const grp = row.groups;
        if (!grp || grp.type !== 'DM') continue;
        const members = grp.group_members?.map(m => m.profile_id) || [];
        if (members.length !== 2) continue;
        const otherId = members.find(id => id !== user.id);
        if (otherId) map[grp.id] = otherId;
      }
      if (isMounted) setDmGroupMap(map);
    };
    buildDmGroupMap();
    return () => { isMounted = false; };
  }, [user?.id, groups]);

  // ─── Subscribe to DM messages globally ───────────────────────────────────────
  useEffect(() => {
    if (!user?.id || Object.keys(dmGroupMap).length === 0) return;
    const groupIds = Object.keys(dmGroupMap).map(Number);
    const channel = supabase.channel(`dm-global:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newM = payload.new;
        const groupIdNum = Number(newM.group_id);
        if (!groupIds.includes(groupIdNum)) return;
        const otherUserId = dmGroupMap[groupIdNum];
        if (!otherUserId) return;
        const { data: fullMsg } = await supabase
          .from('messages')
          .select('*, sender:profiles!sender_id(id, name, avatar, faction)')
          .eq('id', newM.id).single();
        if (!fullMsg) return;
        const mapped = normalizeMessage(fullMsg);
        setDmMessages(prev => {
          const existing = prev[otherUserId] || [];
          if (existing.find(msg => msg.id === mapped.id)) return prev;
          const withoutTemp = existing.filter(msg =>
            !(String(msg.id).startsWith('temp-') && msg.senderId === mapped.senderId && msg.text === mapped.text)
          );
          return { ...prev, [otherUserId]: [...withoutTemp, mapped] };
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, dmGroupMap]);

  // ─── Load initial messages + reactions + read receipts ────────────────────────
  const doFetchMessages = useCallback(async (groupId, replace = true) => {
    if (!groupId) return;
    if (replace) setIsInitialLoading(true);
    else setIsLoadingMore(true);

    const opts = replace ? {} : { before: oldestMsgCreatedAtRef.current };
    const { data: msgs, error } = await loadMessages(groupId, opts);

    if (replace) setIsInitialLoading(false);
    else setIsLoadingMore(false);

    if (error) {
      console.error('[Chat] Load messages error:', error);
      return;
    }

    const normalized = (msgs || []).map(normalizeMessage);

    if (normalized.length < MESSAGES_PAGE_SIZE) setHasMoreMessages(false);
    else setHasMoreMessages(true);

    if (normalized.length > 0) {
      oldestMsgCreatedAtRef.current = normalized[0].createdAt;
    }

    const setter = activeChat === 'general' ? setGeneralMessages : (fn) => setDmMessages(prev => ({
      ...prev, [activeChat]: fn(prev[activeChat] || [])
    }));

    if (replace) {
      if (activeChat === 'general') setGeneralMessages(normalized);
      else setDmMessages(prev => ({ ...prev, [activeChat]: normalized }));
    } else {
      if (activeChat === 'general') setGeneralMessages(prev => [...normalized, ...prev]);
      else setDmMessages(prev => ({ ...prev, [activeChat]: [...normalized, ...(prev[activeChat] || [])] }));
    }

    // Fetch reactions for all loaded messages
    const msgIds = normalized.map(m => m.id);
    if (msgIds.length > 0) {
      const { data: reactionsMap } = await fetchReactions(msgIds);
      if (reactionsMap) setReactions(prev => ({ ...prev, ...reactionsMap }));
    }

    // Fetch read receipts
    const { data: receipts } = await getReadReceipts(groupId);
    if (receipts) setReadReceipts(receipts);

    // Mark chat as read
    if (normalized.length > 0 && user?.id) {
      const lastMsgId = normalized[normalized.length - 1].id;
      markChatRead(groupId, user.id, lastMsgId).catch(() => {});
    }
  }, [activeChat, user?.id]);

  useEffect(() => {
    if (!activeGroupId) return;
    setHasMoreMessages(true);
    oldestMsgCreatedAtRef.current = null;
    doFetchMessages(activeGroupId, true);
  }, [activeGroupId]);

  // ─── Load more (infinite scroll) ─────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (!activeGroupId || isLoadingMore || !hasMoreMessages) return;
    const scrollEl = chatAreaRef.current;
    const prevScrollHeight = scrollEl?.scrollHeight || 0;

    await doFetchMessages(activeGroupId, false);

    // Restore scroll position after prepending older messages
    if (scrollEl) {
      const newScrollHeight = scrollEl.scrollHeight;
      scrollEl.scrollTop = newScrollHeight - prevScrollHeight;
    }
  }, [activeGroupId, isLoadingMore, hasMoreMessages, doFetchMessages]);

  // ─── General Chat Realtime subscription ──────────────────────────────────────
  useEffect(() => {
    if (activeChat !== 'general' || !activeGroupId) return;

    const channel = supabase
      .channel(`campus-chat:${activeGroupId}`)
      // New messages
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroupId}` }, async (payload) => {
        const { data: fullMsg } = await supabase
          .from('messages')
          .select('*, sender:profiles!sender_id(id, name, avatar, faction)')
          .eq('id', payload.new.id).single();
        if (!fullMsg) return;
        const mapped = normalizeMessage(fullMsg);
        setGeneralMessages(prev => {
          if (prev.find(msg => msg.id === mapped.id)) return prev;
          const withoutTemp = prev.filter(msg =>
            !(String(msg.id).startsWith('temp-') && msg.senderId === mapped.senderId && msg.text === mapped.text)
          );
          return [...withoutTemp, mapped];
        });
        // Auto-mark as read if at bottom
        if (!showScrollBtn && user?.id) {
          markChatRead(activeGroupId, user.id, fullMsg.id).catch(() => {});
        }
      })
      // Edits & soft-deletes
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `group_id=eq.${activeGroupId}` }, (payload) => {
        const updated = payload.new;
        const patchMsg = (prev) => prev.map(m => m.id === updated.id ? {
          ...m,
          text: updated.text,
          isEdited: updated.is_edited,
          isDeleted: updated.is_deleted,
          editedAt: updated.edited_at,
        } : m);
        setGeneralMessages(patchMsg);
      })
      // Reactions
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message_reactions' }, async (payload) => {
        const r = payload.new;
        const { data: profile } = await supabase.from('profiles').select('id, name, avatar').eq('id', r.user_id).single();
        setReactions(prev => {
          const msgReactions = { ...(prev[r.message_id] || {}) };
          if (!msgReactions[r.emoji]) msgReactions[r.emoji] = [];
          if (!msgReactions[r.emoji].find(x => x.userId === r.user_id)) {
            msgReactions[r.emoji] = [...msgReactions[r.emoji], { userId: r.user_id, reactor: profile }];
          }
          return { ...prev, [r.message_id]: msgReactions };
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'message_reactions' }, (payload) => {
        const r = payload.old;
        setReactions(prev => {
          const msgReactions = { ...(prev[r.message_id] || {}) };
          if (msgReactions[r.emoji]) {
            msgReactions[r.emoji] = msgReactions[r.emoji].filter(x => x.userId !== r.user_id);
            if (msgReactions[r.emoji].length === 0) delete msgReactions[r.emoji];
          }
          return { ...prev, [r.message_id]: msgReactions };
        });
      })
      // Read receipts
      .on('postgres_changes', { event: '*', schema: 'public', table: 'read_receipts', filter: `chat_id=eq.${activeGroupId}` }, async () => {
        const { data: receipts } = await getReadReceipts(activeGroupId);
        if (receipts) setReadReceipts(receipts);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChat, activeGroupId, showScrollBtn, user?.id]);

  // ─── Auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [generalMessages, dmMessages, activeChat]);

  const handleScroll = () => {
    const el = chatAreaRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    // Trigger load more when near top
    if (el.scrollTop < 100 && hasMoreMessages && !isLoadingMore) {
      handleLoadMore();
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  };

  // ─── Jump to message (from search) ──────────────────────────────────────────
  const jumpToMessage = useCallback((msgId) => {
    setHighlightedMsgId(msgId);
    setShowSearch(false);
    setTimeout(() => {
      const el = messageRefs.current[msgId];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    setTimeout(() => setHighlightedMsgId(null), 2500);
  }, []);

  // ─── Search ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim() || !activeGroupId) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await searchMessages(activeGroupId, searchQuery);
      setSearchResults(data || []);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery, activeGroupId]);

  // ─── Send Message ─────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim() && !pendingFile) return;
    if (!user) { showToast('Please sign in to chat', 'error'); return; }
    if (!activeGroupId) { showToast('Chat still initializing...', 'error'); return; }
    if (inputVal.length > MAX_MESSAGE_LENGTH) { showToast(`Message too long (${MAX_MESSAGE_LENGTH} char limit)`, 'error'); return; }

    const msgTempId = tempId();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isImageFile = pendingFile?.type?.startsWith('image/');

    // Build optimistic message
    const optimisticMsg = {
      id: msgTempId,
      text: inputVal,
      senderId: user.id,
      timestamp: nowStr,
      createdAt: new Date().toISOString(),
      messageType: pendingFile ? (isImageFile ? 'image' : 'file') : 'text',
      fileUrl: mediaPreview?.type === 'image' ? mediaPreview.url : null,
      fileName: pendingFile?.name || null,
      fileSize: pendingFile?.size || null,
      media: mediaPreview
        ? (mediaPreview.type === 'image'
            ? { type: 'image', url: mediaPreview.url, name: mediaPreview.name }
            : { type: 'file', name: mediaPreview.name, size: mediaPreview.size })
        : null,
      isEdited: false,
      isDeleted: false,
      replyToId: replyTo?.id || null,
      reactions: {},
      sender: user,
      _optimistic: true,
    };

    // Offline handling
    if (isOffline) {
      enqueueOfflineMessage({ tempId: msgTempId, groupId: activeGroupId, text: inputVal });
      setOfflineQueue(loadOfflineQueue());
      const offlineMsg = { ...optimisticMsg, _offline: true };
      if (activeChat === 'general') setGeneralMessages(prev => [...prev, offlineMsg]);
      else setDmMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), offlineMsg] }));
      setInputVal(''); setReplyTo(null); setPendingFile(null); setMediaPreview(null);
      return;
    }

    // Optimistic append
    if (activeChat === 'general') setGeneralMessages(prev => [...prev, optimisticMsg]);
    else setDmMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), optimisticMsg] }));

    const sentText = inputVal;
    const sentFile = pendingFile;
    const sentReplyTo = replyTo;
    setInputVal(''); setReplyTo(null); setPendingFile(null); setMediaPreview(null);
    broadcastTyping(false);
    clearTimeout(typingTimer);
    setIsSending(true);

    try {
      let fileUrl = null, fileName = null, fileSize = null, messageType = 'text', legacyMedia = null;

      // Upload file if attached
      if (sentFile) {
        if (sentFile.size > 10 * 1024 * 1024) {
          showToast('File too large (10MB max)', 'error');
          throw new Error('File too large');
        }
        setUploadProgress({ progress: 10, error: null });
        const { data: uploadData, error: uploadError } = await uploadChatFile(
          activeGroupId, user.id, sentFile,
          (pct) => setUploadProgress({ progress: pct, error: null })
        );
        if (uploadError) {
          setUploadProgress({ progress: 0, error: uploadError.userMessage });
          throw new Error(uploadError.userMessage);
        }
        fileUrl = uploadData.publicUrl;
        fileName = uploadData.fileName;
        fileSize = uploadData.fileSize;
        messageType = uploadData.isImage ? 'image' : 'file';
        // Keep legacy media for backward compat with existing render code
        legacyMedia = uploadData.isImage
          ? { type: 'image', url: fileUrl, name: fileName }
          : { type: 'file', url: fileUrl, name: fileName, size: `${Math.round(fileSize / 1024)} KB` };
        setUploadProgress(null);
      }

      const { error } = await sendMessage({
        groupId: activeGroupId,
        senderId: user.id,
        text: sentText || null,
        messageType,
        fileUrl,
        fileName,
        fileSize,
        media: legacyMedia,
        replyToId: sentReplyTo?.id || null,
      });

      if (error) throw new Error(error.userMessage || 'Failed to send message');
    } catch (err) {
      console.error('[Chat] Send error:', err);
      setUploadProgress(null);
      // Rollback optimistic message
      const rollback = (prev) => prev.filter(m => m.id !== msgTempId);
      if (activeChat === 'general') setGeneralMessages(rollback);
      else setDmMessages(prev => ({ ...prev, [activeChat]: rollback(prev[activeChat] || []) }));
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // ─── Edit Message ─────────────────────────────────────────────────────────────
  const startEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text || '');
    setTimeout(() => editInputRef.current?.focus(), 50);
  };

  const cancelEdit = () => { setEditingMsgId(null); setEditText(''); };

  const submitEdit = async (msg) => {
    if (!editText.trim() || editText === msg.text) { cancelEdit(); return; }

    // Optimistic update
    const patchMsg = (prev) => prev.map(m => m.id === msg.id ? { ...m, text: editText, isEdited: true } : m);
    if (activeChat === 'general') setGeneralMessages(patchMsg);
    else setDmMessages(prev => ({ ...prev, [activeChat]: patchMsg(prev[activeChat] || []) }));
    cancelEdit();

    const { error } = await editMessage(msg.id, user.id, editText, msg.createdAt);
    if (error) {
      // Revert
      const revert = (prev) => prev.map(m => m.id === msg.id ? { ...m, text: msg.text, isEdited: msg.isEdited } : m);
      if (activeChat === 'general') setGeneralMessages(revert);
      else setDmMessages(prev => ({ ...prev, [activeChat]: revert(prev[activeChat] || []) }));
      showToast(error.userMessage || 'Failed to edit message', 'error');
    }
  };

  // ─── Delete Message ───────────────────────────────────────────────────────────
  const handleDelete = async (msg) => {
    // Optimistic soft-delete
    const patchMsg = (prev) => prev.map(m => m.id === msg.id ? { ...m, isDeleted: true } : m);
    if (activeChat === 'general') setGeneralMessages(patchMsg);
    else setDmMessages(prev => ({ ...prev, [activeChat]: patchMsg(prev[activeChat] || []) }));

    const { error } = await deleteMessage(msg.id, user.id);
    if (error) {
      // Revert
      const revert = (prev) => prev.map(m => m.id === msg.id ? { ...m, isDeleted: false } : m);
      if (activeChat === 'general') setGeneralMessages(revert);
      else setDmMessages(prev => ({ ...prev, [activeChat]: revert(prev[activeChat] || []) }));
      showToast(error.userMessage || 'Failed to delete message', 'error');
    }
  };

  // ─── Toggle Reaction (DB-backed) ──────────────────────────────────────────────
  const toggleReaction = async (msgId, emoji) => {
    if (!user?.id) return;
    const existingReactors = reactions[msgId]?.[emoji] || [];
    const hasReacted = existingReactors.some(r => r.userId === user.id);

    // Optimistic update
    setReactions(prev => {
      const msgReactions = { ...(prev[msgId] || {}) };
      if (hasReacted) {
        msgReactions[emoji] = (msgReactions[emoji] || []).filter(r => r.userId !== user.id);
        if (msgReactions[emoji].length === 0) delete msgReactions[emoji];
      } else {
        if (!msgReactions[emoji]) msgReactions[emoji] = [];
        msgReactions[emoji] = [...msgReactions[emoji], { userId: user.id, reactor: user }];
      }
      return { ...prev, [msgId]: msgReactions };
    });

    // Persist to DB
    if (hasReacted) {
      const { error } = await removeReaction(msgId, user.id, emoji);
      if (error && error.code !== '23505') console.error('[Chat] Remove reaction error:', error);
    } else {
      const { error } = await addReaction(msgId, user.id, emoji);
      if (error && error.code !== '23505') console.error('[Chat] Add reaction error:', error);
    }
  };

  // ─── Input handling ───────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    broadcastTyping(true);
    clearTimeout(typingTimer);
    const t = setTimeout(() => broadcastTyping(false), 2000);
    setTypingTimer(t);
  };

  // ─── File select ──────────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast('File too large (10MB max)', 'error'); return; }
    setPendingFile(file);
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview({ type: 'image', url: ev.target.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      setMediaPreview({ type: 'file', name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` });
    }
    e.target.value = '';
  };

  // ─── Derived state ────────────────────────────────────────────────────────────
  const getMessages = () => activeChat === 'general' ? generalMessages : (dmMessages[activeChat] || []);
  const activeUser = activeChat !== 'general' ? students.find(s => s.id === activeChat) : null;
  const onlineStudents = students.filter(s => s.online);
  const dmHistoryIds = Object.keys(dmMessages);
  const uniqueStudents = [...new Map(students.map(s => [s.id, s])).values()].filter(s => s.id !== user?.id);
  const sidebarStudents = uniqueStudents
    .sort((a, b) => {
      const aH = dmHistoryIds.includes(String(a.id)), bH = dmHistoryIds.includes(String(b.id));
      if (aH && !bH) return -1; if (!aH && bH) return 1;
      return b.online - a.online;
    })
    .filter(s => !userSearch || s.name.toLowerCase().includes(userSearch.toLowerCase()));

  const getSenderInfo = (msg) => {
    const isMe = msg.senderId === user?.id;
    if (isMe) return { sender: { ...user, name: 'You' }, isMe: true };
    const sender = msg.sender || students.find(s => s.id === msg.senderId) || activeUser;
    return { sender, isMe: false };
  };

  const typingLabel = typingUsers.length === 1
    ? `${typingUsers[0].name} is typing...`
    : typingUsers.length === 2
    ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
    : typingUsers.length > 2 ? 'Several people are typing...' : null;

  const messages = getMessages();

  // Profile click handler
  const handleUserProfileClick = async (clickedUser) => {
    setProfileViewUser({
      name: clickedUser.name || 'Unknown',
      avatarUrl: clickedUser.avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(clickedUser.name || 'user')}&backgroundColor=0a0e1a`,
      department: clickedUser.department || clickedUser.branch || 'Computer Science',
      year: clickedUser.year || '',
      bio: clickedUser.bio || 'No bio provided.',
      skills: clickedUser.skills || [],
    });
    setIsProfileModalOpen(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[85vh] glass-card rounded-3xl overflow-hidden animate-page-load">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="w-72 border-r border-gs-border flex flex-col bg-gs-bg/20 shrink-0 backdrop-blur-md">
        <div className="p-4 border-b border-white/5 space-y-3">
          <h2 className="text-lg font-bold font-heading text-white">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-[#00f0ff] focus:bg-white/10 text-white placeholder-white/40 transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* General Channel */}
          <button onClick={() => handleSelectChat('general')}
            className={`w-full flex items-center gap-3 p-4 border-b border-white/5 transition-colors text-left border-l-4 ${activeChat === 'general' ? 'bg-[#00f0ff]/10 border-l-[#00f0ff]' : 'border-l-transparent hover:bg-white/5'}`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#a855f7] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0">
              <Hash size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Campus General</h3>
                {unreadCounts.general > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">{unreadCounts.general}</span>
                )}
              </div>
              <p className="text-xs text-[var(--color-gs-text-muted)] truncate">{onlineStudents.length + 1} online</p>
            </div>
          </button>

          <div className="px-4 pt-4 pb-2 text-xs font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">Direct Messages</div>

          {sidebarStudents.map(student => (
            <button key={student.id} onClick={() => handleSelectChat(student.id)}
              className={`w-full flex items-center gap-3 p-4 border-b border-white/5 transition-colors text-left group border-l-4 ${activeChat === student.id ? 'bg-[#00f0ff]/10 border-l-[#00f0ff]' : 'border-l-transparent hover:bg-white/5'}`}>
              <div className="relative shrink-0 cursor-pointer hover:scale-110 transition-transform"
                onClick={(e) => { e.stopPropagation(); handleUserProfileClick(student); }}>
                <div className={"w-11 h-11 rounded-full border-2 flex items-center justify-center text-lg bg-[var(--color-gs-card)] " + (factions[student.faction]?.border || 'border-[var(--color-gs-border)]')}>
                  {student.avatar}
                </div>
                {student.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--color-gs-green)] rounded-full border-2 border-[var(--color-gs-bg)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm text-[var(--color-gs-text-main)] truncate group-hover:text-[var(--color-gs-cyan)] transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleUserProfileClick(student); }}>
                    {student.name}
                  </h3>
                  <span className="text-[10px] text-[var(--color-gs-text-muted)] shrink-0 ml-1">{student.online ? 'Online' : 'Offline'}</span>
                </div>
                <p className="text-xs text-[var(--color-gs-text-muted)] truncate">
                  {dmMessages[student.id]?.[dmMessages[student.id].length - 1]?.text || 'Start a conversation'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative backdrop-blur-md">
        {/* Header */}
        <header className="h-16 border-b border-gs-border flex items-center justify-between px-5 shrink-0 bg-transparent">
          {activeChat === 'general' ? (
            <div className="flex items-center gap-3">
              <Hash size={20} className="text-[#00f0ff]" />
              <div>
                <h1 className="font-bold font-heading text-white">Campus General</h1>
                <p className="text-xs text-[var(--color-gs-text-muted)]">{onlineStudents.length + 1} students online</p>
              </div>
            </div>
          ) : activeUser ? (
            <div className="flex items-center gap-3 cursor-pointer rounded-xl px-2 py-1 -mx-2 -my-1 hover:bg-[var(--color-gs-bg)] transition-colors"
              onClick={() => handleUserProfileClick(activeUser)}>
              <div className={"w-9 h-9 rounded-full border-2 flex items-center justify-center bg-[var(--color-gs-bg)] " + (factions[activeUser.faction]?.border || '')}>
                {activeUser.avatar}
              </div>
              <div>
                <h1 className="font-bold hover:text-[var(--color-gs-cyan)] transition-colors">{activeUser.name}</h1>
                <p className={"text-xs " + (factions[activeUser.faction]?.color || 'text-[var(--color-gs-text-muted)]')}>
                  {activeUser.online ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button onClick={() => setShowSearch(prev => !prev)}
              className={`p-2 rounded-xl transition-colors ${showSearch ? 'text-[var(--color-gs-cyan)] bg-[var(--color-gs-cyan)]/10' : 'text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-cyan)] hover:bg-[var(--color-gs-bg)]'}`}
              title="Search messages">
              <Search size={18} />
            </button>
            {activeChat !== 'general' && activeUser && (
              <>
                <button onClick={() => showToast('Conversation archived')} className="p-2 text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-amber)] hover:bg-[var(--color-gs-bg)] rounded-xl transition-colors"><Archive size={18} /></button>
                <button onClick={() => showToast('User blocked')} className="p-2 text-[var(--color-gs-text-muted)] hover:text-red-400 hover:bg-[var(--color-gs-bg)] rounded-xl transition-colors"><Slash size={18} /></button>
              </>
            )}
          </div>
        </header>

        {/* Search Bar */}
        {showSearch && (
          <div className="relative px-4 py-2 border-b border-[var(--color-gs-border)] bg-[var(--color-gs-bg)]/30">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search in this chat..."
                autoFocus
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-9 pr-10 py-2 text-sm outline-none focus:border-[var(--color-gs-cyan)] text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)] hover:text-red-400">
                  <X size={14} />
                </button>
              )}
            </div>
            {(searchQuery || isSearching) && (
              <SearchPanel
                results={searchResults}
                query={searchQuery}
                onJumpTo={jumpToMessage}
                onClose={() => { setShowSearch(false); setSearchQuery(''); }}
                isLoading={isSearching}
              />
            )}
          </div>
        )}

        {/* Messages Area */}
        <div ref={chatAreaRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 relative">

          {/* Load more button */}
          {hasMoreMessages && !isInitialLoading && (
            <button onClick={handleLoadMore} disabled={isLoadingMore}
              className="self-center flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-cyan)] bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl transition-colors disabled:opacity-50">
              {isLoadingMore ? <Loader2 size={12} className="animate-spin" /> : <ChevronUp size={12} />}
              {isLoadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          )}

          {/* Initial loading skeleton */}
          {isInitialLoading && (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'self-end flex-row-reverse' : 'self-start'} max-w-sm w-full animate-pulse`}>
                  <div className="w-9 h-9 rounded-full bg-[var(--color-gs-border)] shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-[var(--color-gs-border)] rounded w-20" />
                    <div className="h-10 bg-[var(--color-gs-border)] rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {!isInitialLoading && messages.map(msg => {
            const { sender, isMe } = getSenderInfo(msg);
            const resolvedSender = sender || { name: 'Unknown', avatar: '🎓', faction: null };
            const hasFaction = isMe ? factions[user?.faction] : factions[resolvedSender.faction];
            const isOptimistic = !!msg._optimistic;
            const isOfflineMsg = !!msg._offline;
            const isHighlighted = highlightedMsgId === msg.id;
            const msgReactions = reactions[msg.id] || {};
            const isEditing = editingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                ref={el => { if (el) messageRefs.current[msg.id] = el; }}
                className={`flex gap-3 w-full max-w-2xl group relative
                  ${isMe ? 'self-end flex-row-reverse' : 'self-start'}
                  ${isOptimistic ? 'opacity-70' : ''}
                  ${isHighlighted ? 'rounded-2xl ring-2 ring-[var(--color-gs-cyan)]/50 bg-[var(--color-gs-cyan)]/5 p-2 -m-2' : ''}
                  transition-all duration-500`}>

                {/* Avatar */}
                <div
                  className={"w-9 h-9 shrink-0 rounded-full border-2 flex items-center justify-center text-base bg-[var(--color-gs-card)] mt-1 cursor-pointer hover:scale-110 transition-transform " + (hasFaction?.border || 'border-[var(--color-gs-border)]')}
                  onClick={() => !isMe && handleUserProfileClick(resolvedSender)}>
                  {resolvedSender.avatar || '🎓'}
                </div>

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                  {/* Sender name + time */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className={"text-xs font-bold " + (hasFaction?.color || 'text-[var(--color-gs-text-muted)]')}>
                      {isMe ? 'You' : resolvedSender.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-gs-text-muted)]">{msg.timestamp}</span>
                    {isOptimistic && !isOfflineMsg && <span className="text-[10px] text-[var(--color-gs-text-muted)] animate-pulse">Sending...</span>}
                    {isOfflineMsg && <span className="text-[10px] text-amber-400 flex items-center gap-1"><WifiOff size={8} /> Queued</span>}
                    {msg.isEdited && <span className="text-[9px] text-[var(--color-gs-text-muted)] italic">(edited)</span>}
                  </div>

                  {/* Reply preview */}
                  {msg.replyToId && (
                    <div className="mb-1.5 px-3 py-1.5 bg-[var(--color-gs-bg)] border-l-2 border-[var(--color-gs-cyan)] rounded-r-lg text-xs text-[var(--color-gs-text-muted)] max-w-xs truncate cursor-pointer hover:text-[var(--color-gs-text-main)]"
                      onClick={() => jumpToMessage(msg.replyToId)}>
                      ↩ Reply
                    </div>
                  )}

                  {/* Deleted message */}
                  {msg.isDeleted ? (
                    <div className="px-4 py-3 rounded-2xl text-sm text-[var(--color-gs-text-muted)] italic bg-[var(--color-gs-card)] border border-[var(--color-gs-border)]/50 border-dashed">
                      🚫 Message deleted
                    </div>
                  ) : (
                    <>
                      {/* Media: image */}
                      {(msg.media?.type === 'image' || msg.messageType === 'image') && (
                        <img
                          src={msg.fileUrl || msg.media?.url}
                          alt={msg.fileName || 'shared image'}
                          className="max-w-xs rounded-xl mb-1.5 border border-[var(--color-gs-border)]"
                          loading="lazy"
                        />
                      )}

                      {/* Media: file */}
                      {(msg.media?.type === 'file' || (msg.messageType === 'file' && !msg.isDeleted)) && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl mb-1.5 text-xs max-w-xs">
                          <File size={14} className="text-[var(--color-gs-cyan)] shrink-0" />
                          {(msg.fileUrl || msg.media?.url) ? (
                            <a href={msg.fileUrl || msg.media?.url} target="_blank" rel="noreferrer"
                              className="text-[var(--color-gs-cyan)] hover:underline truncate">
                              {msg.fileName || msg.media?.name}
                            </a>
                          ) : (
                            <span className="text-[var(--color-gs-text-main)] truncate">{msg.fileName || msg.media?.name}</span>
                          )}
                          <span className="text-[var(--color-gs-text-muted)] shrink-0">
                            {msg.fileSize ? `${Math.round(msg.fileSize / 1024)} KB` : msg.media?.size}
                          </span>
                        </div>
                      )}

                      {/* Edit inline */}
                      {isEditing ? (
                        <div className="flex gap-2 items-end max-w-xs w-full">
                          <textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitEdit(msg); }
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 bg-[var(--color-gs-bg)] border border-[var(--color-gs-cyan)] rounded-xl px-3 py-2 text-sm outline-none resize-none text-[var(--color-gs-text-main)]"
                            rows={2}
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => submitEdit(msg)} className="p-1.5 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-lg hover:bg-cyan-400 transition-colors"><Check size={14} /></button>
                            <button onClick={cancelEdit} className="p-1.5 bg-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] rounded-lg hover:bg-red-500/20 transition-colors"><X size={14} /></button>
                          </div>
                        </div>
                      ) : (
                        /* Text bubble */
                        msg.text && (
                          <div className={"px-4 py-3 rounded-2xl text-sm leading-relaxed break-words max-w-sm " +
                            (isMe
                              ? "bg-gradient-to-br from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,212,255,0.2)]"
                              : "bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] text-[var(--color-gs-text-main)] rounded-tl-none")}>
                            {msg.text}
                          </div>
                        )
                      )}
                    </>
                  )}

                  {/* Read receipts + status */}
                  {isMe && !isOptimistic && !msg.isDeleted && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <ReadTicks
                        msgId={msg.id}
                        senderId={msg.senderId}
                        currentUserId={user?.id}
                        readReceipts={readReceipts}
                        isOptimistic={isOptimistic}
                      />
                    </div>
                  )}

                  {/* Reaction bar (hover) */}
                  {!isOptimistic && !msg.isDeleted && !isEditing && (
                    <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                      {QUICK_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                          className={"text-base w-7 h-7 rounded-full hover:bg-[var(--color-gs-border)] transition-colors flex items-center justify-center hover:scale-125 " +
                            ((msgReactions[emoji] || []).some(r => r.userId === user?.id) ? 'bg-[var(--color-gs-cyan)]/10' : '')}>
                          {emoji}
                        </button>
                      ))}
                      <button onClick={() => setReplyTo(msg)}
                        className="p-1 rounded-full hover:bg-[var(--color-gs-border)] transition-colors text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-cyan)]">
                        <Reply size={14} />
                      </button>
                      {/* More options */}
                      <div className="relative">
                        <button onClick={() => setContextMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                          className="p-1 rounded-full hover:bg-[var(--color-gs-border)] transition-colors text-[var(--color-gs-text-muted)] hover:text-white">
                          <MoreHorizontal size={14} />
                        </button>
                        {contextMenuMsgId === msg.id && (
                          <MessageMenu
                            msg={msg}
                            currentUserId={user?.id}
                            onEdit={() => startEdit(msg)}
                            onDelete={() => handleDelete(msg)}
                            onReply={() => setReplyTo(msg)}
                            onClose={() => setContextMenuMsgId(null)}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Existing Reactions (DB-backed) */}
                  {Object.keys(msgReactions).length > 0 && !msg.isDeleted && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msgReactions).map(([emoji, reactors]) => {
                        const hasReacted = reactors.some(r => r.userId === user?.id);
                        const names = reactors.map(r => r.reactor?.name || 'Someone').join(', ');
                        return (
                          <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                            title={names}
                            className={"flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors " +
                              (hasReacted ? 'bg-[var(--color-gs-cyan)]/15 border-[var(--color-gs-cyan)]/40 text-[var(--color-gs-cyan)]' : 'bg-[var(--color-gs-card)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:border-[var(--color-gs-cyan)]/40')}>
                            {emoji} {reactors.length}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingLabel && (
            <div className="self-start flex gap-3 items-end">
              <div className="w-9 h-9 rounded-full bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] flex items-center justify-center text-base">
                {typingUsers[0] ? (students.find(s => s.id === typingUsers[0].userId)?.avatar || '?') : '?'}
              </div>
              <div>
                <div className="px-4 py-3 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl rounded-tl-none flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 bg-[var(--color-gs-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-gs-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--color-gs-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-[10px] text-[var(--color-gs-text-muted)] pl-1">{typingLabel}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && !typingLabel && !isInitialLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-gs-text-muted)] py-20">
              <MessageSquare size={48} className="mb-4 opacity-40" />
              <p className="text-sm">No messages yet. Say hello! 👋</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-24 right-8 w-9 h-9 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-full flex items-center justify-center shadow-lg hover:bg-cyan-400 transition-colors z-20">
            <ChevronDown size={18} />
          </button>
        )}

        {/* Offline banner */}
        {isOffline && <OfflineBanner queuedCount={offlineQueue.length} />}

        {/* ── Input Area ──────────────────────────────────────────────────────── */}
        <div className="p-4 border-t border-[var(--color-gs-border)] bg-[var(--color-gs-card)] shrink-0">
          {/* Upload progress */}
          {uploadProgress && (
            <UploadProgress progress={uploadProgress.progress} error={uploadProgress.error} />
          )}

          {/* Reply Preview */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl text-xs">
              <Reply size={12} className="text-[var(--color-gs-cyan)] shrink-0" />
              <span className="text-[var(--color-gs-text-muted)] flex-1 truncate">Replying to: {replyTo.text}</span>
              <button onClick={() => setReplyTo(null)} className="text-[var(--color-gs-text-muted)] hover:text-red-400 transition-colors"><X size={14} /></button>
            </div>
          )}

          {/* Media Preview */}
          {mediaPreview && (
            <div className="flex items-center gap-3 mb-2 p-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl">
              {mediaPreview.type === 'image' ? (
                <img src={mediaPreview.url} alt="preview" className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--color-gs-cyan)]/10 flex items-center justify-center"><File size={20} className="text-[var(--color-gs-cyan)]" /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-gs-text-muted)] truncate">{mediaPreview.name}</p>
                {mediaPreview.size && <p className="text-xs text-[var(--color-gs-text-muted)]">{mediaPreview.size}</p>}
              </div>
              <button onClick={() => { setPendingFile(null); setMediaPreview(null); }}
                className="text-[var(--color-gs-text-muted)] hover:text-red-400 transition-colors"><X size={16} /></button>
            </div>
          )}

          {/* Character count warning */}
          {inputVal.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <div className={`text-xs mb-2 ${inputVal.length > MAX_MESSAGE_LENGTH ? 'text-red-400' : 'text-amber-400'}`}>
              {inputVal.length}/{MAX_MESSAGE_LENGTH}
            </div>
          )}

          <div className="relative">
            {showEmoji && <EmojiPicker onSelect={e => setInputVal(prev => prev + e)} onClose={() => setShowEmoji(false)} />}

            <form onSubmit={handleSend} className="flex gap-2 items-center bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl p-2 focus-within:border-[var(--color-gs-cyan)] transition-colors">
              <input ref={fileInputRef} type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                className="hidden" onChange={handleFileSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="p-2 text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-cyan)] transition-colors rounded-xl hover:bg-[var(--color-gs-card)]">
                <Paperclip size={20} />
              </button>
              <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                className={"p-2 transition-colors rounded-xl hover:bg-[var(--color-gs-card)] " + (showEmoji ? 'text-[var(--color-gs-amber)]' : 'text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-amber)]')}>
                <Smile size={20} />
              </button>
              <input
                type="text" value={inputVal} onChange={handleInputChange}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={activeChat === 'general' ? "Message #Campus General..." : `Message @${activeUser?.name || ''}...`}
                className="flex-1 bg-transparent border-none px-2 py-2 outline-none text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)] text-sm"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <button type="submit" disabled={(!inputVal.trim() && !pendingFile) || isSending}
                className="p-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] font-bold rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Public Profile Modal ────────────────────────────────────────────── */}
      {isProfileModalOpen && profileViewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setIsProfileModalOpen(false)}>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsProfileModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] flex items-center justify-center text-[var(--color-gs-text-muted)] hover:text-red-400 hover:border-red-500/40 transition-all shadow-lg">
              <X size={18} />
            </button>
            <PublicProfileView userProfile={profileViewUser} />
          </div>
        </div>
      )}
    </div>
  );
}
