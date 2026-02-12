# Officeless Self-Service Portal

Next.js (React) self-service onboarding and admin portal for Officeless AWS deployments. Includes:

- **Package selector** — Student → Enterprise tiers + add-ons (IDR pricing; currency override per deal)
- **Infrastructure profiles** — P0–P4 sizing under **$1,000/month** AWS cap
- **Terraform plan preview** — Mock provisioning; catalog-based resource list and variable overrides
- **Cost estimator** — In-portal monthly estimate (EKS, EC2, NAT, ALB, EBS, EFS) with link to AWS Pricing Calculator
- **Trial cap** — $1,000 AWS cap; soft/hard enforcement options
- **B2B company verification** — Company details, billing/technical contacts; status Pending until admin approval
- **Admin offboarding** — Pause infra (retain DB), Backup DB to S3 (6-month retention), Destroy all

Hosted on **Vercel**. Provisioning is **mock** (no real AWS changes).

## Structure

- **`apps/web`** — Next.js 14 (App Router) UI + API routes
- **`packages/terraform-catalog`** — Terraform module/resource catalog (reference; logic inlined in `apps/web/lib`)
- **`packages/cost-estimator`** — Pricing defaults + estimation engine (reference; logic inlined in `apps/web/lib`)
- **`docs/`** — T&C versions, IAM OIDC example

## Quick start

```bash
# From repo root (installs apps/web only)
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Customer flow:** Home → Start onboarding → Company → Package → Infra profile → AWS mode → Review (generate plan, accept T&C) → Submit → Status
- **Admin:** Home → Admin → Customer list → Manage (approve/reject, pause, backup, destroy)

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start Next.js dev server       |
| `npm run build`| Build Next.js for production   |
| `npm run start`| Start production server        |
| `npm run lint` | Run ESLint                     |

## Data (mock)

All state is in-memory (`apps/web/lib/store.ts`). Replace with **Vercel Postgres** or **Supabase** for production:

- `companies`, `subscriptions`, `admin_actions`, `tac_acceptances`

## API routes

- `POST /api/onboarding/start` — Create company + draft subscription
- `POST /api/onboarding/select-package` — Set package, add-ons, contract months
- `POST /api/onboarding/select-infra-profile` — Set P0–P4
- `POST /api/onboarding/select-aws-mode` — Set mode A/B/C (+ optional role ARN)
- `POST /api/onboarding/generate-plan` — Terraform plan + cost estimate snapshot
- `POST /api/onboarding/submit-for-approval` — Submit + record T&C acceptance
- `GET /api/subscriptions/[id]` — Get subscription + company
- `GET /api/admin/subscriptions` — List all (for admin)
- `POST /api/admin/approve` — Approve or reject onboarding
- `POST /api/admin/pause` — Create pause (retain DB) action
- `POST /api/admin/backup` — Create backup-to-S3 action (6-month retention)
- `POST /api/admin/destroy` — Create destroy action (requires company name confirm)
- `GET /api/admin/actions?subscriptionId=` — List actions for a subscription

## Terms & Conditions

Full T&C (v1.0) is in the portal at **/terms** and in `docs/terms-and-conditions-v1.md`. Acceptance is stored with timestamp and version (mock store).

## AWS onboarding modes

1. **Mode A** — New AWS account (Organizations); best isolation; 5–15 min estimate.
2. **Mode B** — Existing account with credentials (mock: format-only; prefer C).
3. **Mode C** — Existing account with OIDC AssumeRole (recommended); no long-lived keys.

IAM OIDC trust policy example: `docs/iam-oidc-trust-policy.example.json`.

## Infra profiles (under $1,000/mo)

| Profile | Use case              | Nodes / type      | NAT | Storage   |
|---------|------------------------|-------------------|-----|-----------|
| P0      | Trial / sandbox        | 1× t3a.medium     | No  | 50 GB     |
| P1      | Essentials/Starter     | 2× t3a.medium     | 1   | 2× 50 GB  |
| P2      | Starter/Growth         | 2× t3a.large      | 1   | 2× 100 GB |
| P3      | Pro                    | 3× t3a.large      | 1   | 3× 150 GB |
| P4      | Ultimate               | 4–6× t3a.large    | 1   | scaled    |

Portal blocks selection if cost estimate exceeds $1,000/month.

## License

Proprietary — Officeless.
