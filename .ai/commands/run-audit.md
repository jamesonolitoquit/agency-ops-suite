# run-audit.md

Systematic security and quality audit.

## Objective

Comprehensive audit for vulnerability, code quality, or architectural issues.

## Prerequisites

- Audit scope defined (security, architecture, code quality)
- Relevant role active (security-engineer, system-architect, etc)
- Full codebase access

## Workflow

**1. Define Audit Scope**
- What are we auditing?
- What standards apply?
- What's in/out of scope?

**2. Load Standards**
- security-standards for security audit
- architecture-rules for architecture audit
- component-standards for UI audit

**3. Systematic Scan**
- Check against standard points
- Document findings
- Categorize by severity

**4. Prioritize Issues**
- Critical: Security, data loss, breaking
- High: Performance, maintainability
- Medium: Code style, optional improvements
- Low: Nice-to-have

**5. Create Remediation Plan**
- Priority order
- Effort estimate
- Dependencies

**6. Document Report**
- Findings summary
- Severity breakdown
- Recommended actions

## Output

```markdown
# Audit Report: [Audit Type]

## Summary
- Total issues: XX
- Critical: X
- High: X
- Medium: X
- Low: X

## Critical Issues
### Issue 1: [Title]
- Description: [details]
- Location: [file/line]
- Severity: CRITICAL
- Remediation: [steps]

## High Priority Issues
[Same format as critical]

## Medium Priority Issues
[Same format as critical]

## Recommendations
1. [Immediate action]
2. [Short-term improvement]
3. [Long-term improvement]

## Timeline
- Critical issues: Fix immediately
- High issues: Fix this sprint
- Medium issues: Backlog
```

## Success Criteria

- [ ] Audit scope clear
- [ ] All standards checked
- [ ] Issues categorized by severity
- [ ] Remediation plan clear
- [ ] Report actionable

Used by: security-engineer, system-architect, qa-specialist roles
Next: Create tickets for issues, plan remediation
