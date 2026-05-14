# Standards — Non-Negotiable Engineering Rules

Enforce consistent, predictable code quality across the project.

## Philosophy

Standards are:
- **Non-negotiable** — Apply to all code
- **Explicit** — No ambiguity
- **Enforceable** — Linting, automation, review
- **Evolving** — Update as project grows
- **Domain-specific** — Different standards for different layers

## Standards

| Standard | Domain | Purpose |
|----------|--------|---------|
| **architecture-rules** | All | Layering, boundaries, dependencies |
| **naming-conventions** | All | Consistent naming across codebase |
| **api-standards** | Backend | REST endpoint design |
| **security-standards** | All | Auth, validation, data protection |
| **component-standards** | Frontend | React structure, performance |
| **ui-design-system** | Frontend | Tailwind tokens, dark mode, responsive |
| **backend-rules** | Backend | Services, routes, databases |

## Application

**When writing code:**
- Load relevant standards
- Apply rules before implementation
- Use linting to enforce
- Get reviewed against standards

**When reviewing code:**
- Check against relevant standards
- Request changes if violated
- Mark approved if compliant

## Enforcement

- **ESLint:** Automated formatting and rules
- **Pre-commit:** Validate before commits
- **CI/CD:** Fail builds on violations
- **Code review:** Human validation
- **Scanners:** Detect violations

## Exceptions

Rare exceptions allowed if:
1. Documented in code comment
2. Approved by architect/lead
3. Added to EXCEPTIONS.md
4. Alternative approach explained

## Updates

To update standards:
1. Identify need (team feedback, problem discovered)
2. Propose change
3. Get team alignment
4. Update standard file
5. Update linting rules
6. Communicate to team

Standards keep code predictable and maintainable.

