# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Create order
- Location: tests\payment.spec.ts:3:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Create order', async ({ request }) => {
  4  |   const res = await request.post('http://localhost:4000/payment/create-order', {
  5  |     data: {
  6  |       amount: 500
  7  |     }
  8  |   });
  9  | 
> 10 |   expect(res.status()).toBe(200);
     |                        ^ Error: expect(received).toBe(expected) // Object.is equality
  11 | });
  12 | 
```