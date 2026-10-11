import { absoluteUrl } from '@/lib/seo/metadata';

import type { MetadataRoute } from 'next';

// Everything may be crawled. Keeping test or preview copies out of search results is decided with hosting.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: absoluteUrl('/sitemap.xml') };
}
