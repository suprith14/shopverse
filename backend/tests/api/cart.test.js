// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { api, auth, createProduct, createUser } from './helpers.js';

// describe = a group of related tests
// => = an arrow function (a short function)
describe('cart', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('needs a logged-in user', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/cart').expect(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('adding the same item twice increases the quantity (one row, not two)', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ price: 2500, stock: 5 });

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 1 }).expect(201);
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 2 });

    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(201);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toHaveLength = has exactly N items
    expect(res.body.cart.items).toHaveLength(1);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.cart.items[0].quantity).toBe(3);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.cart.subtotal).toBe(7500);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('the price always comes from the database, never from the request', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ price: 2500 });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const res = await api
      // api.post = send a POST request into the app
      .post('/api/cart/items')
      // .set = add a request header (e.g. Authorization: Bearer <token>)
      .set(auth(accessToken))
      // .send = the JSON body of the request
      .send({ variantId: variant.id, quantity: 1, price: 1, unitPrice: 1 }); // a tampered request

    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.cart.items[0].unitPrice).toBe(2500);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test("can't add more than is in stock", async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ stock: 2 });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity: 3 });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(400);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.error.message).toBe('Only 2 left in stock');
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test("can't add an out-of-stock item", async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ stock: 0 });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(400);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.error.message).toBe('This item is out of stock');
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a hidden (inactive) product is "not found"', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ isActive: false });

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id }).expect(404);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('quantity must be a whole number from 1 to 10', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct({ stock: 50 });

    // const = a name for a value that is never reassigned
    for (const quantity of [0, -1, 1.5, 11]) {
      // await = wait for a Promise (async result) before continuing
      // api.post = send a POST request into the app
      // .set = add a request header (e.g. Authorization: Bearer <token>)
      // .send = the JSON body of the request
      // .expect = supertest: fail if the response doesn't match
      await api.post('/api/cart/items').set(auth(accessToken)).send({ variantId: variant.id, quantity }).expect(400);
    }
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('each user only sees their own cart', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const alice = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const bob = await createUser();
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct();

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/cart/items').set(auth(alice.accessToken)).send({ variantId: variant.id }).expect(201);
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    const res = await api.get('/api/cart').set(auth(bob.accessToken)).expect(200);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toHaveLength = has exactly N items
    expect(res.body.cart.items).toHaveLength(0);
  });
});
