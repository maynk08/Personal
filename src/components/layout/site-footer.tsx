import { ArrowUpIcon } from 'lucide-react';

import { SocialLinks } from '@/components/layout/social-links';

import type { Site } from '@/lib/api/public-schemas';

export function SiteFooter({ site }: { site: Site }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-mono text-sm text-muted">
          © {year} {site.name}
        </p>
        <SocialLinks links={site.socialLinks} />
        <a href="#top" className="inline-flex items-center gap-1.5 rounded-md font-mono text-sm text-muted hover:text-foreground">
          <ArrowUpIcon aria-hidden="true" className="size-4" />
          Back to top
        </a>
      </div>
    </footer>
  );
}
