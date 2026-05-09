"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ProtectedRoute component enforces authentication
 * - If user is authenticated: renders children
 * - If loading: shows fallback or minimal UI
 * - If unauthenticated: redirects to login
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?error=unauthorized");
    }
  }, [loading, isAuthenticated, router]);

  // Show fallback while loading
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-500/10 border border-accent-500/20">
              <div className="w-8 h-8 border-2 border-accent-500/20 border-t-accent-500 rounded-full animate-spin" />
            </div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * useProtectedRoute hook for manual route protection
 * Returns auth state and provides redirect control
 * 
 * Usage:
 * const { isAuthenticated, loading } = useProtectedRoute();
 * if (!isAuthenticated) return null;
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?error=unauthorized");
    }
  }, [loading, isAuthenticated, router]);

  return {
    user,
    loading,
    isAuthenticated,
    redirectTo: (path: string) => router.push(path),
  };
}
