// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { prisma } from '../../src/lib/prisma.js';
// import = bring in code from another file or package
import { api, auth, createUser } from './helpers.js';

// Who may see what. These are the bugs that leak other people's data, so they're worth a test each.

// describe = a group of related tests
// => = an arrow function (a short function)
describe('admin API', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('no token: 401', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/admin/products').expect(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a customer: 403', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/admin/products').set(auth(accessToken)).expect(403);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('an admin: 200', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser({ role: 'ADMIN' });
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/admin/products').set(auth(accessToken)).expect(200);
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe("another customer's order (IDOR)", () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('is "not found", exactly like an order that does not exist', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const alice = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const bob = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    const order = await prisma.order.create({
      // data = Prisma: the values to write
      data: { userId: alice.user.id, subtotal: 2500, total: 2500 },
    });

    // Alice can see her order...
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get(`/api/orders/${order.id}`).set(auth(alice.accessToken)).expect(200);

    // ...Bob can't, and can't even tell it exists (404, not 403).
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.get(`/api/orders/${order.id}`).set(auth(bob.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(404);

    // Same for the invoice PDF and cancelling.
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get(`/api/orders/${order.id}/invoice`).set(auth(bob.accessToken)).expect(404);
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.post(`/api/orders/${order.id}/cancel`).set(auth(bob.accessToken)).expect(404);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test("Bob's order list doesn't include Alice's orders", async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const alice = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const bob = await createUser();
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    await prisma.order.create({ data: { userId: alice.user.id, subtotal: 1000, total: 1000 } });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    const res = await api.get('/api/orders').set(auth(bob.accessToken)).expect(200);
    // expect(value) = check a value; the test fails if the check is false
    // JSON.parse / JSON.stringify = text <-> object
    // JSON.stringify = object -> JSON text
    // res.body = the JSON the API answered
    // .not = the opposite of the next check
    // .toContain = the list/text contains this
    expect(JSON.stringify(res.body)).not.toContain(alice.user.id);
  });
});
