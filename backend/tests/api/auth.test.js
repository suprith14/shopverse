import { describe, expect, test } from 'vitest';
import { api, auth, createUser, PASSWORD, refreshCookie } from './helpers.js';

describe('POST /api/auth/register', () => {
  test('creates the account, returns a token and sets a secure refresh cookie', async () => {
    const res = await api
      .post('/api/auth/register')
      .send({ name: 'Asha', email: 'Asha@Test.dev', password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Asha', email: 'asha@test.dev', role: 'CUSTOMER' });
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.passwordHash).toBeUndefined(); // never leaves the server

    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('refreshToken='));
    expect(cookie).toContain('HttpOnly'); // JavaScript (and so XSS) can't read it
    expect(cookie).toContain('Path=/api/auth'); // only sent to auth endpoints
  });

  test('rejects an email that is already registered', async () => {
    const { email } = await createUser();
    const res = await api.post('/api/auth/register').send({ name: 'Again', email, password: PASSWORD });
    expect(res.status).toBe(409);
  });

  test('rejects a short password with a field-level message', async () => {
    const res = await api.post('/api/auth/register').send({ name: 'Asha', email: 'short@test.dev', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toContainEqual({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  });
});

describe('POST /api/auth/login', () => {
  test('logs in with the right password', async () => {
    const { email } = await createUser();
    const res = await api.post('/api/auth/login').send({ email, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  test('wrong password and unknown email get the SAME answer (no account enumeration)', async () => {
    const { email } = await createUser();
    const wrongPassword = await api.post('/api/auth/login').send({ email, password: 'not-the-password' });
    const unknownEmail = await api.post('/api/auth/login').send({ email: 'nobody@test.dev', password: 'whatever1' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  test('locks the account for 15 minutes after 5 wrong passwords, even for the right one', async () => {
    const { email } = await createUser();
    for (let i = 0; i < 5; i++) {
      await api.post('/api/auth/login').send({ email, password: 'wrong-password' }).expect(401);
    }

    const res = await api.post('/api/auth/login').send({ email, password: PASSWORD });
    expect(res.status).toBe(429);
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(14 * 60); // seconds
  });
});

describe('GET /api/auth/me', () => {
  test('needs a token', async () => {
    await api.get('/api/auth/me').expect(401);
  });

  test('rejects a fake token', async () => {
    await api.get('/api/auth/me').set(auth('not.a.real-token')).expect(401);
  });

  test('returns the logged-in user', async () => {
    const { accessToken, email } = await createUser();
    const res = await api.get('/api/auth/me').set(auth(accessToken));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain(email);
  });
});

describe('POST /api/auth/refresh (token rotation)', () => {
  test('a refresh token works once and is replaced by a new one', async () => {
    const register = await api
      .post('/api/auth/register')
      .send({ name: 'Ravi', email: 'ravi@test.dev', password: PASSWORD });
    const first = refreshCookie(register);

    const res = await api.post('/api/auth/refresh').set('Cookie', first);
    expect(res.status).toBe(200);
    expect(refreshCookie(res)).not.toBe(first);
  });

  test('reusing an old refresh token is treated as theft: every session is ended', async () => {
    const register = await api
      .post('/api/auth/register')
      .send({ name: 'Meera', email: 'meera@test.dev', password: PASSWORD });
    const stolen = refreshCookie(register);

    const rotated = await api.post('/api/auth/refresh').set('Cookie', stolen); // the real user refreshes
    const current = refreshCookie(rotated);

    await api.post('/api/auth/refresh').set('Cookie', stolen).expect(401); // the thief replays the old one
    await api.post('/api/auth/refresh').set('Cookie', current).expect(401); // the real session is gone too
  });
});
