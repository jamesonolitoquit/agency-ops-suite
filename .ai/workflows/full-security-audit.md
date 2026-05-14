# full-security-audit.md

Comprehensive security review end-to-end.

## Stages

**Stage 1: Scope Definition** (security-engineer)
- What are we auditing? (auth, API, database, infrastructure, all?)
- Load security-standards.md
- Define audit boundaries

**Stage 2: Credential & Secret Scan** (security-engineer)
- Scanner: secrets-exposure check
- Look for: API keys, passwords, tokens in code
- Check: .env files, git history
- Gate: No secrets exposed

**Stage 3: Authentication & Authorization** (security-engineer)
- Check: Auth flows implemented correctly
- Check: Session/JWT management
- Check: Permission checks on all endpoints
- Gate: Auth implemented securely

**Stage 4: Input Validation** (security-engineer)
- Check: All inputs validated
- Check: XSS protection
- Check: SQL injection prevention
- Check: Rate limiting present
- Gate: No injection risks

**Stage 5: Data Protection** (security-engineer)
- Check: Encryption in transit (HTTPS)
- Check: Encryption at rest (sensitive data)
- Check: Data retention policies
- Gate: Data protected

**Stage 6: Dependency Security** (security-engineer)
- Scanner: dependency-governance check
- Check: Known vulnerabilities
- Check: Abandoned packages
- Gate: No critical vulnerabilities

**Stage 7: Infrastructure** (security-engineer + deployment-engineer)
- Check: CORS configuration
- Check: Security headers
- Check: Firewall rules
- Check: Access controls
- Gate: Infrastructure hardened

**Stage 8: Remediation Plan** (security-engineer)
- Prioritize issues by severity
- Create tickets
- Estimate effort
- Plan rollout

## Output

```markdown
# Security Audit Report

## Summary
- Issues found: XX
- Critical: X
- High: X
- Medium: X

## Critical Issues
[List with remediation]

## Remediation Timeline
- Critical: Fix immediately
- High: Fix this sprint
- Medium: Backlog

## Compliance Status
- OWASP Top 10: [compliance %]
- SOC 2 ready: [yes/no]
```

## Success Criteria

- [ ] All systems audited
- [ ] Issues categorized by severity
- [ ] Remediation plan clear
- [ ] Team aligned on priorities
- [ ] Tickets created for high/critical

## Timeline

Typical: 4-16 hours depending on system complexity

Used by: workflow-dispatcher.md (domain: SECURITY_AUDIT)
