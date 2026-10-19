import { beforeAll, describe, expect, test } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';
import { api, auth, createUser, PASSWORD } from './helpers.js';

// vitest.config.js sets PROTECTED_ACCOUNTS=shared-demo@test.dev: this file's "public demo account".
const DEMO = 'shared-demo@test.dev';
let demo;

beforeAll(async () => {
  const res = await api.post('/api/auth/register').send({ name: 'Shared Demo', email: DEMO, password: PASSWORD });
  demo = res.body;
});

describe('a shared demo account', () => {
  test('can still log in and shop normally', async () => {
    await api.post('/api/auth/login').send({ email: DEMO, password: PASSWORD }).expect(200);
    await api.get('/api/cart').set(auth(demo.accessToken)).expect(200);
  });

  test("its password can't be changed from My account", async () => {
    const res = await api
      .post('/api/auth/change-password')
      .set(auth(demo.accessToken))
      .send({ currentPassword: PASSWORD, newPassword: 'hijacked-password' });
    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe("This is a shared demo account: its password can't be changed.");
    await api.post('/api/auth/login').send({ email: DEMO, password: PASSWORD }).expect(200); // still works
  });

  test('"forgot password" sends no code, and a reset is refused', async () => {
    const before = await prisma.passwordResetCode.count({ where: { userId: demo.user.id } });
    await api.post('/api/auth/forgot-password').send({ email: DEMO }).expect(200); // same answer as any email
    await new Promise((r) => setTimeout(r, 300)); // the work runs after replying
    expect(await prisma.passwordResetCode.count({ where: { userId: demo.user.id } })).toBe(before);

    const res = await api
      .post('/api/auth/reset-password')
      .send({ email: DEMO, code: '123456', newPassword: 'hijacked-password' });
    expect(res.status).toBe(403);
  });

  test("admins can't block or delete it, and the list marks it as protected", async () => {
    const admin = await createUser({ role: 'ADMIN' });

    const list = await api.get('/api/admin/customers').query({ q: DEMO }).set(auth(admin.accessToken));
    expect(list.body.items[0]).toMatchObject({ email: DEMO, protected: true });

    const block = await api.post(`/api/admin/customers/${demo.user.id}/block`).set(auth(admin.accessToken)).send({});
    expect(block.status).toBe(403);
    expect(block.body.error.message).toBe("This is a shared demo account: it can't be blocked or deleted.");
    await api.delete(`/api/admin/customers/${demo.user.id}`).set(auth(admin.accessToken)).expect(403);

    const user = await prisma.user.findUnique({ where: { id: demo.user.id } });
    expect(user.blockedAt).toBeNull();
    expect(user.deletedAt).toBeNull();
  });

  test('other accounts are not affected', async () => {
    const normal = await createUser();
    await api
      .post('/api/auth/change-password')
      .set(auth(normal.accessToken))
      .send({ currentPassword: PASSWORD, newPassword: 'a-new-password' })
      .expect(200);
  });
});
