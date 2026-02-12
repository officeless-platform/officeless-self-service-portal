'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';

interface CompanyInfo {
  legalName: string;
  registrationNumber?: string;
  address?: string;
}

interface SubscriptionInfo {
  id: string;
  envName: string;
  status: string;
  paused?: boolean;
  destroyed?: boolean;
}

function MockAppLoginContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscriptionId');
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(!!subscriptionId);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!subscriptionId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/subscriptions/${subscriptionId}`);
        if (res.ok) {
          const data = await res.json();
          setCompany(data.company ?? null);
          setSubscription(data.subscription ? { id: data.subscription.id, envName: data.subscription.envName, status: data.subscription.status, paused: data.subscription.paused, destroyed: data.subscription.destroyed } : null);
        } else {
          setCompany(null);
          setSubscription(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [subscriptionId]);

  if (!subscriptionId) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
        <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white">Application login</h1>
          <p className="mt-2 text-sm text-slate-400">Use the link from your onboarding status or environment details to sign in.</p>
          <Link href="/onboarding/status" className="mt-6 inline-block text-emerald-400 hover:underline">View onboarding status →</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (loggedIn && company && subscription) {
    return (
      <div className="min-h-screen bg-slate-950">
        <header className="border-b border-slate-700/60 bg-slate-900/50 px-6 py-4">
          <div className="mx-auto max-w-4xl flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Application</span>
            <button
              type="button"
              onClick={() => setLoggedIn(false)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="text-2xl font-semibold text-white">Welcome, {company.legalName}</h1>
          <p className="mt-1 text-slate-400">Signed in to your application.</p>
          <div className="mt-8 rounded-xl border border-slate-600 bg-slate-800/50 p-6">
            <h2 className="font-medium text-slate-200">Company details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="text-slate-500">Legal name</dt>
                <dd className="text-white">{company.legalName}</dd>
              </div>
              {company.registrationNumber && (
                <div>
                  <dt className="text-slate-500">Registration number</dt>
                  <dd className="text-white">{company.registrationNumber}</dd>
                </div>
              )}
              {company.address && (
                <div>
                  <dt className="text-slate-500">Address</dt>
                  <dd className="text-white">{company.address}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Subscription ID</dt>
                <dd className="font-mono text-white">{subscription.id}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Environment</dt>
                <dd className="text-white">{subscription.envName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="text-white">{subscription.status}</dd>
              </div>
            </dl>
          </div>
          <Link href={`/onboarding/status?id=${subscriptionId}`} className="mt-6 inline-block text-emerald-400 hover:underline">
            ← Back to onboarding status
          </Link>
        </main>
      </div>
    );
  }

  if (!loading && subscriptionId && !subscription) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
        <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white">Subscription not found</h1>
          <p className="mt-2 text-sm text-slate-400">Invalid or expired link.</p>
          <Link href="/onboarding/status" className="mt-6 inline-block text-emerald-400 hover:underline">View onboarding status →</Link>
        </div>
      </div>
    );
  }

  const isActive = subscription && subscription.status === 'ready' && !subscription.paused && !subscription.destroyed;

  if (subscription && !isActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
        <div className="rounded-xl border border-amber-600/50 bg-amber-500/10 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white">Application not available</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your subscription is not active. Sign-in is only available when the environment is ready and not paused or destroyed.
          </p>
          {subscription.paused && <p className="mt-2 text-sm text-amber-400">Environment is paused.</p>}
          {subscription.destroyed && <p className="mt-2 text-sm text-red-400">Environment has been destroyed.</p>}
          {subscription.status !== 'ready' && !subscription.destroyed && <p className="mt-2 text-sm text-slate-400">Current status: {subscription.status}</p>}
          <Link href={`/onboarding/status?id=${subscriptionId}`} className="mt-6 inline-block text-emerald-400 hover:underline">View onboarding status →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6">
      <div className="rounded-xl border border-slate-600 bg-slate-800/50 p-8 max-w-md w-full">
        <h1 className="text-xl font-semibold text-white">Sign in to your application</h1>
        {company && (
          <p className="mt-2 text-sm text-slate-400">
            Company: <span className="text-slate-300">{company.legalName}</span>
          </p>
        )}
        {subscription && (
          <p className="mt-1 text-xs text-slate-500">
            Environment: {subscription.envName} · {subscription.id}
          </p>
        )}
        <button
          type="button"
          onClick={() => setLoggedIn(true)}
          className="btn-primary mt-6 w-full"
        >
          Sign in
        </button>
        <p className="mt-4 text-xs text-slate-500 text-center">
          Mock login. No password required.
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-emerald-400 hover:underline">
          ← Officeless Portal
        </Link>
      </div>
    </div>
  );
}

export default function MockAppLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><p className="text-slate-400">Loading…</p></div>}>
      <MockAppLoginContent />
    </Suspense>
  );
}
