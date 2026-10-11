import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Search, Plus, User, Clock, Check,
  AlertCircle, Loader2, Sparkles, ArrowRight, Shield, Mail
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { getDMConversations, searchUsersForDM, getOrCreateDM } from '@/lib/services/messageService';
import supabase from '@/lib/supabase';

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
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gs-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gs-text-main">
              Direct messages
            </h1>
            {unreadTotal > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#6D6AF6]/10 text-[#9182f8] border border-[#7c6af6]/20">
                {unreadTotal} new
              </span>
            )}
          </div>
          <p className="text-sm text-gs-text-muted mt-0.5">
            Private 1-on-1 dialogue with teammates, mentors, and campus collaborators.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium transition-colors shadow-xs shrink-0 btn-tactile"
        >
          <Plus size={15} /> New message
        </button>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gs-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations by student name or excerpt..."
          className="w-full glass-card rounded-lg pl-9 pr-4 py-2 text-xs text-gs-text-main placeholder-gs-text-muted outline-none focus:border-[#7c6af6] transition-colors shadow-xs"
        />
      </div>

      {/* ── Loading Skeleton ──────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────── */}
      {!loading && conversations.length === 0 && (
        <div className="p-12 text-center glass-card rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 flex items-center justify-center mx-auto text-[#9182f8]">
            <MessageCircle size={20} />
          </div>
          <h3 className="text-sm font-semibold text-gs-text-main">No direct messages yet</h3>
          <p className="text-xs text-gs-text-muted max-w-sm mx-auto">
            Connect directly with fellow students, squad leads, and study partners to collaborate.
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white rounded-lg text-xs font-medium transition-colors shadow-xs btn-tactile"
          >
            <Plus size={13} /> Start conversation
          </button>
        </div>
      )}

      {/* ── Conversations List ────────────────────────────────────── */}
      {!loading && conversations.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-gs-border shadow-xs">
          {filteredConversations.map(conv => {
            const target = conv.targetUser || {};
            const isUnread = conv.isUnread;

            return (
              <div
                key={conv.groupId}
                onClick={() => navigate(`/messages/${target.id}`)}
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isUnread ? 'bg-[#6D6AF6]/[0.05] hover:bg-[#6D6AF6]/[0.08]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-gs-border flex items-center justify-center text-lg shrink-0 overflow-hidden relative">
                    {target.avatar_url ? (
                      <img src={target.avatar_url} alt={target.name} className="w-full h-full object-cover" />
                    ) : (
                      target.avatar || 'ðŸŽ“'
                    )}
                    {isUnread && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6D6AF6] ring-2 ring-gs-card" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-xs truncate ${isUnread ? 'font-semibold text-gs-text-main' : 'font-medium text-gs-text-main'}`}>
                        {target.name}
                      </h4>
                      {target.availability && (
                        <span className="hidden sm:inline-block text-[11px] text-emerald-400 font-medium truncate">
                          · {target.availability}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isUnread ? 'text-[#9182f8] font-medium' : 'text-gs-text-muted'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>

                {/* Timestamp & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-gs-text-muted">
                    {new Date(conv.lastMessageTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <ArrowRight size={13} className="text-gs-text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: New Direct Message ─────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="glass-card rounded-xl p-5 max-w-md w-full shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-gs-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-gs-text-main">Start new conversation</h3>
                <p className="text-xs text-gs-text-muted mt-0.5">Search students by name or department</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Type name to search students..."
                value={userQuery}
                onChange={e => handleUserSearch(e.target.value)}
                className="w-full glass-elevated rounded-lg pl-8 pr-3 py-1.5 text-xs text-gs-text-main outline-none focus:border-[#7c6af6]"
              />
            </div>

            {/* Results List */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {isSearching && (
                <div className="py-6 text-center text-xs text-gs-text-muted flex items-center justify-center gap-2">
                  <Loader2 size={13} className="animate-spin text-[#9182f8]" /> Searching directory...
                </div>
              )}

              {!isSearching && userQuery && searchResults.length === 0 && (
                <div className="py-6 text-center text-xs text-gs-text-muted">
                  No students found matching "{userQuery}"
                </div>
              )}

              {searchResults.map(s => (
                <div
                  key={s.id}
                  onClick={() => handleStartChat(s)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-gs-border flex items-center justify-center text-sm shrink-0 overflow-hidden">
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      s.avatar || 'ðŸŽ“'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs text-gs-text-main truncate">{s.name}</p>
                    <p className="text-[11px] text-gs-text-muted truncate">
                      {s.college || 'Campus Student'} · {s.availability || 'Available'}
                    </p>
                  </div>
                  <ArrowRight size={13} className="text-[#9182f8]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


