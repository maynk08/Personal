import { ArrowUpRightIcon, CodeIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

import { MediaImage } from '@/components/content/media-image';
import { TagList } from '@/components/content/tag-list';

import type { ProjectCard as ProjectCardData } from '@/lib/api/public-schemas';

// The whole card opens the project's page; the live site and source links sit above that link.
type ProjectCardProps = {
  project: ProjectCardData;
  // The card's title level: 3 under a section heading on the home page, 2 on the projects page.
  headingLevel?: 2 | 3;
  // For the first cards on the projects page, whose covers are the largest thing on the first screen.
  priority?: boolean;
};

export function ProjectCard({ project, headingLevel = 3, priority = false }: ProjectCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="group relative flex w-full flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition duration-200 focus-within:border-accent hover:border-accent motion-safe:hover:-translate-y-0.5">
      {project.coverImage !== null && (
        <MediaImage
          image={project.coverImage}
          fallbackAlt={`${project.title} screenshot`}
          sizes="(min-width: 768px) 520px, 100vw"
          priority={priority}
          className="aspect-video w-full rounded-lg border border-border"
          imageClassName="transition-transform duration-300 motion-safe:group-hover:scale-102"
        />
      )}
      <Heading className="text-lg font-medium">
        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:rounded-xl">
          {project.title}
        </Link>
        <ArrowUpRightIcon
          aria-hidden="true"
          className="ml-1 inline size-4 text-accent transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
        />
      </Heading>
      {project.summary !== null && <p className="text-sm text-muted">{project.summary}</p>}
      <TagList tags={project.techStack} label={`Tech used in ${project.title}`} />
      {(project.liveUrl !== null || project.repoUrl !== null) && (
        <div className="relative z-10 mt-auto flex gap-4 pt-1 font-mono text-xs">
          {project.liveUrl !== null && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-accent"
            >
              <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
              Live site<span className="sr-only"> of {project.title} (opens in a new tab)</span>
            </a>
          )}
          {project.repoUrl !== null && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted hover:text-accent"
            >
              <CodeIcon aria-hidden="true" className="size-3.5" />
              Source<span className="sr-only"> of {project.title} (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}
