import React, { useState } from 'react';
import {
  Layers, Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft,
  Phone, Calendar, GraduationCap, BookOpen, Star, Globe,
  Linkedin, Github, Instagram, Twitter, Bell, Shield, Check,
  ChevronDown, ChevronUp, Plus, X
} from 'lucide-react';
import supabase from '@/lib/supabase';
import { useAppContext } from '@/context/AppContext';

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
  'Hackathons', 'Design Sprints', 'AI/ML Events', 'Competitions',
  'Web3 Events', 'Game Jams', 'Tech Talks', 'Workshops',
  'Bootcamps', 'Networking', 'Case Studies', 'Research Symposiums'
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
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">Verify Your Email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            We sent a 6-digit code to <span className="text-blue-600 dark:text-blue-400 font-medium">{data.email}</span>
          </p>
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
            <Mail size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Check your university inbox</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Enter the 6-digit code from the GroupSync verification email to confirm student standing.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* OTP Input - PRIMARY */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2.5 text-center">6-Digit Verification Code</label>
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
                  'w-11 h-13 text-center text-lg font-bold rounded-xl border bg-slate-50 dark:bg-slate-800/80 outline-none transition-colors',
                  digit
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500'
                ].join(' ')}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyCode}
          disabled={otp.join('').length !== 6 || loading}
          className="w-full py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-tactile"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'} {!loading && <Check size={15} />}
        </button>

        {/* Secondary: link-based flow */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gs-text-muted">Clicked the email link instead?</p>
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
            className="text-xs text-[#9182f8] hover:underline disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Checking...' : 'I already clicked the link → Continue'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-xs text-[#9182f8] hover:underline cursor-pointer"
          >
            Resend verification email
          </button>
          <button
            onClick={() => setIsVerifying(false)}
            className="text-xs text-gs-text-muted hover:text-gs-text-main transition-colors cursor-pointer"
          >
            ← Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">Create Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start your collegiate journey on GroupSync.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College Email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="email"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="you@college.edu"
          />
        </div>
        {data.email && !data.email.includes('.edu') && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
            <Star size={11} /> College email (.edu) recommended for automatic verification
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={e => onChange('password', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {data.password && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={"h-1 flex-1 rounded-full transition-all duration-300 " + (i < strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700')} />
              ))}
            </div>
            <p className={"text-xs font-medium " + (strength.score >= 3 ? 'text-emerald-600 dark:text-emerald-400' : strength.score >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')}>
              {strength.label}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type={showConfirm ? 'text' : 'password'}
            value={data.confirmPassword}
            onChange={e => onChange('confirmPassword', e.target.value)}
            className={"w-full bg-slate-50 dark:bg-slate-800/80 border rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none transition-colors text-slate-900 dark:text-white placeholder-slate-400 " + (data.confirmPassword ? (passwordsMatch ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-rose-500 ring-1 ring-rose-500') : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500')}
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          {data.confirmPassword && passwordsMatch && (
            <Check size={16} className="absolute right-9 top-3 text-emerald-500" />
          )}
        </div>
        {data.confirmPassword && !passwordsMatch && (
          <p className="text-xs text-rose-500 mt-1 font-medium">Passwords do not match</p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={handleInitialSignUp}
          disabled={!isValid || loading}
          className="w-full py-2.5 bg-gradient-to-r from-[#7c6af6] to-[#a78bfa] hover:from-[#6155e0] hover:to-[#9178f4] text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-tactile"
        >
          {loading ? 'Processing...' : 'Continue to Profile'} <ArrowRight size={14} />
        </button>

        <div className="my-4 flex items-center opacity-60">
          <div className="flex-grow border-t border-gs-border"></div>
          <span className="flex-shrink-0 mx-3 text-gs-text-muted text-[11px]">or sign up with</span>
          <div className="flex-grow border-t border-gs-border"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex items-center justify-center gap-2.5 py-2 glass-card rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs font-medium text-gs-text-main shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          {/* Microsoft - Coming Soon */}
          <button
            disabled
            type="button"
            className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-gs-text-muted cursor-not-allowed opacity-50"
            title="Coming Soon"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#F35325" d="M11.4 2H2v9.4h9.4V2z"/>
              <path fill="#81BC06" d="M22 2h-9.4v9.4H22V2z"/>
              <path fill="#05A6F0" d="M11.4 12.6H2V22h9.4v-9.4z"/>
              <path fill="#FFBA08" d="M22 12.6h-9.4V22H22v-9.4z"/>
            </svg>
            Microsoft (Soon)
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
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">Personal Information</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tell us a bit about yourself so peers recognize you.</p>
      </div>

      {/* Avatar Picker */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Profile Avatar</label>
        <div className="flex flex-wrap gap-2">
          {AVATARS.map(av => (
            <button
              key={av}
              type="button"
              onClick={() => onChange('avatar', av)}
              className={"text-xl w-10 h-10 rounded-xl border transition-all " + (data.avatar === av ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-500')}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name <span className="text-rose-500">*</span></label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={data.fullName}
            onChange={e => onChange('fullName', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="Your full name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* DOB */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth</label>
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="date"
              value={data.dob}
              onChange={e => onChange('dob', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white [color-scheme:dark]"
            />
          </div>
        </div>
        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
          <select
            value={data.gender}
            onChange={e => onChange('gender', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
          >
            <option value="">Select...</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight size={16} />
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
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">Academic Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your college, degree program, and standing.</p>
      </div>

      {/* College Searchable Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College / University <span className="text-rose-500">*</span></label>
        <div className="relative">
          <GraduationCap size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={collegeSearch}
            onChange={e => { setCollegeSearch(e.target.value); setShowCollegeList(true); onChange('college', e.target.value); }}
            onFocus={() => setShowCollegeList(true)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="Search your college..."
          />
          {showCollegeList && filteredColleges.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
              {filteredColleges.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onChange('college', c); setCollegeSearch(c); setShowCollegeList(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Student ID */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Student ID / Roll No.</label>
          <input
            type="text"
            value={data.studentId}
            onChange={e => onChange('studentId', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
            placeholder="e.g. 21CS001"
          />
        </div>
        {/* Course */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree <span className="text-rose-500">*</span></label>
          <select
            value={data.course}
            onChange={e => onChange('course', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
          >
            <option value="">Select...</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Branch */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch / Department</label>
        <select
          value={data.branch}
          onChange={e => onChange('branch', e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
        >
          <option value="">Select branch...</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Year <span className="text-rose-500">*</span></label>
          <select
            value={data.year}
            onChange={e => onChange('year', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
          >
            <option value="">Year</option>
            {['1st', '2nd', '3rd', '4th', '5th', 'Grad'].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {/* Semester */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Semester</label>
          <select
            value={data.semester}
            onChange={e => onChange('semester', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
          >
            <option value="">Sem</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {/* Grad Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Grad Year</label>
          <select
            value={data.gradYear}
            onChange={e => onChange('gradYear', e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
          >
            <option value="">Year</option>
            {[2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* CGPA */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          CGPA / Percentage <span className="text-[11px] text-slate-400 font-normal ml-1">(optional · <Lock size={10} className="inline" /> private)</span>
        </label>
        <input
          type="text"
          value={data.cgpa}
          onChange={e => onChange('cgpa', e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
          placeholder="e.g. 8.5 or 89%"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight size={16} />
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
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex items-center w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <div className={`w-4 h-4 rounded-full transition-all duration-200 bg-white shadow-xs ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  );

  return (
    <div className="space-y-5 animate-[slideIn_0.3s_ease-out]">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">Interests & Preferences</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Personalize your group recommendations and notification preferences.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Event Interests */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Event Interests</label>
        <div className="flex flex-wrap gap-2">
          {EVENT_INTERESTS.map(interest => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                data.interests.includes(interest)
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Tag Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Skills</label>
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
          <div className="flex flex-wrap gap-2 mb-2">
            {data.skills.map(skill => (
              <span
                key={skill}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-rose-500 transition-colors text-slate-400"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={e => { setSkillInput(e.target.value); setShowSuggestions(true); }}
              onKeyDown={e => { if (e.key === 'Enter' && skillInput.trim()) { e.preventDefault(); addSkill(skillInput); } }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-transparent outline-none text-xs text-slate-900 dark:text-white placeholder-slate-400"
              placeholder="Type a skill and press Enter..."
            />
            {showSuggestions && suggestions.length > 0 && skillInput && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20">
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addSkill(s)}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Plus size={13} className="text-blue-600 dark:text-blue-400" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bio / About Me</label>
        <textarea
          value={data.bio}
          onChange={e => onChange('bio', e.target.value)}
          rows={3}
          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white resize-none text-xs placeholder-slate-400"
          placeholder="Tell other students about your interests, project ideas, and study goals..."
        />
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Social & Portfolio Links</label>
        <div className="space-y-2">
          {[
            { key: 'linkedin', icon: Linkedin, placeholder: 'linkedin.com/in/username' },
            { key: 'github', icon: Github, placeholder: 'github.com/username' },
            { key: 'portfolio', icon: Globe, placeholder: 'yourportfolio.com' },
            { key: 'instagram', icon: Instagram, placeholder: 'instagram.com/username' },
            { key: 'twitter', icon: Twitter, placeholder: 'x.com/username' },
          ].map(({ key, icon: Icon, placeholder }) => (
            <div key={key} className="relative">
              <Icon size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={data.socialLinks[key] || ''}
                onChange={e => onChange('socialLinks', { ...data.socialLinks, [key]: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Bell size={14} className="text-blue-600 dark:text-blue-400" /> Notifications
        </h3>
        {[
          { key: 'events', label: 'New event announcements' },
          { key: 'teamInvites', label: 'Team invitations' },
          { key: 'messages', label: 'Direct messages' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
            <Toggle checked={data.notifications[key]} onChange={() => toggleNotif(key)} />
          </div>
        ))}
      </div>

      {/* Privacy Settings */}
      <div className="bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Shield size={14} className="text-emerald-600 dark:text-emerald-400" /> Privacy
        </h3>
        {[
          { key: 'publicProfile', label: 'Public profile' },
          { key: 'showSkills', label: 'Show skills on profile' },
          { key: 'showEmail', label: 'Show email on profile' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
            <Toggle checked={data.privacy[key]} onChange={() => togglePrivacy(key)} />
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Profile...' : 'Complete Registration'} {!isSubmitting && <Check size={16} />}
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
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gs-bg p-4 relative">
      <div className="w-full max-w-lg rounded-xl p-6 sm:p-8 z-10 glass-card shadow-xs machined-edge">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#7c6af6]/15 border border-[#7c6af6]/30 flex items-center justify-center text-[#9182f8] shadow-xs">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-gs-text-main">GroupSync</h1>
            <p className="text-xs text-gs-text-muted font-medium">Student Registration · Step {step} of 4</p>
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
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? 'bg-[#6D6AF6] border-[#7c6af6] text-white shadow-xs'
                      : isActive
                      ? 'border-[#7c6af6] text-[#9182f8] bg-[#6D6AF6]/10 ring-2 ring-[#6D6AF6]/20'
                      : 'border-gs-border text-gs-text-muted bg-black/5 dark:bg-white/5'
                  }`}>
                    {isDone ? <Check size={14} /> : num}
                  </div>
                  <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap absolute -bottom-5 ${
                    isActive ? 'text-[#9182f8] font-semibold' : isDone ? 'text-gs-text-main' : 'text-gs-text-muted'
                  }`}>{label}</span>
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-0.5 -mt-6 transition-all duration-500 rounded-full ${num < step ? 'bg-[#6D6AF6]' : 'bg-gs-border'}`} />
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
        <p className="text-center text-gs-text-muted mt-8 text-xs">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-[#9182f8] hover:underline font-medium transition-colors cursor-pointer">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}


