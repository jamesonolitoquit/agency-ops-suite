# Commands — Executable Operational Procedures

Reusable instructions for specific operational tasks.

## Philosophy

Each command:
- **Has clear objective**
- **Defines workflow steps**
- **Specifies success criteria**
- **Produces consistent output**
- **Is executable by AI agents**

## Commands

| Command | Domain | Role | Purpose |
|---------|--------|------|---------|
| **plan-feature.md** | FEATURE_PLANNING | system-architect | Design feature before implementation |
| **review-pr.md** | Any | senior engineers | Code review with risk assessment |
| **analyze-bug.md** | DEBUGGING | senior-debug-engineer | Root cause analysis + minimal fix |
| **refactor-system.md** | REFACTORING | system-architect | Code restructuring without behavior changes |
| **optimize-performance.md** | PERFORMANCE | performance-engineer | Profile, optimize, measure improvements |
| **run-audit.md** | SECURITY/QUALITY | various | Comprehensive audit with remediation |

## Command Structure

Each command contains:
- **Objective** — What we're trying to accomplish
- **Prerequisites** — What must be true before starting
- **Workflow** — Step-by-step procedure
- **Output** — What we produce
- **Success Criteria** — Definition of done

## Execution Example

```
→ plan-feature ("Real-time notifications")
  Output: Architecture document, API spec, DB schema

→ review-pr (PR #123)
  Output: Code review with risk assessment

→ analyze-bug ("Webhooks not firing")
  Output: Root cause, minimal fix, prevention

→ optimize-performance ("Dashboard slow")
  Output: Optimization plan with before/after metrics
```

## Anti-Commands

Commands do NOT:
- Have vague procedures
- Skip success criteria
- Produce inconsistent output
- Leave ambiguity about what's done
- Include unnecessary explanation

Commands ARE:
- Deterministic
- Executable
- Clear
- Measurable
- Actionable

Used by: workflow-dispatcher.md, roles/

