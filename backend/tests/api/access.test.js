import { describe, expect, test } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import { api, auth, createUser } from './helpers.js';

// Who may see what. These are the bugs that leak other people's data, so they're worth a test each.

describe('admin API', () => {
  test('no token: 401', async () => {
    await api.get('/api/admin/products').expect(401);
  });

  test('a customer: 403', async () => {
    const { accessToken } = await createUser();
    await api.get('/api/admin/products').set(auth(accessToken)).expect(403);
  });

  test('an admin: 200', async () => {
    const { accessToken } = await createUser({ role: 'ADMIN' });
    await api.get('/api/admin/products').set(auth(accessToken)).expect(200);
  });
});

describe("another customer's order (IDOR)", () => {
  test('is "not found", exactly like an order that does not exist', async () => {
    const alice = await createUser();
    const bob = await createUser();
    const order = await prisma.order.create({
      data: { userId: alice.user.id, subtotal: 2500, total: 2500 },
    });

    // Alice can see her order...
    await api.get(`/api/orders/${order.id}`).set(auth(alice.accessToken)).expect(200);

    // ...Bob can't, and can't even tell it exists (404, not 403).
    const res = await api.get(`/api/orders/${order.id}`).set(auth(bob.accessToken));
    expect(res.status).toBe(404);

    // Same for the invoice PDF and cancelling.
    await api.get(`/api/orders/${order.id}/invoice`).set(auth(bob.accessToken)).expect(404);
    await api.post(`/api/orders/${order.id}/cancel`).set(auth(bob.accessToken)).expect(404);
  });

  test("Bob's order list doesn't include Alice's orders", async () => {
    const alice = await createUser();
    const bob = await createUser();
    await prisma.order.create({ data: { userId: alice.user.id, subtotal: 1000, total: 1000 } });

    const res = await api.get('/api/orders').set(auth(bob.accessToken)).expect(200);
    expect(JSON.stringify(res.body)).not.toContain(alice.user.id);
  });
});
