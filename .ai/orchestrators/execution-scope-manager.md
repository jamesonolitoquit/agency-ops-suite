# Execution Scope Manager — Boundary Calculator

Determines precise execution boundaries for a task.

## Purpose

Prevent operations on unrelated systems. Answer:
- What files can I touch?
- What architecture layers are affected?
- What services can I modify?
- What systems are off-limits?

## Scope Analysis

```
1. Identify primary affected system/folder
2. Identify dependent systems
3. Identify consumers of affected system
4. Calculate isolation boundary
5. Determine read-only vs. write access
6. Identify protected systems
7. Output: scoping rules
```

## Domain-to-Scope Mapping

| Domain | Primary Scope | Read Scope | Write Scope | Protected |
|--------|--------------|-----------|------------|-----------|
| UI_IMPLEMENTATION | src/components/ | styles, types | components, styles | src/api, src/services |
| BACKEND_ENGINEERING | src/api/ | database, types, utils | api, services, db | src/components |
| SECURITY_AUDIT | standards/, config | all readable | standards/, config | nothing (read all) |
| DEBUGGING | identified system | all (investigation) | single file (fix) | infrastructure |
| FEATURE_PLANNING | docs/ | all readable | docs/ | nothing |
| PERFORMANCE | identified layer | all (profiling) | optimization targets only | core business logic unless necessary |
| REFACTORING | target folder | folder + dependencies | target folder only | behavior, APIs |
| DEPLOYMENT | config/, .github/ | all readable | config/, .github/, env | application code |
| TESTING | tests/ | related code | tests/ only | non-test code (read-only) |
| DOCUMENTATION | docs/ | related files | docs/ | code |

## File Impact Analysis

For each affected file, calculate:
- **Read-only:** Information gathering
- **Modify:** Safe to change
- **Create:** Can add new files
- **Delete:** Can remove (if safe)
- **Move:** Can reorganize

Example: Implementing login form component

```
Primary: src/components/LoginForm/
├── Read-only:
│   ├── src/types/auth.ts (understand types)
│   ├── src/api/auth.ts (understand endpoints)
│   └── src/utils/validation.ts (validation rules)
├── Modify safe:
│   ├── src/components/LoginForm/LoginForm.tsx
│   ├── src/components/LoginForm/LoginForm.test.tsx
│   └── src/styles/forms.css
├── Create safe:
│   ├── src/components/LoginForm/types.ts (if needed)
│   └── src/components/LoginForm/hooks.ts (if needed)
└── Forbidden:
    ├── src/api/auth.ts (backend scope)
    ├── database schema (backend scope)
    └── infrastructure config
```

## Architecture Layer Scoping

```
Components Layer ─→ read services, read types
    ↓ (can modify)
Services Layer ─→ read database, read external APIs
    ↓ (read-only from UI)
Data Layer ─→ database, caches
    ↓ (read-only from services)
Infrastructure ─→ config, CI/CD
```

Rule: **Don't cross your layer boundary upward.**

## Boundary Enforcement

When task tries to modify protected system:
1. Check scope rules
2. If violation detected, STOP
3. Suggest: split task, ask owner, document exception
4. Don't proceed without explicit override

Example:
```
UI task attempts: modify src/api/auth.ts
Check: Is backend write allowed? NO
Action: Stop, suggest this is backend work
```

## Dependency Chain Calculation

If task affects: `src/components/Auth/`
- Direct dependencies: `src/api/auth.ts`, `src/types/auth.ts`
- Secondary dependencies: `src/services/tokenManager.ts`
- Consumers: `src/components/Dashboard/`

Question: Should I update consumers?
- NO unless task explicitly includes them
- Document breaking change if needed
- Flag for coordinated PR

## Protection Rules

### Always Protected
- Infrastructure (Dockerfile, k8s configs, CI/CD)
- Core authentication system (unless explicitly fixing auth)
- Database migrations (unless planning schema change)
- Public API contracts (without version bump)

### Conditionally Protected
- Component APIs (check if breaking)
- Service interfaces (check if breaking)
- Data schemas (if accessed externally)

### Never Protected
- Internal implementation details
- Test files
- Documentation
- Unused code

## Scope Validation

Before execution, verify:
- [ ] Primary scope identified
- [ ] Protected systems respected
- [ ] Dependencies understood
- [ ] Impact on consumers documented
- [ ] No cross-layer violations
- [ ] Read vs. write permissions correct

## Scope Output

```json
{
  "domain": "UI_IMPLEMENTATION",
  "primary_scope": "src/components/LoginForm/",
  "can_modify": [
    "src/components/LoginForm/**",
    "src/styles/forms.css"
  ],
  "can_read": [
    "src/types/auth.ts",
    "src/api/auth.ts",
    "src/utils/validation.ts"
  ],
  "cannot_modify": [
    "src/api/**",
    "src/services/**",
    "src/db/**"
  ],
  "dependent_systems": [
    "src/types/auth.ts",
    "src/api/auth.ts"
  ],
  "consumers": [
    "src/components/Dashboard/"
  ],
  "breaking_changes": false
}
```

Used by: context-router.md, context-loader.md, workflow-dispatcher.md
