'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CompanyStep } from './CompanyStep';
import { PackageStep } from './PackageStep';
import { InfraStep } from './InfraStep';
import { AwsModeStep } from './AwsModeStep';
import { ReviewStep } from './ReviewStep';

const STEPS = [
  { id: 'company', title: 'Company' },
  { id: 'package', title: 'Package' },
  { id: 'infra', title: 'Infrastructure' },
  { id: 'aws', title: 'AWS mode' },
  { id: 'review', title: 'Review' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const handleStart = (cid: string, sid: string) => {
    setCompanyId(cid);
    setSubscriptionId(sid);
    setStep(1);
  };

  const handleComplete = (sid: string) => {
    router.push(`/onboarding/status?id=${sid}`);
  };

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
        <ul className="mb-10 flex justify-between gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={
                i === step
                  ? 'font-medium text-emerald-400'
                  : i < step
                    ? 'text-slate-500'
                    : 'text-slate-600'
              }
            >
              {i + 1}. {s.title}
            </li>
          ))}
        </ul>

        {step === 0 && (
          <CompanyStep onSuccess={handleStart} />
        )}
        {step === 1 && subscriptionId && (
          <PackageStep
            subscriptionId={subscriptionId}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && subscriptionId && (
          <InfraStep
            subscriptionId={subscriptionId}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && subscriptionId && (
          <AwsModeStep
            subscriptionId={subscriptionId}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && subscriptionId && (
          <ReviewStep
            subscriptionId={subscriptionId}
            onBack={() => setStep(3)}
            onComplete={handleComplete}
          />
        )}
      </main>
    </div>
  );
}
