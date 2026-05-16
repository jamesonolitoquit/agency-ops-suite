# project-context.md

# [Project Name] — Complete Project Context

## Product Overview

[One paragraph: what the product does, who uses it, why it matters]

## Stack

**Frontend:**
- Next.js 14, React 18, TypeScript strict mode
- Tailwind CSS for styling
- Zustand for state management
- Framer Motion for animations

**Backend:**
- Node.js with Next.js API routes
- PostgreSQL via Supabase
- Supabase auth for authentication
- RLS (Row-Level Security) for authorization

**DevOps:**
- Hosting: Vercel for frontend + backend
- CI/CD: GitHub Actions
- Monitoring: Error tracking + performance monitoring
- Database: Supabase (managed PostgreSQL)

## Architecture

**High Level:**
- Frontend: Next.js app on Vercel
- Backend: API routes (Next.js)
- Database: PostgreSQL on Supabase
- Auth: Supabase Auth (JWT-based)

**Key Services:**
- AuthService: Handle login, permissions
- UserService: Manage user data
- [DomainService]: Domain-specific logic

## Database

**Key Tables:**
- users (id, email, created_at)
- [domain_table] (schema definition)

## Key Business Rules

- Users must verify email before using app
- Admin-only operations require special role
- Data retention: [specify policy]
- Rate limits: [specify limits]

## Deployment

**Environments:**
- Production: [domain.com]
- Staging: [staging.domain.com]
- Local: localhost:3000

**CI/CD:**
- Commits to `main` auto-deploy to production
- Pull requests deploy to preview environment
- Staging requires manual trigger

## Known Limitations

- [Limitation 1]: Workaround is [solution]
- [Limitation 2]: Will be addressed in [phase]

## Getting Help

- Architecture questions: See this file
- Deployment: See CI/CD pipeline
- Database: See Supabase console
- Bugs: Check memory/known-bugs.md

---

**Load this file first. It's your project baseline.**
