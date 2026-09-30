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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled ? 'bg-gs-card/95 backdrop-blur-md border-b border-gs-border shadow-xs' : 'bg-transparent border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5 text-left cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 flex items-center justify-center text-[#6D6AF6] shadow-xs">
              <Layers size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-gs-text-main font-heading leading-tight">
                  GroupSync
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#6D6AF6]" />
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
                  className={`text-xs font-medium transition-colors hover:text-[#6D6AF6] cursor-pointer ${
                    currentPage === link.id ? 'text-[#6D6AF6] font-semibold' : 'text-gs-text-muted'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 pl-6 border-l border-gs-border">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-gs-text-muted hover:text-gs-text-main transition-colors p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </button>
              <button 
                onClick={() => handleNav('login')}
                className="text-xs font-medium text-gs-text-main hover:text-[#6D6AF6] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => handleNav('signup')}
                className="px-3.5 py-1.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer btn-tactile"
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
        <div className="md:hidden bg-gs-card border-b border-gs-border px-4 pt-2 pb-6 space-y-3 backdrop-blur-xl">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`block w-full text-left py-2 text-sm font-medium ${
                currentPage === link.id ? 'text-[#6D6AF6] font-semibold' : 'text-gs-text-muted'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-gs-border flex flex-col gap-2">
            <button
              onClick={() => handleNav('login')}
              className="w-full py-2 text-center text-xs font-medium text-gs-text-main border border-gs-border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNav('signup')}
              className="w-full py-2 text-center text-xs font-medium text-white bg-[#6D6AF6] hover:bg-[#5C59EC] rounded-lg transition-colors shadow-xs cursor-pointer btn-tactile"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

