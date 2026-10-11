import { expect, test } from '@playwright/test';

import { e2eConfig } from '../e2e-config';

import type { APIRequestContext } from '@playwright/test';

const ADMIN_API = `http://localhost:${e2eConfig.backendPort}/api/admin`;
const DEFAULT_ORDER = ['hero', 'about', 'experience', 'projects', 'skills', 'education', 'certifications', 'contact'];
const NEW_ORDER = ['hero', 'projects', 'about', 'experience', 'skills', 'education', 'certifications', 'contact'];

async function saveSectionOrder(request: APIRequestContext, keys: string[]): Promise<void> {
  const login = await request.post(`${ADMIN_API}/auth/login`, { data: { email: e2eConfig.adminEmail, password: e2eConfig.adminPassword } });
  const { token } = ((await login.json()) as { data: { token: string } }).data;
  const response = await request.patch(`${ADMIN_API}/sections/order`, { headers: { Authorization: `Bearer ${token}` }, data: { keys } });
  expect(response.ok()).toBe(true);
}

test.afterAll(async ({ request }) => {
  await saveSectionOrder(request, DEFAULT_ORDER);
});

test('shows the sections and their links in the order saved in the CMS', async ({ page, request }) => {
  await saveSectionOrder(request, NEW_ORDER);

  await page.goto('/');

  const sectionIds = await page.locator('main section[id]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionIds).toEqual(NEW_ORDER);
  const nav = page.getByRole('navigation', { name: 'Sections' }).first();
  await expect(nav.getByRole('link')).toHaveText([
    '~/projects',
    '~/about',
    '~/experience',
    '~/skills',
    '~/education',
    '~/certifications',
    '~/contact',
  ]);
  // Numbering follows the new order.
  await expect(page.locator('#projects')).toContainText('01 // projects');
  await expect(page.locator('#about')).toContainText('02 // about');
});
