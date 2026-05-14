# Task Classifier — Domain Detection Engine

Categorizes incoming tasks into discrete execution domains.

## Domains

### UI_IMPLEMENTATION
Build or modify user interface components.
- **Keywords:** button, component, page, form, layout, styling, Tailwind, React, interaction, animation
- **Role:** ui-systems-engineer
- **Scanners:** ux-consistency, performance-audit
- **Standards:** component-standards, ui-design-system, naming-conventions
- **Forbidden:** database changes, API design (unless trivial integration)

### BACKEND_ENGINEERING
Implement API routes, services, business logic.
- **Keywords:** endpoint, API, route, service, middleware, handler, database operation, integration
- **Role:** backend-api-architect
- **Scanners:** architecture-guardian, test-integrity
- **Standards:** api-standards, backend-rules, naming-conventions
- **Forbidden:** UI implementation beyond data passing

### SECURITY_AUDIT
Security review, vulnerability detection, access control.
- **Keywords:** security, vulnerability, auth, encryption, access, CORS, XSS, injection, secrets
- **Role:** security-engineer
- **Scanners:** security-boost, dependency-governance
- **Standards:** security-standards
- **Forbidden:** implementation of non-security features

### DEBUGGING
Investigate and fix bugs, root cause analysis.
- **Keywords:** bug, broken, error, crash, not working, issue, fix, debug, reproduce
- **Role:** senior-debug-engineer (+ domain-specific backup)
- **Scanners:** none (focused investigation)
- **Standards:** architecture-rules (for understanding)
- **Forbidden:** preventive refactoring

### FEATURE_PLANNING
Architecture, API design, database schema, scope definition.
- **Keywords:** plan, design, architecture, API contract, schema, scope, feature spec, roadmap
- **Role:** system-architect
- **Scanners:** architecture-guardian
- **Standards:** architecture-rules, api-standards, backend-rules
- **Forbidden:** implementation, detailed code examples

### PERFORMANCE_OPTIMIZATION
Profile, optimize, measure improvements.
- **Keywords:** slow, performance, bundle, memory, Core Web Vitals, latency, optimize, profile
- **Role:** performance-engineer
- **Secondary:** ui-systems-engineer (UI) or backend-api-architect (API)
- **Scanners:** performance-audit
- **Standards:** none
- **Forbidden:** unrelated feature work

### REFACTORING
Restructure code, improve maintainability, reduce debt.
- **Keywords:** refactor, restructure, consolidate, improve, debt, duplication, maintainability
- **Role:** system-architect (architecture) or domain-specific
- **Scanners:** architecture-guardian, workspace-hygiene
- **Standards:** architecture-rules, naming-conventions
- **Forbidden:** behavior changes

### DEPLOYMENT
Prepare for production, infrastructure, CI/CD.
- **Keywords:** deploy, production, staging, release, devops, infrastructure, pipeline, rollout
- **Role:** deployment-engineer
- **Secondary:** security-engineer (pre-deployment checks)
- **Scanners:** deployment-readiness
- **Standards:** none
- **Forbidden:** code implementation

### TESTING
Write tests, improve coverage, validation.
- **Keywords:** test, coverage, unit test, e2e, integration test, assert, validation, QA
- **Role:** qa-specialist (or domain-specific role)
- **Scanners:** test-integrity
- **Standards:** none
- **Forbidden:** implementation beyond test code

### DOCUMENTATION
Write docs, API docs, README, comments.
- **Keywords:** document, README, API doc, guide, comment, explain, schema
- **Role:** domain-specific (backend for API docs, UI for component docs)
- **Scanners:** none
- **Standards:** naming-conventions
- **Forbidden:** code changes beyond examples

## Classification Logic

```
1. Extract keywords from task
2. Match against domain keywords
3. If multiple matches, rank by specificity
4. Check for multi-domain signals
5. Return: [primary_domain, secondary_domains]
```

## Multi-Domain Detection

Some tasks span domains. Priority order:
1. SECURITY_AUDIT (always takes priority if security implied)
2. FEATURE_PLANNING (before implementation)
3. DEBUGGING (when fixing)
4. Domain-specific (implementation)
5. PERFORMANCE_OPTIMIZATION (if metrics mentioned)
6. REFACTORING (cleanup phase)

Example: "Implement secure payment API"
- Primary: BACKEND_ENGINEERING
- Secondary: SECURITY_AUDIT
- Execute: plan (architect) → security review (security-engineer) → implement (backend-api-architect)

## Classification Examples

| Task | Domain(s) | Primary Role |
|------|-----------|--------------|
| "Create responsive hero section" | UI_IMPLEMENTATION | ui-systems-engineer |
| "Add JWT auth to dashboard" | BACKEND_ENGINEERING + SECURITY_AUDIT | backend-api-architect + security-engineer |
| "Why is checkout slow?" | DEBUGGING + PERFORMANCE | senior-debug-engineer |
| "Consolidate duplicate auth logic" | REFACTORING + BACKEND_ENGINEERING | system-architect |
| "Deploy to production" | DEPLOYMENT + SECURITY_AUDIT | deployment-engineer |
| "Write OpenAPI spec" | DOCUMENTATION + FEATURE_PLANNING | backend-api-architect |

## Ambiguity Resolution

If classification unclear, ask:
- Is this planning or implementation?
- Is security a concern?
- Is this fixing existing or building new?
- What's the primary goal?

## Output

```json
{
  "domain": "UI_IMPLEMENTATION",
  "confidence": 0.95,
  "secondary_domains": [],
  "primary_role": "ui-systems-engineer",
  "standards": ["component-standards", "ui-design-system"],
  "scanners": ["ux-consistency", "performance-audit"],
  "scope": "src/components/LoginForm"
}
```

Used by: context-router.md, role-orchestrator.md
