import { findProjects } from '@/features/projects/queries';
import { absoluteUrl } from '@/lib/seo/metadata';

import type { MetadataRoute } from 'next';

// Built per request like every page, so new or hidden projects show up straight away.
export const dynamic = 'force-dynamic';

// The home page, plus the projects pages while the Projects section is visible.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await findProjects();
  const home: MetadataRoute.Sitemap = [{ url: absoluteUrl('/') }];
  if (projects === null) {
    return home;
  }
  const latestUpdate = projects
    .map((project) => project.updatedAt)
    .sort()
    .at(-1);
  return [
    ...home,
    { url: absoluteUrl('/projects'), lastModified: latestUpdate },
    ...projects.map((project) => ({ url: absoluteUrl(`/projects/${project.slug}`), lastModified: project.updatedAt })),
  ];
}
