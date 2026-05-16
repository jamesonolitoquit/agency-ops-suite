"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthButtons } from "@/components/AuthButtons";
import { useAuth } from "@/lib/auth-context";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/billing", label: "Billing" },
  { href: "/leads", label: "Leads" },
  { href: "/content", label: "Content" },
  { href: "/reports", label: "Reports" },
  { href: "/provisioning", label: "Provisioning" },
  { href: "/deployment-checklist", label: "Checklist" },
  { href: "/tasks", label: "Tasks" },
  { href: "/assets", label: "Assets" },
  { href: "/domains", label: "Domains" },
  { href: "/audit-logs", label: "Audit Logs" },
  { href: "/requests", label: "Requests" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/security", label: "Security" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const showAuthLoading = loading && !user;

  if (pathname?.startsWith("/login")) {
    return <div className="min-h-screen px-4 py-8 md:px-8">{children}</div>;
  }

  return (
    <div className="min-h-screen text-slate-100 md:flex">
      <aside className="border-b border-white/10 bg-black/20 px-5 py-6 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:px-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-accent-200">Agency Ops</p>
          <h2 className="text-xl font-semibold text-white">Internal Workspace</h2>
          <p className="text-sm leading-6 text-slate-400">Private tools for delivery speed, retention, and clean handoffs.</p>
          {user && (
            <p className="text-xs text-slate-500 mt-4 break-words">
              Authenticated as: <span className="text-accent-300">{user.email}</span>
            </p>
          )}
        </div>

        <nav className="mt-8 flex flex-wrap gap-2 md:flex-col">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const base = 'rounded-full border px-4 py-2 text-sm transition';
            const activeCls = isActive
              ? 'bg-accent-500/10 border-accent-300 text-white ring-1 ring-accent-300'
              : 'border-white/10 bg-white/5 text-slate-200 hover:border-accent-300 hover:bg-accent-500/15';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${base} ${activeCls}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          {showAuthLoading && (
            <p className="mb-3 text-xs text-slate-400">Verifying authentication...</p>
          )}
          <AuthButtons />
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}