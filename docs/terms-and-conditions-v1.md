# Officeless Self-Managed AWS Deployment — Terms & Conditions (v1.0)

Store acceptance with timestamp + version in the portal (`tac_acceptances` table).

## 1. Definitions

- **"Customer AWS Account"** means the AWS account where Officeless infrastructure will be provisioned.
- **"Officeless Portal"** means the self-service onboarding and administration portal.
- **"Trial"** means a time-limited evaluation period as defined in the Order Form.

## 2. Commercial Terms

- Customer agrees to a minimum 6-month contract, paid upfront prior to production provisioning.
- Officeless license fees (package + add-ons) are charged according to the agreed Order Form.
- AWS infrastructure costs are paid by the Customer (either directly to AWS or via pass-through, as agreed).

## 3. Trial Terms

- Trial includes a limited deployment of Officeless for evaluation.
- Trial AWS infrastructure usage is capped at USD $1,000 ("Trial Cap").
- If projected spend is expected to exceed the Trial Cap:
  - Customer may approve continuation (paid),
  - or Officeless may pause/non-scale infrastructure to keep within cap.
- Trial does not guarantee production-grade sizing, availability, or performance.

## 4. Provisioning & Access Models

Customer may choose one onboarding model:

- New AWS account creation under an agreed organizational structure (if applicable),
- Existing AWS account with credentials, or
- Existing AWS account with OIDC AssumeRole (recommended).

Customer is responsible for ensuring required permissions and approvals exist.

## 5. Security & Compliance

- Customer is responsible for AWS account security, billing controls, and security monitoring unless otherwise stated.
- Officeless recommends least-privilege IAM roles and short-lived credentials (OIDC).
- Customer data remains owned by Customer at all times.
- Encryption at rest/in transit will be enabled where supported by selected services/configuration.

## 6. Service Availability

The portal provides a self-service experience and status visibility. Provisioning timelines are best-effort; actual timelines depend on Customer approvals and AWS readiness.

## 7. Offboarding & Data Retention

Customer may request one of the following:

1. Temporary shutdown of compute while retaining database (where configured).
2. Database backup to S3 with retention up to 6 months, after which backups are automatically deleted.
3. Full deletion of infrastructure and databases.

After deletion, data cannot be recovered unless a backup exists within retention.

## 8. Support Boundaries

Support coverage and response times are defined by the support plan in the Order Form. Customer is responsible for third-party dependencies and AWS service limits unless explicitly included.

## 9. Limitation of Liability

- Officeless is not liable for AWS billing overruns caused by Customer-driven usage beyond agreed caps, unless otherwise stated.
- Indirect damages, lost profits, or business interruption are excluded to the maximum extent permitted by law.

## 10. Changes

Officeless may update these Terms; changes apply only when a Customer accepts a new version for new orders/renewals.
