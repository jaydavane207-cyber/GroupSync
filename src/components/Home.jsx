import React from 'react';
import { 
  ArrowRight, 
  Users, 
  Zap, 
  Shield, 
  Sparkles, 
  Filter, 
  Code, 
  CheckCircle2, 
  MessageSquare, 
  FolderKanban, 
  BarChart3, 
  HeartHandshake,
  Trophy,
  Award
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Home({ onNavigate }) {
  const { theme } = useAppContext();

  const stats = [
    { number: '5,000+', label: 'Verified Students', color: 'text-gs-cyan' },
    { number: '500+', label: 'Formed Squads', color: 'text-gs-green' },
    { number: '50+', label: 'Campus Chapters', color: 'text-gs-violet' },
    { number: '80%+', label: 'Project Success Rate', color: 'text-gs-amber' },
  ];

  const advantages = [
    {
      icon: Filter,
      title: 'Skill-Based Matching',
      desc: 'AI algorithm pairs you with peers possessing complementary skills rather than mere social circles.',
      color: 'text-gs-cyan',
      bg: 'bg-gs-cyan/10',
      border: 'border-gs-cyan/30'
    },
    {
      icon: Award,
      title: 'Verified Credentials',
      desc: 'Prove your proficiencies through standardized skill quizzes, certificates, and peer endorsements.',
      color: 'text-gs-green',
      bg: 'bg-gs-green/10',
      border: 'border-gs-green/30'
    },
    {
      icon: MessageSquare,
      title: 'Integrated Collaboration',
      desc: 'Real-time team chat, direct messaging, and group channels all centralized in one fast platform.',
      color: 'text-gs-violet',
      bg: 'bg-gs-violet/10',
      border: 'border-gs-violet/30'
    },
    {
      icon: FolderKanban,
      title: 'Hackathon & Project Focus',
      desc: 'Discover upcoming hackathons, campus bounties, and term capstones actively recruiting talent.',
      color: 'text-gs-amber',
      bg: 'bg-gs-amber/10',
      border: 'border-gs-amber/30'
    },
    {
      icon: BarChart3,
      title: 'Team Analytics & XP',
      desc: 'Track team synergy, milestone progress, and earn XP badges as you complete collaborative challenges.',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30'
    },
    {
      icon: HeartHandshake,
      title: 'Inclusive by Design',
      desc: 'Eliminates popularity contests so introverts and underrepresented talent get fair discovery.',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Build Verified Profile',
      desc: 'List your stack, pass interactive skill quizzes, and showcase your best repositories and portfolio.',
    },
    {
      step: '02',
      title: 'AI Matches Your Synergy',
      desc: 'Our neural matching engine analyzes skill gaps, interests, and schedules to suggest high-compatibility teams.',
    },
    {
      step: '03',
      title: 'Form, Collaborate & Win',
      desc: 'Join squad channels, lock in roles, track milestones, and conquer hackathons together.',
    }
  ];

  return (
    <div className="w-full flex justify-center pb-20 overflow-x-hidden min-h-screen bg-transparent">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-24 z-10">
        
        {/* --- Hero Section --- */}
        <section className="relative pt-32 pb-6 md:pt-44 md:pb-12 flex flex-col items-center text-center animate-page-load">
          {/* Abstract glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-gs-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/3 w-[500px] h-[500px] bg-[var(--color-gs-secondary)]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gs-primary/30 bg-gs-primary/10 text-gs-primary text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Sparkles size={16} /> Connect Talent · Build Teams · Win Together
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white max-w-4xl tracking-tight leading-tight mb-6 font-heading">
            Build Your Dream Squad on{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gs-primary via-cyan-200 to-gs-secondary">
              GroupSync
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-[var(--color-gs-text-muted)] max-w-3xl mb-10 leading-relaxed font-medium">
            Stop defaulting to friend circles with skill mismatches. GroupSync connects student developers, designers, and innovators based on complementary proficiencies, shared interests, and verified track records.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-gradient-to-br from-[#00f0ff] to-[#a855f7] text-[#050810] text-lg font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2"
            >
              Find Teammates Now <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-gs-card/80 border border-white/20 text-lg font-bold rounded-2xl text-white hover:border-gs-primary transition-all flex items-center justify-center gap-2 hover:bg-white/5"
            >
              Sign In to Campus Hub
            </button>
          </div>
        </section>

        {/* --- Stats Counter Grid --- */}
        <section className="relative z-10">
          <div className="bg-gs-card border border-gs-border rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gs-border/60">
              {stats.map((s, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pt-6 md:pt-0' : ''}`}>
                  <div className={`text-4xl md:text-5xl font-black font-heading mb-2 ${s.color}`}>
                    {s.number}
                  </div>
                  <p className="text-sm md:text-base font-bold text-gs-text-muted uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- For Introverts Too Spotlight --- */}
        <section className="relative z-10">
          <div className="bg-gradient-to-r from-purple-950/40 via-gs-card to-cyan-950/40 border border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-20 h-20 rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-4xl shrink-0 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                💜
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black font-heading text-white mb-2">
                  Built For Introverts & Hidden Talent Too
                </h3>
                <p className="text-gs-text-muted text-base md:text-lg leading-relaxed">
                  No social anxiety or awkward networking required. GroupSync evaluates compatibility by technical proficiencies, verified badges, and work styles so your genuine talent speaks for itself.
                </p>
              </div>
              <button
                onClick={() => onNavigate('signup')}
                className="shrink-0 px-6 py-3.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              >
                Join Anonymously
              </button>
            </div>
          </div>
        </section>

        {/* --- Competitive Advantages Grid --- */}
        <section className="relative z-10" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 font-heading">
              Why Students Choose GroupSync
            </h2>
            <p className="text-[var(--color-gs-text-muted)] max-w-2xl mx-auto text-lg font-medium">
              Everything required to go from solo hacker to winning cross-functional team in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i} 
                  className="bg-gs-card border border-gs-border rounded-3xl p-8 hover:border-gs-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${feature.bg} ${feature.color} ${feature.border} shadow-inner`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 font-heading">{feature.title}</h3>
                    <p className="text-[var(--color-gs-text-muted)] text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- How it Works --- */}
        <section className="relative z-10" id="how-it-works">
          <div className="bg-gs-card border border-gs-border rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-14 relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 font-heading">
                How It Works
              </h2>
              <p className="text-[var(--color-gs-text-muted)] max-w-xl mx-auto text-base">
                Three frictionless steps to assemble a high-compatibility squad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 bg-gs-bg/60 border border-gs-border rounded-2xl">
                  <div className="text-4xl font-black text-gs-cyan font-heading">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">{step.title}</h3>
                  <p className="text-[var(--color-gs-text-muted)] text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="relative z-10 text-center flex flex-col items-center pb-16">
          <Shield size={48} className="text-gs-cyan mb-6 drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 max-w-2xl font-heading">
            Ready to Build Your Winning Team?
          </h2>
          <p className="text-base md:text-lg text-[var(--color-gs-text-muted)] mb-10 max-w-xl">
            Join thousands of university peers forming high-performance teams and winning top hackathons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-gradient-to-br from-[#00f0ff] to-[#a855f7] text-[#050810] text-lg font-black rounded-2xl shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              Get Started for Free
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-gs-card border border-white/20 text-lg font-bold rounded-2xl text-white hover:border-gs-primary transition-all hover:bg-white/5"
            >
              Sign In
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
