import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LoginForm from "./login-form";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  redirect("/");
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === "invalid_credentials";
  const isNotAllowed = params.error === "not_allowed";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <section className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent rounded-2xl blur opacity-75"></div>
        
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/5 backdrop-blur-md p-8 shadow-2xl">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-accent-400 font-semibold">Secure Workspace</p>
            <h1 className="text-4xl font-bold text-white">Sign in</h1>
            <p className="text-sm text-slate-400">Access live operations for clients, billing, audits, proposals, and contracts.</p>
          </div>

          {/* Form */}
          <LoginForm action={login} hasError={hasError} isNotAllowed={isNotAllowed} />

          {/* Footer */}
          <div className="mt-6 space-y-3 text-center">
            <p className="text-xs text-slate-500">Protected by RLS • All activity logged</p>
            <Link href="/login/reset" className="text-xs text-accent-300 transition hover:text-accent-200">
              Forgot your password?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}