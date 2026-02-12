'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { id: 'vpc', label: 'Creating VPC and networking' },
  { id: 'eks', label: 'Launching EKS cluster' },
  { id: 'iam', label: 'Configuring IAM and OIDC' },
  { id: 'alb', label: 'Setting up ALB and ingress' },
  { id: 'storage', label: 'Provisioning storage (EFS)' },
  { id: 'finalize', label: 'Finalizing environment' },
];

const DURATION_MS = 18_000; // ~18s total
const STEP_MS = DURATION_MS / STEPS.length;

interface ProvisioningProgressProps {
  onComplete: () => void;
}

export function ProvisioningProgress({ onComplete }: ProvisioningProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const stepIndex = Math.min(
        Math.floor(elapsed / STEP_MS),
        STEPS.length - 1
      );
      setCurrentStep(stepIndex);
      setProgress(Math.min((elapsed / DURATION_MS) * 100, 100));
      if (elapsed >= DURATION_MS) {
        clearInterval(interval);
        onComplete();
      }
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-white">
          Setting up your infrastructure
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          This runs once during first-time creation.
        </p>
        <div className="mt-8 space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-800/50 px-4 py-3 transition-all duration-300"
              style={{
                opacity: i < currentStep ? 0.7 : 1,
                borderColor: i <= currentStep ? 'rgb(16 185 129 / 0.4)' : undefined,
              }}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  i < currentStep
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : i === currentStep
                      ? 'bg-emerald-500/30 text-emerald-300 animate-pulse'
                      : 'bg-slate-700 text-slate-500'
                }`}
              >
                {i < currentStep ? '✓' : i === currentStep ? '⋯' : i + 1}
              </span>
              <span
                className={
                  i <= currentStep ? 'text-slate-200' : 'text-slate-500'
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  );
}
