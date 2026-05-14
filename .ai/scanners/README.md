# Scanners — Automated Auditing Systems

Continuous quality and safety checks that protect against entropy and decay.

## Philosophy

Scanners:
- **Detect issues automatically**
- **Categorize by severity**
- **Provide remediation guidance**
- **Run at strategic points** (PR, pre-deploy, scheduled)
- **Prevent regressions**

## Scanners

| Scanner | Purpose | Trigger | Severity Levels |
|---------|---------|---------|-----------------|
| **workspace-hygiene** | Dead code, console logs, TODOs | PR, daily | HIGH/MEDIUM/LOW |
| **architecture-guardian** | Boundary violations, coupling | PR, daily | CRITICAL/HIGH/MEDIUM |
| **security-boost** | Vulnerabilities, secrets | PR, pre-deploy | CRITICAL/HIGH/MEDIUM |
| **performance-audit** | Slowness, bundle bloat | PR, production | CRITICAL/HIGH/MEDIUM |
| **test-integrity** | Coverage gaps, flaky tests | PR, pre-commit | CRITICAL/HIGH/MEDIUM |
| **ux-consistency** | UI inconsistencies, a11y | PR, design | CRITICAL/MEDIUM/LOW |
| **dependency-governance** | Vulnerable/abandoned packages | Weekly | CRITICAL/HIGH/MEDIUM |
| **deployment-readiness** | Pre-deploy validation | Pre-deploy | CRITICAL/MEDIUM |

## Scan Output Format

```
[Scanner Name] Report

Issues: XX
- CRITICAL: X
- HIGH: X
- MEDIUM: X
- LOW: X

Findings:
1. [Issue]: [Location]
   → Remediation: [Steps]
   → Effort: [estimate]

2. [Issue]: [Location]
   → Remediation: [Steps]
```

## Trigger Points

| Trigger | Scanners Run |
|---------|--------------|
| On PR | workspace-hygiene, architecture-guardian, security-boost, performance-audit, test-integrity, ux-consistency |
| Pre-commit | test-integrity, workspace-hygiene |
| Pre-deploy | security-boost, deployment-readiness |
| Scheduled weekly | dependency-governance |
| Production monitoring | performance-audit |

## Gate Failures

If scanner finds CRITICAL issue:
- **PR:** Block merge
- **Pre-deploy:** Block deployment
- **Scheduled:** Alert team, create ticket

HIGH severity:
- **PR:** Can merge with explanation
- **Pre-deploy:** Should fix before deployment

MEDIUM/LOW:
- **PR:** Merge allowed, add to backlog
- **Pre-deploy:** Merge allowed if timeline critical

## Integration

- Activated by: workflow-dispatcher.md
- Scoped by: execution-scope-manager.md
- Reported in: reports/ folder

Scanners are the immune system of autonomous development.

