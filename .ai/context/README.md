# Context — Persistent Project Intelligence

Project-specific information loaded once per session to ground AI with business context.

## Files

| File | Purpose | Loaded When |
|------|---------|-------------|
| **project-context.md** | Overview, stack, architecture | Starting any task |
| **stack-overview.md** | Tech stack details, versions | Before architectural decisions |
| **business-rules.md** | Domain logic, workflows, policies | Before feature planning |
| **deployment-architecture.md** | Deployment, environments, infrastructure | Before deployment work |

## Usage

**First task in session:**
1. context-router.md routes task
2. Relevant context files auto-load
3. Context < 50KB per context file
4. Use context as baseline, then add task-specific context

**Example:**
```
Task: "Plan feature for multi-user support"

Route: → FEATURE_PLANNING + backend-api-architect + system-architect

Context loaded:
- project-context.md (baseline)
- business-rules.md (understand user roles)
- deployment-architecture.md (deployment implications)

Total context: ~45KB
Ready to plan feature
```

## Key Principles

- **Load once, reference often** — Save context for entire session
- **Persistent baseline** — Don't reload unless explicitly needed
- **Concise, not comprehensive** — 500 words max per file
- **Project-specific only** — No generic framework docs

**Context files are your project's operating system.**
- Database schema overview
- Environment variables and secrets
- CI/CD pipeline
- Rollback procedures

### authentication-model.md
Auth and access control:
- Authentication method (JWT, sessions, OAuth)
- Authorization model (RBAC, ABAC)
- Permission matrix
- Special cases and exceptions

### coding-standards.md
Development conventions:
- Naming conventions
- File structure
- Import organization
- Comment style
- Error handling patterns
- Logging standards

## Context Loading Procedure

```
AI Agent Starts Work
    ↓
Load context/project-context.md
    ↓
Agent understands:
  - What we're building
  - Tech stack
  - Architecture
  - Business rules
  - How we operate
    ↓
Agent references context when making decisions
    ↓
Better decisions, fewer mistakes
```

## Context File Template

```markdown
# Project Context: [Project Name]

## Product Overview
- What does this product do?
- Who are the users?
- What problems does it solve?
- What makes it valuable?

## Technical Stack

### Frontend
- Framework: Next.js 14
- UI Library: React 18
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- State Management: Zustand
- Build Tool: Vite

### Backend
- Runtime: Node.js 18
- Framework: Express / Fastify / Next.js API Routes
- Database: PostgreSQL via Supabase
- Cache: Redis
- Queue: Bull / RabbitMQ

### DevOps
- Hosting: Vercel / AWS / GCP
- CI/CD: GitHub Actions
- Monitoring: Sentry
- Observability: [Tool]

## Architecture Overview

### High-Level Diagram
[Simple ASCII or reference to diagram]

### Key Abstractions
- [Component/Layer]: Responsible for...
- [Component/Layer]: Responsible for...

### Data Flow
User → Frontend → API → Database
            ↓
        Services Layer
        
## Business Rules

### User Roles
- Admin: Full system access
- Manager: Team management
- User: Standard user access

### Core Workflows
1. [Workflow name]: User does X → System does Y
2. [Workflow name]: ...

### Compliance
- GDPR: Data retention 30 days post-deletion
- SOC 2: All changes audited

## Development Workflow

### Local Setup
```bash
npm install
npm run dev
```

### Testing
```bash
npm test          # unit tests
npm run test:e2e  # e2e tests
```

### Deployment
Merge to main → Auto-deploy to staging
Manual approval → Deploy to production

## Known Limitations
- [Limitation]: Workaround is...
- [Limitation]: Will be addressed in Phase 2

## Getting Help
- Architecture questions: See docs/architecture.md
- Deployment issues: See ops/deployment.md
- Bug tracking: GitHub Issues
```

## Guidelines

- **Keep it Current** — Update context as architecture evolves
- **Make it Accessible** — Write for both humans and AI
- **Be Honest** — Include limitations and workarounds
- **Use Diagrams** — Visual context is powerful
- **Reference External Docs** — Link to detailed documentation

Context is the foundation for good decisions.
