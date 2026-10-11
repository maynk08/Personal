import { MailIcon } from 'lucide-react';

import { PageSection } from '@/components/layout/page-section';
import { SocialLinks } from '@/components/layout/social-links';
import { Reveal } from '@/components/motion/reveal';
import { ContactForm } from '@/features/contact/components/contact-form';

import type { Profile } from '@/lib/api/public-schemas';

type ContactSectionProps = {
  index: number;
  heading: string;
  profile: Profile;
};

export function ContactSection({ index, heading, profile }: ContactSectionProps) {
  return (
    <PageSection id="contact" index={index} label="contact" heading={heading}>
      <Reveal className="grid gap-10 md:grid-cols-5">
        <div className="flex flex-col gap-4 md:col-span-2">
          <p className="text-muted">Have a question, an idea or an opportunity? Send a message and I will get back to you.</p>
          {profile.publicEmail !== null && (
            <a
              href={`mailto:${profile.publicEmail}`}
              className="inline-flex w-fit items-center gap-2 font-mono text-sm text-accent underline-offset-4 hover:underline"
            >
              <MailIcon aria-hidden="true" className="size-4" />
              {profile.publicEmail}
            </a>
          )}
          <SocialLinks links={profile.socialLinks} />
        </div>
        <div className="md:col-span-3">
          <ContactForm />
        </div>
      </Reveal>
    </PageSection>
  );
}
