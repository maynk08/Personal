import 'server-only';

import { absoluteUrl } from '@/lib/seo/metadata';

import type { Profile } from '@/lib/api/public-schemas';

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue | undefined };

// The home page as a profile page about one person, for search engines. Empty values are left out.
export function profilePageJsonLd(profile: Profile): Record<string, JsonLdValue | undefined> {
  const sameAs = profile.socialLinks.filter((link) => link.platform !== 'email').map((link) => link.url);
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl('/'),
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      url: absoluteUrl('/'),
      jobTitle: profile.headline === '' ? undefined : profile.headline,
      image: profile.photo?.url,
      email: profile.publicEmail === null ? undefined : `mailto:${profile.publicEmail}`,
      sameAs: sameAs.length === 0 ? undefined : sameAs,
    },
  };
}

// `<` is escaped so text written in the CMS can never close the script tag.
export function serializeJsonLd(data: Record<string, JsonLdValue | undefined>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: Record<string, JsonLdValue | undefined> }) {
  // Structured data must be inline JSON; serializeJsonLd escapes it (allowed by the Next.js guidelines).
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
