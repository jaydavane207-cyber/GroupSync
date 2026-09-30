import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Hash, Paperclip, Smile, Archive, Slash, Send, Reply,
  X, ChevronDown, Image, File, Search, Loader2, User, Edit2, Trash2,
  Check, CheckCheck, AlertCircle, RefreshCw, WifiOff, ChevronUp, MoreHorizontal
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import supabase from '@/lib/supabase';
import PublicProfileView from '@/pages/PublicProfilePage';
import {
  loadMessages, sendMessage, editMessage, deleteMessage,
  addReaction, removeReaction, fetchReactions, markChatRead,
  getReadReceipts, searchMessages, normalizeMessage,
  uploadChatFile, enqueueOfflineMessage, dequeueOfflineMessage,
  loadOfflineQueue
} from '@/lib/services/chatService';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MESSAGES_PAGE_SIZE = 50;
const MAX_MESSAGE_LENGTH = 5000;
const QUICK_REACTIONS = ['ðŸ‘', 'â¤ï¸', 'ðŸ˜‚', 'ðŸŽ‰', 'ðŸ˜¢', 'ðŸ”¥'];

// â”€â”€â”€ Temp ID helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const tempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// â”€â”€â”€ Emoji Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const EMOJI_CATEGORIES = {
  'ðŸ˜€ Smileys': ['ðŸ˜€','ðŸ˜ƒ','ðŸ˜„','ðŸ˜','ðŸ˜†','ðŸ˜…','ðŸ¤£','ðŸ˜‚','ðŸ™‚','ðŸ˜Š','ðŸ˜‡','ðŸ¥°','ðŸ˜','ðŸ¤©','ðŸ˜˜','ðŸ˜—','ðŸ˜™','ðŸ˜š','ðŸ˜‹','ðŸ˜›','ðŸ˜œ','ðŸ¤ª','ðŸ˜','ðŸ¤‘','ðŸ¤—','ðŸ¤”','ðŸ¤','ðŸ˜','ðŸ˜‘','ðŸ˜¶','ðŸ˜','ðŸ˜’','ðŸ˜ž','ðŸ˜”','ðŸ˜Ÿ','ðŸ˜•','ðŸ™','â˜¹ï¸','ðŸ˜£','ðŸ˜–','ðŸ˜«','ðŸ˜©','ðŸ¥º','ðŸ˜¢','ðŸ˜­','ðŸ˜¤','ðŸ˜ ','ðŸ˜¡','ðŸ¤¬','ðŸ˜ˆ'],
  'ðŸ‘‹ Gestures': ['ðŸ‘‹','ðŸ¤š','ðŸ–ï¸','âœ‹','ðŸ––','ðŸ‘Œ','âœŒï¸','ðŸ¤ž','ðŸ¤Ÿ','ðŸ¤˜','ðŸ¤™','ðŸ‘ˆ','ðŸ‘‰','ðŸ‘†','ðŸ‘‡','â˜ï¸','ðŸ‘','ðŸ‘Ž','âœŠ','ðŸ‘Š','ðŸ¤›','ðŸ¤œ','ðŸ‘','ðŸ™Œ','ðŸ¤','ðŸ™'],
  'â¤ï¸ Hearts': ['â¤ï¸','ðŸ§¡','ðŸ’›','ðŸ’š','ðŸ’™','ðŸ’œ','ðŸ–¤','ðŸ¤','ðŸ¤Ž','ðŸ’”','â£ï¸','ðŸ’•','ðŸ’ž','ðŸ’“','ðŸ’—','ðŸ’–','ðŸ’˜','ðŸ’'],
  'ðŸŽ‰ Celebration': ['ðŸŽ‰','ðŸŽŠ','ðŸŽˆ','ðŸŽ','ðŸŽ€','ðŸ†','ðŸ¥‡','ðŸ¥ˆ','ðŸ¥‰','ðŸŽ–ï¸','ðŸ…','ðŸŽ­','ðŸŽ¨','ðŸŽ¬','ðŸŽ¤'],
  'ðŸ’» Tech': ['ðŸ’»','ðŸ–¥ï¸','ðŸ“±','âŒ¨ï¸','ðŸ–±ï¸','ðŸ’¾','ðŸ“€','ðŸ“Š','ðŸ“ˆ','ðŸ“‰','ðŸ”­','ðŸ”¬','ðŸ’¡','ðŸ”‹','ðŸ”Œ'],
};

