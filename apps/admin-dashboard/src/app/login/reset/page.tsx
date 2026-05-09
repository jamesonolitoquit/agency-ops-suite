'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/browser';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/login/recover`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setMessage('Password reset email sent. Check your inbox and follow the recovery link.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/5 p-8 shadow-2xl backdrop-blur-md">
        <div className="space-y-2 mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-400 font-semibold">Password reset</p>
          <h1 className="text-4xl font-bold text-white">Send reset link</h1>
          <p className="text-sm text-slate-400">We’ll email a recovery link that lets you set a new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/50"
              placeholder="admin@example.com"
            />
          </label>

          {error && <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
          {message && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-accent-600 hover:to-accent-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send reset email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-accent-300 transition hover:text-accent-200">
            Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
