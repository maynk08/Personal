import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

import type { AdjacentProjects } from '@/features/projects/utils';

// Links to the previous and next projects in the admin's order, and back to the full list.
export function ProjectPager({ previous, next }: AdjacentProjects) {
  return (
    <nav aria-label="More projects" className="flex flex-col gap-6 border-t border-border pt-8">
      {(previous !== null || next !== null) && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {previous !== null && (
            <li>
              <Link
                href={`/projects/${previous.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:border-accent"
              >
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                  <ArrowLeftIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Previous<span className="sr-only"> project: </span>
                </span>
                <span className="font-medium">{previous.title}</span>
              </Link>
            </li>
          )}
          {next !== null && (
            <li className="sm:col-start-2">
              <Link
                href={`/projects/${next.slug}`}
                className="group flex flex-col items-end gap-1 rounded-xl border border-border p-4 text-right transition-colors hover:border-accent"
              >
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted">
                  Next<span className="sr-only"> project: </span>
                  <ArrowRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="font-medium">{next.title}</span>
              </Link>
            </li>
          )}
        </ul>
      )}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 self-start font-mono text-sm text-accent underline-offset-4 hover:underline"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        All projects
      </Link>
    </nav>
  );
}
