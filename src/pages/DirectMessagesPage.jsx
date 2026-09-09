import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Search, Plus, User, Clock, Check,
  AlertCircle, Loader2, Sparkles, ArrowRight, Shield
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getDMConversations, searchUsersForDM, getOrCreateDM } from '../lib/dmService';
import supabase from '../lib/supabase';

export default function DirectMessagesPage() {
  const navigate = useNavigate();
  const { user, showToast } = useAppContext();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // New Chat Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const channelRef = useRef(null);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await getDMConversations(user.id);
    if (!error) {
      setConversations(data || []);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Realtime subscription for incoming DM messages
  useEffect(() => {
    const channel = supabase
      .channel('dm-inbox-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        loadConversations();
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [loadConversations]);

  // User search for new DM
  const handleUserSearch = async (query) => {
    setUserQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const { data } = await searchUsersForDM(user.id, query);
    setSearchResults(data || []);
    setIsSearching(false);
  };

  const handleStartChat = async (targetUser) => {
    setIsStarting(true);
    const { data, error } = await getOrCreateDM(user.id, targetUser.id);
    setIsStarting(false);

    if (error || !data) {
      showToast('Could not start conversation.', 'error');
    } else {
      setShowNewModal(false);
      navigate(`/messages/${targetUser.id}`);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.targetUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadTotal = conversations.filter(c => c.isUnread).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[load-fade-up_0.3s_ease-out]">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black font-heading text-white tracking-tight">
              Direct <span className="text-[var(--color-gs-cyan)]">Messages</span>
            </h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[var(--color-gs-cyan)] text-[#0f172a]">
                {unreadTotal} new
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[var(--color-gs-text-muted)] mt-1">
            Private 1-on-1 conversations with students, teammates, and mentors.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[var(--color-gs-cyan)] to-[var(--color-gs-secondary)] text-white text-xs font-bold hover:opacity-95 transition-opacity shadow-[0_4px_15px_rgba(0,240,255,0.25)] shrink-0"
        >
          <Plus size={16} /> New Message
        </button>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations by student name or message..."
          className="w-full bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-[var(--color-gs-text-muted)] outline-none focus:border-[var(--color-gs-cyan)] backdrop-blur-xl"
        />
      </div>

      {/* ── Loading Skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────── */}
      {!loading && conversations.length === 0 && (
        <div className="p-16 text-center bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl space-y-4">
          <MessageCircle size={48} className="mx-auto text-[var(--color-gs-text-muted)] opacity-30" />
          <h3 className="text-lg font-bold text-white font-heading">No Direct Messages Yet</h3>
          <p className="text-xs text-[var(--color-gs-text-muted)] max-w-sm mx-auto">
            Reach out to campus collaborators, teammates from hackathons, or friends to start a private conversation.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-5 py-2.5 bg-[var(--color-gs-cyan)] text-[#0f172a] rounded-xl text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Start a Conversation
          </button>
        </div>
      )}

      {/* ── Conversations List ────────────────────────────────────── */}
      {!loading && conversations.length > 0 && (
        <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl overflow-hidden divide-y divide-white/5 backdrop-blur-xl shadow-xl">
          {filteredConversations.map(conv => {
            const target = conv.targetUser || {};
            const isUnread = conv.isUnread;

            return (
              <div
                key={conv.groupId}
                onClick={() => navigate(`/messages/${target.id}`)}
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isUnread ? 'bg-[var(--color-gs-cyan)]/5 hover:bg-[var(--color-gs-cyan)]/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-gs-bg)] border border-white/10 flex items-center justify-center text-2xl shrink-0 overflow-hidden relative">
                    {target.avatar_url ? (
                      <img src={target.avatar_url} alt={target.name} className="w-full h-full object-cover" />
                    ) : (
                      target.avatar || '🎓'
                    )}
                    {isUnread && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-gs-cyan)] ring-2 ring-[var(--color-gs-bg)]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm truncate ${isUnread ? 'font-black text-white' : 'font-bold text-[var(--color-gs-text-main)]'}`}>
                        {target.name}
                      </h4>
                      {target.availability && (
                        <span className="hidden sm:inline-block text-[10px] text-emerald-400 font-medium truncate">
                          · {target.availability}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isUnread ? 'text-[var(--color-gs-cyan)] font-bold' : 'text-[var(--color-gs-text-muted)]'}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>

                {/* Timestamp & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-[var(--color-gs-text-muted)] font-medium">
                    {new Date(conv.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <ArrowRight size={14} className="text-[var(--color-gs-text-muted)] group-hover:text-white" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: New Direct Message ─────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">Start New Conversation</h3>
                <p className="text-xs text-[var(--color-gs-text-muted)]">Find a student to send a direct message</p>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-[var(--color-gs-text-muted)] hover:text-white">
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-gs-text-muted)]" />
              <input
                type="text"
                autoFocus
                placeholder="Type name to search students..."
                value={userQuery}
                onChange={e => handleUserSearch(e.target.value)}
                className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-gs-cyan)]"
              />
            </div>

            {/* Results List */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isSearching && (
                <div className="py-6 text-center text-xs text-[var(--color-gs-text-muted)] flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[var(--color-gs-cyan)]" /> Searching...
                </div>
              )}

              {!isSearching && userQuery && searchResults.length === 0 && (
                <div className="py-6 text-center text-xs text-[var(--color-gs-text-muted)]">
                  No students found matching "{userQuery}"
                </div>
              )}

              {searchResults.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleStartChat(s)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-gs-bg)] border border-white/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      s.avatar || '🎓'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{s.name}</p>
                    <p className="text-[10px] text-[var(--color-gs-text-muted)] truncate">
                      {s.college || 'GroupSync Scholar'} · {s.availability || 'Available'}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-[var(--color-gs-cyan)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
