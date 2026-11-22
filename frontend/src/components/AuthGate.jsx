import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Lock,
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

export default function AuthGate({ onAuthenticated }) {
  const [role, setRole] = useState('passenger');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('details');
  const [otpInput, setOtpInput] = useState('');
  const [challenge, setChallenge] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
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

  const validateInputs = () => {
    const cleanedMobile = mobile.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanedMobile)) {
      return 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
    }
    const cleanedEmail = email.trim().toLowerCase();
    if (cleanedEmail) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanedEmail)) {
        return 'Enter a valid email address or leave Email blank.';
      }
      if (DISPOSABLE_DOMAINS.includes(cleanedEmail.split('@')[1])) {
        return 'Temporary or disposable email domains are blocked. Use a genuine email ID or leave it optional.';
      }
    }
    return '';
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const validationErr = validateInputs();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setError('');
    setLoading(true);
    setDeliveryInfo('');

    const cleanedMobile = mobile.replace(/\D/g, '');
    const cleanedEmail = email.trim().toLowerCase();
    const displayName = name.trim() || (cleanedEmail ? cleanedEmail.split('@')[0] : `Passenger ${cleanedMobile.slice(-4)}`);

    try {
      const res = await fetch('/.netlify/functions/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanedMobile,
          email: cleanedEmail,
          name: displayName,
          role,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Netlify OTP function is unavailable. Redeploy on Netlify to activate.');
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Could not generate OTP.');
      }

      setChallenge(data.challenge || '');
      if (data.sent_via_sms && data.sent_via_email) {
        setDeliveryInfo(`A 6-digit verification code has been sent via SMS to ${data.mobile} and emailed to ${cleanedEmail}.`);
      } else if (data.sent_via_sms) {
        setDeliveryInfo(`A 6-digit verification code has been sent via SMS to ${data.mobile}.`);
      } else if (data.sent_via_email) {
        setDeliveryInfo(`A 6-digit verification code has been emailed to ${cleanedEmail}. Check your Inbox or Spam folder.`);
      } else {
        const target = cleanedEmail ? `${data.mobile} / ${cleanedEmail}` : data.mobile;
        setDeliveryInfo(
          `Verification OTP generated for ${target}: ${data.preview_otp}`
        );
      }

      setStep('otp');
      setSecondsLeft(300);
    } catch (err) {
      setError(err.message || 'Unable to generate OTP right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpInput.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Enter the 6-digit verification OTP.');
      return;
    }
    if (secondsLeft <= 0) {
      setError('This OTP has expired. Click Resend OTP to get a new code.');
      return;
    }

    setError('');
    setLoading(true);

    const cleanedMobile = mobile.replace(/\D/g, '');
    const cleanedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/.netlify/functions/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanedMobile,
          email: cleanedEmail,
          otp: code,
          challenge,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid OTP code.');
      }
      onAuthenticated({
        token: data.access_token,
        ...data.user,
      });
    } catch (err) {
      setError(err.message || 'Verification failed. Double-check your 6-digit OTP.');
    } finally {
      setLoading(false);
    }
  };

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const formattedMobile = mobile.length === 10 ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : `+91 ${mobile}`;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f2f5fa] flex flex-col">
      <div className="bg-[#07244d] pt-10 pb-24 px-4 sm:px-6 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-semibold text-blue-100 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Mobile & Email OTP Identity Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign in to RailYatra 3D
          </h1>
          <p className="text-blue-200 text-sm mt-1.5">
            Verify your identity via Mobile or Email OTP to access 3D berth reservations, live PNR catering, or railway operations.
          </p>
        </div>
      </div>

      <div className="max-w-lg w-full mx-auto px-4 -mt-16 pb-12">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg p-6 sm:p-8">
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

          {step === 'details' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Shaik Sameer"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white pl-16 pr-4 py-3 text-sm font-mono tracking-wider text-slate-900 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Email ID
                  </label>
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
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Add an email to also receive OTP and booking updates in your inbox.
                </p>
              </div>

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
                {loading ? 'Generating Verification OTP...' : 'Send Verification OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-800">
                <div className="font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  OTP Ready for {formattedMobile}{email.trim() ? ` (${email.trim().toLowerCase()})` : ''}
                </div>
                <p className="mt-1 text-blue-700">{deliveryInfo}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Enter 6-Digit Verification OTP
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
                {loading ? 'Verifying Identity...' : 'Verify OTP & Enter Portal'}
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
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-blue-600" />
              Indian Railways Spatial Prototype
            </span>
            <span>HMAC-SHA256 Session Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}