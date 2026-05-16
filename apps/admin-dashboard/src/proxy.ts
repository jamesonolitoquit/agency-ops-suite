import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDevAuthBypassEnabled, resolveAccessContext } from "@/lib/access";
import { createServiceClient } from "@/lib/supabase/service";
import { canAccessPath } from "@/lib/rbac";

const PUBLIC_ROUTES = ["/login", "/api/intake/lead"];

function getDevAuthEmail(request: NextRequest): string | undefined {
  return (
    // Allow header-based dev auth for programmatic requests (Playwright, curl)
    request.headers.get('x-dev-auth-email')?.trim() ||
    request.cookies.get("dev-auth-email")?.value?.trim() ||
    request.nextUrl.searchParams.get("dev-auth-email")?.trim() ||
    undefined
  );
}

// Skip proxy for static assets
function shouldSkipProxy(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    /\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/.test(pathname)
  );
}

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

async function recordDeniedAccessAttempt(request: NextRequest, email: string | null) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("audit_logs").insert({
      entity_type: "auth",
      entity_id: null,
      action: "access-denied",
      summary: "Denied non-admin dashboard access",
      metadata: {
        email,
        pathname: request.nextUrl.pathname,
        search: request.nextUrl.search,
        method: request.method,
        userAgent: request.headers.get("user-agent") ?? null,
        reason: "not_allowed"
      }
    });

    if (error) {
      console.error("Failed to record denied access attempt:", error.message);
    }
  } catch (error) {
    console.error("Failed to record denied access attempt:", error);
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip proxy for static assets - let Next.js handle them
  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });
  let user: { email?: string } | null = null;
  const devAuthBypassEnabled = isDevAuthBypassEnabled();

  if (devAuthBypassEnabled) {
    user = { email: getDevAuthEmail(request) };
  } else if (hasSupabaseEnv()) {
    try {
      const session = await updateSession(request);
      response = session.response;
      user = session.user;
    } catch {
      user = null;
    }
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const accessContext = resolveAccessContext(user?.email, devAuthBypassEnabled);
  const hasValidSession = Boolean(user);
  const canAccessRoute = canAccessPath(accessContext.role, pathname);

  if (hasValidSession && (!accessContext.hasAccess || !canAccessRoute)) {
    void recordDeniedAccessAttempt(request, accessContext.email ?? user?.email ?? null);

    if (isPublicRoute) {
      return response;
    }

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "error=forbidden";
    return NextResponse.redirect(redirectUrl);
  }

  if (!isPublicRoute && !hasValidSession) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Keep public API routes callable even when a user session is present.
  // Only redirect authenticated users away from the login page.
  if (pathname === "/login" && hasValidSession && accessContext.hasAccess && !request.nextUrl.searchParams.get("error")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
