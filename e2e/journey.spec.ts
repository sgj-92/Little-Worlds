import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('child journey: home → create → generating → player → library', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /maya/i })).toBeVisible();
  await page.getByRole('link', { name: 'Make a new story' }).click();

  await expect(page.getByRole('heading', { name: 'What’s your story about?' })).toBeVisible();
  await page.getByRole('button', { name: /space/i }).click();
  await page.getByRole('button', { name: /make my story/i }).click();

  await expect(page.getByRole('heading', { name: 'Making your story' })).toBeVisible();
  await page.getByRole('button', { name: /play my story/i }).click({ timeout: 20_000 });

  await expect(page.getByRole('heading', { name: /robot who counted the stars/i })).toBeVisible();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Next part' }).click();
  await expect(page.getByText('Part 2 of 4')).toBeVisible();

  await page.getByRole('button', { name: 'Go back' }).click();
  await expect(page.getByRole('heading', { name: 'My storybooks' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(7);
});

test('a story in progress survives a reload and can be retried after failure', async ({ page }) => {
  await page.evaluate(() => {
    const raw = window.localStorage.getItem('lw.settings.v1');
    const settings = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem('lw.settings.v1', JSON.stringify({ ...settings, prototype: { simulateFailure: 'narrating' } }));
  });
  await page.goto('/create');
  await page.getByRole('button', { name: /garden/i }).click();
  await page.getByRole('button', { name: /make my story/i }).click();
  await expect(page.getByRole('heading', { name: 'Making your story' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: /try that again/i })).toBeVisible({ timeout: 20_000 });

  await page.goto('/');
  await expect(page.getByText('Your story needs a little help')).toBeVisible();
  await page.getByText('Your story needs a little help').click();
  await page.getByRole('button', { name: /try again/i }).click();
  await expect(page.getByRole('button', { name: /play my story/i })).toBeVisible({ timeout: 20_000 });
});

test('no horizontal overflow on key screens', async ({ page }) => {
  for (const path of ['/', '/create', '/library', '/story/sample_fox', '/parent']) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