// â”€â”€â”€ Emoji Picker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                (activeCategory === cat ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-medium' : 'text-[var(--color-gs-text-muted)] hover:bg-[var(--color-gs-bg)]')}>
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

// â”€â”€â”€ Read Receipt Ticks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ReadTicks({ msgId, senderId, currentUserId, readReceipts, isOptimistic }) {
  if (senderId !== currentUserId) return null; // Only show for own messages
  if (isOptimistic) return <Check size={12} className="text-[var(--color-gs-text-muted)]" />;

  const readers = readReceipts.filter(r => r.userId !== currentUserId && r.lastReadMessageId >= msgId);
  const isRead = readers.length > 0;
  const readAt = isRead ? new Date(readers[0].lastReadAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  if (isRead) {
    return (
      <span title={`Read at ${readAt}`} className="cursor-default">
        <CheckCheck size={12} className="text-blue-600 dark:text-blue-400" />
      </span>
    );
  }
  return <CheckCheck size={12} className="text-[var(--color-gs-text-muted)]" />;
}

// â”€â”€â”€ Message Context Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ File Upload Progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            <div className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Search Results Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SearchPanel({ results, query, onJumpTo, onClose, isLoading }) {
  const highlight = (text) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded px-0.5">{part}</mark>
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
      {isLoading && <div className="p-4 flex justify-center"><Loader2 size={20} className="animate-spin text-blue-600" /></div>}
      {!isLoading && results.length === 0 && query && (
        <div className="p-4 text-center text-sm text-[var(--color-gs-text-muted)]">No messages found for "{query}"</div>
      )}
      {results.map(r => (
        <button key={r.id} onClick={() => onJumpTo(r.id)}
          className="w-full text-left px-4 py-3 hover:bg-[var(--color-gs-bg)] transition-colors border-b border-[var(--color-gs-border)]/50 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{r.sender?.name || 'Unknown'}</span>
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

// â”€â”€â”€ Offline Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OfflineBanner({ queuedCount }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-amber-400 text-xs">
      <WifiOff size={12} />
      <span>You are offline.{queuedCount > 0 ? ` ${queuedCount} message${queuedCount > 1 ? 's' : ''} queued.` : ' Messages will be sent when you reconnect.'}</span>
    </div>
  );
}

// â”€â”€â”€ Main CampusChat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Message state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [generalMessages, setGeneralMessages] = useState([]);
  const [dmMessages, setDmMessages] = useState({});
  const [dmGroupMap, setDmGroupMap] = useState({}); // { groupId: otherUserId }

  // â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // â”€â”€ Edit state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const [contextMenuMsgId, setContextMenuMsgId] = useState(null);

  // â”€â”€ Reactions (DB-backed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [reactions, setReactions] = useState({}); // { messageId: { emoji: [{ userId, reactor }] } }

  // â”€â”€ Read receipts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [readReceipts, setReadReceipts] = useState([]); // [{ userId, lastReadMessageId, lastReadAt }]

  // â”€â”€ File upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [uploadProgress, setUploadProgress] = useState(null); // null | { progress, error }

  // â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const searchDebounceRef = useRef(null);

  // â”€â”€ Offline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(loadOfflineQueue());

  // â”€â”€ Refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chatEndRef = useRef(null);
  const chatAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  const presenceChannelRef = useRef(null);
  const editInputRef = useRef(null);
  const messageRefs = useRef({}); // { msgId: DOM element }
  const oldestMsgCreatedAtRef = useRef(null);

  // â”€â”€â”€ Online/Offline detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Resolve general group ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Handle selecting a DM chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Typing Presence Channel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ DM Group Map Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Subscribe to DM messages globally â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Load initial messages + reactions + read receipts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Load more (infinite scroll) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ General Chat Realtime subscription â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Auto-scroll to bottom â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Jump to message (from search) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Send Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Edit Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Delete Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Toggle Reaction (DB-backed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Input handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleInputChange = (e) => {
    setInputVal(e.target.value);
    broadcastTyping(true);
    clearTimeout(typingTimer);
    const t = setTimeout(() => broadcastTyping(false), 2000);
    setTypingTimer(t);
  };

  // â”€â”€â”€ File select â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Derived state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex h-[85vh] bg-gs-card border border-gs-border rounded-xl overflow-hidden shadow-sm">

      {/* â”€â”€ Flat Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="w-64 border-r border-gs-border flex flex-col bg-[#09090b] shrink-0">
        <div className="p-3 border-b border-gs-border space-y-2">
          <h2 className="text-xs font-semibold text-gs-text-main uppercase tracking-wider px-1">Channels & DMs</h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gs-text-muted" />
            <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
              placeholder="Search chat or peers..."
              className="w-full bg-gs-elevated border border-gs-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-[#6D6AF6] text-gs-text-main placeholder-gs-text-muted transition-colors" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* General Channel */}
          <button onClick={() => handleSelectChat('general')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left ${activeChat === 'general' ? 'bg-[#6D6AF6]/10 text-[#6D6AF6] font-medium' : 'hover:bg-white/[0.04] text-gs-text-muted'}`}>
            <div className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${activeChat === 'general' ? 'bg-[#6D6AF6]/20 border-[#6D6AF6]/30 text-[#6D6AF6]' : 'bg-white/[0.04] border-gs-border text-gs-text-muted'}`}>
              <Hash size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-xs truncate ${activeChat === 'general' ? 'text-[#6D6AF6] font-semibold' : 'text-gs-text-main font-medium'}`}>campus-general</span>
                {unreadCounts.general > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-semibold">{unreadCounts.general}</span>
                )}
              </div>
              <p className="text-[10px] text-gs-text-muted truncate">{onlineStudents.length + 1} online</p>
            </div>
          </button>

          <div className="px-2 pt-3 pb-1 text-[10px] font-semibold text-gs-text-muted uppercase tracking-wider">Direct Messages</div>

          {sidebarStudents.map(student => (
            <button key={student.id} onClick={() => handleSelectChat(student.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left group ${activeChat === student.id ? 'bg-[#6D6AF6]/10 text-[#6D6AF6]' : 'hover:bg-white/[0.04] text-gs-text-muted'}`}>
              <div className="relative shrink-0 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); handleUserProfileClick(student); }}>
                <div className="w-6 h-6 rounded-md border border-gs-border flex items-center justify-center text-xs bg-white/[0.04] font-medium text-gs-text-main">
                  {student.avatar || 'ðŸ‘¤'}
                </div>
                {student.online && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-gs-card" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className={`text-xs truncate ${activeChat === student.id ? 'text-[#6D6AF6] font-semibold' : 'text-gs-text-main font-medium'}`}>
                    {student.name}
                  </h3>
                  <span className="text-[9px] text-gs-text-muted shrink-0 ml-1">{student.online ? 'Online' : 'Offline'}</span>
                </div>
                <p className="text-[10px] text-gs-text-muted truncate">
                  {dmMessages[student.id]?.[dmMessages[student.id].length - 1]?.text || 'No messages yet'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* â”€â”€ Main Chat Area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex-1 flex flex-col min-w-0 bg-gs-card relative">
        {/* Header */}
        <header className="h-14 border-b border-gs-border flex items-center justify-between px-4 shrink-0 bg-gs-card">
          {activeChat === 'general' ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]">
                <Hash size={15} />
              </div>
              <div>
                <h1 className="font-semibold text-xs text-gs-text-main">campus-general</h1>
                <p className="text-[10px] text-gs-text-muted">{onlineStudents.length + 1} online in channel</p>
              </div>
            </div>
          ) : activeUser ? (
            <div className="flex items-center gap-2.5 cursor-pointer rounded-lg px-1.5 py-1 hover:bg-white/[0.02] transition-colors"
              onClick={() => handleUserProfileClick(activeUser)}>
              <div className="w-7 h-7 rounded-md border border-gs-border flex items-center justify-center bg-white/[0.04] text-xs text-gs-text-main font-medium">
                {activeUser.avatar || 'ðŸ‘¤'}
              </div>
              <div>
                <h1 className="font-semibold text-xs text-gs-text-main hover:text-[#6D6AF6] transition-colors">{activeUser.name}</h1>
                <p className="text-[10px] text-gs-text-muted flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeUser.online ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                  {activeUser.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle */}
            <button onClick={() => setShowSearch(prev => !prev)}
              className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'text-[#6D6AF6] bg-[#6D6AF6]/10' : 'text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04]'}`}
              title="Search messages">
              <Search size={16} />
            </button>
            {activeChat !== 'general' && activeUser && (
              <>
                <button onClick={() => showToast('Conversation archived')} className="p-1.5 text-gs-text-muted hover:text-amber-400 hover:bg-white/[0.04] rounded-lg transition-colors"><Archive size={16} /></button>
                <button onClick={() => showToast('User blocked')} className="p-1.5 text-gs-text-muted hover:text-rose-400 hover:bg-white/[0.04] rounded-lg transition-colors"><Slash size={16} /></button>
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
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-9 pr-10 py-2 text-sm outline-none focus:border-blue-500 text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]"
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
              className="self-center flex items-center gap-2 px-3 py-1.5 text-xs text-gs-text-muted hover:text-blue-500 bg-gs-card border border-gs-border rounded-lg transition-colors disabled:opacity-50">
              {isLoadingMore ? <Loader2 size={12} className="animate-spin" /> : <ChevronUp size={12} />}
              {isLoadingMore ? 'Loading...' : 'Load older messages'}
            </button>
          )}

          {/* Initial loading skeleton */}
          {isInitialLoading && (
            <div className="space-y-4 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'self-end flex-row-reverse' : 'self-start'} max-w-sm w-full animate-pulse`}>
                  <div className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-20" />
                    <div className="h-8 bg-black/10 dark:bg-white/10 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          {!isInitialLoading && messages.map(msg => {
            const { sender, isMe } = getSenderInfo(msg);
            const resolvedSender = sender || { name: 'Unknown', avatar: 'ðŸŽ“', faction: null };
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
                className={`flex gap-2.5 w-full max-w-2xl group relative
                  ${isMe ? 'self-end flex-row-reverse' : 'self-start'}
                  ${isOptimistic ? 'opacity-70' : ''}
                  ${isHighlighted ? 'rounded-xl ring-2 ring-blue-500/40 bg-blue-500/5 p-2 -m-2' : ''}
                  transition-colors`}>

                {/* Avatar */}
                <div
                  className="w-8 h-8 shrink-0 rounded-full border border-gs-border flex items-center justify-center text-sm bg-gs-card mt-0.5 cursor-pointer"
                  onClick={() => !isMe && handleUserProfileClick(resolvedSender)}>
                  {resolvedSender.avatar || 'ðŸŽ“'}
                </div>

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                  {/* Sender name + time */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-gs-text-main">
                      {isMe ? 'You' : resolvedSender.name}
                    </span>
                    <span className="text-[10px] text-gs-text-muted">{msg.timestamp}</span>
                    {isOptimistic && !isOfflineMsg && <span className="text-[10px] text-gs-text-muted animate-pulse">Sending...</span>}
                    {isOfflineMsg && <span className="text-[10px] text-amber-500 flex items-center gap-1"><WifiOff size={8} /> Queued</span>}
                    {msg.isEdited && <span className="text-[9px] text-gs-text-muted italic">(edited)</span>}
                  </div>

                  {/* Reply preview */}
                  {msg.replyToId && (
                    <div className="mb-1.5 px-3 py-1.5 bg-[var(--color-gs-bg)] border-l-2 border-blue-600 rounded-r-lg text-xs text-[var(--color-gs-text-muted)] max-w-xs truncate cursor-pointer hover:text-[var(--color-gs-text-main)]"
                      onClick={() => jumpToMessage(msg.replyToId)}>
                      â†© Reply
                    </div>
                  )}

                  {/* Deleted message */}
                  {msg.isDeleted ? (
                    <div className="px-4 py-2.5 rounded-2xl text-xs text-[var(--color-gs-text-muted)] italic bg-[var(--color-gs-card)] border border-[var(--color-gs-border)]/50 border-dashed">
                      ðŸš« Message deleted
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
                          <File size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          {(msg.fileUrl || msg.media?.url) ? (
                            <a href={msg.fileUrl || msg.media?.url} target="_blank" rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline truncate">
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
                            className="flex-1 bg-gs-elevated border border-[#6D6AF6] rounded-lg px-3 py-2 text-xs outline-none resize-none text-gs-text-main"
                            rows={2}
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => submitEdit(msg)} className="p-1.5 bg-[#6D6AF6] text-white rounded-md hover:bg-[#7E7BF8] transition-colors"><Check size={13} /></button>
                            <button onClick={cancelEdit} className="p-1.5 bg-gs-elevated border border-gs-border text-gs-text-muted rounded-md hover:text-rose-400 transition-colors"><X size={13} /></button>
                          </div>
                        </div>
                      ) : (
                        /* Text bubble / message row */
                        msg.text && (
                          <div className={
                            isMe
                              ? "px-3 py-2 rounded-xl rounded-tr-xs text-xs leading-relaxed break-words max-w-sm bg-[#6D6AF6] text-white"
                              : activeChat === 'general'
                              ? "text-xs leading-relaxed break-words text-gs-text-main py-0.5"
                              : "px-3 py-2 rounded-xl rounded-tl-xs text-xs leading-relaxed break-words max-w-sm bg-gs-elevated text-gs-text-main border border-gs-border/60"
                          }>
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
                    <div className={`flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row-reverse' : ''}`}>
                      {QUICK_REACTIONS.map(emoji => (
                        <button key={emoji} onClick={() => toggleReaction(msg.id, emoji)}
                          className={"text-xs w-6 h-6 rounded-md hover:bg-white/[0.08] transition-colors flex items-center justify-center " +
                            ((msgReactions[emoji] || []).some(r => r.userId === user?.id) ? 'bg-[#6D6AF6]/20 text-[#6D6AF6]' : '')}>
                          {emoji}
                        </button>
                      ))}
                      <button onClick={() => setReplyTo(msg)}
                        className="p-1 rounded-md hover:bg-white/[0.08] transition-colors text-gs-text-muted hover:text-gs-text-main">
                        <Reply size={13} />
                      </button>
                      {/* More options */}
                      <div className="relative">
                        <button onClick={() => setContextMenuMsgId(prev => prev === msg.id ? null : msg.id)}
                          className="p-1 rounded-md hover:bg-white/[0.08] transition-colors text-gs-text-muted hover:text-gs-text-main">
                          <MoreHorizontal size={13} />
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
                            className={"flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border transition-colors " +
                              (hasReacted ? 'bg-[#6D6AF6]/15 border-[#6D6AF6]/30 text-[#6D6AF6] font-medium' : 'bg-gs-elevated border-gs-border text-gs-text-muted hover:text-gs-text-main')}>
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
            <div className="self-start flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full bg-gs-card border border-gs-border flex items-center justify-center text-xs">
                {typingUsers[0] ? (students.find(s => s.id === typingUsers[0].userId)?.avatar || 'ðŸ‘¤') : 'ðŸ‘¤'}
              </div>
              <div>
                <div className="px-3 py-2 bg-gs-elevated border border-gs-border rounded-xl rounded-tl-none flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 bg-gs-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gs-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gs-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-[10px] text-gs-text-muted pl-1">{typingLabel}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && !typingLabel && !isInitialLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-gs-text-muted py-20">
              <div className="w-10 h-10 rounded-xl bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center mb-3">
                <MessageSquare size={20} />
              </div>
              <p className="text-xs">No messages yet. Send a message to start the conversation.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-20 right-6 w-8 h-8 bg-[#6D6AF6] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#7E7BF8] transition-colors z-20">
            <ChevronDown size={16} />
          </button>
        )}

        {/* Offline banner */}
        {isOffline && <OfflineBanner queuedCount={offlineQueue.length} />}

        {/* â”€â”€ Input Area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="p-3 border-t border-gs-border bg-gs-card shrink-0">
          {/* Upload progress */}
          {uploadProgress && (
            <UploadProgress progress={uploadProgress.progress} error={uploadProgress.error} />
          )}

          {/* Reply Preview */}
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-gs-elevated border border-gs-border rounded-lg text-xs">
              <Reply size={12} className="text-[#6D6AF6] shrink-0" />
              <span className="text-gs-text-muted flex-1 truncate">Replying to: {replyTo.text}</span>
              <button onClick={() => setReplyTo(null)} className="text-gs-text-muted hover:text-rose-400 transition-colors"><X size={13} /></button>
            </div>
          )}

          {/* Media Preview */}
          {mediaPreview && (
            <div className="flex items-center gap-3 mb-2 p-2 bg-gs-elevated border border-gs-border rounded-lg">
              {mediaPreview.type === 'image' ? (
                <img src={mediaPreview.url} alt="preview" className="w-14 h-14 rounded-md object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-md bg-[#6D6AF6]/10 flex items-center justify-center text-[#6D6AF6]"><File size={18} /></div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gs-text-main truncate">{mediaPreview.name}</p>
                {mediaPreview.size && <p className="text-[10px] text-gs-text-muted">{mediaPreview.size}</p>}
              </div>
              <button onClick={() => { setPendingFile(null); setMediaPreview(null); }}
                className="text-gs-text-muted hover:text-rose-400 transition-colors p-1"><X size={15} /></button>
            </div>
          )}

          {/* Character count warning */}
          {inputVal.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <div className={`text-[10px] mb-1.5 ${inputVal.length > MAX_MESSAGE_LENGTH ? 'text-rose-400' : 'text-amber-400'}`}>
              {inputVal.length}/{MAX_MESSAGE_LENGTH}
            </div>
          )}

          <div className="relative">
            {showEmoji && <EmojiPicker onSelect={e => setInputVal(prev => prev + e)} onClose={() => setShowEmoji(false)} />}

            <form onSubmit={handleSend} className="flex gap-2 items-center bg-gs-elevated border border-gs-border rounded-xl p-1.5 focus-within:border-[#6D6AF6] transition-colors">
              <input ref={fileInputRef} type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                className="hidden" onChange={handleFileSelect} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gs-text-muted hover:text-gs-text-main transition-colors rounded-lg hover:bg-white/[0.04]"
                title="Attach file">
                <Paperclip size={16} />
              </button>
              <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                className={"p-1.5 transition-colors rounded-lg hover:bg-white/[0.04] " + (showEmoji ? 'text-amber-400' : 'text-gs-text-muted hover:text-gs-text-main')}
                title="Add emoji">
                <Smile size={16} />
              </button>
              <input
                type="text" value={inputVal} onChange={handleInputChange}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={activeChat === 'general' ? "Message #campus-general..." : `Message ${activeUser?.name || ''}...`}
                className="flex-1 bg-transparent border-none px-2 py-1 outline-none text-gs-text-main placeholder-gs-text-muted text-xs"
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <button type="submit" disabled={(!inputVal.trim() && !pendingFile) || isSending}
                className="p-1.5 bg-[#6D6AF6] text-white font-medium rounded-lg hover:bg-[#7E7BF8] transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* â”€â”€ Public Profile Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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


