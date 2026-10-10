import Link from 'next/link';

import { MobileMenu } from '@/components/layout/mobile-menu';
import { NavLinks } from '@/components/layout/nav-links';

import type { Site } from '@/lib/api/public-schemas';

// The hero is the top of the page, so the name takes its place instead of a "~/home" link.
export function SiteHeader({ site }: { site: Site }) {
  const items = site.nav.filter((item) => item.key !== 'hero');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="rounded-md font-mono text-sm font-medium text-foreground">
          {site.name === '' ? 'Portfolio' : site.name}
        </Link>
        <nav aria-label="Sections" className="hidden md:block">
          <NavLinks items={items} orientation="horizontal" />
        </nav>
        <MobileMenu items={items} />
      </div>
    </header>
  );
}
