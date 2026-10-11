import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

import { PageSection } from '@/components/layout/page-section';
import { ProjectCard } from '@/features/projects/components/project-card';

import type { Section } from '@/lib/api/public-schemas';

type ProjectsSectionProps = {
  index: number;
  section: Extract<Section, { key: 'projects' }>;
};

// The featured projects; every visible project is on /projects.
export function ProjectsSection({ index, section }: ProjectsSectionProps) {
  const hasMore = section.totalCount > section.items.length;
  return (
    <PageSection id="projects" index={index} label="projects" heading={section.heading}>
      {section.items.length > 0 && (
        <ul className="grid gap-5 md:grid-cols-2">
          {section.items.map((project) => (
            <li key={project.id} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
      {hasMore && (
        <Link
          href="/projects"
          className="mt-8 inline-flex items-center gap-1.5 font-mono text-sm text-accent underline-offset-4 hover:underline"
        >
          View all {section.totalCount} projects
          <ArrowRightIcon aria-hidden="true" className="size-4" />
        </Link>
      )}
    </PageSection>
  );
}
