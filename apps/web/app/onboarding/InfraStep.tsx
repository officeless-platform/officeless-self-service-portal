'use client';

import { useState, useEffect } from 'react';
import { INFRA_PROFILES } from '@/lib/data';
import type { InfraProfileId } from '@/lib/data';
import { estimate } from '@/lib/cost-estimator';
import { INFRA_PROFILE_OVERRIDES } from '@/lib/terraform-catalog';

interface InfraStepProps {
  subscriptionId: string;
  onNext: () => void;
  onBack: () => void;
}

export function InfraStep({ subscriptionId, onNext, onBack }: InfraStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<InfraProfileId>('P1');
  const [estimateResult, setEstimateResult] = useState<ReturnType<typeof estimate> | null>(null);

  useEffect(() => {
    const overrides = INFRA_PROFILE_OVERRIDES[selected];
    if (!overrides) return;
    const result = estimate({
      profileId: selected,
      nodeInstanceType: overrides.instance_types[0] ?? 't3a.medium',
      nodeCount: overrides.desired,
      diskSizeGbPerNode: overrides.disk_size,
      natEnabled: overrides.nat_enabled,
      albEnabled: true,
      efsEnabled: overrides.efs_enabled,
      efsSizeGb: overrides.efs_enabled ? 50 : 0,
      vpnEnabled: overrides.vpn_enabled,
    });
    setEstimateResult(result);
  }, [selected]);

  const handleNext = async () => {
    if (estimateResult && !estimateResult.underCap) {
      setError(estimateResult.capReason ?? 'Estimate exceeds $1,000/month cap.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/select-infra-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, infraProfileId: selected }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? 'Failed to save');
      }
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white">Infrastructure profile</h2>
      <p className="mt-1 text-sm text-slate-400">
        AWS sizing under $1,000/month. Estimate is shown per profile.
      </p>
      <div className="mt-6 space-y-4">
        <div className="grid gap-3">
          {INFRA_PROFILES.map((profile) => (
            <label
              key={profile.id}
              className={`flex cursor-pointer flex-col rounded-lg border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                selected === profile.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="infra"
                value={profile.id}
                checked={selected === profile.id}
                onChange={() => setSelected(profile.id)}
                className="sr-only"
              />
              <div>
                <span className="font-medium text-white">{profile.name}</span>
                <p className="mt-1 text-sm text-slate-400">{profile.description}</p>
                <p className="mt-1 text-xs text-slate-500">Target: {profile.targetPackages}</p>
              </div>
            </label>
          ))}
        </div>
        {estimateResult && (
          <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-4">
            <h3 className="font-medium text-slate-200">Cost estimate (USD/month)</h3>
            <p className="mt-2 text-2xl font-semibold text-white">
              ${estimateResult.totalLowUsd} – ${estimateResult.totalHighUsd}
            </p>
            {!estimateResult.underCap && (
              <p className="mt-2 text-sm text-amber-400">{estimateResult.capReason}</p>
            )}
            <ul className="mt-3 space-y-1 text-sm text-slate-400">
              {estimateResult.drivers.map((d) => (
                <li key={d.name}>
                  {d.name}: ${d.monthlyUsd.toFixed(2)}
                </li>
              ))}
            </ul>
            <a
              href="https://calculator.aws/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-emerald-400 hover:underline"
            >
              Verify with AWS Pricing Calculator →
            </a>
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
            disabled={loading || (estimateResult !== null && !estimateResult.underCap)}
          >
            {loading ? 'Saving…' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
