import { SectionLabel } from '@/components/layout/section-label';

import type { ReactNode } from 'react';

type PageSectionProps = {
  id: string;
  // Position among the numbered sections: "03 // projects".
  index: number;
  label: string;
  heading: string;
  children: ReactNode;
};

// The frame of every home page section after the hero: numbered label, heading, content.
export function PageSection({ id, index, label, heading, children }: PageSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-border py-16 sm:py-20">
      <SectionLabel index={index} name={label} />
      <h2 id={`${id}-heading`} className="mt-2 mb-8 text-2xl font-medium tracking-tight sm:text-3xl">
        {heading}
      </h2>
      {children}
    </section>
  );
}
