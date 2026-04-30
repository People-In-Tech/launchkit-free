'use client';

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;
  return (
    <div className="bg-amber-500 text-amber-950 text-center text-sm py-1 px-4 font-medium">
      🎯 Demo Mode — Showing sample data.{' '}
      <a href="/docs/demo-mode" className="underline">
        Learn more
      </a>
    </div>
  );
}
