import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, Smile, MoreHorizontal, Edit2,
  Trash2, Check, CheckCheck, Loader2, Search, X, Image, FileText,
  AlertCircle, Shield, Clock, User
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getOrCreateDM } from '../lib/dmService';
import {
  loadMessages, sendMessage, uploadChatFile, editMessage,
  deleteMessage, addReaction, removeReaction, fetchReactions,
  markChatRead, searchMessages, normalizeMessage
} from '../lib/chatService';
import supabase from '../lib/supabase';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '🚀'];

export default function DMConversationPage() {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [dmInfo, setDmInfo] = useState(null); // { groupId, targetUser }
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState({});
  const [loading, setLoading] = useState(true);

  // Input & message state
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState('');

  // File upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  // Typing presence
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const presenceChannelRef = useRef(null);

  const messagesEndRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // ─── Initialize DM conversation ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id || !targetUserId) return;
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      const { data, error } = await getOrCreateDM(user.id, targetUserId);
      if (error || !data) {
        showToast('Unable to open conversation.', 'error');
        setLoading(false);
        return;
      }
      if (cancelled) return;

      setDmInfo(data);

      // Load initial messages
      const { data: msgs } = await loadMessages(data.groupId);
      if (!cancelled) {
        const normalized = (msgs || []).map(normalizeMessage);
        setMessages(normalized);

        // Fetch reactions
        const msgIds = normalized.map(m => m.id);
        if (msgIds.length > 0) {
          const { data: rxMap } = await fetchReactions(msgIds);
          if (rxMap) setReactions(rxMap);
        }

        // Mark as read
        if (normalized.length > 0) {
          const lastMsg = normalized[normalized.length - 1];
          markChatRead(data.groupId, user.id, lastMsg.id).catch(() => {});
        }

        setLoading(false);
        setTimeout(() => scrollToBottom('auto'), 100);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [user?.id, targetUserId]);

  // ─── Realtime Message & Reaction Subscription ──────────────────────────────
  useEffect(() => {
    if (!dmInfo?.groupId) return;

    const channel = supabase
      .channel(`dm-room-${dmInfo.groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${dmInfo.groupId}` },
        async (payload) => {
          const newMsg = normalizeMessage(payload.new);
          // Fetch sender profile if not populated
          if (!newMsg.sender) {
            const { data: senderProf } = await supabase
              .from('profiles')
              .select('id, name, avatar, avatar_url, faction')
              .eq('id', newMsg.senderId)
              .single();
            newMsg.sender = senderProf;
          }

          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          // Mark read
          if (newMsg.senderId !== user?.id) {
            markChatRead(dmInfo.groupId, user.id, newMsg.id).catch(() => {});
          }

          setTimeout(() => scrollToBottom('smooth'), 50);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `group_id=eq.${dmInfo.groupId}` },
        (payload) => {
          const updated = normalizeMessage(payload.new);
          setMessages(prev => prev.map(m => (m.id === updated.id ? { ...m, ...updated } : m)));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        async () => {
          // Refresh reactions
          const msgIds = messages.map(m => m.id);
          if (msgIds.length > 0) {
            const { data: rxMap } = await fetchReactions(msgIds);
            if (rxMap) setReactions(rxMap);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    // Presence / Typing Channel
    const presenceChannel = supabase.channel(`typing:dm:${dmInfo.groupId}`, {
      config: { presence: { key: user.id } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const otherTyping = Object.entries(state).some(
          ([key, presences]) => key !== user.id && presences.some(p => p.typing)
        );
        setIsOtherTyping(otherTyping);
      })
      .subscribe();

    presenceChannelRef.current = presenceChannel;

    return () => {
      if (realtimeChannelRef.current) supabase.removeChannel(realtimeChannelRef.current);
      if (presenceChannelRef.current) supabase.removeChannel(presenceChannelRef.current);
    };
  }, [dmInfo?.groupId, user?.id, messages.length]);

  // ─── Typing Emitter ─────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!presenceChannelRef.current) return;

    presenceChannelRef.current.track({ typing: true, name: user.name });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      presenceChannelRef.current?.track({ typing: false });
    }, 2000);
  };

  // ─── Send Message ───────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && !uploadFile) || isSending || !dmInfo) return;

    setIsSending(true);
    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let messageType = 'text';

    try {
      // 1. Upload file if attached
      if (uploadFile) {
        setUploadProgress(10);
        const uploadRes = await uploadChatFile(
          dmInfo.groupId,
          user.id,
          uploadFile,
          (pct) => setUploadProgress(pct)
        );
        if (uploadRes.error) throw new Error(uploadRes.error.userMessage);
        fileUrl = uploadRes.data.publicUrl;
        fileName = uploadRes.data.fileName;
        fileSize = uploadRes.data.fileSize;
        messageType = uploadRes.data.isImage ? 'image' : 'file';
      }

      // 2. Send message via service
      const payload = {
        groupId: dmInfo.groupId,
        senderId: user.id,
        text: inputText.trim(),
        messageType,
        fileUrl,
        fileName,
        fileSize
      };

      setInputText('');
      setUploadFile(null);
      setUploadProgress(null);

      const { error } = await sendMessage(payload);
      if (error) {
        showToast(error.userMessage || 'Failed to send message', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
      setUploadProgress(null);
    }
  };

  // ─── Reaction Handlers ──────────────────────────────────────────────────────
  const handleToggleReaction = async (msgId, emoji) => {
    const msgReactions = reactions[msgId] || {};
    const reactors = msgReactions[emoji] || [];
    const hasReacted = reactors.some(r => r.userId === user.id);

    if (hasReacted) {
      await removeReaction(msgId, user.id, emoji);
    } else {
      await addReaction(msgId, user.id, emoji);
    }

    const { data: updated } = await fetchReactions([msgId]);
    if (updated) setReactions(prev => ({ ...prev, ...updated }));
  };

  // ─── Edit / Delete Handlers ─────────────────────────────────────────────────
  const handleSaveEdit = async (msgId, createdAt) => {
    if (!editText.trim()) return;
    const { error } = await editMessage(msgId, user.id, editText, createdAt);
    if (error) {
      showToast(error.userMessage || 'Failed to edit message', 'error');
    } else {
      setEditingMsg(null);
    }
  };

  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    const { error } = await deleteMessage(msgId, user.id);
    if (error) showToast('Could not delete message', 'error');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={36} className="animate-spin text-[var(--color-gs-cyan)]" />
      </div>
    );
  }

  const target = dmInfo?.targetUser || { name: 'Student', avatar: '🎓' };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between gap-4 bg-[var(--color-gs-card)]">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 rounded-xl text-[var(--color-gs-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Target User Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--color-gs-bg)] border border-white/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
              {target.avatar_url ? (
                <img src={target.avatar_url} alt={target.name} className="w-full h-full object-cover" />
              ) : (
                target.avatar || '🎓'
              )}
            </div>

            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                {target.name}
              </h2>
              <div className="flex items-center gap-2 text-[10px] text-[var(--color-gs-text-muted)]">
                {isOtherTyping ? (
                  <span className="text-[var(--color-gs-cyan)] font-bold animate-pulse">Typing...</span>
                ) : (
                  <span>{target.college || 'GroupSync Scholar'}</span>
                )}
                {target.availability && (
                  <span className="text-emerald-400 font-medium truncate max-w-[180px]">
                    · {target.availability}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Message Thread Area ───────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[var(--color-gs-bg)]/40">
        {messages.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto shadow-inner">
              {target.avatar || '💬'}
            </div>
            <h3 className="font-bold text-white text-sm">Conversation with {target.name}</h3>
            <p className="text-xs text-[var(--color-gs-text-muted)] max-w-xs mx-auto">
              This is the beginning of your direct message history. Say hello! 👋
            </p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.senderId === user?.id;
          const isDeleted = msg.isDeleted;
          const msgRx = reactions[msg.id] || {};
          const isEditingThis = editingMsg === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              {/* Sender Name for other */}
              {!isMe && (
                <span className="text-[10px] font-bold text-[var(--color-gs-text-muted)] px-1">
                  {target.name}
                </span>
              )}

              {/* Message Bubble + Action bar */}
              <div className="flex items-center gap-2 max-w-[85%] sm:max-w-[70%]">
                {/* Me Action Menu */}
                {isMe && !isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => { setEditingMsg(msg.id); setEditText(msg.text || ''); }}
                      className="p-1 hover:bg-white/10 rounded text-[var(--color-gs-text-muted)] hover:text-white"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 hover:bg-white/10 rounded text-[var(--color-gs-text-muted)] hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`rounded-2xl p-3.5 text-sm transition-all shadow-md relative ${
                    isDeleted
                      ? 'bg-white/5 text-[var(--color-gs-text-muted)] italic border border-white/5'
                      : isMe
                      ? 'bg-[var(--color-gs-cyan)] text-[#0f172a] font-medium'
                      : 'bg-[var(--color-gs-card)] text-white border border-[var(--color-gs-border)]'
                  }`}
                >
                  {isDeleted ? (
                    <span>🚫 Message deleted</span>
                  ) : isEditingThis ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="bg-black/20 rounded-lg px-2 py-1 text-xs text-white outline-none w-full"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5 text-[10px]">
                        <button onClick={() => setEditingMsg(null)} className="px-2 py-0.5 rounded hover:bg-black/20">Cancel</button>
                        <button onClick={() => handleSaveEdit(msg.id, msg.createdAt)} className="px-2 py-0.5 bg-black/40 rounded font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Image Preview */}
                      {msg.messageType === 'image' && msg.fileUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden max-h-60">
                          <img src={msg.fileUrl} alt="Attached" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* File Link */}
                      {msg.messageType === 'file' && msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs mb-2 ${
                            isMe ? 'bg-black/10' : 'bg-white/10'
                          }`}
                        >
                          <FileText size={16} />
                          <span className="truncate underline font-bold">{msg.fileName || 'Download Attachment'}</span>
                        </a>
                      )}

                      {/* Text */}
                      {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                      {msg.isEdited && (
                        <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-[#0f172a]/60' : 'text-gray-400'}`}>
                          (edited)
                        </span>
                      )}
                    </>
                  )}

                  {/* Timestamp & Ticks */}
                  <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                    isMe ? 'text-[#0f172a]/70 font-semibold' : 'text-[var(--color-gs-text-muted)]'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck size={12} className="text-[#0f172a]" />}
                  </div>
                </div>

                {/* Reaction Quick Bar on hover */}
                {!isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-[var(--color-gs-card)] border border-white/10 px-1.5 py-0.5 rounded-full shadow-lg">
                    {QUICK_EMOJIS.slice(0, 3).map(em => (
                      <button
                        key={em}
                        onClick={() => handleToggleReaction(msg.id, em)}
                        className="hover:scale-125 text-xs p-0.5 transition-transform"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reaction Badges */}
              {Object.keys(msgRx).length > 0 && (
                <div className="flex flex-wrap gap-1 px-1">
                  {Object.entries(msgRx).map(([em, reactors]) => {
                    const hasMe = reactors.some(r => r.userId === user?.id);
                    return (
                      <button
                        key={em}
                        onClick={() => handleToggleReaction(msg.id, em)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          hasMe
                            ? 'bg-[var(--color-gs-cyan)]/20 border-[var(--color-gs-cyan)] text-[var(--color-gs-cyan)]'
                            : 'bg-[var(--color-gs-card)] border-white/10 text-[var(--color-gs-text-muted)]'
                        }`}
                      >
                        <span>{em}</span>
                        <span>{reactors.length}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ── File Preview Bar ──────────────────────────────────────── */}
      {uploadFile && (
        <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate text-white">
            <Paperclip size={14} className="text-[var(--color-gs-cyan)]" />
            <span className="truncate">{uploadFile.name}</span>
            <span className="text-[10px] text-[var(--color-gs-text-muted)]">
              ({(uploadFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button onClick={() => setUploadFile(null)} className="text-red-400 p-1">✕</button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="h-1 bg-[var(--color-gs-bg)] overflow-hidden">
          <div className="h-full bg-[var(--color-gs-cyan)] transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {/* ── Message Input Bar ─────────────────────────────────────── */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-[var(--color-gs-card)] border-t border-white/5 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={e => setUploadFile(e.target.files[0] || null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-[var(--color-gs-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          title="Attach File"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${target.name}...`}
          className="flex-1 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-2xl px-4 py-2.5 text-sm text-white placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)]"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !uploadFile) || isSending}
          className="p-2.5 rounded-2xl bg-[var(--color-gs-cyan)] text-[#0f172a] hover:bg-cyan-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,240,255,0.25)] shrink-0"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
