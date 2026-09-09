import React, { useState } from 'react';
import {
  Zap, Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft,
  Phone, Calendar, GraduationCap, BookOpen, Star, Globe,
  Linkedin, Github, Instagram, Twitter, Bell, Shield, Check,
  ChevronDown, ChevronUp, Plus, X
} from 'lucide-react';
import supabase from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

const COLLEGES = [
  'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'BITS Pilani', 'BITS Goa',
  'VIT Vellore', 'Manipal Institute of Technology', 'SRM Institute',
  'Anna University', 'Delhi University', 'Mumbai University',
  'Pune University', 'IIIT Hyderabad', 'IIIT Bangalore', 'Other'
];

const COURSES = ['B.Tech', 'B.E.', 'B.Sc', 'B.Com', 'BCA', 'B.Des', 'MBA', 'M.Tech', 'M.Sc', 'MCA', 'PhD', 'Integrated M.Tech'];

const BRANCHES = [
  'Computer Science Engineering', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Biotechnology', 'Data Science', 'AI & ML',
  'Cyber Security', 'Aerospace Engineering', 'Design', 'Business Administration', 'Other'
];

const EVENT_INTERESTS = [
  '🚀 Hackathons', '🎨 Design Sprints', '🤖 AI/ML Events', '🏆 Competitions',
  '🌐 Web3 Events', '🎮 Game Jams', '🎤 Tech Talks', '📚 Workshops',
  '🌟 Bootcamps', '🤝 Networking', '📊 Case Studies', '🔬 Research Symposiums'
];

const SKILL_SUGGESTIONS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Python', 'JavaScript', 'TypeScript',
  'Node.js', 'Java', 'C++', 'Rust', 'Go', 'Kotlin', 'Swift',
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Figma', 'UI/UX', 'Graphic Design', 'Motion Design',
  'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes',
  'SQL', 'MongoDB', 'PostgreSQL', 'GraphQL',
  'Blockchain', 'Solidity', 'Web3', 'Game Dev', 'Unity',
  'Data Science', 'Data Analysis', 'Power BI', 'Tableau'
];

