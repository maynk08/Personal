import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Project not found' };

export default function ProjectNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-24">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-3xl font-medium tracking-tight">Project not found</h1>
      <p className="text-muted">This project does not exist or is no longer shown.</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
        <Link href="/projects" className="text-accent underline underline-offset-4">
          ~/projects
        </Link>
        <Link href="/" className="text-accent underline underline-offset-4">
          ~/ back to the home page
        </Link>
      </div>
    </div>
  );
}
