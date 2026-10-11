import React from 'react';
import { Layers, Github, Linkedin, Twitter } from 'lucide-react';
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
    <footer className="glass-navbar border-t border-white/[0.06] py-14 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-12">
          
          {/* Column 1: Brand */}
          <div className="col-span-1 border-r-0 md:border-r border-gs-border pr-0 md:pr-10">
            <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 mb-4 text-left cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] shadow-xs">
                <Layers size={16} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-gs-text-main font-heading">
                  GroupSync
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D6AF6]" />
              </div>
            </button>
            <p className="text-gs-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
              Connect Talent · Build Teams · Win Together
            </p>
            <p className="text-gs-text-muted text-xs leading-relaxed max-w-xs">
              Democratizing university team formation and hackathon squad discovery through intelligent skill-based pairing.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="col-span-1">
            <h4 className="text-gs-text-main font-semibold mb-4 text-xs uppercase tracking-wider font-heading">Platform</h4>
            <ul className="space-y-2 text-xs text-gs-text-muted">
              <li><button onClick={() => handleNav('home')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Home</button></li>
              <li><button onClick={() => handleNav('about')} className="hover:text-[#9182f8] transition-colors cursor-pointer">About Us</button></li>
              <li><button onClick={() => handleNav('teams')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Browse Teams</button></li>
              <li><button onClick={() => handleNav('projects')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Projects & Hackathons</button></li>
              <li><button onClick={() => handleNav('leaderboard')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Campus Leaderboard</button></li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div className="col-span-1">
            <h4 className="text-gs-text-main font-semibold mb-4 text-xs uppercase tracking-wider font-heading">Features</h4>
            <ul className="space-y-2 text-xs text-gs-text-muted">
              <li><button onClick={() => handleNav('ai')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Smart Match</button></li>
              <li><button onClick={() => handleNav('chat')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Campus Chat</button></li>
              <li><button onClick={() => handleNav('friends')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Friends Network</button></li>
              <li><button onClick={() => handleNav('profile')} className="hover:text-[#9182f8] transition-colors cursor-pointer">Skill Badges & Verification</button></li>
            </ul>
          </div>

          {/* Column 4: Social & Community */}
          <div className="col-span-1">
            <h4 className="text-gs-text-main font-semibold mb-4 text-sm uppercase tracking-wider">Community</h4>
            <div className="flex space-x-2.5 mb-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center text-gs-text-muted hover:text-gs-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <Github size={15} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center text-gs-text-muted hover:text-sky-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <Twitter size={15} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 border border-gs-border flex items-center justify-center text-gs-text-muted hover:text-blue-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <Linkedin size={15} />
              </a>
            </div>
            <p className="text-xs text-gs-text-muted leading-relaxed">
              Empowering student hacker clubs & engineering societies across 50+ universities.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gs-border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gs-text-muted">
          <p>
            © {new Date().getFullYear()} GroupSync. Crafted for campus collaborators.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gs-text-main cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gs-text-main cursor-pointer transition-colors">Terms of Service</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Campus Network Active</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}



