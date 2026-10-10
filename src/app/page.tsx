import { SectionLabel } from '@/components/layout/section-label';
import { getHome } from '@/features/home/queries';

// Placeholder until P3: the visible sections in the admin's order, each with its label and heading.
export default async function HomePage() {
  const { profile, sections } = await getHome();
  // Every section but the hero gets a number, in display order.
  const numbered = sections.filter((section) => section.key !== 'hero').map((section) => section.key);

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        if (section.key === 'hero') {
          return (
            <section key={section.key} id="hero" aria-label="Introduction" className="py-20">
              <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{profile.name}</h1>
              <p className="mt-3 text-lg text-muted">{profile.headline}</p>
            </section>
          );
        }
        return (
          <section key={section.key} id={section.key} aria-labelledby={`${section.key}-heading`} className="border-t border-border py-16">
            <SectionLabel index={numbered.indexOf(section.key) + 1} name={section.key} />
            <h2 id={`${section.key}-heading`} className="mt-2 text-2xl font-medium tracking-tight">
              {section.heading}
            </h2>
          </section>
        );
      })}
    </div>
  );
}
