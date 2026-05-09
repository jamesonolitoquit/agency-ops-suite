"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);
          logAuthEvent("session_valid", { userId: session.user.id, email: session.user.email });
        } else {
          setUser(null);
          logAuthEvent("session_missing", { location: "dashboard_init" });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Session initialization failed";
        setError(errorMsg);
        setUser(null);
        logAuthEvent("session_error", { error: errorMsg });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [supabase]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          setError(null);
          logAuthEvent("signin_success", { userId: session.user.id, email: session.user.email });
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setError(null);
          logAuthEvent("signout_success");
          router.push("/login");
        } else if (event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setUser(session.user);
            setError(null);
            logAuthEvent("token_refreshed", { userId: session.user.id });
          }
        } else if (event === "USER_UPDATED") {
          if (session?.user) {
            setUser(session.user);
            logAuthEvent("user_updated", { userId: session.user.id });
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Handle session expiry with automatic redirect
  useEffect(() => {
    const checkSessionExpiry = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        setError("Session expired");
        logAuthEvent("session_expired");
        router.push("/login?error=session_expired");
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkSessionExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [supabase, router]);

  const signOut = useCallback(async () => {
    try {
      logAuthEvent("signout_initiated", { userId: user?.id });
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sign out failed";
      setError(errorMsg);
      logAuthEvent("signout_error", { error: errorMsg });
    }
  }, [supabase, router, user?.id]);

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) throw refreshError;

      if (session?.user) {
        setUser(session.user);
        setError(null);
        logAuthEvent("session_refreshed", { userId: session.user.id });
      } else {
        setUser(null);
        logAuthEvent("session_refresh_failed");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Session refresh failed";
      setError(errorMsg);
      logAuthEvent("session_refresh_error", { error: errorMsg });
      router.push("/login?error=session_refresh_failed");
    }
  }, [supabase, router]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

/**
 * Log auth-related events to system_events for monitoring
 */
function logAuthEvent(
  event: string,
  metadata: Record<string, any> = {}
) {
  // Fire and forget - don't block UI
  fetch("/api/system/log-auth-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      metadata,
      timestamp: new Date().toISOString(),
      source: "dashboard",
    }),
  }).catch((err) => {
    console.error("[Auth Event Logging] Error:", err);
  });
}
