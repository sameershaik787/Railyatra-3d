import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageCircle,
  KeyRound,
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
  Train,
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

const ACCOUNTS_KEY = 'railyatra_accounts_v2';

async function hashPassword(mobile, password) {
  const raw = `${mobile}:${password}:railyatra3d-v2`;
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(raw);
}

function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAccount(mobile, record) {
  try {
    const all = getAccounts();
    all[mobile] = record;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all));
  } catch {}
}

export default function AuthGate({ onAuthenticated }) {
  const [mode, setMode] = useState('login'); // login | signup | forgot
  const [role, setRole] = useState('passenger');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [step, setStep] = useState('details'); // details | otp
  const [otpInput, setOtpInput] = useState('');
  const [challenge, setChallenge] = useState('');
  const [previewOtp, setPreviewOtp] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setStep('details');
    setOtpInput('');
    setPreviewOtp('');
    setChallenge('');
    setError('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
  };

  const validateDetails = () => {
    const cleanedMobile = mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      return 'Enter a valid 10-digit Indian WhatsApp mobile number starting with 6-9.';
    }

    const cleanedEmail = email.trim().toLowerCase();
    if (cleanedEmail) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanedEmail)) {
        return 'Enter a valid email address or leave Email blank.';
      }
      if (DISPOSABLE_DOMAINS.includes(cleanedEmail.split('@')[1])) {
        return 'Disposable email domains are blocked. Use a genuine email ID or leave it optional.';
      }
    }

    if (mode === 'signup') {
      if (name.trim().length < 2) {
        return 'Enter your full name to create a new account.';
      }
      if (password.length < 6) {
        return 'Password must be at least 6 characters.';
      }
      if (password !== confirmPassword) {
        return 'Password and Confirm Password do not match.';
      }
    }

    if (mode === 'login' && password.length < 6) {
      return 'Enter your password (minimum 6 characters).';
    }

    return '';
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const validationErr = validateDetails();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    const cleanedMobile = mobile.replace(/\D/g, '');
    const accounts = getAccounts();
    const existing = accounts[cleanedMobile];

    if (mode === 'signup' && existing) {
      setError('An account with this WhatsApp number already exists. Please Sign In or use Forgot Password.');
      return;
    }

    if (mode === 'login') {
      if (!existing) {
        setError('No account found for this WhatsApp number. Switch to Sign Up (New User) to register.');
        return;
      }
      const enteredHash = await hashPassword(cleanedMobile, password);
      if (enteredHash !== existing.passwordHash) {
        setError('Incorrect password. Try again or click "Forgot password?" to reset.');
        return;
      }
    }

    if (mode === 'forgot' && !existing) {
      setError('No registered account found for this WhatsApp number. Please Sign Up as a new user.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);
    setDeliveryInfo('');
    setPreviewOtp('');

    const effectiveEmail =
      mode === 'signup' ? email.trim().toLowerCase() : existing?.email || email.trim().toLowerCase();
    const effectiveName =
      mode === 'signup' ? name.trim() : existing?.name || `User ${cleanedMobile.slice(-4)}`;
    const effectiveRole = mode === 'signup' ? role : existing?.role || role;

    try {
      const res = await fetch('/.netlify/functions/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanedMobile,
          email: effectiveEmail,
          name: effectiveName,
          role: effectiveRole,
          purpose: mode,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('WhatsApp OTP service is unavailable. Redeploy on Netlify to activate.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not send WhatsApp verification code.');
      }

      setChallenge(data.challenge || '');
      if (data.sent_via_whatsapp) {
        setDeliveryInfo(`6-digit verification code sent to WhatsApp ${data.mobile}.`);
      } else if (data.sent_via_email) {
        setDeliveryInfo(`6-digit verification code emailed to ${effectiveEmail}.`);
      } else {
        setPreviewOtp(data.preview_otp || '');
        const note = data.wa_note ? ` (${data.wa_note})` : '';
        setDeliveryInfo(
          `WhatsApp API keys not configured on Netlify${note}. Instant WhatsApp verification code for ${data.mobile}:`
        );
      }

      setStep('otp');
      setSecondsLeft(300);
    } catch (err) {
      setError(err.message || 'Unable to generate WhatsApp OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpInput.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Enter the 6-digit WhatsApp verification code.');
      return;
    }
    if (secondsLeft <= 0) {
      setError('This verification code has expired. Click Resend Code.');
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
    }

    setError('');
    setLoading(true);

    const cleanedMobile = mobile.replace(/\D/g, '');
    const accounts = getAccounts();
    const existing = accounts[cleanedMobile];
    const effectiveEmail =
      mode === 'signup' ? email.trim().toLowerCase() : existing?.email || email.trim().toLowerCase();

    try {
      const res = await fetch('/.netlify/functions/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanedMobile,
          email: effectiveEmail,
          otp: code,
          challenge,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid WhatsApp verification code.');
      }

      if (mode === 'signup') {
        const passwordHash = await hashPassword(cleanedMobile, password);
        saveAccount(cleanedMobile, {
          mobile: cleanedMobile,
          name: name.trim(),
          email: effectiveEmail,
          role,
          passwordHash,
          createdAt: new Date().toISOString(),
        });
        onAuthenticated({
          token: data.access_token,
          ...data.user,
          name: name.trim(),
          role,
        });
      } else if (mode === 'forgot') {
        const newHash = await hashPassword(cleanedMobile, password);
        saveAccount(cleanedMobile, {
          ...(existing || {
            mobile: cleanedMobile,
            name: data.user?.name || `User ${cleanedMobile.slice(-4)}`,
            email: effectiveEmail,
            role,
          }),
          passwordHash: newHash,
          updatedAt: new Date().toISOString(),
        });
        setPassword('');
        setConfirmPassword('');
        setOtpInput('');
        setPreviewOtp('');
        setMode('login');
        setStep('details');
        setSuccessMsg('Password updated successfully. Sign in with your new password.');
      } else {
        onAuthenticated({
          token: data.access_token,
          ...data.user,
          name: existing?.name || data.user?.name,
          role: existing?.role || role,
        });
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Double-check your 6-digit code.');
    } finally {
      setLoading(false);
    }
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const formattedMobile =
    mobile.length === 10 ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : `+91 ${mobile}`;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f2f5fa] flex flex-col">
      <div className="bg-[#07244d] pt-10 pb-24 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-blue-100 mb-3">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            WhatsApp OTP Verified Identity Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {mode === 'signup'
              ? 'Create Your RailYatra 3D Account'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Sign in to RailYatra 3D'}
          </h1>
          <p className="text-blue-200 text-sm mt-1.5">
            {mode === 'signup'
              ? 'Register with your WhatsApp number to access 3D berth booking, live PNR catering, or operations.'
              : mode === 'forgot'
              ? 'Verify your WhatsApp number via OTP to set a new password.'
              : 'Sign in with your registered WhatsApp number and password.'}
          </p>
        </div>
      </div>

      <div className="max-w-lg w-full mx-auto px-4 -mt-16 pb-12">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6 sm:p-8">
          {/* Login / Sign Up Switcher */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 mb-5">
              <button
                type="button"
                disabled={step === 'otp'}
                onClick={() => switchMode('login')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'login'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                disabled={step === 'otp'}
                onClick={() => switchMode('signup')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  mode === 'signup'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up (New User)
              </button>
            </div>
          )}

          {/* 3 Clean Role Buttons */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Access Portal
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
                    className={`rounded-xl px-3 py-3 text-center border transition ${
                      active
                        ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'
                    } ${step === 'otp' ? 'opacity-65 cursor-not-allowed' : ''}`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
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
                      placeholder="e.g. Shaik Sameer"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  WhatsApp Mobile Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit WhatsApp number"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-16 pr-4 py-3 text-sm font-mono tracking-wider text-slate-900 outline-none transition"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Email ID</label>
                    <span className="text-[11px] font-medium text-slate-400">Optional</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com (optional)"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                    />
                  </div>
                </div>
              )}

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
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? 'Sending WhatsApp Code...'
                  : mode === 'forgot'
                  ? 'Send WhatsApp Reset Code'
                  : mode === 'signup'
                  ? 'Send WhatsApp Verification Code'
                  : 'Continue with WhatsApp OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {mode === 'forgot' && (
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
              )}
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  WhatsApp Verification for {formattedMobile}
                </div>
                <p className="mt-1 text-emerald-800">{deliveryInfo}</p>
                {previewOtp && (
                  <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-white border border-emerald-200 px-3 py-2">
                    <span className="font-mono text-base font-bold tracking-[0.25em] text-emerald-700">
                      {previewOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpInput(previewOtp)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Enter 6-Digit WhatsApp Code
                  </label>
                  <span className="text-xs font-mono font-semibold text-blue-700">
                    Expires in {mins}:{secs}
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    autoFocus
                    className="w-full rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-base font-mono tracking-[0.35em] text-slate-900 outline-none transition"
                  />
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
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 text-sm shadow-sm flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
              >
                {loading
                  ? 'Verifying...'
                  : mode === 'forgot'
                  ? 'Verify WhatsApp Code & Reset Password'
                  : mode === 'signup'
                  ? 'Verify & Create Account'
                  : 'Verify & Sign In'}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setOtpInput('');
                    setError('');
                  }}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  Change Details
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Resend Code
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-blue-600" />
              Indian Railways Spatial Prototype
            </span>
            <span>WhatsApp OTP + HMAC Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}