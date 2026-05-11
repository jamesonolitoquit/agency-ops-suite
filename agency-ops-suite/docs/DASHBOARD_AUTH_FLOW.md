# DASHBOARD AUTH FLOW — Agency Ops Suite

## Overview

The Agency Ops Suite dashboard implements a multi-layered authentication and authorization system using Supabase Auth with real-time session management, automatic token refresh, and comprehensive event logging.

**Key Principles:**
- Client-side auth state management via React context
- Automatic session validation and token refresh
- Non-blocking auth event logging for monitoring
- Graceful fallback on auth failures
- Protected routes with lazy auth checks

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Next.js App Layout (Root)                               │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ AuthProvider (lib/auth-context.tsx)                │  │
│ │ Manages: Session state, token refresh, expiry      │  │
│ │                                                    │  │
│ │ ┌──────────────────────────────────────────────┐  │  │
│ │ │ AppShell (components/AppShell.tsx)           │  │  │
│ │ │ Shows: Loading state, auth user email        │  │  │
│ │ │ Children: All dashboard pages                │  │  │
│ │ │                                              │  │  │
│ │ │ ┌──────────────────────────────────────┐    │  │  │
│ │ │ │ ProtectedRoute (optional per page)   │    │  │  │
│ │ │ │ Ensures: Page-level auth check       │    │  │  │
│ │ │ │ Renders: Page content if auth OK     │    │  │  │
│ │ │ └──────────────────────────────────────┘    │  │  │
│ │ └──────────────────────────────────────────────┘  │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Special Routes:                                         │
│ • /login - Rendered WITHOUT AppShell, public access    │
│ • /login/reset - Public password reset                 │
└─────────────────────────────────────────────────────────┘
```

---

## Components & Hooks

### 1. AuthProvider (`lib/auth-context.tsx`)

**Purpose:** Root context provider managing all authentication state

**Features:**
- Initializes session on mount
- Listens to auth state changes (signIn, signOut, tokenRefresh)
- Auto-refreshes tokens every 5 minutes
- Redirects on session expiry
- Logs all auth events to system_events

**Exported Hook:** `useAuth()`

```typescript
const { user, loading, error, isAuthenticated, signOut, refreshSession } = useAuth();
```

**Context Type:**
```typescript
interface AuthContextType {
  user: User | null;           // Current Supabase user object
  loading: boolean;            // Auth initialization in progress
  error: string | null;        // Last auth error message
  isAuthenticated: boolean;    // Convenience flag: !!user
  signOut: () => Promise<void>;     // Manual sign out
  refreshSession: () => Promise<void>; // Manual token refresh
}
```

**Event Log Targets:**
- `session_valid` - Valid session found on init
- `session_missing` - No session on init
- `signin_success` - User signed in
- `signout_success` - User signed out
- `signout_error` - Sign out failed
- `token_refreshed` - Token auto-refreshed
- `session_expired` - Session expired, redirected
- `session_error` - Session initialization error
- `session_refresh_error` - Token refresh failed

---

### 2. ProtectedRoute (`lib/protected-route.tsx`)

**Purpose:** Component-level route protection

**Usage:**
```typescript
export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}
```

**Features:**
- Shows loading spinner while checking auth
- Redirects to /login if unauthenticated
- Passes through if authenticated
- Optional fallback UI

**Hook Alternative:** `useProtectedRoute()`
```typescript
const { user, loading, isAuthenticated, redirectTo } = useProtectedRoute();

if (!isAuthenticated) return null;
return <PageContent user={user} />;
```

---

### 3. AuthButtons (`components/AuthButtons.tsx`)

**Purpose:** Sign out button with event logging

**Features:**
- Calls Supabase signOut()
- Redirects to /login
- Triggers auth event logging
- Router refresh to clear cache

---

### 4. AppShell (`components/AppShell.tsx`)

**Purpose:** Layout wrapper with auth state display

**Features:**
- Renders login page without shell
- Shows loading state during auth check
- Displays authenticated user email
- Navigation menu (15 sections)
- Auth buttons in sidebar

---

## Authentication Flow

### Initial Load

```
User visits dashboard
    ↓
AuthProvider mounts
    ↓
getSession() called
    ↓
Session found? → YES → setUser(session.user)
                    → log "session_valid"
                    → AppShell renders nav
    ↓ NO
    → setUser(null)
    → log "session_missing"
    → AppShell shows loading
    → Router redirects to /login
```

### Sign In

```
User fills login form
    ↓
supabase.auth.signInWithPassword({ email, password })
    ↓
Success? → YES → SIGNED_IN event fired
                    → AuthProvider catches event
                    → setUser(user) from session
                    → Router redirects to /
                    → log "signin_success"
    ↓ NO
    → Redirect to /login?error=invalid_credentials
    → log event NOT fired (server-side auth)
```

### Token Expiry & Refresh

```
Session created with 1-hour token
    ↓
