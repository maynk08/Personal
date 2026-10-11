import { AboutSection } from '@/features/about/components/about-section';
import { CertificationsSection } from '@/features/certifications/components/certifications-section';
import { ContactSection } from '@/features/contact/components/contact-section';
import { EducationSection } from '@/features/education/components/education-section';
import { ExperienceSection } from '@/features/experience/components/experience-section';
import { HeroSection } from '@/features/hero/components/hero-section';
import { getHome } from '@/features/home/queries';
import { ProjectsSection } from '@/features/projects/components/projects-section';
import { SkillsSection } from '@/features/skills/components/skills-section';

import type { Profile, Section } from '@/lib/api/public-schemas';

function renderSection(section: Section, index: number, profile: Profile, hasContact: boolean) {
  switch (section.key) {
    case 'hero':
      return <HeroSection key="hero" profile={profile} hasContact={hasContact} />;
    case 'about':
      return <AboutSection key="about" index={index} heading={section.heading} profile={profile} />;
    case 'experience':
      return <ExperienceSection key="experience" index={index} section={section} />;
    case 'projects':
      return <ProjectsSection key="projects" index={index} section={section} />;
    case 'skills':
      return <SkillsSection key="skills" index={index} section={section} />;
    case 'education':
      return <EducationSection key="education" index={index} section={section} />;
    case 'certifications':
      return <CertificationsSection key="certifications" index={index} section={section} />;
    case 'contact':
      return <ContactSection key="contact" index={index} heading={section.heading} profile={profile} />;
  }
}

// The visible sections in the admin's order; every section but the hero is numbered ("03 // projects").
export default async function HomePage() {
  const { profile, sections } = await getHome();
  const numbered = sections.filter((section) => section.key !== 'hero').map((section) => section.key);
  const hasContact = numbered.includes('contact');

  return (
    <div className="flex flex-col">
      {sections.map((section) => renderSection(section, numbered.indexOf(section.key) + 1, profile, hasContact))}
    </div>
  );
}
