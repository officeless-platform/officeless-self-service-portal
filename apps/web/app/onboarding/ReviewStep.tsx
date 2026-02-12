'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OFFICELESS_PACKAGES, INFRA_PROFILES, AWS_MODES, MIN_CONTRACT_MONTHS, TRIAL_CAP_USD } from '@/lib/data';

interface ReviewStepProps {
  subscriptionId: string;
  onBack: () => void;
  onComplete: (subscriptionId: string) => void;
}

interface SubData {
  subscription: {
    packageId: string;
    addOns: string[];
    contractMonths: number;
    infraProfileId: string;
    awsMode: string;
    envName: string;
    planSnapshot?: {
      summary: { totalResources: number; byModule: Record<string, number>; variableOverrides: Record<string, unknown>; outputs: Record<string, string> };
      resources: { module: string; type: string }[];
    };
    costEstimateSnapshot?: {
      totalLowUsd: number;
      totalHighUsd: number;
      underCap: boolean;
      drivers: { name: string; monthlyUsd: number }[];
    };
  };
  company: { legalName: string } | null;
}

export function ReviewStep({ subscriptionId, onBack, onComplete }: ReviewStepProps) {
  const [data, setData] = useState<SubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatePlanLoading, setGeneratePlanLoading] = useState(false);
  const [acceptedTc, setAcceptedTc] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`);
      if (cancelled) return;
      if (!res.ok) {
        setError('Failed to load subscription');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  const generatePlan = async () => {
    setGeneratePlanLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });
      if (!res.ok) throw new Error('Failed to generate plan');
      const json = await res.json();
      setData((prev) =>
        prev
          ? {
              ...prev,
              subscription: {
                ...prev.subscription,
                planSnapshot: json.plan,
                costEstimateSnapshot: json.costEstimate,
              },
            }
          : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate plan');
    } finally {
      setGeneratePlanLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!acceptedTc) {
      setError('You must accept the Terms & Conditions.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding/submit-for-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          userId: 'mock-user',
          termsVersion: 'v1.0',
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error?.message ?? 'Failed to submit');
      }
      onComplete(subscriptionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="card p-6">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  const sub = data.subscription;
  const pkg = OFFICELESS_PACKAGES.find((p) => p.id === sub.packageId);
  const infra = INFRA_PROFILES.find((p) => p.id === sub.infraProfileId);
  const awsMode = AWS_MODES.find((m) => m.id === sub.awsMode);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white">Review & submit</h2>
      <p className="mt-1 text-sm text-slate-400">
        Generate a Terraform plan preview, then accept terms and submit for approval.
      </p>

      <div className="mt-6 space-y-6">
        <section>
          <h3 className="font-medium text-slate-200">Company</h3>
          <p className="text-white">{data.company?.legalName ?? '—'}</p>
        </section>
        <section>
          <h3 className="font-medium text-slate-200">Package</h3>
          <p className="text-white">{pkg?.name ?? sub.packageId}</p>
          {sub.addOns.length > 0 && (
            <p className="text-sm text-slate-400">Add-ons: {sub.addOns.join(', ')}</p>
          )}
          <p className="text-sm text-slate-400">Contract: {sub.contractMonths} months (min {MIN_CONTRACT_MONTHS})</p>
        </section>
        <section>
          <h3 className="font-medium text-slate-200">Infrastructure</h3>
          <p className="text-white">{infra?.name ?? sub.infraProfileId}</p>
        </section>
        <section>
          <h3 className="font-medium text-slate-200">AWS mode</h3>
          <p className="text-white">{awsMode?.name ?? sub.awsMode}</p>
        </section>

        {!sub.planSnapshot && (
          <div>
            <button
              type="button"
              onClick={generatePlan}
              disabled={generatePlanLoading}
              className="btn-primary"
            >
              {generatePlanLoading ? 'Generating…' : 'Generate plan & cost estimate'}
            </button>
          </div>
        )}

        {sub.planSnapshot && (
          <>
            <section className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
              <h3 className="font-medium text-slate-200">Terraform plan preview</h3>
              <p className="mt-1 text-white">
                {sub.planSnapshot.summary.totalResources} resources will be created
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {Object.entries(sub.planSnapshot.summary.byModule).map(([mod, count]) => (
                  <li key={mod}>{mod}: {count} resources</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">
                Outputs: {Object.keys(sub.planSnapshot.summary.outputs || {}).join(', ')}
              </p>
            </section>
            {sub.costEstimateSnapshot && (
              <section className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
                <h3 className="font-medium text-slate-200">Cost estimate</h3>
                <p className="mt-1 text-white">
                  ${sub.costEstimateSnapshot.totalLowUsd} – ${sub.costEstimateSnapshot.totalHighUsd} USD/month
                </p>
                {!sub.costEstimateSnapshot.underCap && (
                  <p className="mt-2 text-sm text-amber-400">Exceeds ${TRIAL_CAP_USD} cap</p>
                )}
              </section>
            )}
            <section>
              <h3 className="font-medium text-slate-200">Trial cap</h3>
              <p className="text-sm text-slate-400">
                Trial AWS infrastructure is capped at ${TRIAL_CAP_USD}. Prorated spend to trial end will be shown on the status page.
              </p>
            </section>
          </>
        )}

        <section>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTc}
              onChange={(e) => setAcceptedTc(e.target.checked)}
              className="mt-1 rounded border-slate-600"
            />
            <span className="text-sm text-slate-300">
              I accept the{' '}
              <Link href="/terms" className="text-emerald-400 hover:underline" target="_blank">
                Terms & Conditions
              </Link>{' '}
              (v1.0) and agree to a minimum {MIN_CONTRACT_MONTHS}-month contract.
            </span>
          </label>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-primary"
            disabled={submitting || !sub.planSnapshot || !acceptedTc}
          >
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </div>
      </div>
    </div>
  );
}
