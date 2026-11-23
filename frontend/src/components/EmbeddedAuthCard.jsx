import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'trashmail.com',
];

const ROLES = [
  { id: 'passenger', label: 'Passenger' },
  { id: 'tte', label: 'TTE Staff' },
  { id: 'admin', label: 'Railway Admin' },
];

export default function EmbeddedAuthCard({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('passenger');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState('details');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0 && resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, resendCooldown]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep('details');
    setOtpDigits(['', '', '', '', '', '']);
    setGeneratedOtp('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMsg('');
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) updated[i] = pasted[i];
    setOtpDigits(updated);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const validateDetails = () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanedEmail)) {
      return 'Enter a valid email address.';
    }
    if (DISPOSABLE_DOMAINS.includes(cleanedEmail.split('@')[1])) {
      return 'Temporary or disposable email addresses are blocked.';
    }
    if (mode === 'signup') {
      if (name.trim().length < 2) return 'Enter your full name.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }
    if (mode === 'login' && password.length < 6) {
      return 'Enter your password (minimum 6 characters).';
    }
    return '';
  };

  const handleSendOtp = (e) => {
    e?.preventDefault();
    const validationErr = validateDetails();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setError('');
    setSuccessMsg('');
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setStep('otp');
    setSecondsLeft(300);
    setResendCooldown(15);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Enter all 6 digits of the OTP.');
      return;
    }
    if (secondsLeft <= 0) {
      setError('OTP expired. Click Resend OTP to generate a fresh code.');
      return;
    }
    if (code !== generatedOtp) {
      setError(`Incorrect 6-digit code. Use Demo OTP: ${generatedOtp}`);
      return;
    }

    if (mode === 'forgot') {
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('New password and Confirm Password do not match.');
        return;
      }
      setPassword('');
      setConfirmPassword('');
      setOtpDigits(['', '', '', '', '', '']);
      setGeneratedOtp('');
      setMode('login');
      setStep('details');
      setSuccessMsg('Password updated for this session. Sign in with your new password.');
      return;
    }

    const cleanedEmail = email.trim().toLowerCase();
    const displayName = name.trim() || cleanedEmail.split('@')[0];
    onAuthenticated?.({
      email: cleanedEmail,
      name: displayName,
      role,
      verified: true,
      verified_at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      status: 'Active',
    });
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-900 w-full">
      {mode !== 'forgot' && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 mb-6">
          <button
            type="button"
            disabled={step === 'otp'}
            onClick={() => switchMode('login')}
            className={`py-2.5 rounded-full text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            disabled={step === 'otp'}
            onClick={() => switchMode('signup')}
            className={`py-2.5 rounded-full text-sm font-semibold transition ${
              mode === 'signup'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          {mode === 'signup'
            ? 'New User Sign Up'
            : mode === 'forgot'
            ? 'Forgot Password'
            : 'Welcome back, Traveller'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {mode === 'signup'
            ? 'Create your RailYatra 3D session and verify with a 6-digit OTP.'
            : mode === 'forgot'
            ? 'Verify your email via OTP to reset your password.'
            : 'Sign in with your email, password, and 6-digit OTP.'}
        </p>
      </div>

      <div className="mb-5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Select Portal Role
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((item) => {
            const active = role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={step === 'otp'}
                onClick={() => setRole(item.id)}
                className={`rounded-xl px-2.5 py-2.5 text-center border text-xs font-bold transition ${
                  active
                    ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'
                } ${step === 'otp' ? 'opacity-65 cursor-not-allowed' : ''}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {step === 'details' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-600">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-11 py-3 text-sm text-slate-900 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Confirm Password <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3.5 text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
          >
            {mode === 'forgot'
              ? 'Generate Reset OTP'
              : mode === 'signup'
              ? 'Generate Sign Up OTP'
              : 'Generate Login OTP'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          )}
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900">
            <div className="font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Session OTP for {email.trim().toLowerCase()}
            </div>
            <p className="mt-1 text-blue-800 font-mono">
              Demo OTP: <strong className="text-sm tracking-widest">{generatedOtp}</strong>
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">6-Digit OTP</label>
              <span className="text-xs font-mono font-semibold text-blue-700">
                Expires in {mins}:{secs}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-full h-12 text-center text-lg font-mono font-bold rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-900 outline-none transition"
                />
              ))}
            </div>
          </div>

          {mode === 'forgot' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-11 py-3 text-sm text-slate-900 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3.5 text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95"
          >
            {mode === 'forgot'
              ? 'Verify OTP & Update Password'
              : mode === 'signup'
              ? 'Verify OTP & Create Account'
              : 'Verify OTP & Sign In'}
            <ShieldCheck className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setStep('details');
                setOtpDigits(['', '', '', '', '', '']);
                setError('');
              }}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={resendCooldown > 0}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}