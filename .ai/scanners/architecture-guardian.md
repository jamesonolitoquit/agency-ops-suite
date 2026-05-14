# architecture-guardian.md

Enforces architectural boundaries and patterns.

## Checks

**Boundary Violations**
- UI code calling database directly
- Components accessing server-only variables
- Client code importing from API routes

**Circular Dependencies**
- Service A imports Service B imports Service A
- Module dependencies form cycles

**Component Coupling**
- Too deep nesting (> 5 levels)
- Prop drilling (> 3 levels)
- God components (> 300 LOC)

**Layering**
- API routes contain business logic (should be in services)
- Components contain business logic (should be in hooks/services)
- Database access in wrong layer

**Duplicate Abstractions**
- Multiple API client implementations
- Multiple auth solutions
- Multiple state management approaches

## Severity

| Issue | Severity |
|-------|----------|
| Client code in server layer | CRITICAL |
| Circular dependencies | HIGH |
| API logic in route handler | HIGH |
| Tight coupling | MEDIUM |
| Code duplication | MEDIUM |

## Output

```
Architecture Guardian Report

Issues: 8
- CRITICAL: 1 (import server-only)
- HIGH: 2 (circular deps, business logic in routes)
- MEDIUM: 5 (coupling, duplication)

Findings:
1. src/components/Form.tsx imports server function [CRITICAL]
2. services/ has circular dependency [HIGH]
3. POST /api/payment contains business logic [HIGH]
```

## Automation

- Dependency graph analysis
- ESLint rules: no-server-imports
- File pattern analysis

Trigger: On PR, scheduled daily
