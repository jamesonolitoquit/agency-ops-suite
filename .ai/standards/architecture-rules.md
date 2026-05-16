# architecture-rules.md

Architectural boundaries and layering principles.

## Layers

```
┌─────────────────────────────────┐
│      User Interface (React)      │  Can call: Hooks, Services
├─────────────────────────────────┤
│   Business Logic (Services)      │  Can call: Database, External APIs
├─────────────────────────────────┤
│    Data Access (Queries, ORM)    │  Can call: Database, Cache
├─────────────────────────────────┤
│        Database Layer            │
└─────────────────────────────────┘
```

## Boundary Rules

**UI Layer CANNOT:**
- Import from server/ folder
- Import database queries directly
- Access environment secrets
- Make raw HTTP calls (use services)

**Service Layer CANNOT:**
- Import React
- Import UI components
- Call browser APIs
- Access DOM

**Database Layer CANNOT:**
- Contain business logic
- Make HTTP calls to external services
- Access browser APIs

## Isolation

| Layer | Allowed Dependencies |
|-------|---------------------|
| UI (React) | Hooks, Services, Utils, Types |
| Services | Database, Utils, Types, External APIs |
| Database | Utils, Types |

## Circular Dependencies

**FORBIDDEN:**
- Service A → Service B → Service A
- Component A → Util → Component A
- Module cycles

**PREVENT WITH:**
- ESLint circular-deps rule
- Clear dependency directions
- Architecture reviews

## Example: Adding Feature

```
✓ correct:
Component → useAuth hook → AuthService → Supabase

✗ incorrect:
Component → Supabase (skips service layer)
Component → backend env (accesses server secrets)
```

## Enforcement

- ESLint rules
- Pre-commit validation
- PR architecture review
- Scanner: architecture-guardian
