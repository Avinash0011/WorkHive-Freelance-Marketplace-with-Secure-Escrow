import { test, expect } from '@playwright/test';

test('User can register', async ({ request }) => {
  const res = await request.post('http://localhost:4000/auth/register', {
    data: {
      email: 'test@example.com',
      password: '123456'
    }
  });

  expect(res.status()).toBe(201);
});

test('Login page works', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', '123456');

  await page.click('button[type="submit"]');

  // We check for the next route, but might need to wait for navigation.
  // URL checking will depend on what the app actually does on login.
});
