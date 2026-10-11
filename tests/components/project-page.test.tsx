// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HighlightedMarkdown } from '@/components/content/highlighted-markdown';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { NavLinks } from '@/components/layout/nav-links';
import { ProjectGallery } from '@/features/projects/components/project-gallery';
import { ProjectHeader } from '@/features/projects/components/project-header';
import { ProjectPager } from '@/features/projects/components/project-pager';

import { navigationState } from '../helpers/navigation';

import type { Project, ProjectCard } from '@/lib/api/public-schemas';

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));
vi.mock('next/navigation', async (importOriginal) =>
  (await import('../helpers/navigation')).createNavigationModule(await importOriginal()),
);

const project: Project = {
  id: '1',
  slug: 'portfolio-cms',
  title: 'Portfolio CMS',
  summary: 'The CMS behind this site.',
  role: 'Solo',
  techStack: ['Next.js', 'MongoDB'],
  liveUrl: 'https://cms.example.com',
  repoUrl: null,
  coverImage: null,
  isFeatured: true,
  updatedAt: '2026-01-01T00:00:00.000Z',
  description: null,
  gallery: [],
};

function card(slug: string, title: string): ProjectCard {
  return { ...project, id: slug, slug, title };
}

beforeEach(() => {
  navigationState.pathname = '/';
});

describe('ProjectHeader', () => {
  it('shows the title, summary, role, stack and only the links that exist', () => {
    render(<ProjectHeader project={project} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Portfolio CMS' })).toBeInTheDocument();
    expect(screen.getByText('The CMS behind this site.')).toBeInTheDocument();
    expect(screen.getByText('Solo')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Tech used in Portfolio CMS' })).getAllByRole('listitem')).toHaveLength(2);
    const live = screen.getByRole('link', { name: /^Live site\s*\(opens in a new tab\)$/ });
    expect(live).toHaveAttribute('href', 'https://cms.example.com');
    expect(live).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.queryByRole('link', { name: /Source/ })).not.toBeInTheDocument();
  });

  it('leaves out the details list when there is no role or stack', () => {
    render(<ProjectHeader project={{ ...project, role: null, techStack: [], summary: null }} />);

    expect(screen.queryByText('role')).not.toBeInTheDocument();
    expect(screen.queryByText('stack')).not.toBeInTheDocument();
  });
});

describe('ProjectGallery', () => {
  it('captions screenshots with their alt text (without repeating it as alt), or names them by number', () => {
    render(
      <ProjectGallery
        title="Portfolio CMS"
        images={[
          { url: 'https://cdn.example.com/1.png', altText: 'Editor', width: 1200, height: 800 },
          { url: 'https://cdn.example.com/2.png', altText: null, width: null, height: null },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Screenshots' })).toBeInTheDocument();
    expect(screen.getAllByRole('img').map((image) => image.getAttribute('aria-label'))).toEqual(['', 'Portfolio CMS screenshot 2']);
    expect(screen.getAllByRole('figure')[0]).toHaveTextContent('Editor');
  });

  it('renders nothing without screenshots', () => {
    const { container } = render(<ProjectGallery title="x" images={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('ProjectPager', () => {
  it('links to the previous and next projects and to the full list', () => {
    render(<ProjectPager previous={card('a', 'Alpha')} next={card('c', 'Gamma')} />);

    const nav = screen.getByRole('navigation', { name: 'More projects' });
    expect(within(nav).getByRole('link', { name: /^Previous\s*project:\s*Alpha$/ })).toHaveAttribute('href', '/projects/a');
    expect(within(nav).getByRole('link', { name: /^Next\s*project:\s*Gamma$/ })).toHaveAttribute('href', '/projects/c');
    expect(within(nav).getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects');
  });

  it('shows only the full-list link for a single project', () => {
    render(<ProjectPager previous={null} next={null} />);

    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['All projects']);
  });
});

describe('Breadcrumbs', () => {
  it('reads like a path, marking the current page', () => {
    render(
      <Breadcrumbs
        trail={[
          { label: '~', href: '/' },
          { label: 'projects', href: '/projects' },
        ]}
        current="portfolio-cms"
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toHaveTextContent('~/projects/portfolio-cms');
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/', '/projects']);
    expect(within(nav).getByText('portfolio-cms')).toHaveAttribute('aria-current', 'page');
  });
});

describe('NavLinks', () => {
  const items = [
    { key: 'about' as const, heading: 'About' },
    { key: 'projects' as const, heading: 'Projects' },
  ];

  it.each(['/projects', '/projects/portfolio-cms'])('highlights the projects link on %s', (pathname) => {
    navigationState.pathname = pathname;
    render(<NavLinks items={items} orientation="horizontal" />);

    expect(screen.getByRole('link', { name: '~/projects' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: '~/about' })).not.toHaveAttribute('aria-current');
  });

  it('highlights nothing on the home page', () => {
    render(<NavLinks items={items} orientation="horizontal" />);

    expect(screen.getByRole('link', { name: '~/projects' })).not.toHaveAttribute('aria-current');
  });
});

describe('HighlightedMarkdown', () => {
  it('highlights code blocks with both themes, labels the language and copies the code', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(await HighlightedMarkdown({ markdown: 'Intro\n\n```ts\nconst answer = 42;\n```' }));

    const block = document.querySelector('pre.shiki');
    expect(block).not.toBeNull();
    expect(block?.querySelector('span[style*="--shiki-dark"]')).not.toBeNull();
    expect(screen.getByText('ts')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Copy\s*code$/ }));

    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(screen.getByRole('status')).toHaveTextContent('Code copied');
    // Loading the highlighter for the first time takes a few seconds when the whole suite runs at once.
  }, 20_000);

  it('shows unknown or missing languages as plain text without a label', async () => {
    render(await HighlightedMarkdown({ markdown: '```not-a-language\nplain words\n```\n\n```\nmore words\n```' }));

    expect(screen.getByText('plain words')).toBeInTheDocument();
    expect(screen.getByText('more words')).toBeInTheDocument();
    expect(screen.queryByText('not-a-language')).not.toBeInTheDocument();
  });

  it('still removes raw HTML and scripts', async () => {
    const { container } = render(
      await HighlightedMarkdown({ markdown: '**bold**\n\n<script>alert(1)</script><img src=x onerror=alert(1)>' }),
    );

    expect(screen.getByText('bold').tagName).toBe('STRONG');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
