import React, { useState, useEffect } from 'react';
import { Layers, Menu, X, Sun, Moon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'glass-navbar'
        : 'bg-transparent border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 text-left cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] shadow-[0_0_12px_rgba(124,106,246,0.25)] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(124,106,246,0.40)] group-hover:bg-[#7c6af6]/20">
              <Layers size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-gs-text-main font-heading leading-tight">
                  GroupSync
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c6af6] shadow-[0_0_6px_rgba(124,106,246,0.8)]" />
              </div>
              <p className="text-[10px] text-gs-text-muted font-medium tracking-wide uppercase hidden sm:block">
                Campus Talent Hub
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
                  className={`text-xs font-medium transition-all duration-200 hover:text-[#9182f8] cursor-pointer relative ${
                    currentPage === link.id
                      ? 'text-[#9182f8] font-semibold'
                      : 'text-gs-text-muted'
                  }`}
                >
                  {link.label}
                  {currentPage === link.id && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-6 border-l border-white/10">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-gs-text-muted hover:text-gs-text-main transition-colors p-2 rounded-lg hover:bg-white/[0.06] cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              <button 
                onClick={() => handleNav('login')}
                className="text-xs font-medium text-gs-text-main hover:text-[#9182f8] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => handleNav('signup')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white text-xs font-medium rounded-lg transition-all shadow-[0_0_16px_rgba(124,106,246,0.35)] hover:shadow-[0_0_24px_rgba(124,106,246,0.50)] cursor-pointer btn-tactile"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="text-gs-text-muted hover:text-gs-text-main p-2 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gs-text-muted hover:text-gs-text-main p-2 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden glass-navbar px-4 pt-2 pb-6 space-y-3">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`block w-full text-left py-2 text-sm font-medium ${
                currentPage === link.id ? 'text-[#9182f8] font-semibold' : 'text-gs-text-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => handleNav('login')}
              className="w-full py-2 text-center text-xs font-medium text-gs-text-main glass-card rounded-lg hover:border-white/20 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNav('signup')}
              className="w-full py-2 text-center text-xs font-medium text-white bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] rounded-lg shadow-[0_0_16px_rgba(124,106,246,0.35)] cursor-pointer btn-tactile"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
