import type { ProjectCard } from '@/lib/api/public-schemas';

export type AdjacentProjects = { previous: ProjectCard | null; next: ProjectCard | null };

// The projects before and after `slug` in the admin's order, for the links at the bottom of a project page.
export function findAdjacentProjects(projects: ProjectCard[], slug: string): AdjacentProjects {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) {
    return { previous: null, next: null };
  }
  return { previous: projects[index - 1] ?? null, next: projects[index + 1] ?? null };
}
