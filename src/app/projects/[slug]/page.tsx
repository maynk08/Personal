import { HighlightedMarkdown } from '@/components/content/highlighted-markdown';
import { MediaImage } from '@/components/content/media-image';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Reveal } from '@/components/motion/reveal';
import { ProjectGallery } from '@/features/projects/components/project-gallery';
import { ProjectHeader } from '@/features/projects/components/project-header';
import { ProjectPager } from '@/features/projects/components/project-pager';
import { getProject, getProjects } from '@/features/projects/queries';
import { findAdjacentProjects } from '@/features/projects/utils';
import { getSite } from '@/features/site/queries';
import { pageMetadata, siteName } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const [site, project] = await Promise.all([getSite(), getProject(slug)]);
  return pageMetadata({
    site,
    title: project.title,
    description: project.summary ?? `${project.title}, a project by ${siteName(site)}.`,
    path: `/projects/${project.slug}`,
  });
}

// One project, laid out like documentation: header, cover, description, screenshots, then the neighbouring projects.
export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10 py-12 sm:py-16">
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          trail={[
            { label: '~', href: '/' },
            { label: 'projects', href: '/projects' },
          ]}
          current={project.slug}
        />
        <ProjectHeader project={project} />
      </div>
      {project.coverImage !== null && (
        <MediaImage
          image={project.coverImage}
          fallbackAlt={`${project.title} screenshot`}
          sizes="(min-width: 768px) 768px, 100vw"
          priority
          className="aspect-video w-full rounded-xl border border-border"
        />
      )}
      {project.description !== null && (
        <Reveal>
          <HighlightedMarkdown markdown={project.description} />
        </Reveal>
      )}
      <ProjectGallery title={project.title} images={project.gallery} />
      <Reveal>
        <ProjectPager {...findAdjacentProjects(projects, project.slug)} />
      </Reveal>
    </article>
  );
}
