# Secrets Inventory & Rotation Schedule
## Agency Ops Suite - CONFIDENTIAL
**DO NOT COMMIT THIS FILE - Store in 1Password or similar**

---

## PRODUCTION SECRETS

| Secret Name | Type | Owner | Last Rotated | Rotation Schedule | Notes |
|------------|------|-------|--------------|------------------|-------|
| SUPABASE_SERVICE_ROLE_KEY | Database | [Your name] | 2026-05-11 | Q1 (quarterly) | DO NOT EXPOSE - Server only |
| STRIPE_SECRET_KEY | Payment | [Your name] | 2026-05-11 | Q1 (quarterly) | Test before rotate |
| STRIPE_WEBHOOK_SECRET | Payment | [Your name] | 2026-05-11 | Q1 (quarterly) | Update webhook endpoint in Stripe |
| RESEND_API_KEY | Email | [Your name] | 2026-05-11 | Q1 (quarterly) | Update .env immediately |
| INTAKE_WEBHOOK_SECRET | API Auth | [Your name] | 2026-05-11 | Monthly | Rotate without downtime |
| NEXT_PUBLIC_SUPABASE_URL | Database | [Your name] | N/A (config) | Never | Public URL, not sensitive |

---

## STAGING SECRETS

| Secret Name | Owner | Last Rotated | Purpose | Status |
|------------|-------|--------------|---------|--------|
| SUPABASE_SERVICE_ROLE_KEY (staging) | [Your name] | 2026-05-11 | Staging DB access | ⏳ Configure |
| STRIPE_SECRET_KEY (test) | [Your name] | 2026-05-11 | Test payments | ⏳ Configure |
| RESEND_API_KEY (staging) | [Your name] | 2026-05-11 | Staging emails | ⏳ Configure |
| INTAKE_WEBHOOK_SECRET (staging) | [Your name] | 2026-05-11 | Staging lead API | ⏳ Configure |

---

## KEY LOCATION & ACCESS

### Where Secrets Are Stored

```
Production Secrets:
  ├─ Vercel dashboard (encrypted)
  ├─ 1Password [Company Vault]
  └─ Local: NEVER in git, only .env.local during setup

Staging Secrets:
  ├─ Vercel dashboard (encrypted)
  ├─ 1Password [Staging Vault]
  └─ Local: .env.staging.local (git-ignored)

Never:
  ❌ Slack
  ❌ Email
  ❌ GitHub (even private repos)
  ❌ Unencrypted files
```

### Who Has Access

```
Production Database:
  - [Your name] (owner)
  - [Team member] (admin) - if applicable

Stripe Account:
  - [Your name] (owner)
  - [Team member] (staff) - if applicable

Vercel Dashboard:
  - [Your name] (owner)
  - [Team member] (member) - if applicable
```

---

## ROTATION PROCEDURES

### Monthly: INTAKE_WEBHOOK_SECRET

**Why:** Minimize impact if lead form is compromised

**Steps:**
1. Generate new secret: `openssl rand -hex 24`
2. Update in Vercel: Settings → Environment Variables
3. Redeploy production
4. Verify form still works (test submission)
5. Update public form with new secret header
6. Archive old secret in 1Password
7. Log rotation in this file

**Time:** 15 minutes  
**Downtime:** None (app restart only)

### Quarterly: Stripe & Supabase Keys

**Why:** Best practice security rotation

**Schedule:**
- Q1: January 10
- Q2: April 10
- Q3: July 10
- Q4: October 10

**Stripe Rotation:**
1. Login to Stripe dashboard
2. Settings → API Keys
3. Generate new secret key (keep old one active)
4. Update Vercel env var
5. Redeploy and monitor
6. Delete old key from Stripe
7. Update SECRETS_INVENTORY.md

**Time:** 30 minutes  
**Downtime:** None (Vercel redeploy automatic)

**Supabase Rotation:**
1. Login to Supabase
2. Settings → API
3. Generate new service role key
4. Update Vercel env var
5. Redeploy
6. Verify database access works
7. Revoke old key
8. Update SECRETS_INVENTORY.md

**Time:** 30 minutes  
**Downtime:** None (automatic)

---

## EMERGENCY PROCEDURES

### If Secret Is Compromised

**Immediate (5 min):**
1. ⚠️ STOP everything - don't continue with scheduled work
2. Rotate the compromised secret immediately
3. Check access logs: Did someone use the old secret?
4. Notify team immediately

**Short-term (30 min):**
1. Redeploy application with new secret
2. Monitor for unusual activity
3. Check Stripe/Supabase logs
4. Create incident report

**Long-term (1-24 hours):**
1. Root cause analysis: How was it exposed?
2. Security audit: Are other secrets at risk?
3. Update procedures to prevent recurrence
4. Notify customers if payment data affected

---

## BACKUP PROCEDURES

### Secrets Backup Location

```
Primary: Vercel dashboard (encrypted)
Backup 1: 1Password (encrypted, team accessible)
Backup 2: Encrypted USB drive (offline)
```

### Verification Checklist (Monthly)

- [ ] Can you access Vercel secrets?
- [ ] Can you access 1Password secrets?
- [ ] Are production and staging secrets different?
- [ ] Are all keys current (not old/revoked)?
- [ ] Is backup USB still encrypted?

---

## AUDIT LOG

| Date | Secret | Action | Who | Reason |
|------|--------|--------|-----|--------|
| 2026-05-11 | INTAKE_WEBHOOK_SECRET | Created | [Your name] | Initial setup |
| 2026-05-11 | All Stripe keys | Created | [Your name] | Initial setup |
| 2026-05-11 | All Supabase keys | Created | [Your name] | Initial setup |
| [Future] | INTAKE_WEBHOOK_SECRET | Rotated | [Your name] | Monthly rotation |

---

## CHECKLIST: Secrets Setup

- [ ] **Production secrets created**
  - [ ] Supabase service role key generated
  - [ ] Stripe keys generated (live mode)
  - [ ] Resend API key created
  - [ ] All added to Vercel environment

- [ ] **Staging secrets created**
  - [ ] Supabase staging project created
  - [ ] Stripe test keys copied
  - [ ] Resend staging key created
  - [ ] All added to Vercel staging environment

- [ ] **Secrets protected**
  - [ ] No secrets in git history
  - [ ] .env.example created (no values)
  - [ ] .gitignore configured
  - [ ] 1Password vault created and secured
  - [ ] Offline backup created

- [ ] **Access documented**
  - [ ] Team knows who has access to what
  - [ ] Rotation schedule documented
  - [ ] Emergency procedures known
  - [ ] Audit trail started

- [ ] **Rotation schedule set**
  - [ ] Monthly: INTAKE_WEBHOOK_SECRET (calendar reminder)
  - [ ] Q1: Stripe/Supabase keys (Jan 10)
  - [ ] Q2: Stripe/Supabase keys (Apr 10)
  - [ ] Q3: Stripe/Supabase keys (Jul 10)
  - [ ] Q4: Stripe/Supabase keys (Oct 10)

---

## APPENDIX: How to Safely Share Secrets With Team

**Scenario:** New team member needs access

**Process:**
1. Create 1Password shared vault
2. Add team member to vault (via 1Password)
3. DO NOT send secrets via email/chat
4. DO NOT copy-paste into messages
5. Team member accesses directly from 1Password
6. No secrets stored locally on personal devices

---

**Document Status:** Template (Update with actual values from your setup)  
**Last Updated:** May 11, 2026  
**Next Review:** May 18, 2026 (after staging setup)

**⚠️ CONFIDENTIAL - Store securely, never commit to git**
