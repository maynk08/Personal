import { z } from 'zod';

// The backend's public API (backend `src/types/public.types.ts`). It returns visible content only.

export const SECTION_KEYS = ['hero', 'about', 'experience', 'projects', 'skills', 'education', 'certifications', 'contact'] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SOCIAL_PLATFORMS = [
  'github',
  'linkedin',
  'x',
  'instagram',
  'youtube',
  'medium',
  'devto',
  'stackoverflow',
  'leetcode',
  'website',
  'email',
  'other',
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const imageSchema = z.object({
  url: z.string(),
  altText: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});

export type PublicImage = z.infer<typeof imageSchema>;

export const documentSchema = z.object({ url: z.string(), fileName: z.string() });

export const socialLinkSchema = z.object({ platform: z.enum(SOCIAL_PLATFORMS), label: z.string().nullable(), url: z.string() });

export type SocialLink = z.infer<typeof socialLinkSchema>;

export const siteSchema = z.object({
  theme: z.enum(['dark', 'light']),
  name: z.string(),
  nav: z.array(z.object({ key: z.enum(SECTION_KEYS), heading: z.string() })),
  socialLinks: z.array(socialLinkSchema),
  resume: documentSchema.nullable(),
});

export type Site = z.infer<typeof siteSchema>;

export const profileSchema = z.object({
  name: z.string(),
  headline: z.string(),
  heroPhrases: z.array(z.string()),
  about: z.string(),
  photo: imageSchema.nullable(),
  resume: documentSchema.nullable(),
  socialLinks: z.array(socialLinkSchema),
  location: z.string().nullable(),
  publicEmail: z.string().nullable(),
  isOpenToWork: z.boolean().nullable(),
  yearsOfExperience: z.number().nullable(),
  languages: z.array(z.object({ name: z.string(), proficiency: z.string().nullable() })),
});

export type Profile = z.infer<typeof profileSchema>;

export const experienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  summary: z.string().nullable(),
  highlights: z.array(z.string()),
  techStack: z.array(z.string()),
  companyLogo: imageSchema.nullable(),
  companyUrl: z.string().nullable(),
});

export const projectCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  role: z.string().nullable(),
  techStack: z.array(z.string()),
  liveUrl: z.string().nullable(),
  repoUrl: z.string().nullable(),
  coverImage: imageSchema.nullable(),
  isFeatured: z.boolean(),
  updatedAt: z.string(),
});

export type ProjectCard = z.infer<typeof projectCardSchema>;

export const projectSchema = projectCardSchema.extend({
  description: z.string().nullable(),
  gallery: z.array(imageSchema),
});

export type Project = z.infer<typeof projectSchema>;

export const skillGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.object({ name: z.string(), icon: z.string().nullable() })),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  grade: z.string().nullable(),
  description: z.string().nullable(),
  logo: imageSchema.nullable(),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string(),
  expiryDate: z.string().nullable(),
  credentialId: z.string().nullable(),
  credentialUrl: z.string().nullable(),
  badge: imageSchema.nullable(),
});

const sectionBase = { heading: z.string(), settings: z.record(z.string(), z.unknown()) };

export const sectionSchema = z.discriminatedUnion('key', [
  z.object({ key: z.enum(['hero', 'about', 'contact']), ...sectionBase }),
  z.object({ key: z.literal('experience'), ...sectionBase, items: z.array(experienceSchema) }),
  z.object({ key: z.literal('projects'), ...sectionBase, items: z.array(projectCardSchema), totalCount: z.number() }),
  z.object({ key: z.literal('skills'), ...sectionBase, items: z.array(skillGroupSchema) }),
  z.object({ key: z.literal('education'), ...sectionBase, items: z.array(educationSchema) }),
  z.object({ key: z.literal('certifications'), ...sectionBase, items: z.array(certificationSchema) }),
]);

export type Section = z.infer<typeof sectionSchema>;

export const homeSchema = z.object({ profile: profileSchema, sections: z.array(sectionSchema) });

export type Home = z.infer<typeof homeSchema>;
