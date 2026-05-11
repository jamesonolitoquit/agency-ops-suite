'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export function SecurityForms({ email }: { email: string }) {
  const router = useRouter();
  const [changePassword, setChangePassword] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [changeError, setChangeError] = useState('');
  const [changeMessage, setChangeMessage] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState(email);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    setChangeError('');
    setChangeMessage('');

    if (!changePassword || changePassword.length < 8) {
      setChangeError('Password must be at least 8 characters long.');
      return;
    }

    if (changePassword !== changePasswordConfirm) {
      setChangeError('Passwords do not match.');
      return;
    }

    setChangeLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: changePassword });

      if (error) {
        setChangeError(error.message);
        return;
      }

      setChangeMessage('Password updated successfully.');
      setChangePassword('');
      setChangePasswordConfirm('');
      router.refresh();
    } finally {
      setChangeLoading(false);
    }
  }

  async function handleSendReset(event: React.FormEvent) {
    event.preventDefault();
    setResetError('');
    setResetMessage('');
    setResetLoading(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/login/recover`;
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), { redirectTo });

      if (error) {
        setResetError(error.message);
        return;
      }

      setResetMessage('Password reset email sent. Check your inbox to continue.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleChangePassword} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-200">Signed-in change</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Change password now</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use this when you are already logged in and want to rotate your password immediately.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">New password</span>
          <input
            type="password"
            value={changePassword}
            onChange={(event) => setChangePassword(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-accent-300"
            placeholder="New secure password"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Confirm new password</span>
          <input
            type="password"
            value={changePasswordConfirm}
            onChange={(event) => setChangePasswordConfirm(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-accent-300"
            placeholder="Repeat new password"
          />
        </label>

        {changeError && <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{changeError}</p>}
        {changeMessage && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{changeMessage}</p>}

        <button
          type="submit"
          disabled={changeLoading}
          className="rounded-full border border-accent-300 bg-accent-500/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-500/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {changeLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <form onSubmit={handleSendReset} className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-200">Recovery link</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Send a reset email</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use this when you are locked out or the session is too old for a direct password update.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Email address</span>
          <input
            type="email"
            value={resetEmail}
            onChange={(event) => setResetEmail(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-accent-300"
            placeholder="you@example.com"
          />
        </label>

        {resetError && <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{resetError}</p>}
        {resetMessage && <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{resetMessage}</p>}

        <button
          type="submit"
          disabled={resetLoading}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-accent-300 hover:bg-accent-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetLoading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}
