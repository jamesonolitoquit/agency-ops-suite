# stack-overview.md

Technology stack details and version information.

## Frontend

- **Framework:** Next.js 14.x
- **UI:** React 18.x with TypeScript strict mode
- **Styling:** Tailwind CSS 3.x
- **State:** Zustand 4.x
- **Forms:** React Hook Form
- **Animations:** Framer Motion 10.x
- **Icons:** Lucide React
- **HTTP:** TanStack Query for server state

## Backend

- **Runtime:** Node.js 18+
- **Framework:** Next.js API routes
- **Database:** PostgreSQL (via Supabase)
- **ORM:** (specify or manual queries)
- **Auth:** Supabase Auth (JWT)
- **Email:** (SendGrid / Resend / Supabase)
- **File Storage:** (Supabase Storage / S3)

## DevOps

- **Hosting:** Vercel (frontend + API)
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors)
- **Analytics:** (specify if any)
- **Secrets:** Environment variables

## Development Tools

- **Package Manager:** npm 9+
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest + React Testing Library
- **E2E:** Playwright

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.x | Framework |
| react | 18.x | UI library |
| tailwindcss | 3.x | Styling |
| zustand | 4.x | State |
| @supabase/supabase-js | 2.x | Backend |

Version lock: Use `package-lock.json` for consistency.
