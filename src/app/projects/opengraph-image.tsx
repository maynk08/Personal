import { getSite } from '@/features/site/queries';
import { siteName } from '@/lib/seo/metadata';
import { SHARE_IMAGE_SIZE, renderShareImage } from '@/lib/seo/share-image';

export const alt = 'Projects, with the site owner’s name';
export const size = SHARE_IMAGE_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function ProjectsShareImage() {
  const site = await getSite();
  const name = siteName(site);
  return renderShareImage({ theme: site.theme, label: '~/projects', title: 'Projects', description: `Projects by ${name}.`, footer: name });
}
