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
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const values = [
    {
      icon: Globe2,
      title: 'Inclusivity',
      desc: 'Every student deserves an authentic opportunity to contribute regardless of background or personality type.'
    },
    {
      icon: Star,
      title: 'Merit & Verified Mastery',
      desc: 'Demonstrated skills, verified certificates, and peer endorsements matter over popularity contests.'
    },
    {
      icon: ShieldCheck,
      title: 'Transparency',
      desc: 'All credentials, assessment badges, and team reviews are genuine, transparent, and verifiable.'
    },
    {
      icon: Users2,
      title: 'Collaborative Growth',
      desc: 'High-performing squads foster mutual respect, constructive review, and shared technical growth.'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Mastery',
      desc: 'Assessments, feedback loops, and peer mentorship are built into every campus team engagement.'
    },
    {
      icon: Gem,
      title: 'Academic Excellence',
      desc: 'We uphold the highest standard of software quality, human-centered design, and student privacy.'
    }
  ];

  const differentiators = [
    {
      icon: Filter,
      title: 'Skill-Based Matching',
      desc: 'Intelligent pairing evaluates technical role requirements rather than relying on chance social encounters.'
    },
    {
      icon: Award,
      title: 'Verified Student Credentials',
      desc: 'Standardized skill assessments and verified certificates ensure mutual confidence before sprinting.'
    },
    {
      icon: MessageSquare,
      title: 'Dedicated Squad Hubs',
      desc: 'Integrated real-time project rooms, direct messaging, and milestone tracking without tool fragmentation.'
    },
    {
      icon: GraduationCap,
      title: 'Collegiate First',
      desc: 'Engineered specifically for university course capstones, campus hackathons, and research collectives.'
    },
    {
      icon: HeartHandshake,
      title: 'Designed for Quiet Talent',
      desc: 'Eliminates awkward extrovert-biased networking by putting portfolio substance front and center.'
    },
    {
      icon: Rocket,
      title: 'Rapid Squad Assembly',
      desc: 'Quickly find verified teammates with complementary proficiencies when hackathon deadlines approach.'
    }
  ];

  return (
    <div className="w-full flex justify-center pb-20 pt-24 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-5xl w-full space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#6D6AF6]/10 text-[#6D6AF6] border border-[#6D6AF6]/20">
            <GraduationCap size={13} />
            About GroupSync
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gs-text-main tracking-tight font-heading">
            Democratizing how university squads form and build together.
          </h1>
          <p className="text-xs sm:text-sm text-gs-text-muted leading-relaxed max-w-2xl mx-auto">
            GroupSync is an academic collaboration platform designed to help students discover complementary teammates, validate domain skills, and execute ambitious technical projects.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gs-card border border-gs-border rounded-xl p-7 shadow-xs space-y-3 machined-edge">
            <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center">
              <Target size={18} />
            </div>
            <h2 className="text-base font-bold text-gs-text-main font-heading">Our Mission</h2>
            <p className="text-xs text-gs-text-muted leading-relaxed">
              To build a thoughtful, merit-based environment that connects university students through verifiable competencies and mutual project goals—ensuring introverts and non-traditional scholars have equal opportunity to excel.
            </p>
          </div>

          <div className="bg-gs-card border border-gs-border rounded-xl p-7 shadow-xs space-y-3 machined-edge">
            <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center">
              <Rocket size={18} />
            </div>
            <h2 className="text-base font-bold text-gs-text-main font-heading">Our Vision</h2>
            <p className="text-xs text-gs-text-muted leading-relaxed">
              A university culture where building high-impact software, hardware, and research products is frictionless, cross-disciplinary, and driven by authentic technical synergy.
            </p>
          </div>
        </div>

        {/* Impact by Numbers */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gs-border/60">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gs-text-main mb-1 font-heading tabular-nums">5,000+</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">Students Connected</p>
            </div>
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-bold text-gs-text-main mb-1 font-heading tabular-nums">520+</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">Squads Formed</p>
            </div>
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-bold text-gs-text-main mb-1 font-heading tabular-nums">48</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">Campus Chapters</p>
            </div>
            <div className="text-center pt-4 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-bold text-gs-text-main mb-1 font-heading tabular-nums">84%</div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gs-text-muted">Project Completion</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">Our Guiding Values</h2>
            <p className="text-xs text-gs-text-muted">The design principles that shape our community and product decisions.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-gs-card border border-gs-border rounded-xl p-5 shadow-xs space-y-2 hover:border-gs-border/80 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center">
                    <Icon size={17} />
                  </div>
                  <h3 className="text-sm font-semibold text-gs-text-main font-heading">{v.title}</h3>
                  <p className="text-xs text-gs-text-muted leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* What Makes GroupSync Different */}
        <div className="bg-gs-card border border-gs-border rounded-xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gs-text-main font-heading">
              What Makes GroupSync Distinct
            </h2>
            <p className="text-xs text-gs-text-muted">
              How our platform compares to unstructured campus message boards and social feeds.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {differentiators.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="flex gap-3.5 p-4 bg-black/5 dark:bg-white/5 border border-gs-border rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-[#6D6AF6]/10 text-[#6D6AF6] flex items-center justify-center shrink-0">
                    <Icon size={17} />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-gs-text-main text-xs font-heading">{d.title}</h3>
                    <p className="text-xs text-gs-text-muted leading-relaxed">{d.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-10 border-t border-gs-border/60 space-y-3">
          <h3 className="text-2xl font-bold text-gs-text-main font-heading">
            Ready to find your project collaborators?
          </h3>
          <p className="text-xs text-gs-text-muted max-w-md mx-auto">
            Set up your verified student profile in under 2 minutes and explore active campus squads.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium text-xs rounded-lg transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              Get Started Free <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
