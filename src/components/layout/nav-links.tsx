'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/cn';
import { toPathLabel } from '@/lib/utils/path-label';

import type { Site } from '@/lib/api/public-schemas';

export type NavItem = Site['nav'][number];

type NavLinksProps = {
  items: NavItem[];
  orientation: 'horizontal' | 'vertical';
  onNavigate?: () => void;
};

// Pages outside the home page that belong to a section: on them, that section's link is highlighted.
function isInSection(pathname: string, key: NavItem['key']): boolean {
  return key === 'projects' && (pathname === '/projects' || pathname.startsWith('/projects/'));
}

// Section links: jumps on the home page, links back to the home page's section from anywhere else.
export function NavLinks({ items, orientation, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <ul className={cn('font-mono text-sm', orientation === 'horizontal' ? 'flex items-center gap-1' : 'flex flex-col gap-1')}>
      {items.map((item) => {
        const isCurrent = isInSection(pathname, item.key);
        return (
          <li key={item.key}>
            <a
              href={isHome ? `#${item.key}` : `/#${item.key}`}
              onClick={onNavigate}
              aria-current={isCurrent ? 'true' : undefined}
              className={cn(
                'block rounded-md transition-colors hover:text-foreground',
                isCurrent ? 'text-accent' : 'text-muted',
                orientation === 'horizontal' ? 'px-2.5 py-1.5' : 'px-3 py-2.5',
              )}
            >
              {toPathLabel(item.heading)}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
