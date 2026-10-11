import { expect, test } from '@playwright/test';

import { e2eConfig } from '../e2e-config';

const ADMIN_API = `http://localhost:${e2eConfig.backendPort}/api/admin`;

test('shows the hero with the typing line, résumé and social links', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('heading', { level: 1, name: 'Ada Lovelace' })).toBeVisible();
  await expect(page.getByText('Full-stack engineer')).toBeVisible();
  await expect(page.getByText('Open to work')).toBeVisible();
  const resume = page.getByRole('link', { name: /Résumé \(PDF\)/ });
  await expect(resume).toHaveAttribute('href', /resume\.pdf$/);
  await expect(resume).toHaveAttribute('target', '_blank');
  // Screen readers get every phrase once, as text.
  await expect(page.getByText('building fast web apps. shipping clean APIs')).toBeAttached();
  await expect(page.getByRole('link', { name: 'GitHub (opens in a new tab)' }).first()).toBeVisible();
});

test('links to the visible sections in order, and shows no hidden content', async ({ page }) => {
  await page.goto('/');

  const nav = page.getByRole('navigation', { name: 'Sections' }).first();
  await expect(nav.getByRole('link')).toHaveText([
    '~/about',
    '~/experience',
    '~/projects',
    '~/skills',
    '~/education',
    '~/certifications',
    '~/contact',
  ]);
  for (const hidden of ['Hidden Corp', 'Secret project', 'Hidden skill', 'English (Native)']) {
    await expect(page.getByText(hidden)).toHaveCount(0);
  }
  await expect(page.getByRole('link', { name: /^X / })).toHaveCount(0);
});

test('shows every section’s content', async ({ page }) => {
  await page.goto('/');

  const about = page.locator('#about');
  await expect(about.getByText('clear')).toHaveJSProperty('tagName', 'STRONG');
  await expect(about.locator('script')).toHaveCount(0);
  await expect(about).toContainText('6 years of experience');
  await expect(about).toContainText('London');

  const experience = page.locator('#experience');
  await expect(experience.getByRole('heading', { name: 'Senior Engineer' })).toBeVisible();
  await expect(experience).toContainText(/Mar 2022 – Present · \d+ yrs?/);
  await expect(experience).toContainText('Jan 2019 – Dec 2021 · 3 yrs');

  const projects = page.locator('#projects');
  await expect(projects.getByRole('article')).toHaveCount(2);
  await expect(projects.getByRole('link', { name: 'Portfolio CMS', exact: true })).toHaveAttribute('href', '/projects/portfolio-cms');
  await expect(projects.getByRole('link', { name: /View all 3 projects/ })).toHaveAttribute('href', '/projects');

  const skills = page.locator('#skills');
  await expect(skills.getByRole('list', { name: 'Backend' }).getByRole('listitem')).toHaveText(['Node.js', 'MongoDB']);
  await expect(skills.locator('svg')).toHaveCount(2);

  await expect(page.locator('#education')).toContainText('BSc, Computer Science');
  const certifications = page.locator('#certifications');
  await expect(certifications).toContainText('Expired Jan 2021');
  await expect(certifications).toContainText('Expires Jan 2099');
});

test('loads the uploaded images', async ({ page }) => {
  await page.goto('/');

  const photo = page.locator('#about img');
  await expect(photo).toHaveAttribute('alt', 'A blue test image');
  await expect.poll(() => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});

test('keeps the first phrase still for visitors who reduce motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const line = page.locator('#hero p[aria-hidden="true"]').filter({ hasText: '>' });
  await expect(line).toContainText('building fast web apps');
  await page.waitForTimeout(2500);
  await expect(line).toContainText('building fast web apps');
});

test('types through the phrases otherwise', async ({ page }) => {
  await page.goto('/');

  const line = page.locator('#hero p[aria-hidden="true"]').filter({ hasText: '>' });
  await expect(line).toContainText('shipping clean APIs', { timeout: 8000 });
});

test('sends a contact message to the inbox, and explains problems first', async ({ page, request }) => {
  await page.goto('/#contact');
  const contact = page.locator('#contact');

  // Skip the browser's own checks, to see the server's answer.
  await contact.locator('form').evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
  await contact.getByRole('textbox', { name: 'Email' }).fill('not-an-email');
  await contact.getByRole('button', { name: 'Send message' }).click();
  await expect(contact.getByText('Enter your name')).toBeVisible();
  await expect(contact.getByText('Enter a valid email address, like name@example.com')).toBeVisible();
  await expect(contact.getByRole('textbox', { name: 'Name' })).toBeFocused();
  await expect(contact.getByRole('textbox', { name: 'Email' })).toHaveValue('not-an-email');

  await contact.getByRole('textbox', { name: 'Name' }).fill('Grace Hopper');
  await contact.getByRole('textbox', { name: 'Email' }).fill('grace@example.com');
  await contact.getByRole('textbox', { name: 'Message' }).fill('Lovely portfolio!');
  await contact.getByRole('button', { name: 'Send message' }).click();
  await expect(contact.getByRole('status')).toContainText('Thanks, Grace!');

  const login = await request.post(`${ADMIN_API}/auth/login`, { data: { email: e2eConfig.adminEmail, password: e2eConfig.adminPassword } });
  const { token } = ((await login.json()) as { data: { token: string } }).data;
  const inbox = await request.get(`${ADMIN_API}/messages`, { headers: { Authorization: `Bearer ${token}` } });
  const messages = ((await inbox.json()) as { data: { name: string; message: string; status: string }[] }).data;
  expect(messages).toEqual([expect.objectContaining({ name: 'Grace Hopper', message: 'Lovely portfolio!', status: 'unread' })]);
});
