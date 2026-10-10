import 'server-only';

import { notFound } from 'next/navigation';
import { cache } from 'react';
import { z } from 'zod';

import { PublicApiNotFoundError, getPublic } from '@/lib/api/public-api';
import { projectCardSchema, projectSchema } from '@/lib/api/public-schemas';

import type { Project, ProjectCard } from '@/lib/api/public-schemas';

// All visible projects in the admin's order. A hidden Projects section makes the backend answer 404.
export const getProjects = cache(async (): Promise<ProjectCard[]> => {
  try {
    return await getPublic('/projects', z.array(projectCardSchema));
  } catch (error) {
    if (error instanceof PublicApiNotFoundError) {
      notFound();
    }
    throw error;
  }
});

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
