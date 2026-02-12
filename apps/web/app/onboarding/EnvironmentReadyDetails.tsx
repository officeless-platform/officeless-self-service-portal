'use client';

interface Endpoints {
  dashboardUrl: string;
  apiEndpoint: string;
  awsConsoleUrl: string;
  awsAccountId?: string;
  region?: string;
}

interface EnvironmentReadyDetailsProps {
  envName: string;
  endpoints: Endpoints;
  companyName?: string;
}

export function EnvironmentReadyDetails({
  envName,
  endpoints,
  companyName,
}: EnvironmentReadyDetailsProps) {
  const accessItems = [
    {
      label: 'Status & dashboard',
      value: endpoints.dashboardUrl,
      href: endpoints.dashboardUrl,
      description: 'View onboarding status and environment dashboard',
    },
    {
      label: 'API endpoint',
      value: endpoints.apiEndpoint,
      href: endpoints.apiEndpoint,
      description: 'Base URL for your environment API',
      status: 'healthy' as const,
    },
    {
      label: 'AWS Console',
      value: endpoints.awsConsoleUrl,
      href: endpoints.awsConsoleUrl,
      description: endpoints.awsAccountId
        ? `Sign in to AWS account ${endpoints.awsAccountId}`
        : 'Open AWS Management Console',
    },
  ];

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-slate-800/50 p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          ✓
        </span>
        <h3 className="text-lg font-semibold text-white">Environment ready</h3>
      </div>
      {companyName && (
        <p className="mt-1 text-sm text-slate-400">{companyName} · {envName}</p>
      )}
      <p className="mt-3 text-sm text-slate-300">
        Your infrastructure has been created. Use the links below to access your environment and AWS resources.
      </p>
      <ul className="mt-4 space-y-4">
        {accessItems.map((item) => (
          <li
            key={item.label}
            className="rounded-lg border border-slate-600 bg-slate-900/50 p-4"
          >
            <span className="block text-sm font-medium text-slate-300">
              {item.label}
            </span>
            <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
            {'status' in item && item.status === 'healthy' && (
              <span className="mt-2 inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                API status: Healthy
              </span>
            )}
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block truncate text-sm text-emerald-400 hover:underline"
            >
              {item.value}
            </a>
          </li>
        ))}
      </ul>
      {endpoints.region && (
        <p className="mt-4 text-xs text-slate-500">
          Region: {endpoints.region}
          {endpoints.awsAccountId && ` · Account: ${endpoints.awsAccountId}`}
        </p>
      )}
    </div>
  );
}
