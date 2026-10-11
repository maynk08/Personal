import { MediaImage } from '@/components/content/media-image';
import { PageSection } from '@/components/layout/page-section';
import { formatYearMonthRange } from '@/lib/utils/format-date';

import type { Section } from '@/lib/api/public-schemas';

type EducationSectionProps = {
  index: number;
  section: Extract<Section, { key: 'education' }>;
};

export function EducationSection({ index, section }: EducationSectionProps) {
  return (
    <PageSection id="education" index={index} label="education" heading={section.heading}>
      <ul className="flex flex-col gap-6">
        {section.items.map((entry) => (
          <li key={entry.id} className="flex gap-4">
            {entry.logo !== null && (
              <MediaImage
                image={entry.logo}
                fallbackAlt={`${entry.institution} logo`}
                sizes="48px"
                className="size-12 shrink-0 rounded-md border border-border"
              />
            )}
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-medium">
                {entry.degree}
                {entry.field !== null && <span>, {entry.field}</span>}
              </h3>
              <p className="text-muted">{entry.institution}</p>
              <p className="font-mono text-xs text-muted">
                {formatYearMonthRange(entry.startDate, entry.endDate)}
                {entry.grade !== null && <span> · {entry.grade}</span>}
              </p>
              {entry.description !== null && <p className="mt-1 max-w-3xl">{entry.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </PageSection>
  );
}
