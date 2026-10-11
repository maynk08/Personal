import { expect, test } from '@playwright/test';

import { e2eConfig } from '../e2e-config';

import type { Page } from '@playwright/test';

const SITE = `http://localhost:${e2eConfig.portfolioPort}`;

const meta = (page: Page, attribute: 'name' | 'property', key: string) => page.locator(`meta[${attribute}="${key}"]`);

test('lists every visible project and marks the projects link in the header', async ({ page }) => {
  await page.goto('/projects');

  await expect(page).toHaveTitle('Projects · Ada Lovelace');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveText('~/projects');
  await expect(page.getByText('3 projects')).toBeVisible();
  await expect(page.getByRole('article').getByRole('heading')).toHaveText(['Portfolio CMS', 'Weather app', 'Old project']);
  await expect(page.getByText('Secret project')).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Sections' }).first();
  await expect(nav.getByRole('link', { name: '~/projects' })).toHaveAttribute('aria-current', 'true');
  await expect(nav.getByRole('link', { name: '~/projects' })).toHaveAttribute('href', '/#projects');
});

test('shows a project like documentation, with highlighted code and screenshots', async ({ page }) => {
  await page.goto('/projects/portfolio-cms');

  await expect(page).toHaveTitle('Portfolio CMS · Ada Lovelace');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toHaveText('~/projects/portfolio-cms');
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio CMS' })).toBeVisible();
  await expect(page.getByText('The CMS behind this site.')).toBeVisible();
  await expect(page.getByText('Solo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Source (opens in a new tab)', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/ada/cms',
  );
  await expect(page.getByRole('link', { name: /Live site/ })).toHaveCount(0);

  const article = page.getByRole('article');
  await expect(article.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible();
  await expect(article.getByText('admin API')).toHaveJSProperty('tagName', 'STRONG');
  await expect(article.locator('script')).toHaveCount(0);

  const code = article.locator('pre.shiki');
  await expect(code).toHaveText('const answer = 42;');
  // The keyword gets the dark theme's colour, not the plain text colour.
  await expect(code.getByText('const')).toHaveCSS('color', 'rgb(255, 123, 114)');

  const gallery = page.getByRole('region', { name: 'Screenshots' });
  await expect(gallery.getByRole('figure')).toHaveCount(2);
  await expect(gallery.getByRole('img', { name: 'Portfolio CMS screenshot 2' })).toBeVisible();
  await expect
    .poll(() =>
      gallery.locator('img').evaluateAll((images: HTMLImageElement[]) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBe(true);
});

test('copies a code block', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/projects/portfolio-cms');

  await page.getByRole('button', { name: 'Copy code' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Code copied' })).toBeAttached();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('const answer = 42;');
});

test('moves between projects in the admin’s order', async ({ page }) => {
  await page.goto('/projects/portfolio-cms');
  const pager = page.getByRole('navigation', { name: 'More projects' });
  await expect(pager.getByRole('link', { name: /Previous/ })).toHaveCount(0);

  await pager.getByRole('link', { name: 'Next project: Weather app' }).click();

  await expect(page).toHaveURL('/projects/weather-app');
  await expect(pager.getByRole('link', { name: 'Previous project: Portfolio CMS' })).toBeVisible();
  await expect(pager.getByRole('link', { name: 'Next project: Old project' })).toBeVisible();
  await pager.getByRole('link', { name: 'All projects' }).click();
  await expect(page).toHaveURL('/projects');
});

test('shows "Project not found" for hidden and unknown projects', async ({ page }) => {
  for (const slug of ['secret-project', 'no-such-project']) {
    const response = await page.goto(`/projects/${slug}`);

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Project not found' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: '~/projects' })).toHaveAttribute('href', '/projects');
  }
});

test('gives each page its description, canonical address and share tags', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Ada Lovelace');
  await expect(meta(page, 'name', 'description')).toHaveAttribute('content', 'Full-stack engineer');
  // Next.js writes the home page's address without the trailing slash.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE);
  await expect(meta(page, 'property', 'og:title')).toHaveAttribute('content', 'Ada Lovelace');
  await expect(meta(page, 'property', 'og:image')).toHaveAttribute('content', new RegExp(`^${SITE}/opengraph-image`));
  await expect(meta(page, 'name', 'twitter:card')).toHaveAttribute('content', 'summary_large_image');
  await expect(meta(page, 'name', 'theme-color')).toHaveAttribute('content', '#0B0D10');

  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}') as {
    '@type': string;
    mainEntity: Record<string, unknown>;
  };
  expect(jsonLd['@type']).toBe('ProfilePage');
  expect(jsonLd.mainEntity).toMatchObject({
    '@type': 'Person',
    name: 'Ada Lovelace',
    jobTitle: 'Full-stack engineer',
    email: 'mailto:ada@example.com',
    sameAs: ['https://github.com/ada', 'https://linkedin.com/in/ada'],
  });

  await page.goto('/projects/portfolio-cms');
  await expect(meta(page, 'name', 'description')).toHaveAttribute('content', 'The CMS behind this site.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/projects/portfolio-cms`);
  await expect(meta(page, 'property', 'og:title')).toHaveAttribute('content', 'Portfolio CMS · Ada Lovelace');
  await expect(meta(page, 'property', 'og:image')).toHaveAttribute(
    'content',
    new RegExp(`^${SITE}/projects/portfolio-cms/opengraph-image`),
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test('serves share images as PNGs, and none for hidden projects', async ({ page, request }) => {
  for (const path of ['/', '/projects', '/projects/portfolio-cms']) {
    await page.goto(path);
    const imageUrl = await meta(page, 'property', 'og:image').getAttribute('content');
    const response = await request.get(imageUrl ?? '');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/png');
    expect((await response.body()).subarray(1, 4).toString()).toBe('PNG');
  }
  expect((await request.get('/projects/secret-project/opengraph-image')).status()).toBe(404);
});

test('lists the visible pages in the sitemap and points robots at it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  expect(urls).toEqual([
    `${SITE}/`,
    `${SITE}/projects`,
    `${SITE}/projects/portfolio-cms`,
    `${SITE}/projects/weather-app`,
    `${SITE}/projects/old-project`,
  ]);

  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});
