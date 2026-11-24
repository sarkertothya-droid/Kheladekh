import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || '';
  const oobCode = searchParams.get('oobCode') || '';
  const prefillEmail = searchParams.get('email') || '';

  const { verifyResetOobCode, confirmNewPasswordWithCode, resetPassword } = useAuth();

  const [email, setEmail] = useState(prefillEmail);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(Boolean(oobCode));
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailVerifiedDone, setEmailVerifiedDone] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode) return;

    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);

    if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          if (!cancelled) {
            setEmailVerifiedDone(true);
            setStatusMessage('আপনার ইমেইল সফলভাবে ভেরিফাই করা হয়েছে!');
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setErrorMessage(err?.message || 'ভেরিফিকেশন লিংকের মেয়াদ শেষ হয়ে গেছে।');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      verifyResetOobCode(oobCode)
        .then((targetEmail) => {
          if (!cancelled) {
            setVerifiedEmail(targetEmail);
            setEmail(targetEmail);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setErrorMessage(err?.message || 'পাসওয়ার্ড রিসেট লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ।');
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [oobCode, mode, verifyResetOobCode]);

  const handleConfirmNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword.length < 6) {
      setErrorMessage('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড দুটি মিলছে না।');
      return;
    }
    setSubmitting(true);
    try {
      await confirmNewPasswordWithCode(oobCode, newPassword);
      setStatusMessage('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন আপনি নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।');
    } catch (err: any) {
      setErrorMessage(err?.message || 'পাসওয়ার্ড আপডেট করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) return;
    setSubmitting(true);
    try {
      await resetPassword(cleanEmail);
      const r = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await r.json();
      setShortUrl(data.shortResetUrl || null);
      setStatusMessage(
        data.message || `KhelaDekH Support Team থেকে ${cleanEmail} ঠিকানায় পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে।`
      );
    } catch (err: any) {
      setErrorMessage(err?.message || 'রিসেট ইমেইল পাঠানো যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#111827] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00B7FF]">
          <ShieldCheck className="w-4 h-4" />
          <span>KhelaDekH Support Team</span>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          {mode === 'verifyEmail'
            ? 'ইমেইল ভেরিফিকেশন'
            : verifiedEmail
            ? 'নতুন পাসওয়ার্ড সেট করুন'
            : 'পাসওয়ার্ড রিসেট সেন্টার'}
        </h1>
        <p className="text-xs text-[#A5B1C2]">
          {verifiedEmail
            ? `অ্যাকাউন্ট: ${verifiedEmail}`
            : 'KhelaDekH অ্যাকাউন্ট নিরাপত্তা ও শর্ট রিসেট পোর্টাল'}
        </p>
      </div>

      {loading && (
        <div className="p-6 rounded-2xl bg-[#0B111C] border border-white/10 flex items-center justify-center gap-3 text-xs text-[#A5B1C2]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#00B7FF]" />
          <span>লিংক যাচাই করা হচ্ছে...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs text-[#16D98A] space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-white">{statusMessage}</span>
          </div>
          {shortUrl && (
            <p className="font-mono text-[11px] text-[#00B7FF] break-all pl-6">{shortUrl}</p>
          )}
          <div className="pt-1">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16D98A] text-[#080B12] text-xs font-bold"
            >
              লগইন পেজে যান
            </Link>
          </div>
        </div>
      )}

      {!loading && verifiedEmail && !statusMessage && (
        <form onSubmit={handleConfirmNewPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>নতুন পাসওয়ার্ড</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="কমপক্ষে ৬ অক্ষর"
              className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#16D98A]" />
              <span>পাসওয়ার্ড নিশ্চিত করুন</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="পাসওয়ার্ড পুনরায় লিখুন"
              className="w-full h-11 px-3.5 rounded-xl bg-[#0B111C] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] disabled:opacity-50"
          >
            {submitting ? 'সংরক্ষণ হচ্ছে...' : 'নতুন পাসওয়ার্ড সেভ করুন'}
          </button>
        </form>
      )}

      {!loading && !verifiedEmail && !emailVerifiedDone && !statusMessage && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00B7FF]" />
              <span>আপনার অ্যাকাউন্টের ইমেইল</span>
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
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] disabled:opacity-50"
          >
            {submitting ? 'পাঠানো হচ্ছে...' : 'KhelaDekH Support Team থেকে লিংক পাঠান'}
          </button>
        </form>
      )}

      <div className="pt-3 border-t border-white/10">
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 text-xs text-[#A5B1C2] hover:text-white font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সাইন ইন পেজে ফিরে যান</span>
        </Link>
      </div>
    </div>
  );
};