const GENDERS = ['Male', 'Female'];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map = [
    { label: 'Too short', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-amber-400' },
    { label: 'Strong', color: 'bg-emerald-400' },
    { label: 'Very Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...map[score] };
};

// ─── Step 1: Account Creation ────────────────────────────────────────────────
function Step1({ data, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  // 6-digit OTP stored as an array of single characters
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const strength = getPasswordStrength(data.password);
  const passwordsMatch = data.password && data.confirmPassword && data.password === data.confirmPassword;
  const isValid = data.email && data.password.length >= 8 && passwordsMatch;

  const handleInitialSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (authError) {
        // Handle "user already registered" gracefully
        if (authError.message?.toLowerCase().includes('already registered') || authError.message?.toLowerCase().includes('already exists')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          throw authError;
        }
        return;
      }

      // Supabase: if email confirmation is required, user is returned but session is null
      if (signUpData?.user && !signUpData?.session) {
        setIsVerifying(true);
      } else if (signUpData?.user && signUpData?.session) {
        // Email confirmation disabled — go straight to next step
        onNext();
      } else {
        setIsVerifying(true);
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        setError('Network error: Unable to connect to Supabase. The project may be paused or inactive — please restore it from your Supabase dashboard.');
      } else {
        setError(err.message || 'Registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle digit input: auto-advance, backspace-to-previous, and paste
  const handleChange = (index, e) => {
    const val = e.target.value;

    // Handle paste of a full 6-digit code into any box
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) next[index + i] = d; });
      setOtp(next);
      const focusIdx = Math.min(index + digits.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    // Auto-advance to next box when a digit is entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move focus back to previous box on Backspace when current box is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Join the OTP array and send to Supabase auth
  const handleVerifyCode = async () => {
    const token = otp.join('');
    setLoading(true);
    setError('');
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: data.email,
        token,
        type: 'signup'
      });

      if (verifyError) throw verifyError;
      onNext();
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    try {
      await supabase.auth.resend({ type: 'signup', email: data.email });
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (authError) {
        setError(authError.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during Google sign-up.');
    }
  };

  if (isVerifying) {
    return (
      <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
        <div>
          <h2 className="text-3xl font-bold font-heading text-white text-white">Verify Your Email</h2>
          <p className="text-[var(--color-gs-text-muted)] mt-1">
            We sent a 6-digit code to <span className="text-[#00f0ff] font-medium">{data.email}</span>
          </p>
        </div>

        {/* Info box */}
        <div className="p-4 bg-gradient-to-r from-[#00f0ff] to-[#a855f7]/5 border border-[#00f0ff]/20 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#a855f7]/10 border border-[#00f0ff]/30 flex items-center justify-center shrink-0 mt-0.5">
            <Mail size={16} className="text-[#00f0ff]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Check your inbox</p>
            <p className="text-xs text-[var(--color-gs-text-muted)] mt-1">
              Enter the 6-digit code from the GroupSync verification email. If you received a link instead, click it then use the button below.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* OTP Input - PRIMARY */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-3 text-center">6-Digit Verification Code</label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={e => handleChange(index, e)}
                onKeyDown={e => handleKeyDown(index, e)}
                onFocus={e => e.target.select()}
                className={[
                  'w-12 h-14 text-center text-whitexl font-bold rounded-xl border bg-white/5 outline-none transition-all duration-200',
                  digit
                    ? 'border-[#00f0ff] text-[#00f0ff] shadow-[0_0_8px_rgba(0,212,255,0.35)]'
                    : 'border-white/10 text-white focus:border-[#00f0ff] focus:bg-white/10'
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={otp.join('').length !== 6 || loading}
          className="w-full py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'} {!loading && <Check size={18} />}
        </button>

        {/* Secondary: link-based flow */}
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--color-gs-text-muted)]">Clicked the email link instead?</p>
          <button
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                const { data: sessionData } = await supabase.auth.getSession();
                if (sessionData?.session?.user) {
                  onNext();
                } else {
                  setError('Email not confirmed yet. Please enter the OTP code above or click the link in your email.');
                }
              } catch (err) {
                setError(err.message || 'Could not verify confirmation.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="text-xs text-[#00f0ff] hover:underline disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'I already clicked the link → Continue'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-xs text-[#00f0ff] hover:underline"
          >
            Resend verification email
          </button>
          <button
            onClick={() => setIsVerifying(false)}
            className="text-xs text-[var(--color-gs-text-muted)] hover:text-white transition-colors"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <h2 className="text-3xl font-bold font-heading text-white text-white">Create Account</h2>
        <p className="text-[var(--color-gs-text-muted)] mt-1">Start your GroupSync journey.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">College Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
          <input
            type="email" value={data.email}
            onChange={e => onChange('email', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
            placeholder="you@college.edu"
          />
        </div>
        {data.email && !data.email.includes('.edu') && (
          <p className="text-xs text-whitember-400 mt-1 flex items-center gap-1">
            <Star size={11} /> College email (.edu) recommended for verification
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
          <input
            type={showPassword ? 'text' : 'password'} value={data.password}
            onChange={e => onChange('password', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-[var(--color-gs-text-muted)] hover:text-white">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {data.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={"h-1 flex-1 rounded-full transition-all duration-300 " + (i < strength.score ? strength.color : 'bg-gs-border')} />
              ))}
            </div>
            <p className={"text-xs font-medium " + (strength.score >= 3 ? 'text-emerald-400' : strength.score >= 2 ? 'text-whitember-400' : 'text-red-400')}>
              {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Confirm Password</label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
          <input
            type={showConfirm ? 'text' : 'password'} value={data.confirmPassword}
            onChange={e => onChange('confirmPassword', e.target.value)}
            className={"w-full bg-white/5 border rounded-xl pl-10 pr-12 py-3 outline-none transition-colors text-white " + (data.confirmPassword ? (passwordsMatch ? 'border-emerald-500' : 'border-red-500') : 'border-white/10 focus:border-[#00f0ff] focus:bg-white/10')}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3.5 text-[var(--color-gs-text-muted)] hover:text-white">
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {data.confirmPassword && passwordsMatch && (
            <Check size={16} className="absolute right-10 top-3.5 text-emerald-400" />
          )}
        </div>
        {data.confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={handleInitialSignUp} disabled={!isValid || loading}
          className="w-full py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.5)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Continue'} <ArrowRight size={18} />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gs-border" />
          <span className="text-xs text-[var(--color-gs-text-muted)]">or sign up with</span>
          <div className="flex-1 h-px bg-gs-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button type="button" onClick={handleGoogleSignup} className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-[#00f0ff] transition-colors text-sm font-medium text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          {/* Microsoft */}
          {/* Microsoft - Coming Soon */}
          <button disabled type="button" className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-[var(--color-gs-text-muted)] opacity-50 cursor-not-allowed" title="Coming Soon">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#F35325" d="M11.4 2H2v9.4h9.4V2z"/>
              <path fill="#81BC06" d="M22 2h-9.4v9.4H22V2z"/>
              <path fill="#05A6F0" d="M11.4 12.6H2V22h9.4v-9.4z"/>
              <path fill="#FFBA08" d="M22 12.6h-9.4V22H22v-9.4z"/>
            </svg>
            Soon
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Personal Information ────────────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const AVATARS = ['🦊', '🐉', '🤖', '🦋', '🐺', '🦅', '🐬', '🦁', '🐸', '🦄', '🐻', '🦖'];
  const isValid = data.fullName;

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <p className="text-[var(--color-gs-text-muted)] mt-1">Tell us a bit about yourself.</p>
      </div>

      {/* Avatar Picker */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Profile Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map(av => (
            <button key={av} type="button" onClick={() => onChange('avatar', av)}
              className={"text-whitexl w-11 h-11 rounded-xl border transition-all hover:scale-110 " + (data.avatar === av ? 'border-[#00f0ff] bg-gradient-to-r from-[#00f0ff] to-[#a855f7]/10 shadow-[0_0_10px_rgba(0,212,255,0.3)]' : 'border-white/10 bg-white/5')}
            >{av}</button>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Full Name <span className="text-red-400">*</span></label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
          <input type="text" value={data.fullName} onChange={e => onChange('fullName', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
            placeholder="Your full name" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* DOB */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
            <input type="date" value={data.dob} onChange={e => onChange('dob', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white [color-scheme:dark]" />
          </div>
        </div>
        {/* Gender */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Gender</label>
          <select value={data.gender} onChange={e => onChange('gender', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white">
            <option value="">Select...</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>



      <div className="flex gap-3 pt-2">
        {onBack && (
          <button onClick={onBack} className="flex-1 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium">
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <button onClick={onNext} disabled={!isValid}
          className="flex-1 py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Academic Information ─────────────────────────────────────────────
function Step3({ data, onChange, onNext, onBack }) {
  const [collegeSearch, setCollegeSearch] = useState(data.college || '');
  const [showCollegeList, setShowCollegeList] = useState(false);
  const filteredColleges = COLLEGES.filter(c => c.toLowerCase().includes(collegeSearch.toLowerCase()));
  const isValid = data.college && data.course && data.year;

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <h2 className="text-3xl font-bold font-heading text-white text-white">Academic Info</h2>
        <p className="text-[var(--color-gs-text-muted)] mt-1">Your educational background.</p>
      </div>

      {/* College Searchable Dropdown */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">College / University <span className="text-red-400">*</span></label>
        <div className="relative">
          <GraduationCap size={18} className="absolute left-3 top-3.5 text-[var(--color-gs-text-muted)]" />
          <input type="text" value={collegeSearch}
            onChange={e => { setCollegeSearch(e.target.value); setShowCollegeList(true); onChange('college', e.target.value); }}
            onFocus={() => setShowCollegeList(true)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
            placeholder="Search your college..." />
          {showCollegeList && filteredColleges.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20 max-h-48 overflow-y-auto">
              {filteredColleges.map(c => (
                <button key={c} type="button"
                  onClick={() => { onChange('college', c); setCollegeSearch(c); setShowCollegeList(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Student ID */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Student ID / Roll No.</label>
          <input type="text" value={data.studentId} onChange={e => onChange('studentId', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
            placeholder="e.g. 21CS001" />
        </div>
        {/* Course */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Degree <span className="text-red-400">*</span></label>
          <select value={data.course} onChange={e => onChange('course', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white">
            <option value="">Select...</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Branch */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Branch / Department</label>
        <select value={data.branch} onChange={e => onChange('branch', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white">
          <option value="">Select branch...</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Year */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Year <span className="text-red-400">*</span></label>
          <select value={data.year} onChange={e => onChange('year', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white">
            <option value="">Year</option>
            {['1st', '2nd', '3rd', '4th', '5th', 'Grad'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {/* Semester */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Semester</label>
          <select value={data.semester} onChange={e => onChange('semester', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-gs-">
            <option value="">Sem</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Grad Year */}
        <div>
          <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Grad Year</label>
          <select value={data.gradYear} onChange={e => onChange('gradYear', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-gs-">
            <option value="">Year</option>
            {[2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* CGPA */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">
          CGPA / Percentage <span className="text-xs text-[var(--color-gs-text-muted)] ml-1">(optional · <Lock size={10} className="inline" /> private)</span>
        </label>
        <input type="text" value={data.cgpa} onChange={e => onChange('cgpa', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white"
          placeholder="e.g. 8.5 or 89%" />
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="flex-1 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={onNext} disabled={!isValid}
          className="flex-1 py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Interests & Preferences ──────────────────────────────────────────
function Step4({ data, onChange, onSubmit, onBack, isSubmitting, error }) {
  const [skillInput, setSkillInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = SKILL_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(skillInput.toLowerCase()) && !data.skills.includes(s)
  ).slice(0, 8);

  const addSkill = (skill) => {
    if (skill.trim() && !data.skills.includes(skill.trim())) {
      onChange('skills', [...data.skills, skill.trim()]);
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (skill) => onChange('skills', data.skills.filter(s => s !== skill));

  const toggleInterest = (interest) => {
    if (data.interests.includes(interest)) {
      onChange('interests', data.interests.filter(i => i !== interest));
    } else {
      onChange('interests', [...data.interests, interest]);
    }
  };

  const toggleNotif = (key) => onChange('notifications', { ...data.notifications, [key]: !data.notifications[key] });
  const togglePrivacy = (key) => onChange('privacy', { ...data.privacy, [key]: !data.privacy[key] });

  const Toggle = ({ checked, onChange: onToggle }) => (
    <button type="button" onClick={onToggle}
      className={"relative flex items-center w-11 h-6 rounded-full transition-colors duration-300 border border-[var(--color-gs-card-border)] " + (checked ? 'bg-gradient-to-r from-[#00f0ff] to-[#a855f7]' : 'toggle-track-off')}>
      <div className={"w-5 h-5 rounded-full transition-all duration-300 toggle-thumb " + (checked ? 'translate-x-[21px] bg-white' : 'translate-x-[1px] bg-white/90')} />
    </button>
  );

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <h2 className="text-3xl font-bold font-heading text-white text-white">Interests & Preferences</h2>
        <p className="text-[var(--color-gs-text-muted)] mt-1">Personalize your GroupSync experience.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Event Interests */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Event Interests</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_INTERESTS.map(interest => (
            <button key={interest} type="button" onClick={() => toggleInterest(interest)}
              className={"px-3 py-1.5 rounded-full border text-sm transition-all " + (data.interests.includes(interest) ? 'border-[#00f0ff] bg-gradient-to-r from-[#00f0ff] to-[#a855f7]/10 text-[#00f0ff]' : 'border-white/10 text-[var(--color-gs-text-muted)] hover:border-[#00f0ff]/50')}>
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Tag Input */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Skills</label>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-[#00f0ff] transition-colors">
          <div className="flex flex-wrap gap-2 mb-2">
            {data.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-[#a855f7]/20 border border-gs-violet/40 text-[#a855f7] rounded-full text-sm font-medium">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors"><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input type="text" value={skillInput}
              onChange={e => { setSkillInput(e.target.value); setShowSuggestions(true); }}
              onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); addSkill(skillInput); } }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent outline-none text-sm text-white placeholder-gs-text-muted"
              placeholder="Type a skill and press Enter..." />
            {showSuggestions && suggestions.length > 0 && skillInput && (
              <div className="absolute top-full left-0 right-0 mt-1 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20">
                {suggestions.map(s => (
                  <button key={s} type="button" onMouseDown={() => addSkill(s)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Plus size={14} className="text-[#00f0ff]" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Bio / About Me</label>
        <textarea value={data.bio} onChange={e => onChange('bio', e.target.value)} rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white resize-none text-sm"
          placeholder="Tell other students about yourself..." />
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm text-[var(--color-gs-text-muted)] mb-2">Social Links</label>
        <div className="space-y-2">
          {[
            { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/in/username', color: 'text-blue-400' },
            { key: 'github', icon: Github, placeholder: 'github.com/username', color: 'text-[var(--color-gs-text-muted)]' },
            { key: 'portfolio', icon: Globe, placeholder: 'yourportfolio.com', color: 'text-emerald-400' },
            { key: 'instagram', icon: Instagram, placeholder: 'instagram.com/username', color: 'text-pink-400' },
            { key: 'twitter', icon: Twitter, placeholder: 'twitter.com/username', color: 'text-sky-400' },
          ].map(({ key, icon: Icon, placeholder, color }) => (
            <div key={key} className="relative">
              <Icon size={16} className={"absolute left-3 top-3.5 " + color} />
              <input type="text" value={data.socialLinks[key] || ''} onChange={e => onChange('socialLinks', { ...data.socialLinks, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-[#00f0ff] focus:bg-white/10 transition-colors text-white text-sm"
                placeholder={placeholder} />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Bell size={15} className="text-[#00f0ff]" /> Notifications</h3>
        {[
          { key: 'events', label: 'New event announcements' },
          { key: 'teamInvites', label: 'Team invitations' },
          { key: 'messages', label: 'Direct messages' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-gs-text-muted)]">{label}</span>
            <Toggle checked={data.notifications[key]} onChange={() => toggleNotif(key)} />
          </div>
        ))}
      </div>

      {/* Privacy Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Shield size={15} className="text-[var(--color-gs-green)]" /> Privacy</h3>
        {[
          { key: 'publicProfile', label: 'Public profile' },
          { key: 'showSkills', label: 'Show skills to others' },
          { key: 'showEmail', label: 'Show email on profile' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-gs-text-muted)]">{label}</span>
            <Toggle checked={data.privacy[key]} onChange={() => togglePrivacy(key)} />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} disabled={isSubmitting} className="flex-1 py-3 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex-1 py-3 bg-gradient-to-r from-[#00f0ff] to-[#a855f7] text-white font-bold rounded-xl hover:opacity-90 btn-scale transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating...' : 'Create Account'} {!isSubmitting && <Check size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main Signup Component ────────────────────────────────────────────────────
const STEP_LABELS = ['Account', 'Personal', 'Academic', 'Preferences'];

export default function Signup({ onNavigate, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1
    email: '', password: '', confirmPassword: '',
    // Step 2
    fullName: '', avatar: '🦊', dob: '', gender: '',
    // Step 3
    college: '', studentId: '', course: '', branch: '',
    year: '', semester: '', gradYear: '', cgpa: '',
    // Step 4
    interests: [], skills: [], bio: '',
    socialLinks: { linkedin: '', github: '', portfolio: '', instagram: '', twitter: '' },
    notifications: { events: true, teamInvites: true, messages: true },
    privacy: { publicProfile: true, showSkills: true, showEmail: false },
  });

  const { checkAuth, theme } = useAppContext();
  const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const userId = sessionData?.session?.user?.id;
      // Use email from form data OR fall back to the authenticated session's email
      const userEmail = formData.email || sessionData?.session?.user?.email || '';

      if (userId) {
        // Update user profile name in auth metadata
        await supabase.auth.updateUser({ data: { name: formData.fullName } });

        // Upsert full profile data
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert([{
            id: userId,
            email: userEmail,
            dob: formData.dob,
            gender: formData.gender,
            college: formData.college,
            course: formData.course,
            branch: formData.branch,
            cgpa: formData.cgpa,
            bio: formData.bio,
            social_links: formData.socialLinks,
            skills: formData.skills,
            interests: formData.interests,
            name: formData.fullName,
            avatar: formData.avatar,
            year: formData.year,
            semester: formData.semester,
            grad_year: formData.gradYear,
            student_id: formData.studentId,
            notifications: formData.notifications,
            privacy: formData.privacy,
            online: true
          }], { onConflict: 'id' });

        if (dbError) throw dbError;

        // Refresh auth state so user.onboardingComplete becomes true, then go to dashboard
        await checkAuth();
        onNavigate('dashboard');
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('failed to fetch') || err.name === 'TypeError') {
        setSubmitError('Network error: Unable to connect to Supabase. The project may be paused or inactive.');
      } else {
        setSubmitError(err.message || 'Failed to save profile. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-transparent p-4 relative overflow-hidden">
      <div className={`w-full max-w-lg backdrop-blur-xl rounded-3xl p-8 z-10 animate-page-load ${theme === 'light' ? 'bg-white/40 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]' : 'bg-[#050810]/60 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)]'}`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 shadow-[0_0_20px_rgba(0,240,255,0.2)] flex items-center justify-center text-[#00f0ff]">
            <Zap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-white drop-shadow-md">Group<span className="text-[#00f0ff]">Sync</span></h1>
            <p className="text-xs text-[var(--color-gs-text-muted)] uppercase tracking-wider font-bold">Step {step} of 4</p>
          </div>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-between w-full mb-8 relative px-2">
          {STEP_LABELS.map((label, i) => {
            const num = i + 1;
            const isActive = num === step;
            const isDone = num < step;
            return (
              <React.Fragment key={num}>
                <div className="flex flex-col items-center gap-2 z-10 w-16 shrink-0 relative">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${isDone ? 'bg-gradient-to-r from-[#00f0ff] to-[#a855f7] border-transparent text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]' : isActive ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'border-white/20 text-white/40 bg-[#050810]'}`}>
                    {isDone ? <Check size={14} /> : num}
                  </div>
                  <span className={`text-[10px] font-bold font-heading uppercase tracking-wider whitespace-nowrap absolute -bottom-5 ${isActive ? 'text-[#00f0ff]' : isDone ? 'text-white/80' : 'text-white/40'}`}>{label}</span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-0.5 -mt-6 transition-all duration-500 rounded-full ${num < step ? 'bg-gradient-to-r from-[#00f0ff] to-[#a855f7] shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-8">
          {/* Step Content */}
          {step === 1 && <Step1 data={formData} onChange={update} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={formData} onChange={update} onNext={() => setStep(3)} onBack={initialStep >= 2 ? null : () => setStep(1)} />}
          {step === 3 && <Step3 data={formData} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step4 data={formData} onChange={update} onSubmit={handleSubmit} onBack={() => setStep(3)} isSubmitting={isSubmitting} error={submitError} />}
        </div>

        {/* Login link */}
        <p className="text-center text-[var(--color-gs-text-muted)] mt-8 text-sm">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors font-medium hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
