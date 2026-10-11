import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ProjectGrid } from '@/features/projects/components/project-grid';
import { getProjects } from '@/features/projects/queries';
import { getSite } from '@/features/site/queries';
import { pageMetadata, siteName } from '@/lib/seo/metadata';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return pageMetadata({ site, title: 'Projects', description: `Projects by ${siteName(site)}.`, path: '/projects' });
}

// Every visible project in the admin's order. A hidden Projects section shows the not-found page.
export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="flex flex-col gap-10 py-12 sm:py-16">
      <header className="flex flex-col gap-3">
        <Breadcrumbs trail={[{ label: '~', href: '/' }]} current="projects" />
        <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">Projects</h1>
        <p className="text-muted">{projects.length === 1 ? '1 project' : `${projects.length} projects`}</p>
      </header>
      {projects.length > 0 && <ProjectGrid projects={projects} />}
    </div>
  );
}
