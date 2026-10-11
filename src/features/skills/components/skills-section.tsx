import { PageSection } from '@/components/layout/page-section';
import { Reveal } from '@/components/motion/reveal';
import { SkillLogo } from '@/features/skills/components/skill-logo';

import type { Section } from '@/lib/api/public-schemas';

type SkillsSectionProps = {
  index: number;
  section: Extract<Section, { key: 'skills' }>;
};

// Groups as labelled rows of tags; names only, no skill levels.
export function SkillsSection({ index, section }: SkillsSectionProps) {
  return (
    <PageSection id="skills" index={index} label="skills" heading={section.heading}>
      <dl className="flex flex-col gap-6">
        {section.items.map((group, position) => (
          <Reveal key={group.id} index={position} className="grid gap-3 sm:grid-cols-4">
            <dt className="font-mono text-sm text-muted">{group.name}</dt>
            <dd className="sm:col-span-3">
              <ul aria-label={group.name} className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-sm"
                  >
                    <SkillLogo slug={skill.icon} />
                    {skill.name}
                  </li>
                ))}
              </ul>
            </dd>
          </Reveal>
        ))}
      </dl>
    </PageSection>
  );
}
