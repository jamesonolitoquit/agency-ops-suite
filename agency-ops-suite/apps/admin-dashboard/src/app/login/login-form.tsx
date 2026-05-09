"use client";

import React from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-accent-600 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500/50 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </>
      ) : (
        "Sign in"
      )}
    </button>
  );
}

export default function LoginForm({
  action,
  hasError,
  isNotAllowed,
}: {
  action: (formData: FormData) => Promise<void>;
  hasError: boolean;
  isNotAllowed: boolean;
}) {
  const errorId = hasError ? "login-error" : undefined;
  const notAllowedId = isNotAllowed ? "login-not-allowed" : undefined;
  const describedBy = [errorId, notAllowedId].filter(Boolean).join(" ") || undefined;

  return (
    <form action={action} className="space-y-5">
      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-300">
          Email address
        </label>
        <input
          id="login-email"
          required
          name="email"
          type="email"
          placeholder="admin@example.com"
          aria-describedby={describedBy}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="login-password"
          required
          name="password"
          type="password"
          placeholder="••••••••"
          aria-describedby={describedBy}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition focus:border-accent-500/50 focus:bg-white/8 focus:ring-2 focus:ring-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Error Messages */}
      {hasError && (
        <div id="login-error" role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-300">Invalid email or password. Please try again.</p>
        </div>
      )}
      {isNotAllowed && (
        <div id="login-not-allowed" role="alert" className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-300">This account is not authorized for admin access.</p>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton />
    </form>
  );
}
