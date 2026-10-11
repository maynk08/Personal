import { SectionLabel } from '@/components/layout/section-label';
import { Reveal } from '@/components/motion/reveal';

import type { ReactNode } from 'react';

type PageSectionProps = {
  id: string;
  // Position among the numbered sections: "03 // projects".
  index: number;
  label: string;
  heading: string;
  children: ReactNode;
};

// The frame of every home page section after the hero: numbered label and heading (revealed on scroll), content.
export function PageSection({ id, index, label, heading, children }: PageSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-border py-16 sm:py-20">
      <Reveal className="mb-8">
        <SectionLabel index={index} name={label} />
        <h2 id={`${id}-heading`} className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
          {heading}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}
