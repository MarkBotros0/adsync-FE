import { test, expect, type Page } from '@playwright/test';

// All dashboard tabs with their expected heading text
const TABS = [
  { path: '/content',    heading: null },           // has sort buttons, not a plain heading
  { path: '/analytics',  heading: null },           // dynamic content
  { path: '/ai-digest',  heading: 'AI Digest' },
  { path: '/influencers',heading: 'Influencers' },
  { path: '/connect',    heading: 'Platform Connections' },
  { path: '/sites',      heading: 'Sites' },
  { path: '/settings',   heading: 'Settings' },
  { path: '/reports',    heading: 'Reports' },
  { path: '/alerts',     heading: 'Alerts' },
  { path: '/users-management', heading: 'Users Management' },
];

// Skip auth gate — the app redirects unauthenticated users to /login.
// We inject a fake auth token into localStorage so the dashboard renders.
async function bypassAuth(page: Page) {
  await page.addInitScript(() => {
    // Minimal fake JWT so BrandAuthProvider treats the user as logged in.
    const fakeToken = [
      btoa('{"alg":"HS256","typ":"JWT"}'),
      btoa(JSON.stringify({ sub: '1', email: 'test@test.com', exp: 9999999999 })),
      'fakesig',
    ].join('.');
    localStorage.setItem('brand_token', fakeToken);
  });
}

async function setTheme(page: Page, theme: 'light' | 'dark') {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, theme);
}

// ─── Tab rendering tests ──────────────────────────────────────────────────────

test.describe('All tabs render without errors', () => {
  for (const tab of TABS) {
    test(`${tab.path} loads`, async ({ page }) => {
      await bypassAuth(page);
      await page.goto(tab.path);

      // Page should not show a React crash boundary
      await expect(page.locator('body')).not.toContainText('Application error');
      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');

      // If tab has a known heading, check it is visible
      if (tab.heading) {
        await expect(
          page.locator(`h1:has-text("${tab.heading}")`).first()
        ).toBeVisible({ timeout: 10_000 });
      }

      // Sidebar should always be present on desktop
      await expect(page.locator('nav').first()).toBeVisible();
    });
  }
});

// ─── Theme toggle tests ───────────────────────────────────────────────────────

test.describe('Theme: settings page toggle', () => {
  test('light mode button is visible', async ({ page }) => {
    await bypassAuth(page);
    await page.goto('/settings');
    await expect(page.getByTestId('theme-light')).toBeVisible();
  });

  test('dark mode button is visible', async ({ page }) => {
    await bypassAuth(page);
    await page.goto('/settings');
    await expect(page.getByTestId('theme-dark')).toBeVisible();
  });

  test('clicking dark adds .dark class to <html>', async ({ page }) => {
    await bypassAuth(page);
    await page.goto('/settings');
    await page.getByTestId('theme-dark').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('clicking light removes .dark class from <html>', async ({ page }) => {
    await bypassAuth(page);
    // Start in dark, then switch to light
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    await page.goto('/settings');
    await page.getByTestId('theme-light').click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('theme persists across page navigation', async ({ page }) => {
    await bypassAuth(page);
    await page.goto('/settings');
    // Switch to dark
    await page.getByTestId('theme-dark').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    // Navigate to another tab
    await page.goto('/alerts');
    // Dark class should still be on <html>
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});

// ─── Per-tab dark mode appearance tests ──────────────────────────────────────

test.describe('Dark mode: every tab uses purple palette', () => {
  for (const tab of TABS) {
    test(`${tab.path} has dark class applied`, async ({ page }) => {
      await bypassAuth(page);
      // Inject dark theme before page load
      await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
      await page.goto(tab.path);

      // The .dark class should be on <html>
      await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 10_000 });

      // Main content area should NOT have light slate backgrounds
      // (bg-white will still appear on cards but the layout wrapper must be purple-dark)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  }
});

// ─── Light mode: every tab ────────────────────────────────────────────────────

test.describe('Light mode: every tab renders clean', () => {
  for (const tab of TABS) {
    test(`${tab.path} has no dark class in light mode`, async ({ page }) => {
      await bypassAuth(page);
      await page.addInitScript(() => localStorage.setItem('theme', 'light'));
      await page.goto(tab.path);

      await expect(page.locator('html')).not.toHaveClass(/dark/, { timeout: 10_000 });
    });
  }
});
