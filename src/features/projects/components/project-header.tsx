import { CodeIcon, ExternalLinkIcon } from 'lucide-react';

import { TagList } from '@/components/content/tag-list';

import type { Project } from '@/lib/api/public-schemas';

// Title, summary, role, tech and the live site and source links at the top of a project page.
export function ProjectHeader({ project }: { project: Project }) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-5xl">{project.title}</h1>
        {project.summary !== null && <p className="text-lg text-muted">{project.summary}</p>}
      </div>
      {(project.role !== null || project.techStack.length > 0) && (
        <dl className="flex flex-col gap-3 font-mono text-sm">
          {project.role !== null && (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <dt className="w-14 shrink-0 text-muted">role</dt>
              <dd>{project.role}</dd>
            </div>
          )}
          {project.techStack.length > 0 && (
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <dt className="w-14 shrink-0 text-muted">stack</dt>
              <dd>
                <TagList tags={project.techStack} label={`Tech used in ${project.title}`} />
              </dd>
            </div>
          )}
        </dl>
      )}
      {(project.liveUrl !== null || project.repoUrl !== null) && (
        <div className="flex flex-wrap gap-3">
          {project.liveUrl !== null && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent"
            >
              <ExternalLinkIcon aria-hidden="true" className="size-4" />
              Live site
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          {project.repoUrl !== null && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
            >
              <CodeIcon aria-hidden="true" className="size-4" />
              Source
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      )}
    </header>
  );
}
