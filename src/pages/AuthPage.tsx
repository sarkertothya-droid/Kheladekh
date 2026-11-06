import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { user, signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else if (mode === 'register') {
        await registerWithEmail(name, email, password);
      } else {
        await resetPassword(email);
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#151E2B] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          {mode === 'login'
            ? 'Sign in to KhelaDekH'
            : mode === 'register'
            ? 'Create your account'
            : 'Reset password'}
        </h1>
        <p className="text-xs text-[#A5B1C2] mt-1">
          Save favorite teams, set match reminders, and personalize your feed.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="p-3 rounded-xl bg-[#16D98A]/10 border border-[#16D98A]/30 text-xs text-[#16D98A]">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label className="block text-xs font-medium text-[#A5B1C2] mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl bg-[#101722] border border-white/10 text-sm text-white focus:outline-none focus:border-[#00B7FF]"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[44px] rounded-xl bg-[#00B7FF] text-[#080B12] text-sm font-bold hover:bg-[#33C5FF] transition-colors disabled:opacity-50"
        >
          {submitting
            ? 'Please wait...'
            : mode === 'login'
            ? 'Sign In'
            : mode === 'register'
            ? 'Create Account'
            : 'Send Reset Link'}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-white/10 w-full" />
        <span className="bg-[#151E2B] px-3 text-xs text-[#A5B1C2]">or</span>
        <div className="border-t border-white/10 w-full" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="w-full min-h-[44px] rounded-xl bg-[#101722] border border-white/10 text-sm font-semibold text-white hover:border-[#00B7FF] transition-colors"
      >
        Continue with Google
      </button>

      <div className="flex items-center justify-between text-xs text-[#A5B1C2] pt-2">
        {mode === 'login' ? (
          <>
            <button
              type="button"
              onClick={() => setMode('register')}
              className="hover:text-white"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="hover:text-white"
            >
              Forgot password?
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setMode('login')}
            className="hover:text-white"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
};
