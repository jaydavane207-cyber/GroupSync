import React, { useState, useEffect } from 'react';
import { Zap, Menu, X, Sun, Moon, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Navbar({ currentPage, onNavigate }) {
  const { theme, setTheme } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'about', label: 'About' },
    { id: 'how-it-works', label: 'How It Works' }
  ];

  const handleNav = (page) => {
    if (page === 'features' || page === 'how-it-works') {
      if (onNavigate) onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(page);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (onNavigate) onNavigate(page);
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? (theme === 'light' ? 'bg-white/90 backdrop-blur-[20px] border-b border-black/10 shadow-sm' : 'bg-[#050810]/80 backdrop-blur-[20px] border-b border-white/8') : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-transparent border border-[var(--color-gs-primary)] shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center text-[var(--color-gs-primary)]">
              <Zap size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white text-glow-cyan font-heading leading-tight">
                Group<span className="text-[var(--color-gs-primary)]">Sync</span>
              </h1>
              <p className="text-[10px] text-gs-cyan font-bold tracking-wider uppercase hidden sm:block">
                Connect Talent · Build Teams
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  className={`text-sm font-semibold transition-colors nav-link-underline hover:text-[var(--color-gs-primary)] ${
                    currentPage === link.id ? 'text-[var(--color-gs-primary)]' : 'text-[var(--color-gs-text-muted)]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-6 border-l border-white/8">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-primary)] transition-colors p-2 rounded-xl hover:bg-white/5"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button 
                onClick={() => handleNav('login')}
                className="text-sm font-bold text-white hover:text-[var(--color-gs-primary)] transition-colors"
              >
                Log In
              </button>
              <button 
                onClick={() => handleNav('signup')}
                className="px-6 py-2.5 bg-gradient-to-br from-[#00f0ff] to-[#a855f7] text-[#050810] text-sm font-black rounded-full shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-[var(--color-gs-text-muted)] p-2"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--color-gs-text-muted)] hover:text-white transition-colors p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass-card absolute top-20 left-4 right-4 animate-[slideInUp_0.2s_ease-out] rounded-3xl border border-white/10 p-6 shadow-2xl bg-[#050810]/95 backdrop-blur-2xl">
          <div className="flex flex-col space-y-3">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left text-base font-bold px-4 py-3 rounded-xl transition-colors ${
                  currentPage === link.id ? 'bg-[var(--color-gs-primary)]/10 text-[var(--color-gs-primary)]' : 'text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="h-px bg-white/10 my-2" />

            <button 
              onClick={() => handleNav('login')}
              className="w-full text-left text-base font-bold px-4 py-3 text-white hover:text-[var(--color-gs-primary)] transition-colors"
            >
              Log In
            </button>
            <button 
              onClick={() => handleNav('signup')}
              className="w-full px-4 py-3 bg-gradient-to-br from-[#00f0ff] to-[#a855f7] text-[#050810] text-base font-black rounded-xl text-center shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
