# Domain & Hosting Operations

Purpose: document operational steps for managing domains, DNS, hosting providers, renewals, and emergency transfer procedures.

1. Account Inventory
- Maintain a secure, shared list of registrar accounts, hosting providers, and DNS credentials in the team password manager. Include recovery contacts and 2FA notes.

2. Renewal Tracking
- Track expiry dates in a central calendar and the `domains` table in the DB. Create automated reminders at 60/30/14/7 days before expiry.

3. DNS Changes
- Use DNS change playbooks for adding records (A, CNAME, TXT). Validate changes with `dig` or `nslookup` and propagate status checks.

4. SSL Certificate Management
- Prefer managed SSL from hosting provider. For manual certificates, document issuance, renewal, and private key storage procedures.

5. Backups & Snapshots
- Ensure daily backups for hosted sites and store snapshots for at least 30 days. Test restore monthly.

6. Emergency Transfer
- Steps to transfer domain: unlock domain, obtain EPP code, initiate transfer at target registrar, confirm via admin email. Notify client and log in `audit_logs`.

7. Monitoring
- Integrate uptime checks (UptimeRobot, Pingdom) and HTTP health checks in `provisioning_runs` outputs. Alert on failures via Slack and email.

8. Hosting Handover
- For client-requested host transfer, prepare export package: DNS exports, CMS exports, database dumps, SSL materials, and deployment run notes.

9. Roles & Permissions
- Define who can perform DNS changes, renewals, and transfers. Use least privilege and record actions in `audit_logs`.
