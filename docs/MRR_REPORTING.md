# MRR Reporting

Overview
- Monthly Recurring Revenue (MRR) is calculated as the sum of `monthly_fee` for all `clients` with `status = 'active'`.

API
- A lightweight endpoint exists at `/api/reports/mrr` which returns `{ mrr, activeClients }`.

Automation
- Schedule a monthly report run that calls the endpoint and stores snapshots in the `report_runs` table.
- Use `report_runs` to track historical MRR and generate charts in the admin dashboard.

Next steps
- Add currency support and handle pro-rated invoices, trial periods, and discounts in future iterations.
