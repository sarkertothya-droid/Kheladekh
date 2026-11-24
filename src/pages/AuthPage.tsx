import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  Phone,
  ShieldCheck,
  UserCheck,
  Copy,
  Check,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

function mapFirebaseError(errString: string): { title: string; hint: string } {
  const lower = errString.toLowerCase();

  if (lower.includes('email-already-in-use')) {
    return {
      title: 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত আছে',
      hint: 'সরাসরি Sign In করুন অথবা পাসওয়ার্ড ভুলে গেলে "পাসওয়ার্ড রিসেট" ব্যবহার করুন।',
    };
  }
  if (lower.includes('weak-password')) {
    return {
      title: 'পাসওয়ার্ডটি খুবই ছোট বা দুর্বল',
      hint: 'দয়া করে কমপক্ষে ৬ অক্ষরের একটি পাসওয়ার্ড দিন।',
    };
  }
  if (lower.includes('invalid-credential') || lower.includes('wrong-password')) {
    return {
      title: 'ভুল ইমেইল বা পাসওয়ার্ড প্রদান করা হয়েছে',
      hint: 'সঠিক পাসওয়ার্ড দিন অথবা নিচের "পাসওয়ার্ড রিসেট" বাটনে ক্লিক করুন।',
    };
  }
  if (lower.includes('user-not-found')) {
    return {
      title: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি',
      hint: 'দয়া করে প্রথমে "নতুন অ্যাকাউন্ট" ট্যাবে গিয়ে অ্যাকাউন্ট তৈরি করুন।',
    };
  }
  if (lower.includes('invalid-phone-number')) {
    return {
      title: 'মোবাইল নম্বরটি সঠিক ফরম্যাটে নেই',
      hint: 'দেশের কোডসহ নম্বর দিন (যেমন বাংলাদেশের জন্য +88017XXXXXXXX)।',
    };
  }
  if (lower.includes('invalid-verification-code')) {
    return {
      title: 'ভুল ৬-ডিজিট OTP কোড',
      hint: 'আপনার মোবাইলে আসা SMS থেকে সঠিক ৬ সংখ্যার কোডটি দেখে আবার লিখুন।',
    };
  }
  if (lower.includes('operation-not-allowed') || lower.includes('billing-not-enabled')) {
    return {
      title: 'Firebase Console-এ এই সাইন-ইন মেথডটি চালু করা প্রয়োজন',
      hint: 'Firebase Console -> Authentication -> Sign-in method থেকে Phone / Email / Anonymous চালু করে আবার চেষ্টা করুন।',
    };
  }
  if (lower.includes('popup-closed-by-user')) {
    return {
      title: 'Google লগইন উইন্ডো বন্ধ করা হয়েছে',
      hint: 'পুনরায় লগইন করতে "Google দিয়ে KhelaDekH-এ সাইন ইন" বাটনে চাপুন।',
    };
  }
  if (lower.includes('network-request-failed')) {
    return {
      title: 'ইন্টারনেট সংযোগে সমস্যা হয়েছে',
      hint: 'আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।',
    };
  }

  return {
    title: 'প্রক্রিয়াকরণে ত্রুটি হয়েছে',
    hint: errString || 'অনুগ্রহ করে তথ্য যাচাই করে পুনরায় চেষ্টা করুন।',
  };
}

