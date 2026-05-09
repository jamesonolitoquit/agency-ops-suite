# Backup Human Operations

Purpose: ensure an on-call human can perform critical tasks if automation fails.

1. Point of Contact
- List the on-call engineers and contact methods (phone, Slack, email). Keep this in the password manager and `README`.

2. Emergency Playbook
- For site down: check uptime monitor, try a soft restart of hosting service, check recent deploys, gather logs, escalate to host support.
- For payment issues: verify webhook delivery, check `billing` records, confirm with client via phone or email.

3. Access & Credentials
- Store credentials in the team's password manager. Include instructions for accessing logs, DB, and hosting control panels.

4. Runbook Steps
- Step 1: Triage — collect incident id, affected client, time, and symptoms.
- Step 2: Mitigate — apply quick fix (rollback, DNS revert, put maintenance page) and notify client.
- Step 3: Resolve — implement permanent fix and document root cause.
- Step 4: Postmortem — write short incident report and update runbooks.

5. Handoff
- If shift ends before resolution, provide a concise status update with remaining actions and blockers.
