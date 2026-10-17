import { describe, expect, test } from 'vitest';
import { api, auth, createProduct, createUser } from './helpers.js';

describe('cart', () => {
  test('needs a logged-in user', async () => {
    await api.get('/api/cart').expect(401);
  });

  test('adding the same item twice increases the quantity (one row, not two)', async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ price: 2500, stock: 5 });

    await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 1 }).expect(201);
    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.cart.items).toHaveLength(1);
    expect(res.body.cart.items[0].quantity).toBe(3);
    expect(res.body.cart.subtotal).toBe(7500);
  });

  test('the price always comes from the database, never from the request', async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ price: 2500 });

    const res = await api
      .post('/api/cart/items')
      .set(auth(accessToken))
      .send({ variantId: variant.id, quantity: 1, price: 1, unitPrice: 1 }); // a tampered request

    expect(res.body.cart.items[0].unitPrice).toBe(2500);
  });

  test("can't add more than is in stock", async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ stock: 2 });

    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Only 2 left in stock');
  });

  test("can't add an out-of-stock item", async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ stock: 0 });

    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('This item is out of stock');
  });

  test('a hidden (inactive) product is "not found"', async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ isActive: false });

    await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id }).expect(404);
  });

  test('quantity must be a whole number from 1 to 10', async () => {
    const { accessToken } = await createUser();
    const { variant } = await createProduct({ stock: 50 });

    for (const quantity of [0, -1, 1.5, 11]) {
      await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity }).expect(400);
    }
  });

  test('each user only sees their own cart', async () => {
    const alice = await createUser();
    const bob = await createUser();
    const { variant } = await createProduct();

    await api.post('/api/cart/items').set(auth(alice.accessToken)).send({ variantId: variant.id }).expect(201);
    const res = await api.get('/api/cart').set(auth(bob.accessToken)).expect(200);
    expect(res.body.cart.items).toHaveLength(0);
  });
});