export const AuthPage: React.FC = () => {
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    signInAsGuest,
    sendPhoneOtp,
    confirmPhoneOtp,
    resetPhoneOtpState,
    resetPassword,
  } = useAuth();
  const { settings } = useData();
  const brandName = settings.siteName?.trim() || 'KhelaDekH';
  const brandLogo = settings.logoUrl || '/src/assets/images/kheladekh_logo_1793952334814.jpg';

  const [mode, setMode] = useState<'login' | 'register' | 'phone' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+880');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string; hint: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState<{
    email: string;
    senderName: string;
    senderEmail: string;
    shortResetUrl: string;
    message: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const switchMode = (nextMode: 'login' | 'register' | 'phone' | 'reset') => {
    setMode(nextMode);
    setErrorDetails(null);
    setResetSuccess(null);
    if (nextMode !== 'phone') {
      setOtpSent(false);
      setOtpCode('');
      resetPhoneOtpState();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);
    setResetSuccess(null);
    setSubmitting(true);

    const cleanEmail = email.trim();

    try {
      if (mode === 'login') {
        await signInWithEmail(cleanEmail, password);
      } else if (mode === 'register') {
        await registerWithEmail(name.trim() || 'Sports Fan', cleanEmail, password);
      } else if (mode === 'phone') {
        if (!otpSent) {
          await sendPhoneOtp(phone.trim(), 'kheladekh-auth-recaptcha', 'signin');
          setOtpSent(true);
        } else {
          await confirmPhoneOtp(otpCode);
        }
      } else {
        await resetPassword(cleanEmail);

        let backendResp: any = null;
        try {
          const r = await fetch('/api/auth/password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, phone: phone.trim().length > 5 ? phone.trim() : undefined }),
          });
          backendResp = await r.json();
        } catch (apiErr) {
          console.warn('Backend reset note:', apiErr);
        }

        setResetSuccess({
          email: cleanEmail,
          senderName: backendResp?.senderName || 'KhelaDekH Support Team',
          senderEmail: backendResp?.senderEmail || 'support@kheladekh.com',
          shortResetUrl: backendResp?.shortResetUrl || `${window.location.origin}/reset`,
          message:
            backendResp?.message ||
            `KhelaDekH Support Team থেকে ${cleanEmail} ঠিকানায় পাসওয়ার্ড রিসেট ইমেইল ও শর্ট লিংক পাঠানো হয়েছে।`,
        });
      }
    } catch (err: any) {
      const parsed = mapFirebaseError(err?.message || String(err));
      setErrorDetails(parsed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setErrorDetails(null);
    setResetSuccess(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const parsed = mapFirebaseError(err?.message || String(err));
      setErrorDetails(parsed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setErrorDetails(null);
    setSubmitting(true);
    try {
      await signInAsGuest();
    } catch (err: any) {
      setErrorDetails(mapFirebaseError(err?.message || String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const copyShortLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[#111827] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Large Prominent KhelaDekH Brand Banner for Google & All Sign-Ins */}
      <div className="rounded-2xl bg-[#0B111C] border border-white/10 p-5 text-center space-y-2.5">
        <div className="flex items-center justify-center gap-3">
          <img
            src={brandLogo}
            alt={brandName}
            className="w-12 h-12 rounded-2xl object-cover border border-[#00B7FF]/40 shadow-md"
          />
          <div className="text-left">
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
              {brandName === 'KhelaDekH' ? (
                <>
                  Khela<span className="text-[#00B7FF]">DekH</span>
                </>
              ) : (
                brandName
              )}
            </h1>
            <p className="text-[11px] font-mono text-[#16D98A] mt-1 tracking-wide">
              LIVE SPORTS &amp; TV ACCOUNT PORTAL
            </p>
          </div>
        </div>
        <p className="text-xs text-[#A5B1C2]">
          Google, মোবাইল নম্বর (SMS OTP), ইমেইল অথবা গেস্ট হিসেবে ১-ক্লিকে যুক্ত হোন
        </p>
      </div>

      {/* Big Clear Google Sign-in Button */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full min-h-[50px] px-4 rounded-2xl bg-white hover:bg-gray-100 text-[#080B12] text-sm sm:text-base font-extrabold transition-colors flex items-center justify-center gap-3 shadow-lg cursor-pointer disabled:opacity-60"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google দিয়ে {brandName}-এ সাইন ইন</span>
        </button>

        {/* Sign-in Method Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#0B111C] border border-white/10">
          {[
            { id: 'login', label: 'ইমেইল লগইন' },
            { id: 'register', label: 'নতুন অ্যাকাউন্ট' },
            { id: 'phone', label: 'ফোন OTP' },
            { id: 'reset', label: 'পাসওয়ার্ড রিসেট' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchMode(tab.id as any)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                mode === tab.id
                  ? 'bg-[#00B7FF] text-[#080B12]'
                  : 'text-[#A5B1C2] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Callout */}
      {errorDetails && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorDetails.title}</span>
          </div>
          <p className="text-[11px] text-red-200/90 leading-relaxed pl-6">{errorDetails.hint}</p>
        </div>
      )}

      {/* Password Reset Success Card (KhelaDekH Support Team + Short Reset Link) */}
      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-[#16D98A]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>রিসেট ইমেইল ও শর্ট রিসেট লিংক তৈরি হয়েছে!</span>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed">{resetSuccess.message}</p>

          <div className="bg-[#0B111C] p-3 rounded-xl border border-white/10 space-y-2 text-[11px] text-[#A5B1C2]">
            <p className="font-semibold text-white">
              প্রেরক: <span className="text-[#00B7FF]">{resetSuccess.senderName}</span>{' '}
              <span className="text-[10px] font-mono text-[#94A3B8]">({resetSuccess.senderEmail})</span>
            </p>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/40 border border-white/10">
              <span className="font-mono text-[#16D98A] truncate">{resetSuccess.shortResetUrl}</span>
              <button
                type="button"
                onClick={() => copyShortLink(resetSuccess.shortResetUrl)}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold inline-flex items-center gap-1 shrink-0"
              >
                {copiedLink ? <Check className="w-3 h-3 text-[#16D98A]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
            <p>১. আপনার {resetSuccess.email} এর Inbox বা Spam ফোল্ডার চেক করুন।</p>
            <p>২. লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।</p>
          </div>

          <button
            type="button"
            onClick={() => switchMode('login')}
            className="w-full py-2.5 rounded-xl bg-[#16D98A] text-[#080B12] text-xs font-bold hover:brightness-110 transition-all text-center"
          >
            লগইন ট্যাবে ফিরে যান
          </button>
        </div>
      )}

      {/* Dynamic Auth Form */}
      {(!resetSuccess || mode !== 'reset') && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#00B7FF]" />
                <span>আপনার পুরো নাম</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
              />
            </div>
          )}

          {mode === 'phone' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#16D98A]" />
                  <span>মোবাইল নম্বর (দেশের কোডসহ)</span>
                </label>
                <input
                  type="tel"
                  required
                  disabled={otpSent}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-[#16D98A] disabled:opacity-60"
                />
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  উদাহরণ: বাংলাদেশ +8801..., ভারত +91..., যুক্তরাষ্ট্র +1...
                </p>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#00B7FF]" />
                    <span>৬ ডিজিটের SMS ভেরিফিকেশন কোড (OTP)</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-[#00B7FF]/50 text-base text-white font-mono tracking-[0.3em] text-center focus:outline-none focus:border-[#00B7FF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      resetPhoneOtpState();
                    }}
                    className="mt-1.5 text-[11px] text-[#00B7FF] hover:underline"
                  >
                    নম্বর পরিবর্তন করুন বা আবার OTP পাঠান
                  </button>
                </div>
              )}

              <div id="kheladekh-auth-recaptcha" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#00B7FF]" />
                <span>ইমেইল ঠিকানা</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
              />
            </div>
          )}

          {mode === 'reset' && (
            <div className="p-3 rounded-xl bg-[#0B111C] border border-white/10 text-[11px] text-[#CBD5E1] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00B7FF] shrink-0 mt-0.5" />
              <span>
                রিসেট ইমেইল <strong className="text-white">KhelaDekH Support Team</strong> থেকে পাঠানো হবে এবং সাথে শর্ট রিসেট লিংক তৈরি হবে।
              </span>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#A5B1C2] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00B7FF]" />
                  <span>পাসওয়ার্ড</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-[11px] text-[#00B7FF] hover:underline font-semibold"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5B1C2] hover:text-white"
                  title={showPassword ? 'লুকান' : 'দেখুন'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>প্রক্রিয়াকরণ হচ্ছে...</span>
              </>
            ) : mode === 'login' ? (
              'সাইন ইন করুন'
            ) : mode === 'register' ? (
              'অ্যাকাউন্ট তৈরি ও ইমেইল ভেরিফাই করুন'
            ) : mode === 'phone' ? (
              otpSent ? 'OTP যাচাই করে সাইন ইন করুন' : 'মোবাইলে ৬-ডিজিট OTP পাঠান'
            ) : (
              'KhelaDekH Support Team থেকে রিসেট পাঠান'
            )}
          </button>
        </form>
      )}

      {/* Anonymous Guest Watch + Back Navigation */}
      <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleGuest}
          disabled={submitting}
          className="px-4 py-2 rounded-xl bg-[#0B111C] hover:bg-white/5 border border-white/10 text-xs font-semibold text-[#CBD5E1] inline-flex items-center justify-center gap-2 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#16D98A]" />
          <span>গেস্ট হিসেবে প্রবেশ করুন (Anonymous)</span>
        </button>

        {mode !== 'login' && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="inline-flex items-center gap-1.5 text-xs text-[#A5B1C2] hover:text-white font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>লগইন পেজে ফিরে যান</span>
          </button>
        )}
      </div>
    </div>
  );
};
