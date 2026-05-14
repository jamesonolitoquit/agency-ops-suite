# security-standards.md

Security requirements and best practices.

## Authentication

- Use established auth library (Supabase, NextAuth, Auth0)
- Don't build custom auth
- Support multi-factor authentication
- Secure session handling

## Authorization

- Implement RBAC (role-based access control)
- Check permissions on every protected endpoint
- Default deny, explicitly allow
- Log permission checks

## Data Protection

- Encrypt sensitive data at rest
- HTTPS only (never HTTP in production)
- Never log passwords or tokens
- Use environment variables for secrets

## Input Validation

- Validate ALL user inputs server-side
- Whitelist allowed characters
- Limit input size
- Prevent SQL injection (use parameterized queries)
- Prevent XSS (sanitize output)

## Secrets Management

- **NEVER commit secrets to git**
- Use `.env.local` (gitignored)
- Use environment variables
- Rotate secrets regularly
- Use secret manager in production

## Dependencies

- Run `npm audit` regularly
- Update packages promptly
- Review breaking changes
- Remove unused packages

## API Security

- Validate API inputs
- Rate limiting enabled
- CORS properly configured
- No sensitive data in URLs
- Webhook signature verification

## Error Handling

- Don't expose internal details in errors
- Log actual errors server-side
- Return generic messages to clients
- Include request IDs for debugging

## Enforcement

- security-boost scanner
- Manual code review
- Regular audits
- Dependency scanning
