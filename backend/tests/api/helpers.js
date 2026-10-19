import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

// Supertest sends requests straight into the Express app: no server, no port.
export const api = request(createApp());

export const PASSWORD = 'correct-horse-battery';

// Every test makes its own data with unique emails/slugs, so tests never depend on each other.
const unique = () => randomUUID().slice(0, 8);

// Signs up a new user through the real API. Returns the user and an access token.
// role: 'ADMIN' promotes the user in the database, then logs in again so the token carries the role.
export async function createUser({ role = 'CUSTOMER' } = {}) {
  const email = `user-${unique()}@test.dev`;
  const res = await api.post('/api/auth/register').send({ name: 'Test User', email, password: PASSWORD });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);

  if (role === 'CUSTOMER') return { ...res.body, email };

  await prisma.user.update({ where: { id: res.body.user.id }, data: { role } });
  const login = await api.post('/api/auth/login').send({ email, password: PASSWORD });
  return { ...login.body, email };
}

// Adds a product with one variant directly in the database (faster than the admin API).
export async function createProduct({ price = 2500, stock = 5, isActive = true } = {}) {
  const id = unique();
  const product = await prisma.product.create({
    data: {
      name: `Test Product ${id}`,
      slug: `test-product-${id}`,
      description: 'Made by a test',
      basePrice: price,
      isActive,
      category: { create: { name: `Test Category ${id}`, slug: `test-category-${id}` } },
      variants: { create: { sku: `TEST-${id}`, name: 'Default', price, stock } },
    },
    include: { variants: true },
  });
  return { product, variant: product.variants[0] };
}

// "Authorization: Bearer <token>"
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

// The refresh token cookie from a response, ready to send back in a Cookie header.
export const refreshCookie = (res) =>
  (res.headers['set-cookie'] ?? []).find((c) => c.startsWith('refreshToken='))?.split(';')[0];
