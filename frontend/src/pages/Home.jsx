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
      desc: 'Connect with peers whose technical skills complement your own, rather than settling for random social circles.'
    },
    {
      icon: Award,
      title: 'Verified Competencies',
      desc: 'Demonstrate real capability through standardized technical assessments, certificates, and peer endorsements.'
    },
    {
      icon: MessageSquare,
      title: 'Dedicated Squad Rooms',
      desc: 'Real-time project chats, resource sharing, and direct messaging built specifically for student collaboration.'
    },
    {
      icon: FolderKanban,
      title: 'Hackathon & Capstone Focus',
      desc: 'Browse open vacancies for upcoming college hackathons, senior capstones, and interdisciplinary lab research.'
    },
    {
      icon: HeartHandshake,
      title: 'Equal Merit Discovery',
      desc: 'Removes social barriers so quiet coders, design thinkers, and underrepresented talent get discovered fairly.'
    },
    {
      icon: BarChart3,
      title: 'Squad Milestones & Reviews',
      desc: 'Track team sprint progress, coordinate role responsibilities, and earn academic standing across projects.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Build Your Academic Dossier',
      desc: 'Add your primary tech stack, pass verified skill assessments, and showcase past work.'
    },
    {
      step: '02',
      title: 'Explore Compatible Squads',
      desc: 'Browse active teams looking for your specific skills, or create your own squad charter.'
    },
    {
      step: '03',
      title: 'Collaborate & Ship Together',
      desc: 'Coordinate in real-time squad rooms, lock in sprint deliverables, and present at campus showcases.'
    }
  ];

  return (
    <div className="w-full flex justify-center pb-20 overflow-x-hidden min-h-screen bg-transparent">
      <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* --- Hero Section --- */}
        <section className="pt-24 pb-8 md:pt-36 md:pb-16 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20 mb-6">
            <GraduationCap size={13} />
            Collegiate Collaboration Network
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gs-text-main max-w-4xl tracking-tight leading-[1.12] mb-6 font-heading">
            Find the missing piece for your next project squad.
          </h1>
          
          <p className="text-sm sm:text-base text-gs-text-muted max-w-2xl mb-8 leading-relaxed">
            Stop relying on mismatched friend circles. GroupSync connects student developers, designers, and researchers based on complementary proficiencies, shared event goals, and verified track records.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              Explore Campus Squads <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gs-card border border-gs-border text-xs font-medium text-gs-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Sign In to Your Campus
            </button>
          </div>

          {/* Realistic Teammate Preview Card */}
          <div className="mt-14 w-full max-w-3xl bg-gs-card border border-gs-border rounded-xl p-6 text-left shadow-xs machined-edge">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gs-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-[#6D6AF6]">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gs-text-main font-heading">Autonomous Greenhouse Rover</h3>
                  <p className="text-xs text-gs-text-muted">Interdisciplinary Engineering Capstone Â· Fall 2026</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
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

              <span className="text-[#6D6AF6] font-medium flex items-center gap-1">
                94% Technical Synergy <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </section>

        {/* --- Stats Counter Grid --- */}
        <section>
          <div className="bg-gs-card border border-gs-border rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gs-border/60">
              {stats.map((s, i) => (
                <div key={i} className={`text-center ${i > 0 ? 'pt-4 sm:pt-0' : ''}`}>
                  <div className="text-3xl sm:text-4xl font-bold text-gs-text-main mb-1 font-heading tabular-nums">
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
                  className="bg-gs-card border border-gs-border rounded-xl p-6 shadow-xs hover:border-gs-border/80 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center mb-4">
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
          <div className="bg-gs-card border border-gs-border rounded-xl p-8 sm:p-12 shadow-xs space-y-8">
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
                <div key={i} className="p-5 bg-black/5 dark:bg-white/5 border border-gs-border rounded-xl space-y-2">
                  <span className="text-xs font-bold text-[#6D6AF6] font-mono">
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
        <section className="text-center py-12 border-t border-gs-border/60 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
            Ready to build your next squad?
          </h2>
          <p className="text-xs text-gs-text-muted max-w-md mx-auto">
            Join thousands of university peers discovering teammates with complementary skills and shared ambition.
          </p>
          <div className="pt-2">
            <button 
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              Get Started for Free <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

