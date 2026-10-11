import { FileTextIcon } from 'lucide-react';

import { SocialLinks } from '@/components/layout/social-links';
import { TypingLine } from '@/features/hero/components/typing-line';

import type { Profile } from '@/lib/api/public-schemas';

type HeroSectionProps = {
  profile: Profile;
  // "Get in touch" only appears when the Contact section is shown.
  hasContact: boolean;
};

export function HeroSection({ profile, hasContact }: HeroSectionProps) {
  return (
    <section id="hero" aria-label="Introduction" className="-mx-4 dot-grid px-4 py-20 sm:-mx-6 sm:px-6 sm:py-28">
      <div className="flex max-w-3xl flex-col items-start gap-5">
        {profile.isOpenToWork === true && (
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
            Open to work
          </p>
        )}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-medium tracking-tight text-balance sm:text-6xl">{profile.name}</h1>
          {profile.headline !== '' && <p className="text-lg text-muted sm:text-xl">{profile.headline}</p>}
        </div>
        <TypingLine phrases={profile.heroPhrases} />
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {profile.resume !== null && (
            <a
              href={profile.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent"
            >
              <FileTextIcon aria-hidden="true" className="size-4" />
              Résumé (PDF)
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          {hasContact && (
            <a
              href="#contact"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-foreground hover:border-accent"
            >
              Get in touch
            </a>
          )}
          <SocialLinks links={profile.socialLinks} />
        </div>
      </div>
    </section>
  );
}
