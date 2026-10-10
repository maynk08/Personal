import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-24">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-3xl font-medium tracking-tight">Page not found</h1>
      <p className="text-muted">This page does not exist or has moved.</p>
      <Link href="/" className="font-mono text-sm text-accent underline underline-offset-4">
        ~/ back to the home page
      </Link>
    </div>
  );
}
