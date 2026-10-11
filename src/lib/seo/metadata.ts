import 'server-only';

import { env } from '@/config/env';

import type { Site } from '@/lib/api/public-schemas';
import type { Metadata } from 'next';

// Browser bar colour per theme: the page background.
export const THEME_COLORS = { dark: '#0B0D10', light: '#FAFAF7' } as const;

export function siteName(site: Pick<Site, 'name'>): string {
  return site.name === '' ? 'Portfolio' : site.name;
}

// The site's description wherever a page has none of its own.
export function siteDescription(site: Pick<Site, 'name' | 'headline'>): string {
  return site.headline === '' ? `Portfolio of ${siteName(site)}.` : site.headline;
}

// `path` starts with "/".
export function absoluteUrl(path: string): string {
  return `${env.siteUrl}${path}`;
}

type PageMetadataInput = {
  site: Pick<Site, 'name' | 'headline'>;
  // Shown before the site name ("Projects · Ada Lovelace"); the home page has none.
  title: string | null;
  description: string;
  path: string;
};

/**
 * Title, description, canonical address and share-preview tags for one page. The share image comes from the
 * page's `opengraph-image` file, which Next.js adds to these tags.
 */
export function pageMetadata({ site, title, description, path }: PageMetadataInput): Metadata {
  const name = siteName(site);
  const fullTitle = title === null ? name : `${title} · ${name}`;
  return {
    title: title === null ? { absolute: name } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: name, title: fullTitle, description, url: path, locale: 'en' },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
  };
}
