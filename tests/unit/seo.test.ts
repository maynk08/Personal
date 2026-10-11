import { beforeEach, describe, expect, it, vi } from 'vitest';

import sitemap from '@/app/sitemap';
import { findProjects } from '@/features/projects/queries';
import { findAdjacentProjects } from '@/features/projects/utils';
import { profilePageJsonLd, serializeJsonLd } from '@/lib/seo/json-ld';
import { pageMetadata, siteDescription } from '@/lib/seo/metadata';

import type { Profile, ProjectCard } from '@/lib/api/public-schemas';

vi.mock('next/navigation', () => ({ notFound: vi.fn(), unstable_rethrow: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', fetchMock);

beforeEach(() => {
  fetchMock.mockReset();
});

function project(slug: string, updatedAt = '2026-01-01T00:00:00.000Z'): ProjectCard {
  return {
    id: slug,
    slug,
    title: slug.toUpperCase(),
    summary: null,
    role: null,
    techStack: [],
    liveUrl: null,
    repoUrl: null,
    coverImage: null,
    isFeatured: false,
    updatedAt,
  };
}

const profile: Profile = {
  name: 'Ada Lovelace',
  headline: 'Full-stack engineer',
  heroPhrases: [],
  about: '',
  photo: { url: 'https://cdn.example.com/ada.png', altText: null, width: null, height: null },
  resume: null,
  socialLinks: [
    { platform: 'github', label: null, url: 'https://github.com/ada' },
    { platform: 'email', label: null, url: 'mailto:ada@example.com' },
  ],
  location: null,
  publicEmail: 'ada@example.com',
  isOpenToWork: null,
  yearsOfExperience: null,
  languages: [],
};

function respondWith(status: number, data?: unknown): void {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(status === 200 ? { success: true, data } : { success: false, message: 'Not found' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('pageMetadata', () => {
  it('builds the title, canonical address and share tags for a page', () => {
    const metadata = pageMetadata({
      site: { name: 'Ada Lovelace', headline: '' },
      title: 'Projects',
      description: 'Projects by Ada Lovelace.',
      path: '/projects',
    });

    expect(metadata).toEqual({
      title: 'Projects',
      description: 'Projects by Ada Lovelace.',
      alternates: { canonical: '/projects' },
      openGraph: {
        type: 'website',
        siteName: 'Ada Lovelace',
        title: 'Projects · Ada Lovelace',
        description: 'Projects by Ada Lovelace.',
        url: '/projects',
        locale: 'en',
      },
      twitter: { card: 'summary_large_image', title: 'Projects · Ada Lovelace', description: 'Projects by Ada Lovelace.' },
    });
  });

  it('uses the name alone as the home page title', () => {
    const metadata = pageMetadata({ site: { name: 'Ada Lovelace', headline: 'x' }, title: null, description: 'x', path: '/' });

    expect(metadata.title).toEqual({ absolute: 'Ada Lovelace' });
    expect(metadata.openGraph?.title).toBe('Ada Lovelace');
  });

  it('describes the site by its headline, or by the name when there is none', () => {
    expect(siteDescription({ name: 'Ada', headline: 'Full-stack engineer' })).toBe('Full-stack engineer');
    expect(siteDescription({ name: 'Ada', headline: '' })).toBe('Portfolio of Ada.');
    expect(siteDescription({ name: '', headline: '' })).toBe('Portfolio of Portfolio.');
  });
});

describe('profilePageJsonLd', () => {
  it('describes the site owner, linking social profiles but not the email link', () => {
    expect(profilePageJsonLd(profile)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: 'http://portfolio.test/',
      mainEntity: {
        '@type': 'Person',
        name: 'Ada Lovelace',
        url: 'http://portfolio.test/',
        jobTitle: 'Full-stack engineer',
        image: 'https://cdn.example.com/ada.png',
        email: 'mailto:ada@example.com',
        sameAs: ['https://github.com/ada'],
      },
    });
  });

  it('leaves out what is hidden or empty', () => {
    const data = profilePageJsonLd({ ...profile, headline: '', photo: null, publicEmail: null, socialLinks: [] });

    expect(JSON.parse(serializeJsonLd(data))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      url: 'http://portfolio.test/',
      mainEntity: { '@type': 'Person', name: 'Ada Lovelace', url: 'http://portfolio.test/' },
    });
  });

  it('escapes "<" so CMS text cannot close the script tag', () => {
    const serialized = serializeJsonLd(profilePageJsonLd({ ...profile, name: '</script><script>alert(1)</script>' }));

    expect(serialized).not.toContain('<');
    expect((JSON.parse(serialized) as { mainEntity: { name: string } }).mainEntity.name).toBe('</script><script>alert(1)</script>');
  });
});

describe('findAdjacentProjects', () => {
  const projects = [project('a'), project('b'), project('c')];

  it('returns the neighbours in the admin’s order', () => {
    expect(findAdjacentProjects(projects, 'b')).toEqual({ previous: projects[0], next: projects[2] });
  });

  it('has no previous project for the first and no next one for the last', () => {
    expect(findAdjacentProjects(projects, 'a')).toEqual({ previous: null, next: projects[1] });
    expect(findAdjacentProjects(projects, 'c')).toEqual({ previous: projects[1], next: null });
    expect(findAdjacentProjects([project('a')], 'a')).toEqual({ previous: null, next: null });
  });

  it('returns no neighbours for a project that is not in the list', () => {
    expect(findAdjacentProjects(projects, 'z')).toEqual({ previous: null, next: null });
  });
});

describe('findProjects', () => {
  it('returns null while the Projects section is hidden', async () => {
    respondWith(404);

    await expect(findProjects()).resolves.toBeNull();
  });
});

describe('sitemap', () => {
  it('lists the home page, the projects page and every visible project', async () => {
    respondWith(200, [project('first', '2026-03-01T10:00:00.000Z'), project('second', '2026-05-02T10:00:00.000Z')]);

    expect(await sitemap()).toEqual([
      { url: 'http://portfolio.test/' },
      { url: 'http://portfolio.test/projects', lastModified: '2026-05-02T10:00:00.000Z' },
      { url: 'http://portfolio.test/projects/first', lastModified: '2026-03-01T10:00:00.000Z' },
      { url: 'http://portfolio.test/projects/second', lastModified: '2026-05-02T10:00:00.000Z' },
    ]);
  });

  it('lists only the home page while the Projects section is hidden', async () => {
    respondWith(404);

    expect(await sitemap()).toEqual([{ url: 'http://portfolio.test/' }]);
  });
});
