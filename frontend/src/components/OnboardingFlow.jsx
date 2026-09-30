import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { ONBOARDING_SKILLS, ONBOARDING_INTERESTS, ONBOARDING_AVATARS, ONBOARDING_QUIZ, MOCK_FACTIONS } from '@/data/mockData';
import { Check, ChevronRight, Trophy, Shield } from 'lucide-react';

export default function OnboardingFlow({ onComplete }) {
  const { theme } = useAppContext();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: '', college: '', phone: '', year: '1st Year' });
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState(Array(6).fill(null));
  const [avatar, setAvatar] = useState('ðŸ¤–');
  const [assignedFaction, setAssignedFaction] = useState(null);

  const handleNext = () => {
    if (step === 4) {
      // Calculate faction
      const counts = quizAnswers.reduce((acc, f) => {
        acc[f] = (acc[f] || 0) + 1;
        return acc;
      }, {});
      const topFaction = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      setAssignedFaction(topFaction);
    }
    setStep(s => s + 1);
  };

  const toggleItem = (arr, setArr, item) => {
    if (arr.includes(item)) setArr(arr.filter(i => i !== item));
    else setArr([...arr, item]);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-gs-text-main)] mb-1">Welcome to GroupSync</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Complete your profile to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gs-text-main block">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})} 
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs outline-none focus:border-[#6D6AF6] transition-colors text-gs-text-main placeholder-gs-text-muted" 
                  placeholder="e.g. Alex Chen" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gs-text-main block">College / University</label>
                <input 
                  type="text" 
                  value={profile.college} 
                  onChange={e => setProfile({...profile, college: e.target.value})} 
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs outline-none focus:border-[#6D6AF6] transition-colors text-gs-text-main placeholder-gs-text-muted" 
                  placeholder="e.g. Stanford University" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gs-text-main block">Phone Number</label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={e => setProfile({...profile, phone: e.target.value})} 
                  className="w-full bg-black/5 dark:bg-white/5 border border-gs-border rounded-lg px-3.5 py-2 text-xs outline-none focus:border-[#6D6AF6] transition-colors text-gs-text-main placeholder-gs-text-muted" 
                  placeholder="e.g. +1 234 567 8900" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gs-text-main block">Academic Year</label>
                <div className="flex flex-wrap gap-1.5">
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Grad'].map(y => (
                    <button 
                      key={y} 
                      type="button"
                      onClick={() => setProfile({...profile, year: y})} 
                      className={"px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer " + (profile.year === y ? "bg-[#6D6AF6] text-white border-[#6D6AF6] shadow-xs" : "bg-black/5 dark:bg-white/5 border-gs-border text-gs-text-muted hover:text-gs-text-main hover:border-gs-border/80")}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              disabled={!profile.name || !profile.college || !profile.phone} 
              onClick={handleNext} 
              className="w-full py-2 mt-2 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-tactile"
            >
              Continue
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-gs-text-main)] tracking-tight mb-1">Your Skills</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Select the skills you bring to teams</p>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center max-h-[45vh] overflow-y-auto p-1">
              {ONBOARDING_SKILLS.map(s => {
                const isSelected = skills.includes(s);
                return (
                  <button 
                    key={s} 
                    type="button"
                    onClick={() => toggleItem(skills, setSkills, s)} 
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      isSelected 
                        ? "bg-[#6D6AF6]/10 border-[#6D6AF6]/40 text-[#6D6AF6]" 
                        : "bg-[var(--color-gs-bg)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={skills.length === 0} 
              onClick={handleNext} 
              className="w-full py-2.5 mt-3 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
            >
              Next Step <ChevronRight size={15} />
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-gs-text-main)] tracking-tight mb-1">Your Interests</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">What domains are you passionate about?</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-h-[45vh] overflow-y-auto p-1">
              {ONBOARDING_INTERESTS.map(i => {
                const isSelected = interests.includes(i);
                return (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => toggleItem(interests, setInterests, i)} 
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      isSelected 
                        ? "bg-[#6D6AF6]/10 border-[#6D6AF6]/40 text-[#6D6AF6]" 
                        : "bg-[var(--color-gs-bg)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:text-[var(--color-gs-text-main)] hover:border-white/20"
                    }`}
                  >
                    {i}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={interests.length === 0} 
              onClick={handleNext} 
              className="w-full py-2.5 mt-3 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
            >
              Next Step <ChevronRight size={15} />
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-gs-text-main)] tracking-tight mb-1">House Assessment</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Answer a few questions to find your community house</p>
            </div>

            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
              {ONBOARDING_QUIZ.map((qObj, idx) => (
                <div key={idx} className="space-y-2.5">
                  <p className="font-medium text-sm text-[var(--color-gs-text-main)] flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--color-gs-bg)] border border-[var(--color-gs-border)] flex items-center justify-center shrink-0 text-xs text-[var(--color-gs-text-muted)] font-mono">{idx + 1}</span>
                    <span>{qObj.q}</span>
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {qObj.opts.map((opt, oIdx) => {
                      const isSelected = quizAnswers[idx] === opt.f;
                      return (
                        <button 
                          key={oIdx} 
                          type="button"
                          onClick={() => {
                            const newAns = [...quizAnswers];
                            newAns[idx] = opt.f;
                            setQuizAnswers(newAns);
                          }} 
                          className={`p-3 text-left rounded-xl border transition-colors flex items-center justify-between text-xs cursor-pointer ${
                            isSelected 
                              ? "bg-[#6D6AF6]/10 border-[#6D6AF6]/40 text-[var(--color-gs-text-main)] font-medium" 
                              : "bg-[var(--color-gs-bg)] border-[var(--color-gs-border)] text-[var(--color-gs-text-muted)] hover:border-white/20 hover:text-[var(--color-gs-text-main)]"
                          }`}
                        >
                          <span>{opt.t}</span>
                          {isSelected && <Check size={14} className="text-[#6D6AF6] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button 
              disabled={quizAnswers.includes(null)} 
              onClick={handleNext} 
              className="w-full py-2.5 mt-3 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
            >
              Reveal House <ChevronRight size={15} />
            </button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 text-center"
          >
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-gs-text-main)] tracking-tight mb-1">Choose Avatar</h2>
              <p className="text-xs text-[var(--color-gs-text-muted)]">Select an avatar for your profile</p>
            </div>

            <div className="grid grid-cols-4 gap-3 p-1">
              {ONBOARDING_AVATARS.map(av => {
                const isSelected = avatar === av;
                return (
                  <button 
                    key={av} 
                    type="button"
                    onClick={() => setAvatar(av)} 
                    className={`text-3xl aspect-square flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                      isSelected 
                        ? "bg-[#6D6AF6]/10 border-[#6D6AF6] shadow-xs" 
                        : "bg-[var(--color-gs-bg)] border-[var(--color-gs-border)] hover:border-white/20"
                    }`}
                  >
                    {av}
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleNext} 
              className="w-full py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
            >
              Complete Setup <ChevronRight size={15} />
            </button>
          </motion.div>
        );

      case 6:
        const f = MOCK_FACTIONS[assignedFaction] || MOCK_FACTIONS['Nexus'] || Object.values(MOCK_FACTIONS)[0];
        const FactionIcon = f.icon;
        return (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-6 max-w-sm mx-auto py-2"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-gs-text-muted)] mb-1">House Alignment</p>
              <h1 className="text-2xl font-bold text-[var(--color-gs-text-main)] tracking-tight">{f.name}</h1>
            </div>

            <div className="w-20 h-20 rounded-xl mx-auto flex items-center justify-center bg-[#6D6AF6]/10 border border-[#6D6AF6]/20 text-[#6D6AF6]">
              <FactionIcon size={38} />
            </div>

            <p className="text-xs text-[var(--color-gs-text-muted)] leading-relaxed italic">
              "{f.description}"
            </p>

            <button 
              onClick={() => onComplete({ ...profile, skills, interests, avatar, faction: assignedFaction })} 
              className="w-full py-2.5 bg-[#6D6AF6] hover:bg-[#5C59EC] text-white font-medium rounded-lg text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
            >
              Enter GroupSync <ChevronRight size={15} />
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[var(--color-gs-bg)] p-4 relative font-body text-[var(--color-gs-text-main)]">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[var(--color-gs-card)] border border-[var(--color-gs-border)] rounded-xl p-6 md:p-8 shadow-xs">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        {/* Clean Progress Indicator */}
        <div className="mt-6 flex justify-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div 
              key={s} 
              className={"h-1 rounded-full transition-all duration-300 " + (step >= s ? "w-6 bg-[#6D6AF6]" : "w-2 bg-[var(--color-gs-border)]")} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

