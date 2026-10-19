// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { prisma } from '../../src/lib/prisma.js';
// import = bring in code from another file or package
import { api, auth, createProduct, createUser, PASSWORD, refreshCookie } from './helpers.js';

// const = a name for a value that is never reassigned
const SUSPENDED = 'This account has been suspended. Please contact support.';

// describe = a group of related tests
// => = an arrow function (a short function)
describe('admin: customer list', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('customers only, with online status, order count and total spent', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const shopper = await createUser();
    // await = wait for a Promise (async result) before continuing
    // prisma.user = the User table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    await prisma.user.update({ where: { id: shopper.user.id }, data: { lastSeenAt: new Date() } });
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    await prisma.order.create({ data: { userId: shopper.user.id, status: 'PAID', subtotal: 4000, total: 4000 } });
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    await prisma.order.create({ data: { userId: shopper.user.id, status: 'CANCELLED', subtotal: 999, total: 999 } });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .query = add ?key=value to the URL
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.get('/api/admin/customers').query({ q: shopper.email }).set(auth(admin.accessToken));

    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(200);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toHaveLength = has exactly N items
    expect(res.body.items).toHaveLength(1);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toMatchObject = has at least these properties
    expect(res.body.items[0]).toMatchObject({ email: shopper.email, online: true, orderCount: 2, totalSpent: 4000 });
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBeUndefined = is undefined
    expect(res.body.items[0].passwordHash).toBeUndefined();

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .query = add ?key=value to the URL
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const admins = await api.get('/api/admin/customers').query({ q: admin.email }).set(auth(admin.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // .toHaveLength = has exactly N items
    expect(admins.body.items).toHaveLength(0); // admins are not "customers"
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('customers cannot use it', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const customer = await createUser();
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/admin/customers').set(auth(customer.accessToken)).expect(403);
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('admin: block / unblock', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a blocked customer cannot log in, refresh their session or check out; unblock restores login', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const login = await api.post('/api/auth/register').send({ name: 'Bad Actor', email: 'bad@test.dev', password: PASSWORD });
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // res.body = the JSON the API answered
    const { user, accessToken } = login.body;
    // const = a name for a value that is never reassigned
    const session = refreshCookie(login);

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post(`/api/admin/customers/${user.id}/block`).set(auth(admin.accessToken)).send({ reason: 'chargebacks' }).expect(204);

    // Right password, but blocked: 403 with the suspension message
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const blocked = await api.post('/api/auth/login').send({ email: 'bad@test.dev', password: PASSWORD });
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(blocked.status).toBe(403);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(blocked.body.error.message).toBe(SUSPENDED);

    // Their existing session was ended
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/refresh').set('Cookie', session).expect(401);

    // Their still-valid access token can't be used to buy anything
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { variant } = await createProduct();
    // await = wait for a Promise (async result) before continuing
    // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    await prisma.cartItem.create({ data: { userId: user.id, variantId: variant.id, quantity: 1 } });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const checkout = await api.post('/api/orders').set(auth(accessToken)).send({ addressId: 'any' });
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(checkout.status).toBe(403);

    // The blocked list shows them, with the reason
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .query = add ?key=value to the URL
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const list = await api.get('/api/admin/customers').query({ status: 'blocked', q: 'bad@test.dev' }).set(auth(admin.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toMatchObject = has at least these properties
    expect(list.body.items[0]).toMatchObject({ blockedReason: 'chargebacks' });

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.post(`/api/admin/customers/${user.id}/unblock`).set(auth(admin.accessToken)).expect(204);
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/login').send({ email: 'bad@test.dev', password: PASSWORD }).expect(200);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a wrong password on a blocked account still says "wrong password" (no hint it exists)', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const target = await createUser();
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post(`/api/admin/customers/${target.user.id}/block`).set(auth(admin.accessToken)).send({}).expect(204);

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const res = await api.post('/api/auth/login').send({ email: target.email, password: 'not-the-password' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('admins cannot be blocked from this page', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const otherAdmin = await createUser({ role: 'ADMIN' });
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post(`/api/admin/customers/${otherAdmin.user.id}/block`).set(auth(admin.accessToken)).send({}).expect(404);
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('admin: delete', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a customer without orders is deleted completely', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const target = await createUser();

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.delete = send a DELETE request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.delete(`/api/admin/customers/${target.user.id}`).set(auth(admin.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toEqual = same contents (deep compare)
    // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
    expect(res.body).toEqual({ mode: 'deleted' });
    // expect(value) = check a value; the test fails if the check is false
    // await = wait for a Promise (async result) before continuing
    // prisma.user = the User table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // .toBeNull = is null
    expect(await prisma.user.findUnique({ where: { id: target.user.id } })).toBeNull();
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a customer with orders is anonymised: personal data gone, orders kept', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const target = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    const order = await prisma.order.create({
      // data = Prisma: the values to write
      data: { userId: target.user.id, status: 'DELIVERED', subtotal: 2500, total: 2500 },
    });
    // await = wait for a Promise (async result) before continuing
    // prisma.address = the Address table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    await prisma.address.create({
      // data = Prisma: the values to write
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

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.delete = send a DELETE request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.delete(`/api/admin/customers/${target.user.id}`).set(auth(admin.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toEqual = same contents (deep compare)
    // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
    expect(res.body).toEqual({ mode: 'anonymised', orderCount: 1 });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.user = the User table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    const user = await prisma.user.findUnique({ where: { id: target.user.id } });
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(user.name).toBe('Deleted customer');
    // expect(value) = check a value; the test fails if the check is false
    // .not = the opposite of the next check
    // .toContain = the list/text contains this
    expect(user.email).not.toContain(target.email);
    // expect(value) = check a value; the test fails if the check is false
    // .not = the opposite of the next check
    // .toBeNull = is null
    expect(user.deletedAt).not.toBeNull();
    // expect(value) = check a value; the test fails if the check is false
    // await = wait for a Promise (async result) before continuing
    // prisma.address = the Address table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    // .toBe = exactly equal (===)
    expect(await prisma.address.count({ where: { userId: target.user.id } })).toBe(0);
    // expect(value) = check a value; the test fails if the check is false
    // await = wait for a Promise (async result) before continuing
    // prisma.order = the Order table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    // .not = the opposite of the next check
    // .toBeNull = is null
    expect(await prisma.order.findUnique({ where: { id: order.id } })).not.toBeNull(); // kept for the invoice

    // They can't log in, and their email is free to sign up again
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/login').send({ email: target.email, password: PASSWORD }).expect(401);
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/register').send({ name: 'Back Again', email: target.email, password: PASSWORD }).expect(201);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('an admin cannot delete their own account', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });
    // await = wait for a Promise (async result) before continuing
    // api.delete = send a DELETE request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.delete(`/api/admin/customers/${admin.user.id}`).set(auth(admin.accessToken)).expect(400);
  });
});
