# Workflow Dispatcher — Pipeline Selector

Maps tasks to structured multi-stage workflows.

## Workflow Selection

```
1. Domain from task-classifier
2. Task complexity assessment
3. Emergency/routine detection
4. Select workflow
5. Load workflow file
6. Execute stages
7. Run validation gates
8. Generate output
```

## Workflow Routing

| Task Type | Complexity | Workflow | Stages |
|-----------|-----------|----------|--------|
| New feature | High | build-feature | plan → design → implement → test → deploy |
| Bug fix | Low/Med | analyze-bug (debugging) | reproduce → trace → fix → test → verify |
| Security issue | High | full-security-audit | scan → analyze → remediate → test → verify |
| Performance issue | Med | optimize-application | profile → analyze → optimize → test → verify |
| Urgent fix | Med | emergency-hotfix | triage → minimal-fix → test → deploy → monitor |
| Deployment | Med | ship-production-release | checklist → stage → deploy → monitor |
| Refactoring | High | refactor-system | analyze → plan → implement → test → validate |

## Workflow Composition

Each workflow contains:

```
Workflow: build-feature
├── Stage 1: Plan (system-architect)
│   └── Command: plan-feature
│   └── Input: feature description
│   └── Output: architecture document
│   └── Gate: architecture review passed
│
├── Stage 2: Implement (backend-api-architect OR ui-systems-engineer)
│   └── Commands: implement-component / build-api-route
│   └── Input: architecture document
│   └── Output: code, tests
│   └── Gate: tests pass, coverage > 80%
│
├── Stage 3: Security (security-engineer)
│   └── Command: run-audit (security subset)
│   └── Input: implemented code
│   └── Output: security assessment
│   └── Gate: no critical issues
│
├── Stage 4: Quality (qa-specialist)
│   └── Scanners: performance, accessibility
│   └── Input: implemented code
│   └── Output: quality report
│   └── Gate: meets quality bar
│
└── Stage 5: Deploy (deployment-engineer)
    └── Command: ship-production-release
    └── Input: approved code
    └── Output: deployed feature
    └── Gate: deployment verified
```

## Stage Gating

Between stages:
- **Auto-pass:** Code meets criteria
- **Manual gate:** Requires approval
- **Auto-fail:** Critical issues found

If gate fails:
- Stop pipeline
- Report blocker
- Suggest remediation
- Await resolution

## Workflow Paths

### Happy Path
All stages pass → proceed to next.

### Remediation Path
Stage fails → fix issue → re-run stage → proceed.

### Emergency Path
Override gates if explicitly requested → use at own risk.

## Conditional Workflows

### Feature with Security Concerns
Adds: full-security-audit stage early

### Performance-Critical Feature
Adds: performance-audit stage after implementation

### Breaking API Change
Adds: deprecation plan stage

## Workflow Execution

```
dispatch_workflow(
  workflow_name: "build-feature",
  task: {
    description: "Real-time notifications",
    domain: "BACKEND_ENGINEERING",
    complexity: "HIGH"
  }
) → Execute stages 1-5, return result
```

## Multi-Workflow Coordination

If task spans multiple workflows:
- Use system-architect as coordinator
- Execute workflows sequentially
- Pass outputs between workflows

Example: "Refactor auth system + add 2FA"
1. Workflow: refactor-system (analyze + implement)
2. Workflow: build-feature (add 2FA feature)
3. Workflow: full-security-audit (validate)

## Abort Conditions

Stop workflow if:
- Critical blocker detected
- Dependency unavailable
- Scope exceeded
- User requests abort

Upon abort:
- Document why
- Suggest recovery
- Clean up artifacts
- Return to start

## Output

```json
{
  "workflow": "build-feature",
  "stages_completed": 5,
  "stages_total": 5,
  "status": "success",
  "output": {
    "code": "...",
    "tests": "...",
    "docs": "...",
    "security_review": "passed",
    "performance_metrics": "meets_bar"
  },
  "gates_passed": 5,
  "gates_failed": 0,
  "duration_minutes": 45,
  "next_action": "deploy"
}
```

## Workflow Files Location

All workflows in: `workflows/`
- build-feature.md
- emergency-hotfix.md
- full-security-audit.md
- optimize-application.md
- ship-production-release.md
- (extensible)

Used by: context-router.md, role-orchestrator.md
