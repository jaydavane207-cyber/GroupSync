import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  UserPlus, 
  Search, 
  MessageSquare, 
  Check, 
  X, 
  Sparkles, 
  Circle, 
  Mail, 
  UserCheck, 
  Shield, 
  ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function FriendsPage() {
  const { user, students, showToast } = useAppContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState('friends'); // 'friends' | 'requests' | 'suggestions'
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Mock State
  const [friends, setFriends] = useState([
    {
      id: 'f1',
      name: 'Alice Johnson',
      avatar: '👩‍💻',
      college: 'Stanford University',
      course: 'Computer Science',
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
      status: 'online',
      mutualCount: 4,
      faction: 'innovators'
    },
    {
      id: 'f2',
      name: 'Bob Smith',
      avatar: '👨‍💼',
      college: 'MIT',
      course: 'Data Science',
      skills: ['Python', 'PyTorch', 'SQL', 'FastAPI'],
      status: 'online',
      mutualCount: 7,
      faction: 'architects'
    },
    {
      id: 'f3',
      name: 'Carol White',
      avatar: '👩‍🎨',
      college: 'UC Berkeley',
      course: 'Design & Media',
      skills: ['Figma', 'UI/UX', 'Design Systems', 'Blender'],
      status: 'offline',
      mutualCount: 2,
      faction: 'creators'
    },
    {
      id: 'f4',
      name: 'David Chen',
      avatar: '👨‍🔬',
      college: 'Carnegie Mellon',
      course: 'Cybersecurity',
      skills: ['Go', 'Rust', 'Penetration Testing', 'Docker'],
      status: 'offline',
      mutualCount: 5,
      faction: 'debuggers'
    }
  ]);

  const [requests, setRequests] = useState([
    {
      id: 'r1',
      name: 'Emma Watson',
      avatar: '👩‍💻',
      college: 'Harvard University',
      course: 'Software Engineering',
      skills: ['Python', 'AI/ML', 'Docker'],
      message: 'Saw your profile on the Leaderboard! Would love to team up for the next Hackathon.',
      timeAgo: '2h ago'
    },
    {
      id: 'r2',
      name: 'Rohan Mehta',
      avatar: '👨‍💻',
      college: 'IIT Delhi',
      course: 'Computer Science',
      skills: ['React Native', 'Firebase', 'Tailwind'],
      message: 'Looking for a solid frontend engineer for our mobile climate app.',
      timeAgo: '1d ago'
    }
  ]);

  const [suggestions, setSuggestions] = useState([
    {
      id: 's1',
      name: 'Sophia Patel',
      avatar: '👩‍🔬',
      college: 'Georgia Tech',
      course: 'Machine Learning',
      skills: ['NLP', 'Transformers', 'Python', 'Kubernetes'],
      mutualCount: 6,
      reason: 'Shares 3 core skills & same faction'
    },
    {
      id: 's2',
      name: 'Liam Neeson',
      avatar: '👨‍💻',
      college: 'UT Austin',
      course: 'Cloud Computing',
      skills: ['AWS', 'DevOps', 'Terraform', 'Go'],
      mutualCount: 3,
      reason: 'Complementary cloud skills for your stack'
    },
    {
      id: 's3',
      name: 'Zara Khan',
      avatar: '👩‍🎨',
      college: 'Columbia University',
      course: 'Human-Computer Interaction',
      skills: ['Product Design', 'Wireframing', 'User Research'],
      mutualCount: 5,
      reason: 'Top UI/UX designer on campus'
    }
  ]);

  const filteredFriends = friends.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
    f.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAcceptRequest = (req) => {
    setRequests(prev => prev.filter(r => r.id !== req.id));
    setFriends(prev => [
      {
        id: req.id,
        name: req.name,
        avatar: req.avatar,
        college: req.college,
        course: req.course,
        skills: req.skills,
        status: 'online',
        mutualCount: 1,
        faction: 'innovators'
      },
      ...prev
    ]);
    showToast(`Accepted friend request from ${req.name}!`, 'success');
  };

  const handleDeclineRequest = (id) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showToast('Friend request declined.', 'info');
  };

  const handleAddFriend = (sugg) => {
    setSuggestions(prev => prev.filter(s => s.id !== sugg.id));
    showToast(`Friend request sent to ${sugg.name}!`, 'success');
  };

  return (
    <div className="space-y-8 animate-[slideIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black font-heading text-gs-text-main tracking-tight drop-shadow-sm flex items-center gap-3">
            <Users2 className="text-gs-cyan w-10 h-10" /> Friends & Connections
          </h1>
          <p className="text-gs-text-muted mt-2 text-lg font-medium">
            Build your high-trust peer network, accept team invites, and discover skilled collaborators.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 bg-gs-card border border-gs-border p-2 rounded-2xl relative z-10 w-fit backdrop-blur-xl shadow-lg">
        <button
          onClick={() => setTab('friends')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            tab === 'friends'
              ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg'
          }`}
        >
          <Users2 size={16} /> My Friends ({friends.length})
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            tab === 'requests'
              ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg'
          }`}
        >
          <UserPlus size={16} /> Requests
          {requests.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center ml-1">
              {requests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('suggestions')}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            tab === 'suggestions'
              ? 'bg-gs-primary text-[#050810] shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg'
          }`}
        >
          <Sparkles size={16} /> Recommended ({suggestions.length})
        </button>
      </div>

      {/* Tab: Friends */}
      {tab === 'friends' && (
        <div className="space-y-6 relative z-10">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-gs-card border border-gs-border rounded-2xl px-4 py-3 focus-within:border-gs-primary transition-colors">
            <Search className="text-gs-text-muted shrink-0" size={20} />
            <input
              type="text"
              placeholder="Search friends by name, skill, or university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-gs-text-main placeholder-gs-text-muted text-base"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gs-text-muted hover:text-gs-text-main">
                <X size={18} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFriends.map(friend => (
              <div
                key={friend.id}
                className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl hover:border-gs-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-3xl shadow-inner">
                          {friend.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gs-card ${
                          friend.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gs-text-main hover:text-gs-primary transition-colors">
                          {friend.name}
                        </h3>
                        <p className="text-xs text-gs-text-muted">{friend.course} · {friend.college}</p>
                        <p className="text-[11px] font-semibold text-gs-cyan mt-0.5">
                          {friend.status === 'online' ? '🟢 Active now' : '⚪ Last seen recently'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gs-text-muted mb-2">
                      Verified Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {friend.skills.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-gs-bg border border-gs-border text-gs-text-main text-xs rounded-lg font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex-1 py-2.5 bg-gs-primary text-[#050810] rounded-xl font-bold text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  >
                    <MessageSquare size={16} /> Direct Message
                  </button>
                  <button
                    onClick={() => navigate('/public-profile')}
                    className="px-4 py-2.5 border border-gs-border rounded-xl text-gs-text-muted hover:text-gs-text-main hover:bg-gs-bg font-semibold text-sm transition-colors"
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredFriends.length === 0 && (
            <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <Users2 size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">No friends found</p>
              <p className="text-sm text-gs-text-muted mt-1">Try switching to the Recommended tab to discover peers</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Requests */}
      {tab === 'requests' && (
        <div className="space-y-4 relative z-10">
          {requests.map(req => (
            <div
              key={req.id}
              className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-gs-bg border border-gs-border flex items-center justify-center text-3xl shrink-0 shadow-inner">
                  {req.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gs-text-main">{req.name}</h3>
                    <span className="text-xs text-gs-text-muted">· {req.timeAgo}</span>
                  </div>
                  <p className="text-xs text-gs-text-muted">{req.course} · {req.college}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {req.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-gs-bg border border-gs-border text-gs-text-main text-[11px] rounded font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gs-text-muted italic bg-gs-bg/60 border border-gs-border/50 rounded-xl p-3 mt-3">
                    "{req.message}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleAcceptRequest(req)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050810] font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                >
                  <Check size={16} /> Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(req.id)}
                  className="flex-1 md:flex-none px-4 py-2.5 border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <UserCheck size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">No pending connection requests</p>
              <p className="text-sm text-gs-text-muted mt-1">You're all caught up on new connection invites!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Suggestions */}
      {tab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {suggestions.map(sugg => (
            <div
              key={sugg.id}
              className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl flex flex-col justify-between text-center group hover:border-gs-primary/50 transition-all duration-300"
            >
              <div>
                <div className="w-20 h-20 rounded-3xl bg-gs-bg border border-gs-border flex items-center justify-center text-4xl mx-auto mb-4 shadow-inner group-hover:scale-105 transition-transform">
                  {sugg.avatar}
                </div>
                <h3 className="font-bold text-lg text-gs-text-main">{sugg.name}</h3>
                <p className="text-xs text-gs-text-muted">{sugg.course}</p>
                <p className="text-xs text-gs-cyan font-medium mt-1">{sugg.college}</p>
                <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg py-1 px-2 mt-3 font-semibold">
                  💡 {sugg.reason}
                </p>

                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {sugg.skills.map(s => (
                    <span key={s} className="px-2.5 py-0.5 bg-gs-bg border border-gs-border text-gs-text-main text-[11px] rounded-lg font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleAddFriend(sugg)}
                className="mt-6 w-full py-2.5 bg-gs-primary text-[#050810] font-bold rounded-xl text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              >
                <UserPlus size={16} /> Connect & Invite
              </button>
            </div>
          ))}

          {suggestions.length === 0 && (
            <div className="col-span-3 text-center py-16 bg-gs-card border border-gs-border rounded-3xl p-8">
              <Sparkles size={48} className="mx-auto text-gs-text-muted opacity-40 mb-3" />
              <p className="text-lg font-bold text-gs-text-main">No more suggestions right now</p>
              <p className="text-sm text-gs-text-muted mt-1">Check back as new students join the campus hub</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
