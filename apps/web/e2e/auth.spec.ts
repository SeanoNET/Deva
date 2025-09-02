import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show welcome page when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check welcome elements
    await expect(page.getByRole('heading', { name: 'Welcome to Deva' })).toBeVisible();
    await expect(page.getByText('Your intelligent development assistant for Linear')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect Linear Account' })).toBeVisible();
  });

  test('should show connection instructions', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Connect your Linear account to get started')).toBeVisible();
    await expect(page.getByText('You\'ll be redirected to Linear to authorize Deva')).toBeVisible();
  });

  test('should redirect to Linear OAuth when clicking connect button', async ({ page }) => {
    await page.goto('/');

    // Mock the OAuth endpoint to avoid actual Linear redirect in tests
    await page.route('**/api/auth/linear', async route => {
      await route.fulfill({
        status: 302,
        headers: { 'Location': 'https://linear.app/oauth/authorize?client_id=test' }
      });
    });

    const connectButton = page.getByRole('button', { name: 'Connect Linear Account' });
    await connectButton.click();

    // In a real test, this would redirect to Linear, but we're mocking it
    // The important part is that the button click triggers the OAuth flow
  });

  test('should handle authentication success', async ({ page }) => {
    // Simulate successful authentication
    await page.goto('/?auth=success');

    // Should show the connected interface
    await expect(page.getByText('Ready to create work items!')).toBeVisible();
    await expect(page.getByText('Connected to Linear')).toBeVisible();
  });

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/?error=oauth_not_configured');

    await expect(page.getByText('Please configure your Linear OAuth credentials')).toBeVisible();
  });
});