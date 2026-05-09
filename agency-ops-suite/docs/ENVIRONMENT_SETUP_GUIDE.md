# Environment Setup Guide

**Status:** Day 1 of Operational Readiness  
**Goal:** Verify lead bridge can receive form submissions  
**Time:** 30-45 minutes

---

## Step 1: Update .env.local

### 1.1 Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Log in and select your project
3. Click **Settings** → **API**
4. Copy these values:

```
Project URL:          https://[project-id].supabase.co
Anon Key:             eyJhbGc...
Service Role Key:     eyJhbGc... (marked as "service_role")
```

### 1.2 Update apps/admin-dashboard/.env.local

Replace the placeholder values:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://[paste-your-project-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[paste-your-anon-key]

# Admin access (set to your email)
ADMIN_EMAIL_ALLOWLIST=your-actual-email@example.com

# Optional: Allow bypassing login for local testing
DEV_AUTH_BYPASS=true
DEV_AUTH_BYPASS_EMAIL=your-actual-email@example.com

# Intake secret (use for testing lead submissions)
INTAKE_WEBHOOK_SECRET=my-local-test-secret-12345
```

### 1.3 Verify You Can Start the Dev Server

```bash
cd d:\GitHub\Portfolio\ Files\agency-ops-suite
npm run dev --workspace apps/admin-dashboard
```

You should see:
```
> dev
> next dev

  ▲ Next.js 14.2.31
  - Local:        http://localhost:3000
  - Environments: .env.local

  ✓ Ready in 1.5s
```

---

## Step 2: Verify the Internal Endpoint

The internal `/api/intake/lead` endpoint is already built. Let's verify it works:

### 2.1 Test with Curl

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/intake/lead \
  -H "Content-Type: application/json" \
  -H "x-intake-secret: my-local-test-secret-12345" \
  -d '{
    "name": "Test Business",
    "businessType": "e-commerce",
    "email": "test@example.com",
    "phone": "555-1234"
  }'
```

**Expected Response (201):**
```json
{
  "ok": true,
  "leadId": "00000000-0000-0000-0000-000000000000"
}
```

### 2.2 Verify Lead Appears in Dashboard

1. Go to http://localhost:3000
2. Log in (use the email in ADMIN_EMAIL_ALLOWLIST)
3. Click "Leads"
4. You should see the test lead you just submitted

**If it doesn't appear:**
- Check the console for errors
- Verify the secret matches (case-sensitive)
- Verify Supabase URL and keys are correct

---

## Step 3: Create a Contact Form (for Testing)

Create a simple test form on the admin dashboard to manually submit leads:

### File: apps/admin-dashboard/src/app/admin/test-lead-form/page.tsx

```typescript
'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLeadForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      businessType: formData.get('businessType'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    }

    try {
      // Test the internal endpoint directly
      const response = await fetch('/api/intake/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-intake-secret': process.env.NEXT_PUBLIC_INTAKE_WEBHOOK_SECRET || '',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => router.push('/leads'), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Test Lead Form</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Lead submitted! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Business Type</label>
            <select
              name="businessType"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="">Select type</option>
              <option value="e-commerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="service">Service</option>
              <option value="local">Local Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder="555-1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              name="message"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Tell us about your project"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Lead'}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          This form tests the internal /api/intake/lead endpoint directly.
        </p>
      </div>
    </div>
  )
}
```

### Step 3.1 Test the Form

1. Visit http://localhost:3000/admin/test-lead-form
2. Fill in the form
3. Click "Submit Lead"
4. You should be redirected to /leads
5. The new lead should appear in the list

---

## Step 4: Document the Public Site Integration

Once the above is working locally, the **public site needs to do the same thing**:

### 4.1 Create /api/lead in Your Public Site

Use the template provided: [PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts](PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts)

Your public site needs:
- Endpoint: `/api/lead`
- Environment variables:
  - `NEXT_PUBLIC_INTAKE_ENDPOINT=http://localhost:3000` (local testing)
  - `NEXT_PUBLIC_INTAKE_ENDPOINT=https://internal.youragency.com` (production)
  - `INTAKE_WEBHOOK_SECRET=my-local-test-secret-12345` (must match admin dashboard)

### 4.2 Update Your Contact Form (Public Site)

```typescript
async function submitLead(formData) {
  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  
  if (!response.ok) throw new Error('Lead submission failed')
  return response.json()
}
```

---

## Step 5: Verification Checklist

- [ ] .env.local has real Supabase URL and keys
- [ ] Admin email matches your actual email
- [ ] Dev server starts without errors
- [ ] Internal endpoint reachable (curl test passes)
- [ ] Test lead created via curl appears in dashboard
- [ ] Test lead form page works
- [ ] Lead submitted via form appears in dashboard
- [ ] INTAKE_WEBHOOK_SECRET is the same in both places
- [ ] Secret is strong (use `openssl rand -hex 32`)

---

## Troubleshooting

### Curl Returns 401 Unauthorized
- **Check:** Is the secret correct? (case-sensitive)
- **Check:** Is the secret matching between admin-dashboard .env.local?

### Curl Returns 400 Invalid Payload
- **Check:** Are name and businessType both provided?
- **Check:** Is JSON valid? (use `jq` to validate)

### Lead Doesn't Appear in Dashboard
- **Check:** Did you refresh the page?
- **Check:** Are you logged in with the correct email (from ADMIN_EMAIL_ALLOWLIST)?
- **Check:** Does the Supabase URL and key match?

### Dev Server Won't Start
- **Check:** Node version is 18+
- **Check:** Dependencies installed (`npm install`)
- **Check:** Port 3000 is not in use

---

## Next: Public Site Integration

Once all above steps pass, create the same flow in your public landing page:

1. Copy [PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts](PUBLIC_API_LEAD_ROUTE_TEMPLATE.ts)
2. Place in: `[public-site-repo]/app/api/lead/route.ts`
3. Add environment variables to public site
4. Deploy and test from your landing page form

---

**⏱️ Expected time to complete:** 30-45 minutes  
**🎯 Success criteria:** Form submission → internal DB visible  
**📝 Document completion:** Update [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) Day 1 progress
