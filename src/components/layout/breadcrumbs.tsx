import Link from 'next/link';
import { Fragment } from 'react';

export type Crumb = { label: string; href: string };

// The page's place in the site, written like a path: "~/projects/portfolio-cms". The last part is the current page.
export function Breadcrumbs({ trail, current }: { trail: Crumb[]; current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-sm">
      <ol className="flex flex-wrap items-center text-muted">
        {trail.map((crumb) => (
          <Fragment key={crumb.href}>
            <li>
              <Link href={crumb.href} className="rounded-sm hover:text-accent">
                {crumb.label}
              </Link>
            </li>
            <li aria-hidden="true" className="px-0.5 text-decor">
              /
            </li>
          </Fragment>
        ))}
        <li aria-current="page" className="text-foreground">
          {current}
        </li>
      </ol>
    </nav>
  );
}
