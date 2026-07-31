import { test, expect } from '@playwright/test';

test('Create order', async ({ request }) => {
  const res = await request.post('http://localhost:4000/payment/create-order', {
    data: {
      amount: 500
    }
  });

  expect(res.status()).toBe(200);
});
