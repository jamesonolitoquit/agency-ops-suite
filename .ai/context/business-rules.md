# business-rules.md

Domain logic and operational constraints.

## User Roles

- **Admin:** Full system access, user management
- **Manager:** Team management, report access
- **User:** Personal data access only

## Core Workflows

### User Signup
1. User provides email, password
2. Email verification sent
3. User clicks link to verify
4. Account activated
5. User can login

### Authentication
- JWT tokens valid for 24 hours
- Refresh tokens extend session
- Logout clears tokens

### Permissions

| Role | Can Do | Cannot Do |
|------|--------|-----------|
| Admin | Everything | Nothing restricted |
| Manager | View reports, manage team | Access other teams |
| User | View own data | View others' data |

## Data Policies

- Email addresses unique per user
- Passwords never logged
- Sessions expire after 30 days inactivity
- Deleted data: soft delete (keep 30 days)

## Constraints

- Emails: maximum 100 per minute (rate limit)
- Files: maximum 10MB each
- API: 1000 requests/hour per user

## Compliance

- GDPR: Users can request data export
- Data deletion: Completely removed after 30 days
- Audit logging: All admin actions logged
