'use client';

import { useState, useEffect } from 'react';
import { OFFICELESS_PACKAGES } from '@/lib/data';
import type { PackageId } from '@/lib/data';

interface PackageStepProps {
  subscriptionId: string;
  onNext: () => void;
  onBack: () => void;
}

export function PackageStep({ subscriptionId, onNext, onBack }: PackageStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PackageId>('essentials');
  const [contractMonths, setContractMonths] = useState(6);
  const [addOns, setAddOns] = useState<string[]>([]);

  const handleNext = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/onboarding/select-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          packageId: selected,
          addOns,
          contractMonths,
        }),
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

  const addOnOptions = [
    'App Creators',
    'App Users',
    'Additional tables/records/storage',
    'Workflow execution',
    'App Development (service)',
    'Training (service)',
  ];

  const toggleAddOn = (name: string) => {
    setAddOns((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white">Officeless package</h2>
      <p className="mt-1 text-sm text-slate-400">
        Prices in IDR/month. Currency can be overridden per deal.
      </p>
      <div className="mt-6 space-y-4">
        <div className="grid gap-3">
          {OFFICELESS_PACKAGES.map((pkg) => (
            <label
              key={pkg.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition ${
                selected === pkg.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
              }`}
            >
              <input
                type="radio"
                name="package"
                value={pkg.id}
                checked={selected === pkg.id}
                onChange={() => setSelected(pkg.id)}
                className="sr-only"
              />
              <div>
                <span className="font-medium text-white">{pkg.name}</span>
                <span className="ml-2 text-slate-400">{pkg.description}</span>
              </div>
              <span className="text-slate-300">
                {pkg.monthlyPriceIdr == null
                  ? 'Need assessment'
                  : `Rp ${pkg.monthlyPriceIdr.toLocaleString('id-ID')}/mo`}
              </span>
            </label>
          ))}
        </div>
        <div>
          <label className="label">Add-ons</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {addOnOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleAddOn(opt)}
                className={`rounded-full px-3 py-1 text-sm ${
                  addOns.includes(opt)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Contract length (months, min 6)</label>
          <input
            type="number"
            min={6}
            className="input w-24"
            value={contractMonths}
            onChange={(e) => setContractMonths(Number(e.target.value) || 6)}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack} className="btn-secondary">
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
