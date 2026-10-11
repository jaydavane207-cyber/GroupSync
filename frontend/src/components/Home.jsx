import React from 'react';
import { 
  ArrowRight, 
  Users, 
  Shield, 
  Filter, 
  Code, 
  CheckCircle2, 
  MessageSquare, 
  FolderKanban, 
  BarChart3, 
  HeartHandshake,
  Trophy,
  Award,
  GraduationCap,
  Layers,
  ChevronRight,
  Cpu
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Home({ onNavigate }) {
  const { theme } = useAppContext();

  const stats = [
    { number: '5,000+', label: 'Verified Students' },
    { number: '520+', label: 'Active Project Squads' },
    { number: '48', label: 'University Chapters' },
    { number: '84%', label: 'Hackathon Finish Rate' },
  ];

  const advantages = [
    {
      icon: Filter,
      title: 'Skill-First Matching',
      desc: 'Connect with peers whose technical skills complement your own, rather than settling for random social circles.',
      gradient: 'from-violet-500/10 to-purple-500/5',
      border: 'hover:border-violet-500/30',
      iconBg: 'bg-violet-500/10 text-violet-400',
    },
    {
      icon: Award,
      title: 'Verified Competencies',
      desc: 'Demonstrate real capability through standardized technical assessments, certificates, and peer endorsements.',
      gradient: 'from-sky-500/10 to-cyan-500/5',
      border: 'hover:border-sky-500/30',
      iconBg: 'bg-sky-500/10 text-sky-400',
    },
    {
      icon: MessageSquare,
      title: 'Dedicated Squad Rooms',
      desc: 'Real-time project chats, resource sharing, and direct messaging built specifically for student collaboration.',
      gradient: 'from-emerald-500/10 to-green-500/5',
      border: 'hover:border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      icon: FolderKanban,
      title: 'Hackathon & Capstone Focus',
      desc: 'Browse open vacancies for upcoming college hackathons, senior capstones, and interdisciplinary lab research.',
      gradient: 'from-amber-500/10 to-yellow-500/5',
      border: 'hover:border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
    },
    {
      icon: HeartHandshake,
      title: 'Equal Merit Discovery',
      desc: 'Removes social barriers so quiet coders, design thinkers, and underrepresented talent get discovered fairly.',
      gradient: 'from-pink-500/10 to-rose-500/5',
      border: 'hover:border-pink-500/30',
      iconBg: 'bg-pink-500/10 text-pink-400',
    },
    {
      icon: BarChart3,
      title: 'Squad Milestones & Reviews',
      desc: 'Track team sprint progress, coordinate role responsibilities, and earn academic standing across projects.',
      gradient: 'from-indigo-500/10 to-blue-500/5',
      border: 'hover:border-indigo-500/30',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Build Your Academic Dossier',
      desc: 'Add your primary tech stack, pass verified skill assessments, and showcase past work.',
      color: 'text-violet-400',
    },
    {
      step: '02',
      title: 'Explore Compatible Squads',
      desc: 'Browse active teams looking for your specific skills, or create your own squad charter.',
      color: 'text-sky-400',
    },
    {
      step: '03',
      title: 'Collaborate & Ship Together',
      desc: 'Coordinate in real-time squad rooms, lock in sprint deliverables, and present at campus showcases.',
      color: 'text-emerald-400',
    }
  ];

  return (
    <div className="w-full flex justify-center pb-20 overflow-x-hidden min-h-screen bg-transparent">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* --- Hero Section --- */}
        <section className="pt-24 pb-8 md:pt-36 md:pb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#7c6af6]/10 text-[#9182f8] border border-[#7c6af6]/25 mb-6 backdrop-blur-sm shadow-[0_0_16px_rgba(124,106,246,0.12)]">
            <GraduationCap size={13} />
            Collegiate Collaboration Network
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gs-text-main max-w-4xl tracking-tight leading-[1.12] mb-6 font-heading">
            Find the{' '}
            <span className="bg-gradient-to-r from-[#7c6af6] via-[#a78bfa] to-[#38bdf8] bg-clip-text text-transparent">
              missing piece
            </span>{' '}
            for your next project squad.
          </h1>
          
          <p className="text-sm sm:text-base text-gs-text-muted max-w-2xl mb-8 leading-relaxed">
            Stop relying on mismatched friend circles. GroupSync connects student developers, designers, and researchers based on complementary proficiencies, shared event goals, and verified track records.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium rounded-lg transition-all shadow-[0_0_20px_rgba(124,106,246,0.35)] hover:shadow-[0_0_30px_rgba(124,106,246,0.55)] cursor-pointer btn-tactile"
            >
              Explore Campus Squads <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 glass-card text-xs font-medium text-gs-text-main hover:border-white/20 rounded-lg transition-all cursor-pointer"
            >
              Sign In to Your Campus
            </button>
          </div>

          {/* Realistic Teammate Preview Card */}
          <div className="mt-14 w-full max-w-3xl glass-card glass-card-hover rounded-xl p-6 text-left machined-edge">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/25 flex items-center justify-center text-[#9182f8] shadow-[0_0_12px_rgba(124,106,246,0.20)]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gs-text-main font-heading">Autonomous Greenhouse Rover</h3>
                  <p className="text-xs text-gs-text-muted">Interdisciplinary Engineering Capstone · Fall 2026</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm">
                1 Seat Open: Computer Vision
              </span>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-gs-text-muted">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gs-text-main">Squad Stack:</span>
                <span className="tag-skill font-mono">PyTorch</span>
                <span className="tag-skill font-mono">ROS 2</span>
                <span className="tag-skill font-mono">React Native</span>
              </div>

              <span className="text-[#9182f8] font-medium flex items-center gap-1">
                94% Technical Synergy <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </section>

        {/* --- Stats Counter Grid --- */}
        <section>
          <div className="glass-card rounded-xl p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
              {stats.map((s, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pt-4 sm:pt-0' : ''}`}>
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#9182f8] to-[#38bdf8] bg-clip-text text-transparent mb-1 font-heading tabular-nums">
                    {s.number}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Competitive Advantages Grid --- */}
        <section id="features" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
              Why University Teams Rely on GroupSync
            </h2>
            <p className="text-xs text-gs-text-muted">
              Designed from the ground up to solve the real hurdles of student collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {advantages.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i} 
                  className={`glass-card glass-card-hover rounded-xl p-6 border transition-all duration-200 bg-gradient-to-br ${feature.gradient} ${feature.border}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${feature.iconBg}`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold text-gs-text-main mb-1.5 font-heading">{feature.title}</h3>
                  <p className="text-xs text-gs-text-muted leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- How it Works --- */}
        <section id="how-it-works" className="space-y-8">
          <div className="glass-card rounded-xl p-8 sm:p-12 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
                How It Works
              </h2>
              <p className="text-xs text-gs-text-muted">
                Three straightforward steps to assemble a high-compatibility project squad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="p-5 glass-elevated rounded-xl space-y-2 hover:border-white/15 transition-all duration-200">
                  <span className={`text-xs font-bold font-mono ${step.color}`}>
                    Step {step.step}
                  </span>
                  <h3 className="text-sm font-semibold text-gs-text-main font-heading">{step.title}</h3>
                  <p className="text-xs text-gs-text-muted leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="text-center py-12 border-t border-white/[0.06] space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
            Ready to build your next squad?
          </h2>
          <p className="text-xs text-gs-text-muted max-w-md mx-auto">
            Join thousands of university peers discovering teammates with complementary skills and shared ambition.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium rounded-lg transition-all shadow-[0_0_20px_rgba(124,106,246,0.35)] hover:shadow-[0_0_30px_rgba(124,106,246,0.55)] cursor-pointer btn-tactile"
            >
              Get Started for Free <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
