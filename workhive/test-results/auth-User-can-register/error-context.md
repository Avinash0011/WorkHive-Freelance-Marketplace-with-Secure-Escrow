# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> User can register
- Location: tests\auth.spec.ts:3:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 400
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('User can register', async ({ request }) => {
  4  |   const res = await request.post('http://localhost:4000/auth/register', {
  5  |     data: {
  6  |       email: 'test@example.com',
  7  |       password: '123456'
  8  |     }
  9  |   });
  10 | 
> 11 |   expect(res.status()).toBe(201);
     |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  12 | });
  13 | 
  14 | test('Login page works', async ({ page }) => {
  15 |   await page.goto('/login');
  16 | 
  17 |   await page.fill('input[name="email"]', 'test@example.com');
  18 |   await page.fill('input[name="password"]', '123456');
  19 | 
  20 |   await page.click('button[type="submit"]');
  21 | 
  22 |   // We check for the next route, but might need to wait for navigation.
  23 |   // URL checking will depend on what the app actually does on login.
  24 | });
  25 | 
```