5-minute check interval
    ↓
Token still valid? → YES → Continue
    ↓ NO
    → Call refreshSession()
    → New token obtained
    → setUser(user) updated
    → log "token_refreshed"
    → Continue seamlessly
```

### Session Expiry (No Refresh Available)

```
Token expired, refresh failed
    ↓
Session check detects: no session
    ↓
setUser(null)
    ↓
Router.push("/login?error=session_expired")
    ↓
log "session_expired"
    ↓
User sees login page with error message
```

### Manual Sign Out

```
User clicks Logout button
    ↓
AuthButtons calls useAuth().signOut()
    ↓
Supabase.auth.signOut() called
    ↓
SIGNED_OUT event fired
    ↓
AuthProvider catches event
    ↓
setUser(null)
    ↓
Router.push("/login")
    ↓
log "signout_success"
```

---

## Event Logging

### Log Endpoint: `/api/system/log-auth-event`

**Method:** POST (No auth required - logs auth events)

**Request Body:**
```json
{
  "event": "session_valid",
  "metadata": {
    "userId": "user-uuid",
    "email": "user@example.com"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "dashboard"
}
```

**Response:**
```json
{
  "ok": true,
  "logged": true
}
```

**Storage:** `system_events` table
```sql
INSERT INTO system_events (
  event_type,      -- "auth_<event>"
  severity,        -- "info", "warning", "error"
  summary,         -- "Dashboard auth event: ..."
  metadata,        -- JSON with full context
  timestamp        -- ISO timestamp
)
```

### Severity Mapping

| Event | Severity | Action |
|---|---|---|
| `session_valid` | info | Normal session init |
| `signin_success` | info | Successful login |
| `token_refreshed` | info | Auto-refresh worked |
| `session_missing` | warning | No session found |
| `session_refresh_failed` | warning | Token refresh failed, can retry |
| `session_expired` | error | Session lost, redirect to login |
| `session_error` | error | Session init failed |
| `signout_error` | error | Sign out failed |
| `session_refresh_error` | error | Token refresh error |

---

## Protected Routes

### Implicit Protection (All Non-Login Pages)

All dashboard pages except `/login` are implicitly protected:
1. AppShell loading state shows while checking auth
2. If not authenticated, user redirected to `/login?error=unauthorized`
3. If authenticated, page renders normally

### Explicit Protection (Component Level)

Optional per-page wrapper for additional safety:

```typescript
// src/app/clients/page.tsx
import { ProtectedRoute } from "@/lib/protected-route";

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <Clients />
    </ProtectedRoute>
  );
}
```

### Hybrid Protection (Hook Level)

For components that need auth details:

```typescript
// Any component inside dashboard
"use client";
import { useAuth } from "@/lib/auth-context";

export function AdminPanel() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <UnauthorizedUI />;
  
  return <div>Authenticated as: {user?.email}</div>;
}
```

---

## Error Handling & Recovery

### Scenario 1: Session Invalid on Load

**Symptom:** User visits dashboard, no valid session

**Flow:**
1. AuthProvider detects: session not found
2. Logs: `session_missing`
3. AppShell shows loading state
4. Router redirects to `/login?error=unauthorized`
5. User sees login page

**Recovery:** User logs in again

---

### Scenario 2: Token Expires During Use

**Symptom:** User works in dashboard, token expires

**Flow:**
1. 5-minute check interval detects expiry
2. Auto-refresh attempts to get new token
3. Success → New token loaded, continue seamlessly
4. Failure → Session check finds no valid session
5. Router redirects to `/login?error=session_expired`
6. Logs: `session_refresh_error`

**Recovery:** User logs in again (refresh token may still be valid)

---

### Scenario 3: Sign Out Fails

**Symptom:** User clicks logout, sign out returns error

**Flow:**
1. Supabase.auth.signOut() throws error
2. Error caught in useAuth() hook
3. Logs: `signout_error` with error message
4. User sees error state in dashboard
5. Can retry logout or close browser

**Recovery:** Close browser and re-login (server-side session cleanup happens)

---

### Scenario 4: Auth Event Logging Fails

**Symptom:** `/api/system/log-auth-event` endpoint error

**Flow:**
1. logAuthEvent() function fires endpoint (non-blocking)
2. Endpoint error caught internally
3. No UI disruption (logging is best-effort)
4. Console error logged for debugging
5. Auth flow continues normally

**Impact:** Minimal - auth event just isn't logged, system works fine

---

## Session Management

### Token Lifecycle

| Stage | Duration | Action |
|---|---|---|
| Token issued | - | After successful login |
| Token valid | 1 hour | Used for API auth |
| Token near expiry | 5+ mins left | Refresh triggered |
| Token expired | - | Refresh attempt |
| Refresh success | - | New token obtained, continue |
| Refresh failed | - | Session invalid, redirect to login |

### Automatic Refresh Interval

- **Check interval:** Every 5 minutes
- **Trigger:** If session exists and token valid
- **Action:** Call `supabase.auth.refreshSession()`
- **Success:** Update user state
- **Failure:** Log error, continue (next interval will catch expiry)

### Manual Refresh

```typescript
const { refreshSession } = useAuth();
await refreshSession();
```

---

## Dashboard Integration

### Example Page Implementation

```typescript
// src/app/clients/page.tsx
"use client";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/lib/protected-route";

