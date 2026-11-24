const { test, expect } = require('@playwright/test');

const pageErrors = new WeakMap();

test.beforeEach(async ({ page }) => {
  pageErrors.set(page, []);
  page.on('pageerror', error => pageErrors.get(page).push(error.message));
  await page.route('https://**/*', route => route.abort());
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page), 'unexpected browser JavaScript errors').toEqual([]);
});

async function openWithoutConsentBanner(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('hia_cookies', 'declined'));
  await page.reload();
}

test('main navigation reaches the contact form', async ({ page }) => {
  await openWithoutConsentBanner(page);
  await page.locator('.main-nav a[href="#contact-form"]').click();
  await expect(page).toHaveURL(/#contact-form$/);
  await expect(page.locator('#contact-form')).toBeVisible();
});

test('mobile navigation keeps donation available and transfers focus to its dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWithoutConsentBanner(page);

  const menuButton = page.locator('#menuToggle');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#drawer .donate-btn')).toBeVisible();

  await page.locator('#drawer .donate-btn').click();
  const dialog = page.getByRole('dialog', { name: 'Make a Donation' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test('phone and tablet layouts fit the viewport and keep key controls usable', async ({ page }) => {
  await openWithoutConsentBanner(page);

  for (const width of [320, 360, 390, 430, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    if (width <= 600) {
      await expect(page.locator('#menuToggle')).toBeVisible();
      const heroDonate = page.locator('.hero-ctas .donate-btn').first();
      await expect(heroDonate).toBeVisible();
      const heroBox = await heroDonate.boundingBox();
      expect(heroBox.x).toBeGreaterThanOrEqual(0);
      expect(heroBox.x + heroBox.width).toBeLessThanOrEqual(width);

      await heroDonate.click();
      const modal = await page.locator('.modal-box').boundingBox();
      expect(modal.x).toBeGreaterThanOrEqual(0);
      expect(modal.x + modal.width).toBeLessThanOrEqual(width);
      expect(modal.y).toBeGreaterThanOrEqual(0);
      expect(modal.y + modal.height).toBeLessThanOrEqual(844);
      await page.keyboard.press('Escape');
    }
  }
});

test('donation methods switch tabs and Escape restores focus', async ({ page }) => {
  await openWithoutConsentBanner(page);
  const donateButton = page.locator('.hero-ctas .donate-btn').first();
  await donateButton.click();

  const dialog = page.getByRole('dialog', { name: 'Make a Donation' });
  await expect(dialog).toBeVisible();
  const bankTransferTab = page.getByRole('tab', { name: 'Bank Transfer' });
  await bankTransferTab.click();
  await expect(page.locator('#panel-bank')).toBeVisible();
  await expect(page.locator('#panel-bank')).toContainText('PostFinance');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(donateButton).toBeFocused();
});

test('contact form submits to a stub and announces success', async ({ page }) => {
  await page.route('https://formspree.io/f/maqrqwql', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '{}'
  }));
  await openWithoutConsentBanner(page);
  await page.locator('#cf-name').fill('Test Donor');
  await page.locator('#cf-email').fill('donor@example.test');
  await page.locator('#cf-subject').selectOption('Donation Question');
  await page.locator('#cf-message').fill('This is a browser test.');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(page.getByRole('status').filter({ hasText: 'Message sent' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sent!' })).toBeEnabled();
});

test('essential-only choice persists and keeps optional analytics unloaded', async ({ page }) => {
  let analyticsRequested = false;
  page.on('request', request => {
    if(request.url().includes('faro-collector') || request.url().includes('faro-web-sdk')) analyticsRequested = true;
  });

  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Cookie preferences' });
  await expect(banner).toBeVisible({ timeout: 4_000 });
  await page.getByRole('button', { name: 'Essential only' }).click();
  await expect(banner).toBeHidden();
  await page.reload();
  await expect(banner).toBeHidden();
  expect(analyticsRequested).toBe(false);

  await page.locator('.cookie-settings').click();
  await expect(banner).toBeVisible();
});

test('video iframe loads only after the visitor activates it', async ({ page }) => {
  await openWithoutConsentBanner(page);
  const frame = page.locator('.video-wrap iframe');
  await expect(frame).toHaveAttribute('src', 'about:blank');

  await page.getByRole('button', { name: 'Load video' }).click();
  await expect(frame).toHaveAttribute('src', /youtube-nocookie\.com\/embed/);
  await expect(page.getByRole('button', { name: 'Load video' })).toBeHidden();
});

test('French language choice translates key content and updates the document language', async ({ page }) => {
  await openWithoutConsentBanner(page);
  await page.getByRole('button', { name: 'FR' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('.hero h1')).toContainText('Soutenir les veuves');
  await expect(page.locator('label[for="cf-name"]')).toHaveText('Nom complet');
  await expect(page.getByRole('button', { name: 'FR' })).toHaveAttribute('aria-pressed', 'true');
});
