import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      hint: 'সঠিক পাসওয়ার্ড দিন অথবা নিচের "পাসওয়ার্ড ভুলে গেছেন?" বাটনে ক্লিক করুন।',
    };
  }
  if (lower.includes('user-not-found')) {
    return {
      title: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি',
      hint: 'দয়া করে প্রথমে "নতুন অ্যাকাউন্ট তৈরি করুন" বাটনে ক্লিক করে অ্যাকাউন্ট খুলুন।',
    };
  }
  if (lower.includes('popup-closed-by-user')) {
    return {
      title: 'Google লগইন উইন্ডো বন্ধ করা হয়েছে',
      hint: 'পুনরায় লগইন করতে "Google দিয়ে লগইন করুন" বাটনে চাপুন।',
    };
  }
  if (lower.includes('network-request-failed')) {
    return {
      title: 'ইন্টারনেট সংযোগে সমস্যা হয়েছে',
      hint: 'আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।',
    };
  }

  return {
    title: 'লগইন বা অ্যাকাউন্ট তৈরিতে ত্রুটি',
    hint: errString || 'অনুগ্রহ করে তথ্য যাচাই করে পুনরায় চেষ্টা করুন।',
  };
}

export const AuthPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ title: string; hint: string } | null>(null);
  const [resetSuccess, setResetSuccess] = useState<{
    email: string;
    senderEmail: string;
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

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
      } else {
        // Automated Email + Mail-to-SMS Notification Reset Flow from factsknown178@gmail.com
        await resetPassword(cleanEmail);

        let backendResp: any = null;
        try {
          const r = await fetch('/api/auth/password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, phone: phone.trim() || undefined }),
          });
          backendResp = await r.json();
        } catch (apiErr) {
          console.warn('Backend reset log note:', apiErr);
        }

        setResetSuccess({
          email: cleanEmail,
          senderEmail: backendResp?.senderEmail || 'factsknown178@gmail.com',
          message:
            backendResp?.message ||
            `factsknown178@gmail.com থেকে স্বয়ংক্রিয় পাসওয়ার্ড রিসেট ইমেইল ও SMS অ্যালার্ট ${cleanEmail} ঠিকানায় পাঠানো হয়েছে।`,
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

  return (
    <div className="max-w-md mx-auto bg-[#151E2B] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00B7FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-[#00B7FF] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>KhelaDekH Account</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          {mode === 'login'
            ? 'অ্যাকাউন্টে সাইন ইন করুন'
            : mode === 'register'
            ? 'নতুন অ্যাকাউন্ট তৈরি করুন'
            : 'অটো-রিকভারি ও SMS পাসওয়ার্ড রিসেট'}
        </h1>
        <p className="text-xs text-[#A5B1C2] mt-1">
          {mode === 'reset'
            ? 'আপনার ইমেইল (এবং ঐচ্ছিক মোবাইল নম্বর) দিলে সাথে সাথে factsknown178@gmail.com থেকে অটোমেটিক রিসেট লিংক ও SMS পাঠানো হবে।'
            : 'লাইভ ম্যাচ দেখা, প্রিয় দল সংরক্ষণ ও নোটিফিকেশন পেতে যুক্ত থাকুন।'}
        </p>
      </div>

      {/* 1-Click Google Sign-in */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full min-h-[46px] rounded-2xl bg-gradient-to-r from-white via-white to-gray-100 hover:brightness-105 text-[#080B12] text-sm font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/10 active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span>Google দিয়ে ১-ক্লিকে সাইন ইন</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#151E2B] px-3 text-xs text-[#A5B1C2]">অথবা ইমেইল দিয়ে</span>
        <div className="border-t border-white/10 w-full" />
      </div>

      {/* Error Callout */}
      {errorDetails && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorDetails.title}</span>
          </div>
          <p className="text-[11px] text-red-200/90 leading-relaxed pl-6">
            {errorDetails.hint}
          </p>
        </div>
      )}

      {/* Password Reset Success Card */}
      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs text-[#16D98A] space-y-2.5 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-[#16D98A]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>অটোমেটিক মেইল ও SMS নোটিফিকেশন পাঠানো হয়েছে!</span>
          </div>
          <p className="text-[11px] text-white/95 leading-relaxed">
            {resetSuccess.message}
          </p>
          <div className="bg-[#101722]/80 p-2.5 rounded-xl border border-white/5 space-y-1 text-[10px] text-[#A5B1C2]">
            <p className="font-semibold text-white">
              প্রেরক মেইল: <span className="text-[#00B7FF] font-mono">{resetSuccess.senderEmail}</span>
            </p>
            <p>১. আপনার {resetSuccess.email} এর Inbox বা Spam ফোল্ডার চেক করুন।</p>
            <p>২. লিংকে ক্লিক করে সাথে সাথে নতুন পাসওয়ার্ড সেট করুন।</p>
          </div>
          <button
            type="button"
            onClick={() => setMode('login')}
            className="w-full py-2 rounded-xl bg-[#16D98A] text-[#080B12] text-xs font-bold hover:brightness-110 transition-all text-center"
          >
            লগইন পেজে ফিরে যান
          </button>
        </div>
      )}

      {/* Form */}
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
                className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF] transition-colors"
              />
            </div>
          )}

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
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF] transition-colors"
            />
          </div>

          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#16D98A]" />
                <span>মোবাইল নম্বর (SMS অ্যালার্টের জন্য - ঐচ্ছিক)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF] transition-colors"
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#A5B1C2] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#00B7FF]" />
                  <span>পাসওয়ার্ড</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorDetails(null);
                      setResetSuccess(null);
                    }}
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
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF] transition-colors"
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
            className="w-full min-h-[44px] rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-all disabled:opacity-50 shadow-lg shadow-[#00B7FF]/20 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>প্রক্রিয়াকরণ হচ্ছে...</span>
              </>
            ) : mode === 'login' ? (
              'সাইন ইন করুন'
            ) : mode === 'register' ? (
              'অ্যাকাউন্ট তৈরি করুন'
            ) : (
              'অটো মেইল ও SMS পাঠান'
            )}
          </button>
        </form>
      )}

      {/* Mode Switcher Footer */}
      <div className="flex items-center justify-between text-xs text-[#A5B1C2] pt-2 border-t border-white/5">
        {mode === 'login' ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorDetails(null);
                setResetSuccess(null);
              }}
              className="hover:text-white font-medium"
            >
              নতুন অ্যাকাউন্ট তৈরি করবেন?
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setErrorDetails(null);
                setResetSuccess(null);
              }}
              className="hover:text-[#00B7FF] font-medium"
            >
              পাসওয়ার্ড রিসেট
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorDetails(null);
              setResetSuccess(null);
            }}
            className="inline-flex items-center gap-1.5 hover:text-white font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সাইন ইন পেজে ফিরে যান</span>
          </button>
        )}
      </div>
    </div>
  );
};
