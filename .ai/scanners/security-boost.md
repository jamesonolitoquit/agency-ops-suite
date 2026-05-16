# security-boost.md

Detects security vulnerabilities and risks.

## Checks

**Secrets & Credentials**
- API keys in code
- Passwords in code
- Private keys exposed
- .env files tracked

**Auth & Access**
- Missing auth guards on endpoints
- Missing RBAC checks
- Public admin routes
- Weak session handling

**Input Validation**
- Unvalidated user input
- SQL injection risks
- XSS vulnerabilities
- Missing CSRF tokens

**Data Protection**
- Secrets sent in logs
- Sensitive data in localStorage
- Missing encryption
- Hardcoded secrets

**Dependencies**
- Known vulnerable packages
- Outdated versions
- Unmaintained libraries

**Infrastructure**
- Missing CORS validation
- Missing security headers
- Weak TLS configuration
- Open ports

## Severity

| Issue | Severity |
|-------|----------|
| Exposed API key | CRITICAL |
| SQL injection risk | CRITICAL |
| Missing auth guard | HIGH |
| Weak session | HIGH |
| Unvalidated input | MEDIUM |
| Missing headers | MEDIUM |

## Output

```
Security Boost Report

Issues: 15
- CRITICAL: 2 (API key exposed, SQL injection)
- HIGH: 4 (missing auth, weak sessions)
- MEDIUM: 9 (validation, headers)

Findings:
1. API_KEY in .env.local tracked in git [CRITICAL]
   → Remediation: Rotate key, remove from git history
   
2. POST /api/users vulnerable to SQL injection [CRITICAL]
   → Remediation: Use parameterized queries
   
3. POST /api/data missing auth guard [HIGH]
   → Remediation: Add auth middleware
```

## Automation

- Secret scanning (truffleHog, gitleaks)
- Dependency scanning (npm audit)
- SAST (static analysis)
- Manual code review

Trigger: On PR, pre-deploy, weekly
