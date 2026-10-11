import { env } from '@/config/env';
import { getSite } from '@/features/site/queries';
import { siteName } from '@/lib/seo/metadata';
import { SHARE_IMAGE_SIZE, renderShareImage } from '@/lib/seo/share-image';

export const alt = 'Name, headline and photo of the site owner';
export const size = SHARE_IMAGE_SIZE;
export const contentType = 'image/png';
// Content comes from the CMS, so the image is made per request like the pages.
export const dynamic = 'force-dynamic';

export default async function HomeShareImage() {
  const site = await getSite();
  return renderShareImage({
    theme: site.theme,
    label: '~/',
    title: siteName(site),
    description: site.headline,
    // The site's address, since the name is already the title.
    footer: new URL(env.siteUrl).host,
    photoUrl: site.photo?.url ?? null,
  });
}
