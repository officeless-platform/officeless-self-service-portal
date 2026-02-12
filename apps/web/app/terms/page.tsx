import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions — Officeless Self-Service Portal',
  description: 'Officeless Self-Managed AWS Deployment Terms & Conditions',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-700/60 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-white">
            Officeless Portal
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white">
            Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <article className="card p-8 prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300">
          <h1 className="text-2xl font-bold">
            Officeless Self-Managed AWS Deployment — Terms & Conditions (v1.0)
          </h1>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">1. Definitions</h2>
            <ul>
              <li><strong>“Customer AWS Account”</strong> means the AWS account where Officeless infrastructure will be provisioned.</li>
              <li><strong>“Officeless Portal”</strong> means the self-service onboarding and administration portal.</li>
              <li><strong>“Trial”</strong> means a time-limited evaluation period as defined in the Order Form.</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">2. Commercial Terms</h2>
            <ul>
              <li>Customer agrees to a minimum 6-month contract, paid upfront prior to production provisioning.</li>
              <li>Officeless license fees (package + add-ons) are charged according to the agreed Order Form.</li>
              <li>AWS infrastructure costs are paid by the Customer (either directly to AWS or via pass-through, as agreed).</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">3. Trial Terms</h2>
            <ul>
              <li>Trial includes a limited deployment of Officeless for evaluation.</li>
              <li>Trial AWS infrastructure usage is capped at USD $1,000 (“Trial Cap”).</li>
              <li>If projected spend is expected to exceed the Trial Cap: Customer may approve continuation (paid), or Officeless may pause/non-scale infrastructure to keep within cap.</li>
              <li>Trial does not guarantee production-grade sizing, availability, or performance.</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">4. Provisioning & Access Models</h2>
            <p>Customer may choose one onboarding model:</p>
            <ul>
              <li>New AWS account creation under an agreed organizational structure (if applicable),</li>
              <li>Existing AWS account with credentials, or</li>
              <li>Existing AWS account with OIDC AssumeRole (recommended).</li>
            </ul>
            <p>Customer is responsible for ensuring required permissions and approvals exist.</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">5. Security & Compliance</h2>
            <ul>
              <li>Customer is responsible for AWS account security, billing controls, and security monitoring unless otherwise stated.</li>
              <li>Officeless recommends least-privilege IAM roles and short-lived credentials (OIDC).</li>
              <li>Customer data remains owned by Customer at all times.</li>
              <li>Encryption at rest/in transit will be enabled where supported by selected services/configuration.</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">6. Service Availability</h2>
            <p>The portal provides a self-service experience and status visibility. Provisioning timelines are best-effort; actual timelines depend on Customer approvals and AWS readiness.</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">7. Offboarding & Data Retention</h2>
            <p>Customer may request one of the following:</p>
            <ol className="list-decimal pl-6">
              <li>Temporary shutdown of compute while retaining database (where configured).</li>
              <li>Database backup to S3 with retention up to 6 months, after which backups are automatically deleted.</li>
              <li>Full deletion of infrastructure and databases.</li>
            </ol>
            <p>After deletion, data cannot be recovered unless a backup exists within retention.</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">8. Support Boundaries</h2>
            <p>Support coverage and response times are defined by the support plan in the Order Form. Customer is responsible for third-party dependencies and AWS service limits unless explicitly included.</p>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
            <ul>
              <li>Officeless is not liable for AWS billing overruns caused by Customer-driven usage beyond agreed caps, unless otherwise stated.</li>
              <li>Indirect damages, lost profits, or business interruption are excluded to the maximum extent permitted by law.</li>
            </ul>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-semibold">10. Changes</h2>
            <p>Officeless may update these Terms; changes apply only when a Customer accepts a new version for new orders/renewals.</p>
          </section>

          <p className="mt-10 text-sm text-slate-500">Version 1.0. Acceptance is recorded with timestamp and terms version in the portal.</p>
        </article>
        <div className="mt-8">
          <Link href="/" className="text-emerald-400 hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
