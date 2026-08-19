import React from 'react';
import { Zap, Github, Linkedin, Twitter, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Footer({ onNavigate }) {
  const navigate = useNavigate();

  const handleNav = (target) => {
    if (onNavigate) {
      onNavigate(target);
    } else {
      if (target === 'home' || target === 'how-it-works') navigate('/');
      else if (target === 'about') navigate('/about');
      else if (target === 'login') navigate('/login');
      else if (target === 'signup') navigate('/signup');
      else navigate(`/${target}`);
    }
  };

  return (
    <footer className="bg-[var(--color-gs-card)] border-t border-[var(--color-gs-border)] py-14 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      {/* Subtle Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-[var(--color-gs-violet)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 border-r-0 md:border-r border-[var(--color-gs-border)] pr-0 md:pr-10">
            <button onClick={() => handleNav('home')} className="flex items-center gap-3 mb-4 text-left">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-cyan)] flex items-center justify-center text-[var(--color-gs-cyan)] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <Zap size={18} />
              </div>
              <h2 className="text-xl font-black text-[var(--color-gs-text-main)] font-heading">
                Group<span className="text-[var(--color-gs-cyan)]">Sync</span>
              </h2>
            </button>
            <p className="text-[var(--color-gs-cyan)] text-xs font-bold uppercase tracking-wider mb-3">
              Connect Talent · Build Teams · Win Together
            </p>
            <p className="text-[var(--color-gs-text-muted)] text-sm leading-relaxed max-w-xs">
              Democratizing university team formation and hackathon squad discovery through intelligent skill-based pairing.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="col-span-1">
            <h3 className="text-[var(--color-gs-text-main)] font-bold font-heading mb-5">Platform</h3>
            <ul className="space-y-3 text-sm text-[var(--color-gs-text-muted)]">
              <li><button onClick={() => handleNav('home')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Home</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-[var(--color-gs-cyan)] transition-colors">About Us</button></li>
              <li><button onClick={() => handleNav('browse')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Browse Teams</button></li>
              <li><button onClick={() => handleNav('projects')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Projects & Hackathons</button></li>
              <li><button onClick={() => handleNav('leaderboard')} className="hover:text-[var(--color-gs-cyan)] transition-colors">XP Leaderboard</button></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="col-span-1">
            <h3 className="text-[var(--color-gs-text-main)] font-bold font-heading mb-5">Features</h3>
            <ul className="space-y-3 text-sm text-[var(--color-gs-text-muted)]">
              <li><button onClick={() => handleNav('ai')} className="hover:text-[var(--color-gs-cyan)] transition-colors">AI Team Match</button></li>
              <li><button onClick={() => handleNav('chat')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Campus Chat</button></li>
              <li><button onClick={() => handleNav('friends')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Friends Network</button></li>
              <li><button onClick={() => handleNav('profile')} className="hover:text-[var(--color-gs-cyan)] transition-colors">Skill Badges & Verification</button></li>
            </ul>
          </div>

          {/* Column 4: Social & Community */}
          <div className="col-span-1">
            <h3 className="text-[var(--color-gs-text-main)] font-bold font-heading mb-5">Community</h3>
            <div className="flex space-x-3 mb-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] flex items-center justify-center text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-cyan)] hover:border-[var(--color-gs-cyan)] hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all">
                <Github size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] flex items-center justify-center text-[var(--color-gs-text-muted)] hover:text-sky-400 hover:border-sky-400 hover:shadow-[0_0_10px_rgba(56,189,248,0.2)] transition-all">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] flex items-center justify-center text-[var(--color-gs-text-muted)] hover:text-blue-500 hover:border-blue-500 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all">
                <Linkedin size={18} />
              </a>
            </div>
            <p className="text-xs text-[var(--color-gs-text-muted)] leading-relaxed">
              Partnered with student hacker clubs & engineering societies across 50+ universities.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--color-gs-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[var(--color-gs-text-muted)]">
          <p>
            © {new Date().getFullYear()} GroupSync. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-gs-green)] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
              <span className="text-xs">Live Campus Mesh</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
