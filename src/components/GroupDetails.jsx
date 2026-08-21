import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock, Unlock, Settings, LogOut, ShieldAlert, MessageSquare, Layout, Calendar as CalendarIcon, CornerDownRight, AlignLeft, AtSign, Send, Smile, Paperclip, Clock, MapPin, X, Image, File, BarChart3, Plus, Trash2, Loader2, Zap, Medal, Info, Sparkles, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { XP_VALUES } from './Leaderboard';
import { useAppContext } from '../context/AppContext';
import { ONBOARDING_AVATARS } from '../data/mockData';
import KanbanBoard from './KanbanBoard';
import EventDetailsModal from './EventDetailsModal';
import supabase from '../lib/supabase';

// ─── Emoji Data ───────────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = {
  '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','😐','😑','😶','😏','😒','😞','😔','😟','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡'],
  '👋 Gestures': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🤲','🤝','🙏'],
  '❤️ Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'],
  '🎉 Celebration': ['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🥈','🥉','🎖️','🏅','🎨','🎬','🎤','🎧','🎸','🎹','🎺','🎻','🥁'],
  '💻 Tech': ['💻','🖥️','⌨️','🖱️','💾','📱','📺','📷','🎮','🕹️','🎲','💡','🔋','🔌','💰','📊','📈','📉','🔭','🔬'],
};

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
function GroupEmojiPicker({ onSelect, onClose }) {
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
    <div ref={ref} className="absolute bottom-full left-0 mb-2 w-72 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-2xl shadow-2xl z-30 overflow-hidden animate-[slideInUp_0.15s_ease-out]">
      <div className="p-2 border-b border-[var(--color-gs-border)]">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emoji..."
          className="w-full bg-[var(--color-gs-bg)] rounded-xl px-3 py-1.5 text-sm outline-none text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]" autoFocus />
      </div>
      {!search && (
        <div className="flex gap-1 px-2 py-1.5 border-b border-[var(--color-gs-border)] overflow-x-auto">
          {Object.keys(EMOJI_CATEGORIES).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={"px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors " + (activeCategory === cat ? 'bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)]' : 'text-[var(--color-gs-text-muted)] hover:bg-[var(--color-gs-bg)]')}
            >{cat.split(' ')[0]}</button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-40 overflow-y-auto">
        {filtered.map((emoji, i) => (
          <button key={i} onClick={() => { onSelect(emoji); onClose(); }}
            className="text-lg p-1 rounded-lg hover:bg-[var(--color-gs-bg)] transition-colors hover:scale-125">{emoji}</button>
        ))}
      </div>
    </div>
  );
}

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, groups, setGroups, selectedGroupId, setSelectedGroupId, showToast, factions, students, refreshGroups, loading } = useAppContext();
  
  // Update context state but use 'id' primarily
  useEffect(() => {
    if (id) setSelectedGroupId(Number(id));
  }, [id, setSelectedGroupId]);

  const group = groups.find(g => g.id === Number(id));
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showInlineEventDetails, setShowInlineEventDetails] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'tasks'
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // XP Award state (admin only)
  const [showAwardXP, setShowAwardXP] = useState(false);
  const [awardUserId, setAwardUserId] = useState('');
  const [awardPlacement, setAwardPlacement] = useState('1st');
  const [awardingXP, setAwardingXP] = useState(false);

  const [groupMessages, setGroupMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [realMembers, setRealMembers] = useState([]);

  // Fetch real group members from Supabase
  useEffect(() => {
    if (!id) return;
    const fetchRealMembers = async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('profile_id, profiles(id, name, avatar, faction, online, department, college, branch, year)')
        .eq('group_id', Number(id));
      if (!error && data) {
        setRealMembers(data.map(m => m.profiles).filter(Boolean));
      }
    };
    fetchRealMembers();
  }, [id]);

  // Fetch creator profile if not present
  useEffect(() => {
    const adminId = group?.admin_id || group?.adminId;
    if (!adminId) return;
    const fetchCreator = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminId)
        .single();
      if (!error && data) {
        setCreatorProfile(data);
      }
    };
    fetchCreator();
  }, [group?.admin_id, group?.adminId]);

  const formatMessage = useCallback((m) => ({
    id: m.id,
    text: m.text,
    sender: m.sender?.name || 'User',
    avatar: m.sender?.avatar || '🎓',
    avatarBg: 'bg-[var(--color-gs-bg)] text-[var(--color-gs-text-main)]',
    timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMine: m.sender_id === user.id,
    media: m.media,
    isPoll: m.is_poll,
    sender_id: m.sender_id,
    created_at: m.created_at
  }), [user.id]);

  const fetchChatHistory = useCallback(async () => {
    if (!selectedGroupId) return;
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(name, avatar)')
      .eq('group_id', selectedGroupId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setGroupMessages(data.map(formatMessage));
    }
    setMessagesLoading(false);
  }, [selectedGroupId, formatMessage]);

  useEffect(() => {
    fetchChatHistory();
    
    // Supabase Realtime: listen to postgres_changes on messages table
    const channel = supabase
      .channel(`chat:${selectedGroupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${selectedGroupId}` },
        async (payload) => {
          // Fetch the full message with sender profile
          const { data: fullMsg } = await supabase
            .from('messages')
            .select('*, sender:profiles(name, avatar)')
            .eq('id', payload.new.id)
            .single();
          if (fullMsg) {
            setGroupMessages(prev => {
              if (prev.find(m => m.id === fullMsg.id)) return prev;
              return [...prev, formatMessage(fullMsg)];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `group_id=eq.${selectedGroupId}` },
        async (payload) => {
          const { data: fullMsg } = await supabase
            .from('messages')
            .select('*, sender:profiles(name, avatar)')
            .eq('id', payload.new.id)
            .single();
          if (fullMsg) {
            setGroupMessages(prev => prev.map(m => m.id === fullMsg.id ? formatMessage(fullMsg) : m));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroupId, fetchChatHistory, user.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  if (!group) {
    // BUG-4 FIX: Show spinner while groups are loading, only 404 if fully loaded
    if (loading || groups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-[var(--color-gs-text-muted)]">
          <div className="w-12 h-12 border-4 border-[var(--color-gs-bg)] border-t-[var(--color-gs-cyan)] rounded-full animate-spin" />
          <p className="text-sm font-bold animate-pulse">Loading group...</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <span className="text-6xl">🔍</span>
        <h2 className="text-2xl font-bold font-heading text-white">Group Not Found</h2>
        <p className="text-[var(--color-gs-text-muted)]">This group may have been deleted or you followed an invalid link.</p>
        <button onClick={() => navigate('/browse')} className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale shadow-[0_0_15px_rgba(0,240,255,0.3)]">Browse Groups</button>
      </div>
    );
  }

  // ── Handle XP Award ────────────────────────────────────────────────────────
  const handleAwardXP = async () => {
    if (!awardUserId || !awardPlacement) return;
    setAwardingXP(true);

    const xpAmount = XP_VALUES[awardPlacement] ?? 50;

    // Check if already awarded for this event/user combo
    const { data: existing } = await supabase
      .from('event_results')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', awardUserId)
      .maybeSingle();

    if (existing) {
      showToast('This member was already awarded XP for this event.', 'error');
      setAwardingXP(false);
      return;
    }

    // Insert event result — DB trigger handles XP update + activity log
    const { error } = await supabase
      .from('event_results')
      .insert([{
        group_id: group.id,
        user_id: awardUserId,
        placement: awardPlacement,
        xp_awarded: xpAmount,
        awarded_by: user.id,
      }]);

    setAwardingXP(false);

    if (!error) {
      showToast(`🏆 +${xpAmount} XP awarded for ${awardPlacement} place!`, 'success');
      setAwardUserId('');
      setAwardPlacement('1st');
      setShowAwardXP(false);
    } else {
      showToast('Failed to award XP: ' + error.message, 'error');
    }
  };

  const isAdmin = group.adminId === user.id;
  const isMember = group.memberIds?.includes(user.id);

  const handleLeaveGroup = async () => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.id)
      .eq('profile_id', user.id);

    if (!error) {
      // Decrement fixed member count
      await supabase
        .from('groups')
        .update({ members: Math.max(0, group.members - 1) })
        .eq('id', group.id);

      if (refreshGroups) await refreshGroups();
      showToast('You have left the group.');
      navigate('/dashboard');
    } else {
      showToast('Failed to leave group: ' + error.message, 'error');
    }
  };

  const handleJoinGroup = async () => {
    if (group.members >= group.maxMembers) {
      showToast('Group is full!', 'error');
      return;
    }

    if (group.privacy === 'private') {
      showToast('Request sent to admin for approval!');
      return;
    }

    if (group.privacy === 'password') {
      showToast('Please enter the password first.', 'info');
      return;
    }

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        profile_id: user.id
      });

    if (!error) {
      // Increment fixed member count
      await supabase
        .from('groups')
        .update({ members: group.members + 1 })
        .eq('id', group.id);

      if (refreshGroups) await refreshGroups();
      showToast('Welcome to the group!');
    } else {
      showToast('Failed to join group: ' + error.message, 'error');
    }
  };

  const handleChangePrivacy = async (e) => {
    const newPrivacy = e.target.value;
    // BUG-6 FIX: Persist privacy change to Supabase DB
    const { error } = await supabase
      .from('groups')
      .update({ privacy: newPrivacy })
      .eq('id', group.id);
    if (!error) {
      const updated = groups.map(g => g.id === group.id ? { ...g, privacy: newPrivacy } : g);
      setGroups(updated);
      showToast(`Privacy changed to ${newPrivacy}`, 'success');
    } else {
      showToast('Failed to update privacy: ' + error.message, 'error');
    }
  };

  const handleSendGroupMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() && !mediaPreview) return;
    
    // Explicitly parse the URL :id into a number to guarantee it is never null/undefined
    const activeGroupId = Number(id);

    const newMessage = {
      group_id: activeGroupId,
      sender_id: user.id,
      text: chatInput || null,
      media: mediaPreview,
      is_poll: false
    };

    const { error } = await supabase.from('messages').insert([newMessage]);
    
    if (!error) {
      setChatInput('');
      setMediaPreview(null);
      setShowEmoji(false);
    } else {
      console.error('Error sending message:', error);
      showToast('Failed to send message', 'error');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { showToast('File too large (max 25MB)', 'error'); return; }
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview({ type: 'image', url: ev.target.result, name: file.name });
      reader.readAsDataURL(file);
    } else {
      setMediaPreview({ type: 'file', name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    }
    e.target.value = '';
  };

  const handleCreatePoll = async () => {
    const validOptions = pollOptions.filter(o => o.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) {
      showToast('Need a question and at least 2 options', 'error');
      return;
    }
    
    const pollData = {
      type: 'poll',
      question: pollQuestion,
      options: validOptions.map(o => ({ text: o, votes: 0 })),
      voters: {} // Track who voted for what: { user_id: option_index }
    };

    const activeGroupId = Number(id);

    const { error } = await supabase.from('messages').insert([{
      group_id: activeGroupId,
      sender_id: user.id,
      text: pollQuestion,
      is_poll: true,
      media: pollData
    }]);

    if (!error) {
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
      showToast('Poll created!');
    } else {
      showToast('Failed to create poll', 'error');
    }
  };

  const handleVote = async (msgId, optionIdx) => {
    // 1. Fetch current message state
    const { data: msg, error: fetchErr } = await supabase
      .from('messages')
      .select('media')
      .eq('id', msgId)
      .single();

    if (fetchErr || !msg) return;

    const pollData = msg.media;
    if (pollData.voters[user.id] !== undefined) {
      showToast('You already voted!', 'info');
      return;
    }

    // 2. Update poll data
    pollData.voters[user.id] = optionIdx;
    pollData.options[optionIdx].votes += 1;

    // 3. Persist update
    const { error: updateErr } = await supabase
      .from('messages')
      .update({ media: pollData })
      .eq('id', msgId);

    if (updateErr) showToast('Voting failed', 'error');
  };

  return (
    <div className="space-y-8 animate-page-load">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white flex items-center gap-3">
            {group.name} 
            {group.privacy === 'private' && <Lock className="text-gray-400" size={24}/>}
            {group.privacy === 'public' && <Unlock className="text-[#00f0ff]" size={24}/>}
          </h1>
          <p className="text-[var(--color-gs-text-muted)] mt-2">{group.event} • {group.type}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => setShowSettings(!showSettings)} className="px-4 py-2 glass-card hover:border-[#00f0ff]/50 rounded-xl transition-colors flex items-center gap-2 btn-scale">
              <Settings size={18} className="text-[#00f0ff]" /> Settings
            </button>
          )}
          {isMember && (
            <button onClick={() => setShowLeaveConfirm(true)} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 btn-scale">
              <LogOut size={18} /> Leave Group
            </button>
          )}
        </div>
      </header>

      {showLeaveConfirm && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <ShieldAlert className="text-red-500 shrink-0" size={32} />
            <div>
              <h3 className="text-lg font-bold text-red-500">Leaving Group</h3>
              <p className="text-sm text-red-400/80">Are you sure? If this is a private group, you will need an invite to rejoin.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setShowLeaveConfirm(false)} className="px-4 py-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl flex-1 md:flex-none">Cancel</button>
            <button onClick={handleLeaveGroup} className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl flex-1 md:flex-none hover:bg-red-600">Confirm Leave</button>
          </div>
        </div>
      )}

      {showSettings && isAdmin && (
        <div className="glass-card p-6 rounded-2xl animate-[slideInUp_0.2s_ease-out] space-y-6">
          <h2 className="text-2xl font-bold font-heading text-white mb-2">Admin Settings</h2>

          {/* Privacy */}
          <div>
            <label className="block text-sm text-[var(--color-gs-text-muted)] mb-1 font-medium">Group Privacy</label>
            <select value={group.privacy} onChange={handleChangePrivacy} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 text-white appearance-none max-w-md transition-colors">
              <option value="public">Public (Anyone can see and request)</option>
              <option value="private">Private (Hidden from browse, invite only)</option>
              <option value="password">Password Protected (Visible, requires password)</option>
            </select>
          </div>
          {group.privacy === 'password' && (
            <div>
              <label className="block text-sm text-[var(--color-gs-text-muted)] mb-1">Set Password</label>
              <input type="text" placeholder="Enter password (mock)" className="w-full bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-lg p-3 outline-none focus:border-[var(--color-gs-cyan)] text-[var(--color-gs-text-main)] max-w-md" />
            </div>
          )}

          {/* ── Award XP Panel ──────────────────────────────────────── */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20">
                  <Medal size={18} className="text-[#f59e0b]" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Award Event XP</h3>
                  <p className="text-xs text-[var(--color-gs-text-muted)]">Points are permanent and update the Leaderboard instantly.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAwardXP(p => !p)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  showAwardXP
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    : 'bg-white/5 border border-white/10 text-white hover:border-[#f59e0b]/40'
                }`}
              >
                {showAwardXP ? 'Cancel' : '+ Award XP'}
              </button>
            </div>

            {showAwardXP && (
              <div className="bg-black/20 border border-[#f59e0b]/20 rounded-2xl p-5 space-y-4 animate-[slideInUp_0.15s_ease-out]">
                {/* XP reference table */}
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(XP_VALUES).map(([place, xp]) => (
                    <div key={place} className={`text-center p-2 rounded-xl border transition-all cursor-pointer ${
                      awardPlacement === place
                        ? 'border-[#f59e0b]/60 bg-[#f59e0b]/10 text-[#f59e0b]'
                        : 'border-white/10 bg-white/5 text-[var(--color-gs-text-muted)] hover:border-[#f59e0b]/30'
                    }`}
                      onClick={() => setAwardPlacement(place)}
                    >
                      <div className="text-lg">
                        {place === '1st' ? '🥇' : place === '2nd' ? '🥈' : place === '3rd' ? '🥉' : '⚡'}
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider">{place}</div>
                      <div className="text-sm font-black">+{xp} XP</div>
                    </div>
                  ))}
                </div>

                {/* Member selector */}
                <div>
                  <label className="block text-xs text-[var(--color-gs-text-muted)] mb-2 font-bold uppercase tracking-wider">Select Member</label>
                  <select
                    value={awardUserId}
                    onChange={e => setAwardUserId(e.target.value)}
                    className="w-full bg-[var(--color-gs-bg)] border border-white/10 rounded-xl p-3 outline-none focus:border-[#f59e0b] text-white text-sm"
                  >
                    <option value="">-- Choose a member --</option>
                    {realMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.avatar} {m.name || 'Unknown'} {m.id === user.id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confirm award */}
                <button
                  onClick={handleAwardXP}
                  disabled={!awardUserId || awardingXP}
                  className="w-full py-3 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white font-black rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  {awardingXP
                    ? <><Loader2 size={18} className="animate-spin" /> Awarding…</>
                    : <><Zap size={18} /> Award {XP_VALUES[awardPlacement]} XP for {awardPlacement} Place</>
                  }
                </button>
                <p className="text-[10px] text-[var(--color-gs-text-muted)] text-center opacity-60">
                  ⚠️ XP awards are permanent. Each member can only be awarded once per event.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          {isMember && (
            <div className="flex gap-4 border-b border-white/10 pb-4">
              <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'chat' ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]" : "text-[var(--color-gs-text-muted)] hover:text-white"}`}>
                 <MessageSquare size={18} /> Chat
              </button>
              <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'tasks' ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]" : "text-[var(--color-gs-text-muted)] hover:text-white"}`}>
                 <Layout size={18} /> Tasks
              </button>
            </div>
          )}

          {isMember ? (
            <div className="glass-card p-6 rounded-2xl min-h-[500px] flex flex-col relative overflow-hidden">
               {/* Ambient Glow */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/5 blur-3xl pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00f0ff]/5 blur-3xl pointer-events-none" />
               
               {activeTab === 'chat' && (
                 <div className="flex flex-col flex-1 relative z-10">
                   <h3 className="text-xl font-bold font-heading text-white mb-4 flex justify-between items-center">
                     <div className="flex items-center gap-2"><MessageSquare className="text-[#00f0ff]" /> Group Communication</div>
                   </h3>

                   {/* Chat Messages Area */}
                   <div className="flex-1 bg-black/20 border border-white/5 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[350px] mb-4 custom-scrollbar">
                      {messagesLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-[var(--color-gs-text-muted)] gap-2">
                          <Loader2 className="animate-spin text-[var(--color-gs-cyan)]" size={24} />
                          <p className="text-xs font-bold">Syncing Chat...</p>
                        </div>
                      ) : (
                        groupMessages.map(msg => {
                          if (msg.isPoll) {
                            const pollData = msg.media;
                            const totalVotes = pollData.options.reduce((s, o) => s + o.votes, 0);
                            const hasVoted = pollData.voters?.[user.id] !== undefined;

                            return (
                              <div key={msg.id} className={"flex gap-3 " + (msg.isMine ? "flex-row-reverse" : "")}>
                                <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 " + (msg.isMine ? "bg-gradient-to-br from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)]" : msg.avatarBg)}>
                                  {msg.avatar}
                                </div>
                                <div className={"flex-1 " + (msg.isMine ? "flex flex-col items-end" : "")}>
                                  <div className="flex items-baseline gap-2">
                                    <span className={"font-bold text-sm " + (msg.isMine ? "text-[var(--color-gs-cyan)]" : "text-[var(--color-gs-text-main)]")}>{msg.sender}</span>
                                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                  </div>
                                  <div className={"bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] p-4 rounded-xl mt-1 w-full max-w-sm " + (msg.isMine ? "rounded-tr-none" : "rounded-tl-none")}>
                                    <h4 className="font-bold flex items-center gap-2 mb-3"><BarChart3 size={16} className="text-[var(--color-gs-cyan)]" /> {pollData.question}</h4>
                                    <div className="space-y-2">
                                      {pollData.options.map((opt, idx) => {
                                        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                        const isSelected = pollData.voters?.[user.id] === idx;
                                        return (
                                          <button 
                                            key={idx}
                                            onClick={() => handleVote(msg.id, idx)}
                                            disabled={hasVoted}
                                            className={"w-full relative overflow-hidden bg-[var(--color-gs-bg)] border rounded-lg p-2 text-left transition-all " + (isSelected ? "border-[var(--color-gs-cyan)] shadow-[0_0_10px_rgba(0,212,255,0.2)]" : "border-[var(--color-gs-border)] hover:border-[var(--color-gs-cyan)]/30")}
                                          >
                                            <div className="absolute left-0 top-0 bottom-0 bg-[var(--color-gs-cyan)]/10 transition-all duration-500" style={{ width: percentage + '%' }} />
                                            <span className="relative z-10 font-medium flex justify-between text-xs">
                                              {opt.text} 
                                              <span className="opacity-70">{percentage}% ({opt.votes})</span>
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <p className="text-[10px] text-[var(--color-gs-text-muted)] mt-2">{totalVotes} votes total</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id} className={"flex gap-3 " + (msg.isMine ? "flex-row-reverse" : "")}>
                              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 " + (msg.isMine ? "" : msg.avatarBg)}>
                                {msg.isMine ? (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] flex items-center justify-center text-sm">{msg.avatar}</div>
                                ) : msg.avatar}
                              </div>
                              <div className={"flex-1 " + (msg.isMine ? "flex flex-col items-end" : "")}>
                                <div className="flex items-baseline gap-2">
                                  <span className={"font-bold text-sm " + (msg.isMine ? "text-[var(--color-gs-cyan)]" : "text-[var(--color-gs-text-main)]")}>{msg.sender}</span>
                                  <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                </div>
                                {msg.media?.type === 'image' && (
                                  <img src={msg.media.url} alt="shared" className="max-w-xs rounded-xl mt-1 border border-[var(--color-gs-border)]" />
                                )}
                                {msg.media?.type === 'file' && (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl mt-1 text-xs">
                                    <File size={14} className="text-[var(--color-gs-cyan)]" />
                                    <span className="text-[var(--color-gs-text-main)]">{msg.media.name}</span>
                                    <span className="text-[var(--color-gs-text-muted)]">{msg.media.size}</span>
                                  </div>
                                )}
                                {msg.text && (
                                  <p className={"p-3 rounded-xl mt-1 max-w-md text-sm " + (msg.isMine 
                                    ? "bg-gradient-to-br from-[var(--color-gs-cyan)] to-[var(--color-gs-violet)] text-white rounded-tr-none shadow-[0_4px_15px_rgba(0,212,255,0.2)]" 
                                    : "text-[var(--color-gs-text-main)] bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-tl-none")}>
                                    {msg.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                   {/* Poll Creator */}
                   {showPollCreator && (
                     <div className="mb-3 p-4 bg-[var(--color-gs-bg)] border border-[var(--color-gs-cyan)]/30 rounded-xl space-y-3 animate-[slideInUp_0.15s_ease-out]">
                       <div className="flex justify-between items-center">
                         <h4 className="font-bold text-sm flex items-center gap-2"><BarChart3 size={16} className="text-[var(--color-gs-cyan)]" /> Create Poll</h4>
                         <button onClick={() => setShowPollCreator(false)} className="text-[var(--color-gs-text-muted)] hover:text-red-400"><X size={16} /></button>
                       </div>
                       <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Ask a question..."
                         className="w-full bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-gs-cyan)] text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]" />
                       {pollOptions.map((opt, i) => (
                         <div key={i} className="flex gap-2">
                           <input type="text" value={opt} onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                             placeholder={`Option ${i + 1}`}
                             className="flex-1 bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-gs-cyan)] text-[var(--color-gs-text-main)] placeholder-[var(--color-gs-text-muted)]" />
                           {pollOptions.length > 2 && (
                             <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="p-2 text-[var(--color-gs-text-muted)] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                           )}
                         </div>
                       ))}
                       <div className="flex gap-2">
                         {pollOptions.length < 6 && (
                           <button onClick={() => setPollOptions([...pollOptions, ''])} className="flex-1 py-2 text-xs border border-dashed border-[var(--color-gs-border)] rounded-lg text-[var(--color-gs-text-muted)] hover:border-[var(--color-gs-cyan)] hover:text-[var(--color-gs-cyan)] transition-colors flex items-center justify-center gap-1">
                             <Plus size={14} /> Add Option
                           </button>
                         )}
                         <button onClick={handleCreatePoll} className="flex-1 py-2 bg-[var(--color-gs-cyan)] text-[#0f172a] font-bold text-xs rounded-lg hover:bg-cyan-400 transition-colors">
                           Post Poll
                         </button>
                       </div>
                     </div>
                   )}

                   {/* Media Preview */}
                   {mediaPreview && (
                     <div className="flex items-center gap-3 mb-3 p-2 bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] rounded-xl">
                       {mediaPreview.type === 'image' ? (
                         <img src={mediaPreview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
                       ) : (
                         <div className="w-10 h-10 rounded-lg bg-[var(--color-gs-cyan)]/10 flex items-center justify-center"><File size={18} className="text-[var(--color-gs-cyan)]" /></div>
                       )}
                       <span className="text-sm text-[var(--color-gs-text-muted)] flex-1 truncate">{mediaPreview.name}</span>
                       <button onClick={() => setMediaPreview(null)} className="text-[var(--color-gs-text-muted)] hover:text-red-400 transition-colors"><X size={16} /></button>
                     </div>
                   )}

                   {/* Chat Input */}
                   <div className="relative z-10">
                     {showEmoji && <GroupEmojiPicker onSelect={e => setChatInput(prev => prev + e)} onClose={() => setShowEmoji(false)} />}
                     <form onSubmit={handleSendGroupMessage} className="flex gap-2 items-center glass-card rounded-2xl p-2 focus-within:border-[#00f0ff] focus-within:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all bg-white/5">
                       {/* File upload */}
                       <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={handleFileSelect} />
                       <button type="button" onClick={() => fileInputRef.current?.click()}
                         className="p-2 text-[var(--color-gs-text-muted)] hover:text-[#00f0ff] transition-colors rounded-xl hover:bg-white/5">
                         <Paperclip size={18} />
                       </button>

                       {/* Emoji */}
                       <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                         className={`p-2 transition-colors rounded-xl hover:bg-white/5 ${showEmoji ? 'text-[#a855f7]' : 'text-[var(--color-gs-text-muted)] hover:text-[#a855f7]'}`}>
                         <Smile size={18} />
                       </button>

                       {/* Poll */}
                       <button type="button" onClick={() => setShowPollCreator(prev => !prev)}
                         className={`p-2 transition-colors rounded-xl hover:bg-white/5 ${showPollCreator ? 'text-[#00f0ff]' : 'text-[var(--color-gs-text-muted)] hover:text-[#00f0ff]'}`}>
                         <BarChart3 size={18} />
                       </button>

                       <input
                         type="text"
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendGroupMessage(); } }}
                         placeholder="Type a message..."
                         className="flex-1 bg-transparent border-none px-2 py-2 outline-none text-white placeholder-white/30 text-sm"
                       />
                       <button
                         type="submit"
                         disabled={!chatInput.trim() && !mediaPreview}
                         className="p-2.5 bg-gradient-to-br from-[#00f0ff] to-[#a855f7] text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(0,240,255,0.3)] btn-scale"
                       >
                         <Send size={18} />
                       </button>
                     </form>
                   </div>
                 </div>
               )}
               {activeTab === 'tasks' && (
                 <KanbanBoard
                   groupId={group.id}
                   members={realMembers.length > 0 ? realMembers : [{ id: user.id, name: user.name || 'You', avatar: user.avatar || '🎓' }]}
                 />
               )}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00f0ff]/10 blur-3xl rounded-full" />
              <div className="w-full max-w-sm mx-auto flex flex-col gap-3 relative z-10">
                {group.privacy === 'password' && (
                  <input type="password" placeholder="Enter Group Password" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-[#00f0ff] text-white text-center transition-colors" />
                )}
                <button 
                  disabled={group.members >= group.maxMembers}
                  onClick={handleJoinGroup}
                  className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                >
                  {group.members >= group.maxMembers ? 'Group Full' : group.privacy === 'private' ? 'Request to Join' : group.privacy === 'password' ? 'Unlock & Join' : 'Join Group'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Event Details Bar */}
          <div className="glass-card rounded-2xl overflow-hidden relative group border border-white/10">
            {group.poster_url && (
              <div 
                onClick={() => setShowEventModal(true)}
                className="overflow-hidden h-40 cursor-pointer relative group/banner"
                title="Click to view full event popup"
              >
                <img src={group.poster_url} alt={`${group.name} Event Banner`} className="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-105" />
                <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-transparent to-[#050810]" />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-white flex items-center gap-1 opacity-0 group-hover/banner:opacity-100 transition-opacity">
                  <Sparkles size={11} className="text-[var(--color-gs-cyan)]" /> View Event Details
                </div>
              </div>
            )}
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  onClick={() => setShowInlineEventDetails(!showInlineEventDetails)}
                  className="text-xl font-bold font-heading text-white flex items-center gap-2 cursor-pointer hover:text-[var(--color-gs-cyan)] transition-colors select-none"
                  title="Click to toggle creator event details"
                >
                  <CalendarIcon className="text-[#a855f7]" /> Event Details
                  {showInlineEventDetails ? (
                    <ChevronUp size={16} className="text-[var(--color-gs-text-muted)]" />
                  ) : (
                    <ChevronDown size={16} className="text-[var(--color-gs-text-muted)]" />
                  )}
                </h3>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--color-gs-cyan)]/15 border border-[var(--color-gs-cyan)]/30 text-[var(--color-gs-cyan)] hover:bg-[var(--color-gs-cyan)]/25 transition-all flex items-center gap-1"
                  title="View full event details provided by creator"
                >
                  <Info size={13} /> Full Popup
                </button>
              </div>

              <div className="space-y-3">
                {/* Event Name card (Circled in user UI) */}
                <div 
                  onClick={() => setShowInlineEventDetails(!showInlineEventDetails)}
                  className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[var(--color-gs-cyan)]/10 via-white/5 to-transparent rounded-xl border border-[var(--color-gs-cyan)]/30 hover:border-[var(--color-gs-cyan)] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all cursor-pointer group/event"
                  role="button"
                  tabIndex={0}
                  title="Click to view full event information provided by creator"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)] group-hover/event:scale-110 transition-transform">
                      <CalendarIcon size={18} className="text-[var(--color-gs-cyan)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-bold text-[var(--color-gs-text-muted)] uppercase tracking-wider">Event Name</p>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)]">
                          {showInlineEventDetails ? 'Expanded' : 'Click to View'}
                        </span>
                      </div>
                      <p className="text-sm font-black text-white group-hover/event:text-[var(--color-gs-cyan)] transition-colors">{group.event}</p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/5 text-[var(--color-gs-text-muted)] group-hover/event:text-[var(--color-gs-cyan)] group-hover/event:bg-[var(--color-gs-cyan)]/10 transition-all">
                    {showInlineEventDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Creator & Event Information Accordion (Expands right inside this card!) */}
                {showInlineEventDetails && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3.5 animate-[fadeIn_0.2s_ease-out]">
                    {/* Creator header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-sm">
                          {creatorProfile?.avatar || '🎓'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {creatorProfile?.name || (group.adminId === user?.id ? `${user?.name || 'You'} (Creator)` : 'Organizer')}
                          </p>
                          <p className="text-[10px] text-[var(--color-gs-cyan)] font-semibold">Event Creator & Lead</p>
                        </div>
                      </div>

                      {creatorProfile?.id && creatorProfile.id !== user?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/chat');
                            showToast(`Opening chat with ${creatorProfile.name || 'Organizer'}`);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[var(--color-gs-cyan)]/20 text-[var(--color-gs-cyan)] transition-all"
                          title="Message Organizer"
                        >
                          <MessageSquare size={14} />
                        </button>
                      )}
                    </div>

                    {/* Creator's Vision & Description */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1 flex items-center gap-1">
                        <FileText size={11} className="text-[var(--color-gs-cyan)]" /> Creator's Vision & Goals
                      </p>
                      <p className="text-xs text-[var(--color-gs-text-main)] leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5 font-medium">
                        {group.description || "Building innovative solutions for the hackathon/competition."}
                      </p>
                    </div>

                    {/* Required skills */}
                    {group.skills && group.skills.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1 flex items-center gap-1">
                          <Tag size={11} className="text-[var(--color-gs-violet)]" /> Desired Skills
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {group.skills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--color-gs-cyan)]/10 border border-[var(--color-gs-cyan)]/25 text-[var(--color-gs-cyan)] flex items-center gap-1">
                              <ShieldCheck size={9} /> {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setShowEventModal(true)}
                      className="w-full py-2 bg-gradient-to-r from-[var(--color-gs-cyan)]/20 to-[var(--color-gs-violet)]/20 border border-[var(--color-gs-cyan)]/40 hover:border-[var(--color-gs-cyan)] text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                    >
                      <Info size={13} className="text-[var(--color-gs-cyan)]" /> Open Full Modal View
                    </button>
                  </div>
                )}

                <div 
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-3 p-3 bg-[var(--color-gs-bg)] hover:bg-white/5 rounded-xl border border-[var(--color-gs-border)] hover:border-[var(--color-gs-amber)]/40 transition-colors cursor-pointer"
                  title="Click to view event details"
                >
                  <div className="p-2 rounded-lg bg-[var(--color-gs-amber)]/10">
                    <CalendarIcon size={16} className="text-[var(--color-gs-amber)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gs-text-muted)]">Date</p>
                    <p className="text-sm font-bold text-[var(--color-gs-text-main)]">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div 
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-3 p-3 bg-[var(--color-gs-bg)] hover:bg-white/5 rounded-xl border border-[var(--color-gs-border)] hover:border-[var(--color-gs-violet)]/40 transition-colors cursor-pointer"
                  title="Click to view event details"
                >
                  <div className="p-2 rounded-lg bg-[var(--color-gs-violet)]/10">
                    <Clock size={16} className="text-[var(--color-gs-violet)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gs-text-muted)]">Time</p>
                    <p className="text-sm font-bold text-[var(--color-gs-text-main)]">10:00 AM — 6:00 PM</p>
                  </div>
                </div>

                <div 
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center gap-3 p-3 bg-[var(--color-gs-bg)] hover:bg-white/5 rounded-xl border border-[var(--color-gs-border)] hover:border-[var(--color-gs-green)]/40 transition-colors cursor-pointer"
                  title="Click to view event details"
                >
                  <div className="p-2 rounded-lg bg-[var(--color-gs-green)]/10">
                    <MapPin size={16} className="text-[var(--color-gs-green)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-gs-text-muted)]">Type</p>
                    <p className="text-sm font-bold text-[var(--color-gs-text-main)]">{group.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold font-heading text-white mb-4 flex items-center gap-2"><Users className="text-[#ec4899]" /> {`Members (${realMembers.length || group.members}${group.maxMembers ? '/' + group.maxMembers : ''})`}</h3>
            
            <div className="space-y-4">
               {realMembers.length === 0 ? (
                 <div className="px-2 py-4 text-center text-sm text-[var(--color-gs-text-muted)]">
                   Loading members...
                 </div>
               ) : realMembers.map((member) => {
                  const isCurrentUser = member.id === user.id;
                  const isGroupAdmin = member.id === group.adminId;
                  const FactionColor = factions[member.faction]?.color || 'text-gray-500';
                  const FactionBorder = factions[member.faction]?.border || 'border-gray-500';
                  const FactionName = factions[member.faction]?.name || 'Member';
                  return (
                   <div key={member.id} className="flex items-center gap-3 group cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all">
                     <div className="relative shrink-0">
                       <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-lg">{member.avatar || '👤'}</div>
                       {member.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full border border-[#050810]" />}
                     </div>
                     <div className="flex-1">
                       <p className="font-bold text-sm">
                         {isCurrentUser ? 'You' : member.name || 'Unknown User'}
                         {isGroupAdmin && <span className="ml-1 text-xs text-[var(--color-gs-cyan)]">(Admin)</span>}
                       </p>
                       <p className={"text-xs " + FactionColor}>{FactionName}</p>
                     </div>
                     {!isCurrentUser && (
                       <button onClick={(e) => {
                         e.stopPropagation();
                         navigate('/chat');
                         showToast(`Opened DM with ${member.name}`);
                       }} className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-gs-cyan)] hover:bg-[var(--color-gs-cyan)]/20 rounded-lg transition-all">
                         <MessageSquare size={16} />
                       </button>
                     )}
                   </div>
                  );
               })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        group={group}
        creatorProfile={creatorProfile}
        isMember={isMember}
        isAdmin={isAdmin}
        onJoinGroup={handleJoinGroup}
        onGroupUpdated={(updatedGroup) => {
          setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        }}
      />
    </div>
  );
}
