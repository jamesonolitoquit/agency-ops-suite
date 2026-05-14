# security-checklist.md

Security audit and hardening validation.

## Authentication & Authorization

- [ ] Passwords >= 12 characters
- [ ] Passwords hashed (bcrypt/Argon2)
- [ ] Session tokens secure (HttpOnly, Secure flags)
- [ ] Refresh tokens working
- [ ] Token expiration enforced
- [ ] Permission checks on all endpoints
- [ ] Default deny, explicit allow
- [ ] Admin endpoints protected
- [ ] Role-based access control tested

## Data Protection

- [ ] Sensitive data encrypted at rest
- [ ] HTTPS enforced (no HTTP in production)
- [ ] CORS whitelist set
- [ ] No sensitive data in URLs
- [ ] No sensitive data in logs
- [ ] PII not exposed in errors
- [ ] Database backup encryption enabled

## Secrets Management

- [ ] No secrets in code
- [ ] No secrets in .git history
- [ ] No secrets in environment configs
- [ ] Secrets use environment variables
- [ ] Secrets rotated regularly
- [ ] Secrets manager configured (if applicable)

## Input Validation

- [ ] All user inputs validated
- [ ] Whitelist validation (not blacklist)
- [ ] File uploads validated (type, size)
- [ ] Input size limits enforced
- [ ] Special characters escaped
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)

## Dependencies

- [ ] `npm audit` shows no critical vulnerabilities
- [ ] All dependencies up to date
- [ ] No abandoned packages used
- [ ] License compliance checked
- [ ] Dependency tree reviewed

## Error Handling

- [ ] No stack traces in responses
- [ ] No technical details in user messages
- [ ] Errors logged server-side
- [ ] Request IDs for debugging
- [ ] Graceful degradation on error

## Infrastructure

- [ ] Database username/password rotated
- [ ] No default credentials used
- [ ] Firewall rules restrictive
- [ ] SSH keys secured
- [ ] Access logs enabled
- [ ] Rate limiting enabled

## Compliance (if applicable)

- [ ] GDPR: Data export available
- [ ] GDPR: Data deletion available
- [ ] CCPA: Privacy policy clear
- [ ] Audit logging enabled
- [ ] Data retention policies documented

---

**Run security audit before production release.**
