# Role Orchestrator — Role Activation Engine

Determines which AI roles activate and in what order.

## Role Activation Rules

- **MAX 2 roles active simultaneously** (primary + specialist)
- Each role has clear responsibilities
- No role overlap
- Clear handoff between roles

## Role Matrix

| Role | Domain | Specialization | Typical Tasks |
|------|--------|-----------------|---------------|
| system-architect | FEATURE_PLANNING, REFACTORING | Architecture, design, strategic decisions | Plan features, design APIs, refactor systems |
| ui-systems-engineer | UI_IMPLEMENTATION | Component systems, responsive design, UX | Build components, implement designs, UX improvements |
| backend-api-architect | BACKEND_ENGINEERING | API design, services, business logic | Implement routes, design services, business logic |
| security-engineer | SECURITY_AUDIT | Auth, encryption, access control | Security reviews, vulnerability fixes, auth design |
| performance-engineer | PERFORMANCE_OPTIMIZATION | Profiling, optimization, metrics | Profile code, optimize queries, reduce bundle |
| senior-debug-engineer | DEBUGGING | Root cause analysis, pattern recognition | Debug issues, trace data flow, reproduce bugs |
| tailwind-design-enforcer | UI_IMPLEMENTATION (specialist) | Design tokens, consistency, accessibility | Design audits, design system enforcement |
| deployment-engineer | DEPLOYMENT | DevOps, CI/CD, infrastructure | Deploy, configure pipelines, manage environments |

## Role Selection Logic

```
1. Task domain from task-classifier
2. Map to primary role
3. Check if specialist needed (secondary domain?)
4. Activate primary
5. Activate secondary if applicable
6. Load role files
7. Execute
8. Deactivate roles
```

## Single-Role Activation

Example: "Create login form component"

```
Domain: UI_IMPLEMENTATION
Primary role: ui-systems-engineer
Secondary: none

Activate: ui-systems-engineer
Load: roles/ui-systems-engineer.md
Execute: implement-component command
Deactivate: ui-systems-engineer
```

## Multi-Role Activation

Example: "Implement secure payment processing"

```
Domains: BACKEND_ENGINEERING + SECURITY_AUDIT
Primary role: backend-api-architect
Secondary role: security-engineer

Order:
1. system-architect (optional): Plan API
2. security-engineer: Security design review
3. backend-api-architect: Implement routes
4. security-engineer: Security validation
5. Deactivate both
```

## Role Conflict Prevention

Never activate simultaneously:
- ui-systems-engineer + backend-api-architect (different layers)
- system-architect + senior-debug-engineer (different modes)
- performance-engineer + backend-api-architect (separate concerns)

If task spans conflicting roles:
- Split into sequential steps
- OR use system-architect as coordinator

## Role Specialization

### Primary Roles
Make independent decisions, implement, validate.

### Specialist Roles
Provide expertise, validate decisions, hand off to primary.

Example: "Optimize dashboard performance"
```
Primary: performance-engineer
- Profiles code
- Identifies bottlenecks
- Proposes optimizations
- Validates improvements

If bottleneck is UI:
- Hands off to: ui-systems-engineer
- For: implementation

If bottleneck is API:
- Hands off to: backend-api-architect
- For: optimization
```

## Role Transition Handoff

Between roles, exchange:
```
From role → To role:
- Problem statement
- Analysis completed
- Constraints discovered
- Decision made
- Next steps defined
```

Example handoff:

```
security-engineer → backend-api-architect:
"Payment API needs OAuth 2.0. 
 Use Supabase auth client. 
 Restrict endpoints with RLS. 
 Implement payment webhook validation."
```

## Role Context Loading

Each role loads:
- Role definition file
- Related standards (auto-selected)
- Relevant examples

Role does NOT load:
- Other role files
- Unrelated domains
- Full documentation

## Deactivation Rules

Role deactivates when:
- Task complete
- Handing off to different role
- Session ends
- Scope out of domain

Upon deactivation:
- Prune intermediate reasoning
- Keep only: decisions, code, tests
- Output: ready for next phase

## Emergency Role Override

User can force role: "Use system-architect for this"
- Load requested role anyway
- Document override
- Use at own risk (may not be optimal)

## Role Availability Check

Before activating role, verify:
- Role file exists
- Role applies to domain
- No conflicts with active roles
- Scope is relevant

If role unavailable:
- Use primary role only
- Warn user
- Suggest alternative

## Output

```json
{
  "active_roles": [
    {
      "role": "ui-systems-engineer",
      "activation_order": 1,
      "status": "active"
    },
    {
      "role": "performance-engineer", 
      "activation_order": 2,
      "status": "waiting"
    }
  ],
  "conflicts": [],
  "ready": true
}
```

Used by: context-router.md, context-loader.md
Consumes: role files from roles/
