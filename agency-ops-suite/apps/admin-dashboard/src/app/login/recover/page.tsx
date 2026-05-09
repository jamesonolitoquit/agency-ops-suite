'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';

export default function PasswordRecoveryPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function syncRecoveryState() {
      const { data } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (data.session) {
        setReady(true);
      }

      setCheckingSession(false);
    }

    void syncRecoveryState();

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function retryRecoverySession() {
    setCheckingSession(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (data.session) {
      setReady(true);
    }

    setCheckingSession(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage('Password updated successfully. You can now sign in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
      setReady(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/5 p-8 shadow-2xl backdrop-blur-md">
        <div className="space-y-2 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-400 font-semibold">Password recovery</p>
          <h1 className="text-4xl font-bold text-white">Set a new password</h1>
          <p className="text-sm text-slate-400">
            Open this page from the recovery email. We’ll update the password on your Supabase session.
          </p>
        </div>

        {!ready ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-300">
              {checkingSession
                ? 'Checking the recovery session...'
                : 'Waiting for the recovery link to open this session.'}
            </p>
            <p className="text-sm text-slate-400">
              If you arrived here manually, request a reset email from the sign-in page first.
            </p>
            <button
              type="button"
              onClick={retryRecoverySession}
              className="inline-flex text-sm text-accent-300 transition hover:text-accent-200"
            >
              Retry session check
            </button>
            <Link href="/login/reset" className="inline-flex text-sm text-accent-300 transition hover:text-accent-200">
              Request a reset email
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/50"
                placeholder="New secure password"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Confirm new password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/50"
                placeholder="Repeat new password"
              />
            </label>

            {error && <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
            {message && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-accent-300 transition hover:text-accent-200">
            Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
