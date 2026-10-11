import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { e2eConfig } from '../e2e-config';

import type { APIRequestContext, Page } from '@playwright/test';

const ADMIN_API = `http://localhost:${e2eConfig.backendPort}/api/admin`;
const PAGES = ['/', '/projects', '/projects/portfolio-cms', '/projects/no-such-project'];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'phone', width: 390, height: 844 },
];

async function setTheme(request: APIRequestContext, theme: 'dark' | 'light'): Promise<void> {
  const login = await request.post(`${ADMIN_API}/auth/login`, { data: { email: e2eConfig.adminEmail, password: e2eConfig.adminPassword } });
  const { token } = ((await login.json()) as { data: { token: string } }).data;
  const response = await request.put(`${ADMIN_API}/settings`, { headers: { Authorization: `Bearer ${token}` }, data: { theme } });
  expect(response.ok()).toBe(true);
}

// Elements the page currently shows as invisible or shifted, ignoring decoration and screen-reader-only text.
function countHiddenOrMoved(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>('main *')].filter((element) => {
        const style = getComputedStyle(element);
        return style.opacity === '0' || (style.transform !== 'none' && style.transform !== '');
      }).length,
  );
}

test.describe('scroll reveals', () => {
  test('reveal content below the screen as it scrolls into view', async ({ page }) => {
    await page.goto('/');
    const contactHeading = page.locator('#contact h2');
    // Below the screen, it waits hidden once the page is running...
    await expect.poll(() => contactHeading.evaluate((element) => getComputedStyle(element.parentElement as Element).opacity)).toBe('0');

    await contactHeading.scrollIntoViewIfNeeded();

    // ...and is fully shown after scrolling to it.
    await expect.poll(() => contactHeading.evaluate((element) => getComputedStyle(element.parentElement as Element).opacity)).toBe('1');
    await expect(contactHeading).toBeVisible();
  });

  test('never hide or move anything for visitors who reduce motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(await countHiddenOrMoved(page)).toBe(0);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    expect(await countHiddenOrMoved(page)).toBe(0);
  });
});

test.describe('accessibility', () => {
  // Changes the shared site theme, so the theme runs go one after another and end on dark.
  test.describe.configure({ mode: 'serial' });

  test.afterAll(async ({ request }) => {
    await setTheme(request, 'dark');
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`has no serious problems in the ${theme} theme`, async ({ page, request }) => {
      await setTheme(request, theme);
      // Reduced motion shows everything at once, so the checker sees every element at full colour.
      await page.emulateMedia({ reducedMotion: 'reduce' });

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        for (const path of PAGES) {
          await page.goto(path);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

          const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
          const serious = results.violations
            .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
            .map(
              (violation) =>
                `${viewport.name} ${path}: ${violation.id} (${violation.nodes.map((node) => node.target.join(' ')).join(', ')})`,
            );
          expect(serious).toEqual([]);
        }
      }
    });
  }
});

test.describe('keyboard', () => {
  test('starts with a working skip link and shows focus on every stop', async ({ page }) => {
    await page.goto('/projects/portfolio-cms');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#content$/);

    for (let stop = 0; stop < 8; stop += 1) {
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const element = document.activeElement;
        return element === null || element === document.body ? 'none' : getComputedStyle(element).outlineStyle;
      });
      expect(outline).not.toBe('none');
    }
  });
});