function ClientsContent() {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Clients</h1>
      <p>Viewing as: {user?.email}</p>
      {/* Page content */}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <ClientsContent />
    </ProtectedRoute>
  );
}
```

### Example with useProtectedRoute Hook

```typescript
// src/app/reports/page.tsx
"use client";

import { useProtectedRoute } from "@/lib/protected-route";

export default function ReportsPage() {
  const { user, loading, isAuthenticated } = useProtectedRoute();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // Redirecting...
  
  return (
    <div>
      <h1>Reports for {user?.email}</h1>
      {/* Page content */}
    </div>
  );
}
```

---

## Monitoring & Debugging

### Query Auth Events

```sql
-- All dashboard auth events (last 24 hours)
SELECT 
  event_type,
  severity,
  summary,
  metadata,
  timestamp
FROM system_events
WHERE event_type LIKE 'auth_%'
  AND timestamp > now() - interval '24 hours'
ORDER BY timestamp DESC;

-- Auth errors only
SELECT 
  event_type,
  metadata->>'error' as error_detail,
  metadata->>'userId' as user_id,
  timestamp
FROM system_events
WHERE event_type LIKE 'auth_%'
  AND severity = 'error'
ORDER BY timestamp DESC;

-- Session expiries (incidents)
SELECT 
  event_type,
  metadata->>'userId' as user_id,
  count(*) as expiry_count,
  max(timestamp) as last_expiry
FROM system_events
WHERE event_type = 'auth_session_expired'
GROUP BY event_type, metadata->>'userId'
ORDER BY last_expiry DESC;

-- Auth flow sequence for specific user
SELECT 
  event_type,
  metadata->>'email' as email,
  summary,
  timestamp
FROM system_events
WHERE metadata->>'userId' = '<user-uuid>'
  AND event_type LIKE 'auth_%'
ORDER BY timestamp DESC
LIMIT 20;
```

### Browser Console Debugging

```javascript
// Check current auth state
// (in browser console, on dashboard)
localStorage.getItem('sb-auth-token')

// Check last auth event log
fetch('/api/system/log-auth-event', {
  method: 'POST',
  body: JSON.stringify({ event: 'debug', metadata: { test: true } })
})
```

---

## Deployment Considerations

### Environment Variables Required

```env
# .env.local (NOT committed)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# For service-client logging endpoint
SUPABASE_SERVICE_ROLE_KEY=<service-key>
```

### CORS & Security

- Auth endpoint: `/api/system/log-auth-event` is public (logs auth events)
- All other `/api` endpoints require authorization header
- Supabase RLS enforces data access control
- Session tokens stored in httpOnly cookies (Supabase default)

### Rate Limiting

Consider rate-limiting auth endpoints:
- Login attempts: 5 per minute per IP
- Token refresh: handled by Supabase (1 per 60 seconds)
- Log events: unlimited (non-critical path)

---

## Testing

### Unit Test: AuthProvider

```typescript
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth-context';

function TestComponent() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading</div>;
  return <div>{user?.email || 'No user'}</div>;
}

test('shows loading state initially', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  expect(screen.getByText('Loading')).toBeInTheDocument();
});
```

### Integration Test: Protected Route

```typescript
test('redirects to login when not authenticated', async () => {
  const { push } = useRouter();
  jest.mock('@/lib/auth-context', () => ({
    useAuth: () => ({ isAuthenticated: false, loading: false })
  }));
  
  render(<ProtectedRoute><div>Protected</div></ProtectedRoute>);
  
  expect(push).toHaveBeenCalledWith('/login?error=unauthorized');
});
```

---

## Summary

**Authentication Layers:**
1. ✅ Session validation on app init
2. ✅ Automatic token refresh every 5 minutes
3. ✅ Session expiry detection and redirect
4. ✅ Component-level route protection
5. ✅ Non-blocking auth event logging
6. ✅ User state display in UI

**Event Coverage:**
- Session init/valid/missing
- Sign in/out success/error
- Token refresh success/error
- Session expiry handling
- Unauthorized access attempts

**Operational Status:** ✅ Ready for deployment to staging

---

**Last Updated:** Phase F — Dashboard Auth Enforcement  
**Implementation Status:** Complete  
**Test Coverage:** 5/5 core flows implemented  
**Event Logging:** 8+ auth events tracked  
**Next Phase:** Phase G — Monitoring Completion
