import { describe, expect, test } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import { api, auth, createProduct, createUser, PASSWORD, refreshCookie } from './helpers.js';

const SUSPENDED = 'This account has been suspended. Please contact support.';

describe('admin: customer list', () => {
  test('customers only, with online status, order count and total spent', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const shopper = await createUser();
    await prisma.user.update({ where: { id: shopper.user.id }, data: { lastSeenAt: new Date() } });
    await prisma.order.create({ data: { userId: shopper.user.id, status: 'PAID', subtotal: 4000, total: 4000 } });
    await prisma.order.create({ data: { userId: shopper.user.id, status: 'CANCELLED', subtotal: 999, total: 999 } });

    const res = await api.get('/api/admin/customers').query({ q: shopper.email }).set(auth(admin.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({ email: shopper.email, online: true, orderCount: 2, totalSpent: 4000 });
    expect(res.body.items[0].passwordHash).toBeUndefined();

    const admins = await api.get('/api/admin/customers').query({ q: admin.email }).set(auth(admin.accessToken));
    expect(admins.body.items).toHaveLength(0); // admins are not "customers"
  });

  test('customers cannot use it', async () => {
    const customer = await createUser();
    await api.get('/api/admin/customers').set(auth(customer.accessToken)).expect(403);
  });
});

describe('admin: block / unblock', () => {
  test('a blocked customer cannot log in, refresh their session or check out; unblock restores login', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const login = await api.post('/api/auth/register').send({ name: 'Bad Actor', email: 'bad@test.dev', password: PASSWORD });
    const { user, accessToken } = login.body;
    const session = refreshCookie(login);

    await api.post(`/api/admin/customers/${user.id}/block`).set(auth(admin.accessToken)).send({ reason: 'chargebacks' }).expect(204);

    // Right password, but blocked: 403 with the suspension message
    const blocked = await api.post('/api/auth/login').send({ email: 'bad@test.dev', password: PASSWORD });
    expect(blocked.status).toBe(403);
    expect(blocked.body.error.message).toBe(SUSPENDED);

    // Their existing session was ended
    await api.post('/api/auth/refresh').set('Cookie', session).expect(401);

    // Their still-valid access token can't be used to buy anything
    const { variant } = await createProduct();
    await prisma.cartItem.create({ data: { userId: user.id, variantId: variant.id, quantity: 1 } });
    const checkout = await api.post('/api/orders').set(auth(accessToken)).send({ addressId: 'any' });
    expect(checkout.status).toBe(403);

    // The blocked list shows them, with the reason
    const list = await api.get('/api/admin/customers').query({ status: 'blocked', q: 'bad@test.dev' }).set(auth(admin.accessToken));
    expect(list.body.items[0]).toMatchObject({ blockedReason: 'chargebacks' });

    await api.post(`/api/admin/customers/${user.id}/unblock`).set(auth(admin.accessToken)).expect(204);
    await api.post('/api/auth/login').send({ email: 'bad@test.dev', password: PASSWORD }).expect(200);
  });

  test('a wrong password on a blocked account still says "wrong password" (no hint it exists)', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const target = await createUser();
    await api.post(`/api/admin/customers/${target.user.id}/block`).set(auth(admin.accessToken)).send({}).expect(204);

    const res = await api.post('/api/auth/login').send({ email: target.email, password: 'not-the-password' });
    expect(res.status).toBe(401);
  });

  test('admins cannot be blocked from this page', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const otherAdmin = await createUser({ role: 'ADMIN' });
    await api.post(`/api/admin/customers/${otherAdmin.user.id}/block`).set(auth(admin.accessToken)).send({}).expect(404);
  });
});

describe('admin: delete', () => {
  test('a customer without orders is deleted completely', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const target = await createUser();

    const res = await api.delete(`/api/admin/customers/${target.user.id}`).set(auth(admin.accessToken));
    expect(res.body).toEqual({ mode: 'deleted' });
    expect(await prisma.user.findUnique({ where: { id: target.user.id } })).toBeNull();
  });

  test('a customer with orders is anonymised: personal data gone, orders kept', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const target = await createUser();
    const order = await prisma.order.create({
      data: { userId: target.user.id, status: 'DELIVERED', subtotal: 2500, total: 2500 },
    });
    await prisma.address.create({
      data: {
        userId: target.user.id,
        fullName: 'Real Name',
        phone: '+919876543210',
        line1: '1 Street',
        city: 'Bengaluru',
        state: 'KA',
        postalCode: '560001',
        country: 'IN',
      },
    });

    const res = await api.delete(`/api/admin/customers/${target.user.id}`).set(auth(admin.accessToken));
    expect(res.body).toEqual({ mode: 'anonymised', orderCount: 1 });

    const user = await prisma.user.findUnique({ where: { id: target.user.id } });
    expect(user.name).toBe('Deleted customer');
    expect(user.email).not.toContain(target.email);
    expect(user.deletedAt).not.toBeNull();
    expect(await prisma.address.count({ where: { userId: target.user.id } })).toBe(0);
    expect(await prisma.order.findUnique({ where: { id: order.id } })).not.toBeNull(); // kept for the invoice

    // They can't log in, and their email is free to sign up again
    await api.post('/api/auth/login').send({ email: target.email, password: PASSWORD }).expect(401);
    await api.post('/api/auth/register').send({ name: 'Back Again', email: target.email, password: PASSWORD }).expect(201);
  });

  test('an admin cannot delete their own account', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    await api.delete(`/api/admin/customers/${admin.user.id}`).set(auth(admin.accessToken)).expect(400);
  });
});
