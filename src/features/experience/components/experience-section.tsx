import { MediaImage } from '@/components/content/media-image';
import { TagList } from '@/components/content/tag-list';
import { PageSection } from '@/components/layout/page-section';
import { Reveal } from '@/components/motion/reveal';
import { currentYearMonth, formatDuration, formatYearMonthRange } from '@/lib/utils/format-date';

import type { Section } from '@/lib/api/public-schemas';

type ExperienceSectionProps = {
  index: number;
  section: Extract<Section, { key: 'experience' }>;
};

// Newest first (the backend's order), as a timeline.
export function ExperienceSection({ index, section }: ExperienceSectionProps) {
  const today = currentYearMonth();
  return (
    <PageSection id="experience" index={index} label="experience" heading={section.heading}>
      <ol className="flex flex-col border-l border-border">
        {section.items.map((job, position) => {
          const duration = formatDuration(job.startDate, job.endDate, today);
          return (
            <Reveal as="li" key={job.id} index={position} className="relative pb-10 pl-6 last:pb-0">
              <span aria-hidden="true" className="absolute top-2 -left-1.5 size-3 rounded-full border-2 border-accent bg-background" />
              <p className="font-mono text-xs text-muted">
                {formatYearMonthRange(job.startDate, job.endDate)}
                {duration !== null && <span> · {duration}</span>}
              </p>
              <div className="mt-2 flex items-center gap-3">
                {job.companyLogo !== null && (
                  <MediaImage
                    image={job.companyLogo}
                    fallbackAlt={`${job.company} logo`}
                    sizes="40px"
                    className="size-10 shrink-0 rounded-md border border-border"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium">{job.role}</h3>
                  <p className="text-muted">
                    {job.companyUrl === null ? (
                      job.company
                    ) : (
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:text-accent hover:underline"
                      >
                        {job.company}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                    {job.location !== null && <span> · {job.location}</span>}
                  </p>
                </div>
              </div>
              {job.summary !== null && <p className="mt-3 max-w-3xl">{job.summary}</p>}
              {job.highlights.length > 0 && (
                <ul className="mt-3 flex max-w-3xl list-disc flex-col gap-1.5 pl-5 marker:text-accent">
                  {job.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <TagList tags={job.techStack} label={`Tech used at ${job.company}`} />
              </div>
            </Reveal>
          );
        })}
      </ol>
    </PageSection>
  );
}
