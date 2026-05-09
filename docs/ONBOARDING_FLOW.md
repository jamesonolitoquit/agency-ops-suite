# Client Onboarding Flow

This flow runs after a client is marked `Won` and payment is confirmed.

1. Invoice & Payment
  - Send invoice (50% upfront). Wait for confirmation before starting onboarding.

2. Send Onboarding Link
  - Link to intake form hosted on landing app -> posts to ops intake.

3. Intake Form captures
  - Company name, primary contact, email, phone, business type
  - Selected package, preferred launch date, estimated budget
  - Asset uploads: logo, brand colors, copy, images (max file size X)
  - Domain/hosting access fields: registrar, username, transfer code

4. Internal checklist created in ops suite
  - Create project entry, assign PM, provisioning run to create site from selected template

5. Asset Review & Gap List
  - PM reviews uploads, requests missing content with deadlines

6. Design/Template selection
  - Choose a template variant and present preview to client for approval

7. Development & QA
  - Implement content, configure DNS on staging, run QA checklist

8. Client Approval
  - Present staging link; capture approval via email or portal

9. Launch
  - Schedule DNS cutover, enable SSL, run post-launch checklist and backups

10. Handoff & Billing
  - Final invoice (remaining balance), handoff docs, maintenance subscription activated if chosen

Checkpoints & Timeboxes
- If assets missing after 14 days, pause project and invoice continuation fee.
