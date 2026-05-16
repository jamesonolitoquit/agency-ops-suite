# Context Loader — Selective File Loading Engine

Loads ONLY the minimum viable context for a task.

## Loading Philosophy

- Load by domain, not by "everything"
- Resolve dependencies without cascading loads
- Exclude unrelated documentation
- Prevent recursive context explosion
- Cache loaded context to avoid reloads

## Load Decision Tree

```
1. Task domain determined (from task-classifier.md)
2. Identify required role(s)
3. Load role file ONLY
4. Load relevant standards (check which apply)
5. Load relevant scanners (if execution phase)
6. Load project-context.md (once per session)
7. Load specific business rules if domain-relevant
8. Load relevant memory entries (if debugging/refactoring)
9. DON'T load: unused README files, other domains, architecture docs
```

## Selective Loading Rules

### Project Context
Load `context/project-context.md` once at session start. Contains:
- Stack overview
- Architecture summary
- Key business rules
- Deployment model

Don't reload in same session.

### Role Files
Load ONE or TWO role files based on primary/secondary roles.
- `roles/[role-name].md`
- Nothing else from roles/

### Standards
Load ONLY standards relevant to task:
- UI task → load component-standards, ui-design-system
- API task → load api-standards, backend-rules
- Security task → load security-standards
- ALL tasks → load naming-conventions

### Memory (if applicable)
Load only when:
- Debugging: load known-bugs.md, optimization-history.md
- Refactoring: load architectural-decisions.md, failed-approaches.md
- Planning: load architectural-decisions.md
- Otherwise: skip memory files

### Scanners
Load scanner DESCRIPTIONS only when needed (validation phase). Not during planning.

### Architecture Docs
NEVER load entire docs/ folder. Load specific files only:
- If task references it explicitly
- If scope-manager determines it's relevant

## Context Size Limits

| Category | Max Items | Examples |
|----------|-----------|----------|
| Roles | 2 | primary + specialist |
| Standards | 3 | related to domain |
| Memory files | 2 | if applicable |
| Project context | 1 | project-context.md |
| Scanners | 2 | domain-relevant only |

Total: ~50KB maximum per session.

## Dependency Resolution

If role references another domain:
- DON'T load full second domain
- Load only what role explicitly needs
- Example: UI task references "call API for data"
  - Don't load full backend standards
  - Load api-standards.md only

## Exclusion Rules

NEVER load unless explicitly requested:
- Full docs/ folder
- All README files
- All memory files
- All role files
- Unrelated standards

ALWAYS skip:
- Previous session artifacts
- Abandoned branches
- Draft/WIP documents
- Generic best practices

## Load Example

```
Task: "Fix mobile navigation responsiveness"

Classification: UI_IMPLEMENTATION

Load:
✓ roles/ui-systems-engineer.md (primary)
✓ standards/component-standards.md (UI specific)
✓ standards/ui-design-system.md (UI specific)
✓ standards/naming-conventions.md (all tasks)
✓ context/project-context.md (once)
✗ roles/backend-api-architect.md (unrelated)
✗ standards/api-standards.md (unrelated)
✗ memory/* (not needed)
✗ docs/ARCHITECTURE.md (unrelated)
✗ scanners/performance-audit.md (loaded later if needed)

Context loaded: ~20KB
```

## Performance Checks

If loading would exceed 100KB:
- Warn: "Context approaching limit"
- If exceeds 150KB:
  - Prune oldest/least relevant
  - Ask user to scope task more tightly
  - Split into sub-tasks

## Caching Strategy

Cache in session:
- Project context (full session)
- Role definitions (full session)
- Standards (full session)

Reload if:
- Task switches domains
- User requests refresh
- Session timeout (1 hour)

## Implementation

Called by: context-router.md → execution-scope-manager.md
Output: loaded files, load size, caching strategy
