import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-700/60 bg-slate-900/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Officeless Self-Service Portal</h1>
          <nav className="flex gap-4">
            <Link
              href="/onboarding"
              className="text-slate-300 hover:text-emerald-400"
            >
              Start onboarding
            </Link>
            <Link
              href="/onboarding/status"
              className="text-slate-300 hover:text-emerald-400"
            >
              Check customer status
            </Link>
            <Link
              href="/admin"
              className="text-slate-300 hover:text-emerald-400"
            >
              Admin
            </Link>
            <Link
              href="/terms"
              className="text-slate-300 hover:text-emerald-400"
            >
              Terms & Conditions
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Self-managed Officeless on AWS
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Onboard your company, choose your package and infrastructure profile,
            and get a provisioning plan—all under a $1,000/month AWS infrastructure cap.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            $1,000 refers to infrastructure cost only; Officeless licensing is not included.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/onboarding"
              className="btn-primary inline-flex items-center px-6 py-3"
            >
              Start onboarding
            </Link>
            <Link
              href="/onboarding/status"
              className="btn-secondary inline-flex items-center px-6 py-3"
            >
              Check customer status
            </Link>
            <Link
              href="/admin"
              className="btn-secondary inline-flex items-center px-6 py-3"
            >
              Admin portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
