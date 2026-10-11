import { ProjectCard } from '@/features/projects/components/project-card';

import type { ProjectCard as ProjectCardData } from '@/lib/api/public-schemas';

// Project cards two to a row on wider screens; cards in a row share its height.
export function ProjectGrid({ projects }: { projects: ProjectCardData[] }) {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id} className="flex">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}
