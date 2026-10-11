import { Reveal } from '@/components/motion/reveal';
import { ProjectCard } from '@/features/projects/components/project-card';

import type { ProjectCard as ProjectCardData } from '@/lib/api/public-schemas';

// How many leading cards load their covers first: one row on wider screens.
const PRIORITY_CARDS = 2;

type ProjectGridProps = {
  projects: ProjectCardData[];
  // True on the projects page: cards are the page's main content (h2 titles, first covers loaded first).
  isPageContent?: boolean;
};

// Project cards two to a row on wider screens; cards in a row share its height.
export function ProjectGrid({ projects, isPageContent = false }: ProjectGridProps) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {projects.map((project, position) => (
        <Reveal as="li" key={project.id} index={position} className="flex">
          <ProjectCard project={project} headingLevel={isPageContent ? 2 : 3} priority={isPageContent && position < PRIORITY_CARDS} />
        </Reveal>
      ))}
    </ul>
  );
}
