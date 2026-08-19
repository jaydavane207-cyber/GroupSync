import React from 'react';
import { 
  Target, 
  Rocket, 
  Globe2, 
  Star, 
  ShieldCheck, 
  Users2, 
  TrendingUp, 
  Gem, 
  Filter, 
  Award, 
  MessageSquare, 
  GraduationCap, 
  HeartHandshake, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Globe2,
      title: 'Inclusivity',
      desc: 'Everyone deserves a seat at the table regardless of background or personality type.',
      color: 'text-gs-cyan',
      bg: 'bg-gs-cyan/10'
    },
    {
      icon: Star,
      title: 'Meritocracy',
      desc: 'Skills, work ethic, and verified proficiencies matter—not social popularity.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10'
    },
    {
      icon: ShieldCheck,
      title: 'Transparency',
      desc: 'All credentials, skill quiz badges, and certificates are verified and authentic.',
      color: 'text-gs-green',
      bg: 'bg-gs-green/10'
    },
    {
      icon: Users2,
      title: 'Collaboration',
      desc: 'Great teams build transformative projects through synergy and mutual respect.',
      color: 'text-gs-violet',
      bg: 'bg-gs-violet/10'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      desc: 'Learning, skill enhancement, and peer mentorship are embedded in every team experience.',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      icon: Gem,
      title: 'Excellence',
      desc: 'We uphold the highest standard of product design, engineering, and student support.',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10'
    }
  ];

  const differentiators = [
    {
      icon: Filter,
      title: 'Skill-Based Matching',
      desc: 'Proprietary AI algorithm ensures complementary technical roles rather than friend group echo chambers.'
    },
    {
      icon: Award,
      title: 'Verified Credentials',
      desc: 'Standardized skill assessments, uploaded certificates, and peer endorsements validate real ability.'
    },
    {
      icon: MessageSquare,
      title: 'Built-in Collaboration',
      desc: 'Group chats, direct messaging, file sharing, and project tracking all inside one unified interface.'
    },
    {
      icon: GraduationCap,
      title: 'Student-Centric Architecture',
      desc: 'Tailored specifically for college courses, university hackathons, and student engineering clubs.'
    },
    {
      icon: HeartHandshake,
      title: 'Inclusive by Design',
      desc: 'Special algorithms designed to give introverts and underrepresented talent equal visibility.'
    },
    {
      icon: Zap,
      title: 'Real-time Synergy Engine',
      desc: 'Interactive skill trees, XP leaderboards, and instant peer matching for rapid hackathon squad formation.'
    }
  ];

  return (
    <div className="w-full flex justify-center pb-20 pt-32 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-5xl w-full space-y-20">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gs-primary/30 bg-gs-primary/10 text-gs-primary text-sm font-semibold mb-6">
            <Zap size={16} /> Connect Talent · Build Teams · Win Together
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gs-text-main font-heading mb-6 tracking-tight">
            About Group<span className="text-gs-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">Sync</span>
          </h1>
          <p className="text-lg md:text-xl text-gs-text-muted leading-relaxed max-w-3xl mx-auto font-medium">
            We are democratizing university team formation, empowering every student to find their ideal teammates, build award-winning projects, and prepare for real-world collaborative excellence.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gs-card border border-gs-primary/30 rounded-3xl p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-gs-primary/10 border border-gs-primary/40 flex items-center justify-center text-gs-primary mb-6 shadow-inner">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-black font-heading text-white mb-4">Our Mission</h2>
            <p className="text-gs-text-muted leading-relaxed text-base">
              Build an intelligent, inclusive platform that connects students based on complementary skills, shared interests, and work style compatibility. We empower every student—especially introverts—to find the right squad and build transformative collaborative projects.
            </p>
          </div>

          <div className="bg-gs-card border border-gs-secondary/30 rounded-3xl p-8 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-gs-secondary/10 border border-gs-secondary/40 flex items-center justify-center text-gs-secondary mb-6 shadow-inner">
              <Rocket size={28} />
            </div>
            <h2 className="text-2xl font-black font-heading text-white mb-4">Our Vision</h2>
            <p className="text-gs-text-muted leading-relaxed text-base">
              Create a world where every student, regardless of personality type, background, or social network, can effortlessly discover the perfect teammates and transform ambitious ideas into world-class software, hardware, and research products.
            </p>
          </div>
        </div>

        {/* Impact by Numbers */}
        <div className="bg-gs-card border border-gs-border rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-black font-heading text-center text-white mb-10">
            Impact By The Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gs-border/60">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-black font-heading text-gs-cyan mb-2">5,000+</div>
              <p className="text-xs md:text-sm font-bold text-gs-text-muted uppercase tracking-wider">Students Connected</p>
            </div>
            <div className="text-center pt-6 md:pt-0">
              <div className="text-4xl md:text-5xl font-black font-heading text-gs-green mb-2">500+</div>
              <p className="text-xs md:text-sm font-bold text-gs-text-muted uppercase tracking-wider">Teams Formed</p>
            </div>
            <div className="text-center pt-6 md:pt-0">
              <div className="text-4xl md:text-5xl font-black font-heading text-gs-violet mb-2">50+</div>
              <p className="text-xs md:text-sm font-bold text-gs-text-muted uppercase tracking-wider">Partner Colleges</p>
            </div>
            <div className="text-center pt-6 md:pt-0">
              <div className="text-4xl md:text-5xl font-black font-heading text-amber-400 mb-2">80%+</div>
              <p className="text-xs md:text-sm font-bold text-gs-text-muted uppercase tracking-wider">Project Completion</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-white mb-3">Our Core Values</h2>
            <p className="text-gs-text-muted max-w-xl mx-auto text-base">The foundational principles that guide GroupSync design and community guidelines.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-gs-card border border-gs-border rounded-3xl p-6 shadow-xl hover:border-gs-primary/40 transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${v.bg} ${v.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 font-heading">{v.title}</h3>
                  <p className="text-sm text-gs-text-muted leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* What Makes GroupSync Different */}
        <div className="bg-gs-card border border-gs-border rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black font-heading text-white mb-3">
              What Makes GroupSync Different
            </h2>
            <p className="text-gs-text-muted text-base max-w-xl mx-auto">
              How our platform compares to traditional social networks and unstructured campus message boards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="flex gap-4 p-5 bg-gs-bg/60 border border-gs-border rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-gs-primary/10 border border-gs-primary/30 flex items-center justify-center text-gs-primary shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-1 font-heading">{d.title}</h3>
                    <p className="text-sm text-gs-text-muted leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-gs-primary/20 via-gs-secondary/20 to-gs-primary/20 border border-gs-primary/40 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <h3 className="text-3xl font-black text-white mb-4 font-heading">
            Ready to Find Your Dream Squad?
          </h3>
          <p className="text-gs-text-muted max-w-xl mx-auto mb-8 text-base">
            Create your verified student profile in less than 2 minutes and join active hackathon teams today.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-br from-gs-primary to-gs-secondary text-[#050810] font-black text-lg rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            Get Started Free <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}
