import { BriefcaseBusinessIcon, LanguagesIcon, MapPinIcon } from 'lucide-react';

import { Markdown } from '@/components/content/markdown';
import { MediaImage } from '@/components/content/media-image';
import { PageSection } from '@/components/layout/page-section';
import { Reveal } from '@/components/motion/reveal';

import type { Profile } from '@/lib/api/public-schemas';
import type { LucideIcon } from 'lucide-react';

type AboutSectionProps = {
  index: number;
  heading: string;
  profile: Profile;
};

function details(profile: Profile): { icon: LucideIcon; text: string }[] {
  const languages = profile.languages.map((language) =>
    language.proficiency === null ? language.name : `${language.name} (${language.proficiency})`,
  );
  return [
    profile.location === null ? null : { icon: MapPinIcon, text: profile.location },
    profile.yearsOfExperience === null
      ? null
      : {
          icon: BriefcaseBusinessIcon,
          text: `${profile.yearsOfExperience} ${profile.yearsOfExperience === 1 ? 'year' : 'years'} of experience`,
        },
    languages.length === 0 ? null : { icon: LanguagesIcon, text: languages.join(', ') },
  ].filter((detail) => detail !== null);
}

export function AboutSection({ index, heading, profile }: AboutSectionProps) {
  const chips = details(profile);
  return (
    <PageSection id="about" index={index} label="about" heading={heading}>
      <Reveal className="grid gap-10 md:grid-cols-3">
        {profile.photo !== null && (
          <MediaImage
            image={profile.photo}
            fallbackAlt={`Photo of ${profile.name}`}
            sizes="(min-width: 768px) 320px, 100vw"
            // Right after the hero, the photo is the largest thing on a phone's first screen, so it loads first.
            priority={index === 1}
            className="aspect-square w-full max-w-xs rounded-xl border border-border"
          />
        )}
        <div className={profile.photo === null ? 'md:col-span-3' : 'md:col-span-2'}>
          {profile.about !== '' && <Markdown markdown={profile.about} />}
          {chips.length > 0 && (
            <ul aria-label="Details" className="mt-6 flex flex-wrap gap-2">
              {chips.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted"
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </PageSection>
  );
}
