import { getProject } from '@/features/projects/queries';
import { getSite } from '@/features/site/queries';
import { siteName } from '@/lib/seo/metadata';
import { SHARE_IMAGE_SIZE, renderShareImage } from '@/lib/seo/share-image';

export const alt = 'Project title, summary and tech stack';
export const size = SHARE_IMAGE_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

// A hidden or unknown project has no share image (not found), like its page.
export default async function ProjectShareImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [site, project] = await Promise.all([getSite(), getProject(slug)]);
  return renderShareImage({
    theme: site.theme,
    label: `~/projects/${project.slug}`,
    title: project.title,
    description: project.summary,
    footer: siteName(site),
    tags: project.techStack,
  });
}
