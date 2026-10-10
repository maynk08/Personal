// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

import { navigationState } from '../helpers/navigation';

import type { Site } from '@/lib/api/public-schemas';

vi.mock('next/navigation', async (importOriginal) =>
  (await import('../helpers/navigation')).createNavigationModule(await importOriginal()),
);

const site: Site = {
  theme: 'dark',
  name: 'Ada Lovelace',
  nav: [
    { key: 'hero', heading: 'Home' },
    { key: 'about', heading: 'About me' },
    { key: 'projects', heading: 'Projects' },
  ],
  socialLinks: [
    { platform: 'github', label: null, url: 'https://github.com/ada' },
    { platform: 'linkedin', label: null, url: 'https://linkedin.com/in/ada' },
    { platform: 'email', label: null, url: 'mailto:ada@example.com' },
  ],
  resume: null,
};

beforeEach(() => {
  navigationState.pathname = '/';
});

describe('SiteHeader', () => {
  it('links to the visible sections like paths, leaving out the hero', () => {
    render(<SiteHeader site={site} />);
    const nav = screen.getAllByRole('navigation', { name: 'Sections' })[0];

    const links = within(nav as HTMLElement).getAllByRole('link');
    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual([
      ['~/about-me', '#about'],
      ['~/projects', '#projects'],
    ]);
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute('href', '/');
  });

  it('links back to the home page’s sections from other pages', () => {
    navigationState.pathname = '/projects/portfolio-cms';
    render(<SiteHeader site={site} />);

    const nav = screen.getAllByRole('navigation', { name: 'Sections' })[0];
    expect(within(nav as HTMLElement).getByRole('link', { name: '~/projects' })).toHaveAttribute('href', '/#projects');
  });

  it('opens the phone menu, and closes it with Escape or by choosing a link', async () => {
    const user = userEvent.setup();
    render(<SiteHeader site={site} />);
    const button = screen.getByRole('button', { name: 'Menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    expect(panel).toBeVisible();

    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();

    await user.click(button);
    await user.click(within(panel as HTMLElement).getByRole('link', { name: '~/projects' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SiteFooter', () => {
  it('lists the social links with names, opening external ones in a new tab', () => {
    render(<SiteFooter site={site} />);
    const links = within(screen.getByRole('list', { name: 'Social links' })).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'GitHub (opens in a new tab)',
      'LinkedIn (opens in a new tab)',
      'Send an email',
    ]);
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[2]).not.toHaveAttribute('target');
    expect(screen.getByRole('link', { name: 'Back to top' })).toHaveAttribute('href', '#top');
  });
});
