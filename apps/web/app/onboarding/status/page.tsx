'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { ProvisioningProgress } from '../ProvisioningProgress';
import { EnvironmentReadyDetails } from '../EnvironmentReadyDetails';

interface SubscriptionStatus {
  status: string;
  envName: string;
  initialSetupShownAt?: string;
  endpoints?: {
    dashboardUrl: string;
    apiEndpoint: string;
    awsConsoleUrl: string;
    awsAccountId?: string;
    region?: string;
  };
  planSnapshot?: { summary: { outputs: Record<string, string> } };
}

function OnboardingStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [statusIdInput, setStatusIdInput] = useState('');
  const [data, setData] = useState<{
    subscription: SubscriptionStatus;
    company: { legalName: string } | null;
  } | null>(null);
  const [loading, setLoading] = useState(!!id);

  const fetchData = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/subscriptions/${id}`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (cancelled) return;
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleProvisioningComplete = useCallback(async () => {
    if (!id) return;
    const res = await fetch('/api/onboarding/provisioning-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: id }),
    });
    if (res.ok) {
      const updated = await res.json();
      setData((prev) =>
        prev
          ? { ...prev, subscription: { ...prev.subscription, ...updated } }
          : { subscription: updated, company: null }
      );
    } else {
      await fetchData();
    }
  }, [id, fetchData]);

  const statusLabel = useMemo(() => {
    if (!data?.subscription) return null;
    const s = data.subscription.status;
    const map: Record<string, string> = {
      draft: 'Draft',
      pending_approval: 'Pending approval',
      approved: 'Approved',
      provisioning: 'Provisioning',
      ready: 'Ready',
      rejected: 'Rejected',
    };
    return map[s] ?? s;
  }, [data?.subscription?.status]);

  if (!id) {
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
        <main className="mx-auto max-w-lg px-6 py-16">
          <h1 className="text-xl font-semibold text-white">View onboarding status</h1>
          <p className="mt-1 text-slate-400">
            Enter your subscription ID to see provisioning progress and environment details.
          </p>
          <div className="mt-6">
            <label htmlFor="status-id" className="label">
              Subscription ID
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="status-id"
                type="text"
                placeholder="e.g. sub-1"
                value={statusIdInput}
                onChange={(e) => setStatusIdInput(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (statusIdInput) router.push(`/onboarding/status?id=${encodeURIComponent(statusIdInput)}`);
                  }
                }}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  if (statusIdInput) router.push(`/onboarding/status?id=${encodeURIComponent(statusIdInput)}`);
                }}
                disabled={!statusIdInput}
                className="btn-primary"
              >
                View status
              </button>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            You received this ID when you started onboarding (e.g. sub-1, sub-2).
          </p>
          <Link href="/onboarding" className="mt-6 inline-block text-emerald-400 hover:underline">
            Start a new onboarding →
          </Link>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16">
        <div className="mx-auto max-w-lg text-center text-slate-400">Loading…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-slate-400">Subscription not found.</p>
          <Link href="/" className="mt-4 inline-block text-emerald-400 hover:underline">
            Home
          </Link>
        </div>
      </div>
    );
  }

  const sub = data.subscription;

  // One-time: show provisioning progress animation when status is provisioning and not yet shown
  if (sub.status === 'provisioning' && !sub.initialSetupShownAt) {
    return <ProvisioningProgress onComplete={handleProvisioningComplete} />;
  }

  const outputs = sub.planSnapshot?.summary?.outputs ?? {};
  const showReadyDetails = sub.status === 'ready' && sub.endpoints;

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
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="card p-6">
          <h1 className="text-xl font-semibold text-white">Onboarding status</h1>
          <p className="mt-1 text-slate-400">{data.company?.legalName ?? '—'}</p>
          <div className="mt-6">
            <span className="label">Status</span>
            <p className="mt-1 text-lg font-medium text-white">{statusLabel}</p>
            <p className="mt-2 text-sm text-slate-400">
              Environment: {sub.envName}. Provisioning is mock; no real AWS resources are created.
            </p>
          </div>

          {showReadyDetails && sub.endpoints && (
            <div className="mt-6">
              <EnvironmentReadyDetails
                envName={sub.envName}
                endpoints={sub.endpoints}
                companyName={data.company?.legalName ?? undefined}
              />
            </div>
          )}

          {!showReadyDetails && Object.keys(outputs).length > 0 && (
            <div className="mt-6 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
              <h3 className="font-medium text-slate-200">Outputs (mock)</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {Object.entries(outputs).map(([k, v]) => (
                  <li key={k}>
                    <span className="text-slate-500">{k}:</span> {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8">
            <Link href="/" className="text-emerald-400 hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OnboardingStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 px-6 py-16">
          <div className="mx-auto max-w-lg text-center text-slate-400">Loading…</div>
        </div>
      }
    >
      <OnboardingStatusContent />
    </Suspense>
  );
}
