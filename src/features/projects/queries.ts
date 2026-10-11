import 'server-only';

import { notFound } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { PublicApiNotFoundError, getPublic } from '@/lib/api/public-api';
import { projectCardSchema, projectSchema } from '@/lib/api/public-schemas';

import type { Project, ProjectCard } from '@/lib/api/public-schemas';

// All visible projects in the admin's order, or null while the Projects section is hidden (the backend answers 404).
export const findProjects = cache(async (): Promise<ProjectCard[] | null> => {
  try {
    return await getPublic('/projects', z.array(projectCardSchema));
  } catch (error) {
    if (error instanceof PublicApiNotFoundError) {
      return null;
    }
    throw error;
  }
});

// For the projects pages: a hidden Projects section shows the not-found page.
export async function getProjects(): Promise<ProjectCard[]> {
  return (await findProjects()) ?? notFound();
}

// One project's page; an unknown, hidden or malformed slug shows the not-found page.
export const getProject = cache(async (slug: string): Promise<Project> => {
  try {
    return await getPublic(`/projects/${encodeURIComponent(slug)}`, projectSchema);
  } catch (error) {
    if (error instanceof PublicApiNotFoundError) {
      notFound();
    }
    throw error;
  }
});
