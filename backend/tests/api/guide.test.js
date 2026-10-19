import { describe, expect, test } from 'vitest';
import { api, auth, createUser } from './helpers.js';

// vitest.config.js sets GUIDE_PASSWORD=test-guide-password
describe('POST /api/guide/unlock (project guide)', () => {
  test('needs a logged-in user', async () => {
    await api.post('/api/guide/unlock').send({ password: 'test-guide-password' }).expect(401);
  });

  test('a wrong password is refused (403, so the store does not try to refresh the login)', async () => {
    const { accessToken } = await createUser();
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'nope-nope' });
    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Wrong guide password');
    expect(res.body.html).toBeUndefined();
  });

  test('the right password returns the guide, never cached', async () => {
    const { accessToken } = await createUser();
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'test-guide-password' });
    expect(res.status).toBe(200);
    expect(res.body.html).toContain('<title>ShopVerse System Map</title>');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('5 wrong passwords lock that user out for 15 minutes, even with the right one', async () => {
    const { accessToken } = await createUser();
    for (let i = 0; i < 5; i++) {
      await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: `wrong-${i}` }).expect(403);
    }
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'test-guide-password' });
    expect(res.status).toBe(429);
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(14 * 60);
  });
});
