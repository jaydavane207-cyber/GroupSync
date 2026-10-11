import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Paperclip, Smile, MoreHorizontal, Edit2,
  Trash2, Check, CheckCheck, Loader2, Search, X, Image, FileText,
  AlertCircle, Shield, Clock, User
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getOrCreateDM } from '@/lib/services/messageService';
import {
  loadMessages, sendMessage, uploadChatFile, editMessage,
  deleteMessage, addReaction, removeReaction, fetchReactions,
  markChatRead, searchMessages, normalizeMessage
} from '@/lib/services/chatService';
import supabase from '@/lib/supabase';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '🚀'];

export default function DMConversationPage() {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [dmInfo, setDmInfo] = useState(null);
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  const target = dmInfo?.targetUser || { name: 'Student', avatar: 'ðŸŽ“' };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-7.5rem)] glass-card rounded-xl overflow-hidden shadow-sm">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gs-border flex items-center justify-between gap-4 bg-gs-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="p-1.5 rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-black/5 dark:hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Target User Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-lg shrink-0 overflow-hidden">
              {target.avatar_url ? (
                <img src={target.avatar_url} alt={target.name} className="w-full h-full object-cover" />
              ) : (
                target.avatar || 'ðŸŽ“'
              )}
            </div>

            <div>
              <h2 className="font-semibold text-sm text-gs-text-main flex items-center gap-1.5">
                {target.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-gs-text-muted">
                {isOtherTyping ? (
                  <span className="text-blue-500 font-medium">typing...</span>
                ) : (
                  <span>{target.college || 'Campus Student'}</span>
                )}
                {target.availability && (
                  <span className="text-emerald-500 font-medium truncate max-w-[180px]">
                    · {target.availability}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Message Thread Area ───────────────────────────────────── */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-gs-card">
        {messages.length === 0 && (
          <div className="py-20 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/[0.04] border border-gs-border flex items-center justify-center text-xl mx-auto">
              {target.avatar || 'ðŸ’¬'}
            </div>
            <h3 className="font-semibold text-gs-text-main text-sm">Conversation with {target.name}</h3>
            <p className="text-xs text-gs-text-muted max-w-xs mx-auto">
              Start collaborating by sending a friendly greeting or proposing project synergies.
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
              {/* Message Bubble + Action bar */}
              <div className="flex items-center gap-1.5 max-w-[85%] sm:max-w-[70%]">
                {/* Me Action Menu */}
                {isMe && !isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    <button
                      onClick={() => { setEditingMsg(msg.id); setEditText(msg.text || ''); }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Edit"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`rounded-xl px-3.5 py-2 text-xs transition-all relative ${
                    isDeleted
                      ? 'bg-white/[0.02] text-gs-text-muted italic border border-gs-border'
                      : isMe
                      ? 'bg-[#6D6AF6] text-white rounded-tr-xs'
                      : 'bg-gs-elevated text-gs-text-main border border-gs-border/60 rounded-tl-xs'
                  }`}
                >
                  {isDeleted ? (
                    <span>ðŸš« Message deleted</span>
                  ) : isEditingThis ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="bg-black/20 rounded-md px-2.5 py-1 text-xs text-white outline-none w-full"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5 text-[10px]">
                        <button onClick={() => setEditingMsg(null)} className="px-2 py-0.5 rounded hover:bg-white/10">Cancel</button>
                        <button onClick={() => handleSaveEdit(msg.id, msg.createdAt)} className="px-2 py-0.5 bg-white/20 rounded font-medium">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Image Preview */}
                      {msg.messageType === 'image' && msg.fileUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden max-h-60 border border-gs-border/60">
                          <img src={msg.fileUrl} alt="Attached" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* File Link */}
                      {msg.messageType === 'file' && msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs mb-1.5 ${
                            isMe ? 'bg-[#5C59EC] text-white' : 'bg-white/[0.04] text-gs-text-main'
                          }`}
                        >
                          <FileText size={15} />
                          <span className="truncate underline font-medium">{msg.fileName || 'Download File'}</span>
                        </a>
                      )}

                      {/* Text */}
                      {msg.text && <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                      {msg.isEdited && (
                        <span className={`text-[9px] block text-right mt-1 ${isMe ? 'text-white/60' : 'text-gs-text-muted'}`}>
                          (edited)
                        </span>
                      )}
                    </>
                  )}

                  {/* Timestamp & Ticks */}
                  <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                    isMe ? 'text-blue-100 font-medium' : 'text-gs-text-muted'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {isMe && <CheckCheck size={12} className="text-blue-100" />}
                  </div>
                </div>

                {/* Reaction Quick Bar on hover */}
                {!isDeleted && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-gs-card border border-gs-border px-1 py-0.5 rounded-full shadow-sm">
                    {QUICK_EMOJIS.slice(0, 3).map(em => (
                      <button
                        key={em}
                        onClick={() => handleToggleReaction(msg.id, em)}
                        className="text-xs p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                          hasMe
                            ? 'bg-[#6D6AF6]/15 border-[#7c6af6]/30 text-[#9182f8]'
                            : 'bg-white/[0.04] border-gs-border text-gs-text-muted'
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
        <div className="px-4 py-2 bg-gs-elevated border-t border-gs-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate text-gs-text-main">
            <Paperclip size={14} className="text-[#9182f8]" />
            <span className="truncate">{uploadFile.name}</span>
            <span className="text-[11px] text-gs-text-muted">
              ({(uploadFile.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button onClick={() => setUploadFile(null)} className="text-gs-text-muted hover:text-rose-400 p-1">✕</button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="h-1 bg-white/[0.04] overflow-hidden">
          <div className="h-full bg-[#6D6AF6] transition-all" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}

      {/* ── Message Input Bar ─────────────────────────────────────── */}
      <form onSubmit={handleSend} className="p-3 bg-gs-card border-t border-gs-border flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={e => setUploadFile(e.target.files[0] || null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04] transition-colors"
          title="Attach File"
        >
          <Paperclip size={16} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${target.name}...`}
          className="flex-1 glass-elevated rounded-lg px-3 py-1.5 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#7c6af6] transition-colors"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !uploadFile) || isSending}
          className="p-2 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 btn-tactile"
        >
          {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}


