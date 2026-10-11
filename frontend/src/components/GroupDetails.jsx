import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock, Unlock, Settings, LogOut, ShieldAlert, MessageSquare, Layout, Calendar as CalendarIcon, CornerDownRight, AlignLeft, AtSign, Send, Smile, Paperclip, Clock, MapPin, X, Image, File, BarChart3, Plus, Trash2, Loader2, Award, Medal, Info, ExternalLink, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { XP_VALUES } from '@/pages/Leaderboard';
import { useAppContext } from '@/context/AppContext';
import { ONBOARDING_AVATARS } from '@/data/mockData';
import KanbanBoard from './KanbanBoard';
import EventDetailsModal from '@/components/modals/EventDetailsModal';
import supabase from '@/lib/supabase';

// ─── Emoji Data ───────────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = {
  '😀 Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😙','😚','😋','😛','😜','🤪','😝','🤑','🤗','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴'],
  '👋 Gestures': ['👋','🤚','🖐️','✋','🖖','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏'],
  '❤️ Hearts': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝'],
  '🎉 Celebration': ['🎉','🎊','🎈','🎂','🎀','🎁','🏆','🥇','🥈','🥉','🏅','🎖️','🎫','🎟️','🎭'],
  '💻 Tech': ['💻','🖥️','📱','⌨️','🖱️','💾','💿','📀','📊','📈','📉','🔍','🔎','💡','🔋','🔌'],
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
              className={"px-2 py-1 rounded-lg text-xs whitespace-nowrap transition-colors " + (activeCategory === cat ? 'bg-blue-500/10 text-blue-500' : 'text-gs-text-muted hover:bg-black/5 dark:hover:bg-white/[0.04]')}
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
  
  const [localGroup, setLocalGroup] = useState(null);
  const [isFetchingGroup, setIsFetchingGroup] = useState(true);

  // Update context state but use 'id' primarily
  useEffect(() => {
    if (id) setSelectedGroupId(Number(id));
  }, [id, setSelectedGroupId]);

  // Sync or fetch group from Supabase
  useEffect(() => {
    if (!id) return;
    const found = groups.find(g => g.id === Number(id));
    if (found) {
      setLocalGroup(found);
      setIsFetchingGroup(false);
      return;
    }

    const fetchSingleGroup = async () => {
      setIsFetchingGroup(true);
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('*, group_members(profile_id)')
          .eq('id', Number(id))
          .maybeSingle();

        if (!error && data) {
          const mapped = {
            ...data,
            adminId: data.admin_id,
            maxMembers: Math.min(data.max_members || data.maxMembers || 10, 10),
            memberIds: data.group_members?.map(m => m.profile_id) || []
          };
          setLocalGroup(mapped);
        }
      } catch (e) {
        console.error('Error fetching group:', e);
      } finally {
        setIsFetchingGroup(false);
      }
    };

    fetchSingleGroup();
  }, [id, groups]);

  const group = groups.find(g => g.id === Number(id)) || localGroup;
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
    timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    isMine: user?.id ? m.sender_id === user.id : false,
    media: m.media,
    isPoll: m.is_poll,
    sender_id: m.sender_id,
    created_at: m.created_at
  }), [user?.id]);

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
  }, [selectedGroupId, fetchChatHistory, user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages]);

  if (isFetchingGroup && !group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500 dark:text-slate-400">
        <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-8">
        <span className="text-5xl">🔍</span>
        <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Group Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This group may have been archived, disbanded, or you followed an invalid link.</p>
        <button onClick={() => navigate('/browse')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors">Browse Groups</button>
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

  const isAdmin = Boolean((group?.adminId && user?.id && group.adminId === user.id) || (group?.admin_id && user?.id && group.admin_id === user.id));
  const isMember = Boolean((group?.memberIds && user?.id && group.memberIds.includes(user.id)) || (user?.id && realMembers.some(m => m.id === user.id)));

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
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-3">
            {group.name} 
            {group.privacy === 'private' && <Lock className="text-slate-400" size={22}/>}
            {group.privacy === 'public' && <Unlock className="text-emerald-600 dark:text-emerald-400" size={22}/>}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.event} • {group.type}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={() => setShowSettings(!showSettings)} className="px-3.5 py-2 glass-card hover:border-slate-400 dark:hover:border-slate-600 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium">
              <Settings size={15} className="text-blue-600 dark:text-blue-400" /> Settings
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
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Group Privacy</label>
            <select value={group.privacy} onChange={handleChangePrivacy} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white appearance-none max-w-md transition-colors text-xs">
              <option value="public">Public (Anyone can see and request)</option>
              <option value="private">Private (Hidden from browse, invite only)</option>
              <option value="password">Password Protected (Visible, requires password)</option>
            </select>
          </div>
          {group.privacy === 'password' && (
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Set Password</label>
              <input type="text" placeholder="Enter password (mock)" className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white max-w-md text-xs" />
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
                        {m.avatar} {m.name || 'Unknown'} {user?.id && m.id === user.id ? '(You)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Confirm award */}
                <button
                  onClick={handleAwardXP}
                  disabled={!awardUserId || awardingXP}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {awardingXP
                    ? <><Loader2 size={16} className="animate-spin" /> Awarding...</>
                    : <><Award size={16} /> Award {XP_VALUES[awardPlacement]} XP for {awardPlacement} Place</>
                  }
                </button>
                <p className="text-[10px] text-[var(--color-gs-text-muted)] text-center opacity-60">
                  XP awards are permanent. Each member can only be awarded once per event.
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
            <div className="flex gap-2 border-b border-gs-border pb-2.5">
              <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-2 px-3.5 py-1.5 font-medium text-xs rounded-lg transition-colors border ${activeTab === 'chat' ? "bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30" : "border-transparent text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04]"}`}>
                 <MessageSquare size={14} /> Chat
              </button>
              <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 px-3.5 py-1.5 font-medium text-xs rounded-lg transition-colors border ${activeTab === 'tasks' ? "bg-[#6D6AF6]/10 text-[#9182f8] border-[#7c6af6]/30" : "border-transparent text-gs-text-muted hover:text-gs-text-main hover:bg-white/[0.04]"}`}>
                 <Layout size={14} /> Tasks
              </button>
            </div>
          )}

          {isMember ? (
            <div className="glass-card rounded-xl p-5 min-h-[500px] flex flex-col relative overflow-hidden shadow-xs">
               {activeTab === 'chat' && (
                 <div className="flex flex-col flex-1 relative z-10">
                   <h3 className="text-sm font-semibold text-gs-text-main mb-4 flex justify-between items-center">
                     <div className="flex items-center gap-2"><MessageSquare className="text-[#9182f8]" size={16} /> Group Communication</div>
                   </h3>

                   {/* Chat Messages Area */}
                   <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4 overflow-y-auto max-h-[350px] mb-4 custom-scrollbar">
                      {messagesLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-2">
                          <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={20} />
                          <p className="text-xs font-semibold">Syncing Chat...</p>
                        </div>
                      ) : (
                        groupMessages.map(msg => {
                          if (msg.isPoll) {
                            const pollData = msg.media;
                            const totalVotes = pollData.options.reduce((s, o) => s + o.votes, 0);
                            const hasVoted = Boolean(user?.id && pollData.voters?.[user.id] !== undefined);

                            return (
                              <div key={msg.id} className={"flex gap-3 " + (msg.isMine ? "flex-row-reverse" : "")}>
                                <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 " + (msg.isMine ? "bg-blue-600 text-white" : msg.avatarBg)}>
                                  {msg.avatar}
                                </div>
                                <div className={"flex-1 " + (msg.isMine ? "flex flex-col items-end" : "")}>
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-semibold text-xs text-gs-text-main">{msg.sender}</span>
                                    <span className="text-[10px] text-gs-text-muted">{msg.timestamp}</span>
                                  </div>
                                  <div className={"bg-gs-card border border-gs-border p-3.5 rounded-xl mt-1 w-full max-w-sm " + (msg.isMine ? "rounded-tr-none" : "rounded-tl-none")}>
                                    <h4 className="font-semibold flex items-center gap-2 mb-2.5 text-xs text-gs-text-main"><BarChart3 size={14} className="text-blue-500" /> {pollData.question}</h4>
                                    <div className="space-y-1.5">
                                      {pollData.options.map((opt, idx) => {
                                        const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                                        const isSelected = Boolean(user?.id && pollData.voters?.[user.id] === idx);
                                        return (
                                          <button 
                                            key={idx}
                                            onClick={() => handleVote(msg.id, idx)}
                                            disabled={hasVoted}
                                            className={"w-full relative overflow-hidden bg-black/5 dark:bg-white/[0.02] border rounded-lg p-2 text-left transition-colors " + (isSelected ? "border-blue-500" : "border-gs-border hover:border-gs-border/80")}
                                          >
                                            <div className="absolute left-0 top-0 bottom-0 bg-blue-500/10 transition-all duration-300" style={{ width: percentage + '%' }} />
                                            <span className="relative z-10 font-medium flex justify-between text-xs">
                                              {opt.text} 
                                              <span className="opacity-70">{percentage}% ({opt.votes})</span>
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <p className="text-[10px] text-gs-text-muted mt-2">{totalVotes} votes total</p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id} className={"flex gap-3 " + (msg.isMine ? "flex-row-reverse" : "")}>
                              <div className={"w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 " + (msg.isMine ? "" : msg.avatarBg)}>
                                {msg.isMine ? (
                                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">{msg.avatar}</div>
                                ) : msg.avatar}
                              </div>
                              <div className={"flex-1 " + (msg.isMine ? "flex flex-col items-end" : "")}>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-semibold text-xs text-gs-text-main">{msg.sender}</span>
                                  <span className="text-[10px] text-gs-text-muted">{msg.timestamp}</span>
                                </div>
                                {msg.media?.type === 'image' && (
                                  <img src={msg.media.url} alt="shared" className="max-w-xs rounded-xl mt-1 border border-gs-border" />
                                )}
                                {msg.media?.type === 'file' && (
                                  <div className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl mt-1 text-xs">
                                    <File size={14} className="text-blue-500" />
                                    <span className="text-gs-text-main">{msg.media.name}</span>
                                    <span className="text-gs-text-muted">{msg.media.size}</span>
                                  </div>
                                )}
                                {msg.text && (
                                  <p className={"px-3.5 py-2 rounded-2xl mt-1 max-w-md text-xs leading-relaxed break-words " + (msg.isMine 
                                    ? "bg-blue-600 text-white rounded-tr-xs" 
                                    : "text-gs-text-main bg-black/5 dark:bg-white/[0.06] rounded-tl-xs")}>
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
                     <div className="mb-3 p-3.5 glass-card rounded-xl space-y-3">
                       <div className="flex justify-between items-center">
                         <h4 className="font-semibold text-xs flex items-center gap-2 text-gs-text-main"><BarChart3 size={15} className="text-blue-500" /> Create Poll</h4>
                         <button onClick={() => setShowPollCreator(false)} className="text-gs-text-muted hover:text-gs-text-main"><X size={15} /></button>
                       </div>
                       <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="Ask a question..."
                         className="w-full bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 text-gs-text-main placeholder-gs-text-muted" />
                       {pollOptions.map((opt, i) => (
                         <div key={i} className="flex gap-2">
                           <input type="text" value={opt} onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                             placeholder={`Option ${i + 1}`}
                             className="flex-1 bg-black/5 dark:bg-white/[0.03] border border-gs-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-blue-500 text-gs-text-main placeholder-gs-text-muted" />
                           {pollOptions.length > 2 && (
                             <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="p-2 text-gs-text-muted hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                           )}
                         </div>
                       ))}
                       <div className="flex gap-2">
                         {pollOptions.length < 6 && (
                           <button onClick={() => setPollOptions([...pollOptions, ''])} className="flex-1 py-1.5 text-xs border border-dashed border-gs-border rounded-lg text-gs-text-muted hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-1">
                             <Plus size={13} /> Add Option
                           </button>
                         )}
                         <button onClick={handleCreatePoll} className="flex-1 py-1.5 bg-blue-600 text-white font-medium text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                           Post Poll
                         </button>
                       </div>
                     </div>
                   )}

                   {/* Media Preview */}
                   {mediaPreview && (
                     <div className="flex items-center gap-3 mb-3 p-2 glass-card rounded-xl">
                       {mediaPreview.type === 'image' ? (
                         <img src={mediaPreview.url} alt="preview" className="w-14 h-14 rounded-lg object-cover" />
                       ) : (
                         <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><File size={16} className="text-blue-500" /></div>
                       )}
                       <span className="text-xs text-gs-text-muted flex-1 truncate">{mediaPreview.name}</span>
                       <button onClick={() => setMediaPreview(null)} className="text-gs-text-muted hover:text-red-500 transition-colors"><X size={15} /></button>
                     </div>
                   )}

                   {/* Chat Input */}
                   <div className="relative z-10">
                     {showEmoji && <GroupEmojiPicker onSelect={e => setChatInput(prev => prev + e)} onClose={() => setShowEmoji(false)} />}
                     <form onSubmit={handleSendGroupMessage} className="flex gap-2 items-center glass-elevated rounded-xl p-1.5 focus-within:border-[#7c6af6] transition-colors">
                       {/* File upload */}
                       <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={handleFileSelect} />
                       <button type="button" onClick={() => fileInputRef.current?.click()}
                         className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60">
                         <Paperclip size={18} />
                       </button>

                       {/* Emoji */}
                       <button type="button" onClick={() => setShowEmoji(prev => !prev)}
                         className={`p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 ${showEmoji ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                         <Smile size={18} />
                       </button>

                       {/* Poll */}
                       <button type="button" onClick={() => setShowPollCreator(prev => !prev)}
                         className={`p-2 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/60 ${showPollCreator ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
                         <BarChart3 size={18} />
                       </button>

                       <input
                         type="text"
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendGroupMessage(); } }}
                         placeholder="Type a message..."
                         className="flex-1 bg-transparent border-none px-2 py-2 outline-none text-slate-900 dark:text-white placeholder-slate-400 text-sm"
                       />
                       <button
                         type="submit"
                         disabled={!chatInput.trim() && !mediaPreview}
                         className="p-1.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-xs btn-tactile"
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
                   members={realMembers.length > 0 ? realMembers : [{ id: user?.id || 'you', name: user?.name || 'You', avatar: user?.avatar || '🎓' }]}
                 />
               )}
            </div>
          ) : (
            <div className="bg-gs-card border border-gs-border p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden shadow-xs">
              <div className="w-full max-w-sm mx-auto flex flex-col gap-3 relative z-10">
                {group.privacy === 'password' && (
                  <input type="password" placeholder="Enter Group Password" className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white text-center transition-colors text-xs" />
                )}
                <button 
                  disabled={group.members >= group.maxMembers}
                  onClick={handleJoinGroup}
                  className="w-full py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium text-xs rounded-lg shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed btn-tactile"
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
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white flex items-center gap-1 opacity-0 group-hover/banner:opacity-100 transition-opacity">
                  <CalendarIcon size={11} className="text-blue-400" /> View Event Details
                </div>
              </div>
            )}
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 
                  onClick={() => setShowEventModal(true)}
                  className="text-xl font-bold font-heading text-white flex items-center gap-2 cursor-pointer hover:text-blue-400 transition-colors select-none"
                  title="Click to view full event details"
                >
                  <CalendarIcon className="text-blue-500" /> Event Details
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEventModal(true)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="View full event details provided by creator"
                >
                  <Info size={14} /> Full Info
                </button>
              </div>

              <div className="space-y-3">
                {/* Event Name card (Circled in user UI) */}
                <div 
                  onClick={() => setShowEventModal(true)}
                  className="flex items-center justify-between p-3.5 bg-[var(--color-gs-bg)] rounded-xl border border-[var(--color-gs-border)] hover:border-blue-500/40 transition-colors cursor-pointer group/event"
                  role="button"
                  tabIndex={0}
                  title="Click to view full event information provided by creator"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <CalendarIcon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-medium text-[var(--color-gs-text-muted)] uppercase tracking-wider">Event Name</p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          View Info
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-gs-text-main)] group-hover/event:text-blue-500 transition-colors">{group.event}</p>
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg text-[var(--color-gs-text-muted)] group-hover/event:text-blue-500 transition-colors">
                    <Info size={15} />
                  </div>
                </div>

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
                  const isCurrentUser = Boolean(user?.id && member.id === user.id);
                  const isGroupAdmin = Boolean((group?.adminId && member.id === group.adminId) || (group?.admin_id && member.id === group.admin_id));
                  const FactionColor = (member.faction && factions?.[member.faction]?.color) || 'text-gray-500';
                  const FactionBorder = (member.faction && factions?.[member.faction]?.border) || 'border-gray-500';
                  const FactionName = (member.faction && factions?.[member.faction]?.name) || 'Member';
                  return (
                   <div key={member.id} className="flex items-center gap-3 group cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-all">
                     <div className="relative shrink-0">
                       <div className="w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-lg">{member.avatar || '👤'}</div>
                       {member.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] rounded-full border border-[#050810]" />}
                     </div>
                     <div className="flex-1">
                       <p className="font-bold text-sm">
                         {isCurrentUser ? 'You' : member.name || 'Unknown User'}
                         {isGroupAdmin && <span className="ml-1 text-xs text-blue-400">(Admin)</span>}
                       </p>
                       <p className={"text-xs " + FactionColor}>{FactionName}</p>
                     </div>
                     {!isCurrentUser && (
                       <button onClick={(e) => {
                         e.stopPropagation();
                         navigate('/chat');
                         showToast(`Opened DM with ${member.name}`);
                       }} className="opacity-0 group-hover:opacity-100 p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
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




