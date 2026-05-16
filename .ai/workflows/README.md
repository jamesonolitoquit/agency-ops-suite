# Workflows — Multi-Stage Autonomous Pipelines

Structured procedures coordinating roles, commands, scanners, and validation gates.

## Philosophy

Workflows are:
- **Multi-stage** — Multiple roles execute in sequence
- **Validated** — Quality gates between stages
- **Reversible** — Rollback procedures defined
- **Monitored** — Metrics tracked throughout
- **Deterministic** — Same input always produces same output

## Workflows

| Workflow | Purpose | Stages | Timeline |
|----------|---------|--------|----------|
| **build-feature.md** | Full feature development | 7 | 8-40 hrs |
| **emergency-hotfix.md** | Urgent production fix | 7 | 15-60 min |
| **full-security-audit.md** | Comprehensive security review | 8 | 4-16 hrs |
| **optimize-application.md** | Performance optimization cycle | 7 | 4-24 hrs |
| **ship-production-release.md** | Production deployment | Multiple | 1-4 hrs |

## Execution Model

```
Workflow Start
    ↓
Stage 1: Execute → Validate
    ↓ (Pass) → Continue
    ↓ (Fail) → Fix or Rollback
    ↓
Stage 2: Execute → Validate
    ↓ (Continue pattern)
    ↓
... (repeat for all stages)
    ↓
Workflow Complete → Output generated
```

## Quality Gates

Between stages:
- **Auto-pass:** Criteria met → proceed
- **Manual gate:** Requires approval → wait or reject
- **Auto-fail:** Critical issue → stop and remediate

If gate fails:
1. Identify issue
2. Remediate (fix code, address feedback)
3. Re-run failed stage
4. Proceed if now passing

## Failure Recovery

Each workflow defines recovery for each stage.

Example (build-feature):
- Stage 1-2 fails → restart planning
- Stage 3 fails → fix security issue, continue
- Stage 6 fails → debug in staging, redeploy
- Stage 7 fails → rollback, incident response

## Integration

- Dispatched by: workflow-dispatcher.md
- Activated by: role-orchestrator.md
- Scoped by: execution-scope-manager.md
- Monitored by: scanners/

Workflows are the operational heart of autonomous development.

