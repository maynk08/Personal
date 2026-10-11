// @vitest-environment jsdom
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AboutSection } from '@/features/about/components/about-section';
import { ContactForm } from '@/features/contact/components/contact-form';
import { TypingLine } from '@/features/hero/components/typing-line';
import { ProjectCard } from '@/features/projects/components/project-card';

import { setReducedMotion } from '../helpers/browser-mocks';

import type { ContactFormState } from '@/features/contact/form-state';
import type { Profile } from '@/lib/api/public-schemas';

vi.mock('next/image', () => ({ default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} /> }));
vi.mock('@/features/contact/actions', () => ({ sendContactMessage: vi.fn() }));

const { sendContactMessage } = await import('@/features/contact/actions');

// Each step of the animation schedules the next only after React re-renders, so time moves in small steps.
function advanceInSteps(totalMs: number, stepMs = 10): void {
  for (let elapsed = 0; elapsed < totalMs; elapsed += stepMs) {
    act(() => {
      vi.advanceTimersByTime(stepMs);
    });
  }
}

const visibleLine = (): string => document.querySelector('p[aria-hidden="true"]')?.textContent ?? '';

describe('TypingLine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the first phrase, then deletes it and types the next', () => {
    setReducedMotion(false);
    render(<TypingLine phrases={['abc', 'xy']} />);
    expect(visibleLine()).toBe('> abc');

    advanceInSteps(1800 + 3 * 30 + 400 + 2 * 60 + 50);

    expect(visibleLine()).toBe('> xy');
    expect(screen.getByText('abc. xy')).toHaveClass('sr-only');
  });

  it('keeps the first phrase still when motion is reduced', () => {
    setReducedMotion(true);
    render(<TypingLine phrases={['abc', 'xy']} />);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(visibleLine()).toBe('> abc');
  });

  it('shows nothing without phrases', () => {
    setReducedMotion(false);
    const { container } = render(<TypingLine phrases={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

const profile: Profile = {
  name: 'Ada Lovelace',
  headline: 'Engineer',
  heroPhrases: [],
  about: 'Hello **there**',
  photo: { url: 'https://cdn.test/me.png', altText: null, width: 400, height: 400 },
  resume: null,
  socialLinks: [],
  location: 'London',
  publicEmail: null,
  isOpenToWork: null,
  yearsOfExperience: 1,
  languages: [{ name: 'English', proficiency: null }],
};

describe('AboutSection', () => {
  it('falls back to a descriptive alt text and shows only the details that were switched on', () => {
    render(<AboutSection index={1} heading="About" profile={profile} />);

    expect(screen.getByRole('img', { name: 'Photo of Ada Lovelace' })).toBeInTheDocument();
    expect(screen.getByText('there').tagName).toBe('STRONG');
    expect(
      within(screen.getByRole('list', { name: 'Details' }))
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['London', '1 year of experience', 'English']);
  });
});

describe('ProjectCard', () => {
  it('links the whole card to the project page and leaves out missing links', () => {
    render(
      <ProjectCard
        project={{
          id: '1',
          slug: 'site',
          title: 'Site',
          summary: null,
          role: null,
          techStack: [],
          liveUrl: null,
          repoUrl: 'https://github.com/a/site',
          coverImage: null,
          isFeatured: true,
          updatedAt: '2026-01-01T00:00:00.000Z',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Site' })).toHaveAttribute('href', '/projects/site');
    expect(screen.getByRole('link', { name: /Source/ })).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('link', { name: /Live site/ })).not.toBeInTheDocument();
  });
});

describe('ContactForm', () => {
  it('shows the server’s errors next to the fields, keeps the text, and focuses the first problem', async () => {
    const failed: ContactFormState = {
      status: 'failed',
      values: { name: '', email: 'nope', subject: '', message: 'Hi' },
      fieldErrors: { name: 'Enter your name' },
    };
    vi.mocked(sendContactMessage).mockResolvedValue(failed);
    const user = userEvent.setup();
    render(<ContactForm />);
    screen.getByRole('button', { name: 'Send message' }).closest('form')?.setAttribute('novalidate', '');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    const name = await screen.findByRole('textbox', { name: 'Name' });
    expect(name).toHaveAccessibleDescription('Enter your name');
    expect(name).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveValue('nope');
  });

  it('replaces the form with a thank-you note once sent', async () => {
    vi.mocked(sendContactMessage).mockResolvedValue({
      status: 'sent',
      values: { name: '', email: '', subject: '', message: '' },
      fieldErrors: {},
      senderName: 'Grace',
    });
    const user = userEvent.setup();
    render(<ContactForm />);
    screen.getByRole('button', { name: 'Send message' }).closest('form')?.setAttribute('novalidate', '');

    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thanks, Grace! Your message is on its way');
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument();
  });
});
