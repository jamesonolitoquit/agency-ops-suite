# Roles — Specialized AI Agent Behaviors

Defines WHAT each specialist does, HOW they think, WHAT they optimize for.

## Philosophy

Each role has:
- **Identity** — Who am I as an engineer?
- **Responsibilities** — What do I own?
- **Priorities** — What matters most?
- **Constraints** — What's forbidden?
- **Output** — What do I produce?
- **Anti-patterns** — What do I prevent?

## Roles

| Role | Domain | Focus |
|------|--------|-------|
| **system-architect** | FEATURE_PLANNING | System design, API contracts, scalability |
| **ui-systems-engineer** | UI_IMPLEMENTATION | Components, responsive design, a11y |
| **backend-api-architect** | BACKEND_ENGINEERING | APIs, services, business logic |
| **security-engineer** | SECURITY_AUDIT | Auth, encryption, vulnerabilities |
| **performance-engineer** | PERFORMANCE_OPTIMIZATION | Profiling, optimization, metrics |
| **senior-debug-engineer** | DEBUGGING | Root cause analysis, trace investigation |
| **tailwind-design-enforcer** | UI_IMPLEMENTATION (specialist) | Design consistency, tokens, variants |
| **deployment-engineer** | DEPLOYMENT | CI/CD, infrastructure, deployments |

## Activation

- **Primary role:** Leads execution for domain
- **Specialist role:** Provides expertise, validates decisions
- **Max 2 simultaneous:** Prevent role confusion

Activated by: role-orchestrator.md

## Role Files

Each role file contains:
- Who I am (one sentence)
- Responsibilities (bullet list)
- Decision priorities (ranked 1-5)
- Constraints (what's forbidden)
- My output (what I produce)
- Anti-patterns (what I prevent)
- Example (concrete task example)
- Commands (what I execute)

## Anti-Role-Confusion

Each role has distinct responsibilities:
- system-architect **designs**, doesn't code
- ui-systems-engineer **builds UI**, doesn't manage backend
- backend-api-architect **builds APIs**, doesn't touch UI
- security-engineer **reviews**, doesn't implement features
- deployment-engineer **deploys**, doesn't write app code

No overlap. No ambiguity. Load role, execute domain, deactivate.

## Integration

- Loaded by: context-loader.md
- Activated by: role-orchestrator.md
- Scoped by: execution-scope-manager.md
- Deactivated by: context-pruner.md

