// import = bring in code from another file or package
// beforeAll = run once before all tests in this file
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { beforeAll, describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { prisma } from '../../src/lib/prisma.js';
// import = bring in code from another file or package
import { api, auth, createUser, PASSWORD } from './helpers.js';

// vitest.config.js sets PROTECTED_ACCOUNTS=shared-demo@test.dev: this file's "public demo account".
// const = a name for a value that is never reassigned
const DEMO = 'shared-demo@test.dev';
// let = a name whose value can be changed later
let demo;

// beforeAll = run once before all tests in this file
// => = an arrow function (a short function)
// async = this function works with await and returns a Promise
beforeAll(async () => {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // api.post = send a POST request into the app
  // .send = the JSON body of the request
  const res = await api.post('/api/auth/register').send({ name: 'Shared Demo', email: DEMO, password: PASSWORD });
  // res.body = the JSON the API answered
  demo = res.body;
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('a shared demo account', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('can still log in and shop normally', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/login').send({ email: DEMO, password: PASSWORD }).expect(200);
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/cart').set(auth(demo.accessToken)).expect(200);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test("its password can't be changed from My account", async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const res = await api
      // api.post = send a POST request into the app
      .post('/api/auth/change-password')
      // .set = add a request header (e.g. Authorization: Bearer <token>)
      .set(auth(demo.accessToken))
      // .send = the JSON body of the request
      .send({ currentPassword: PASSWORD, newPassword: 'hijacked-password' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(403);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.error.message).toBe("This is a shared demo account: its password can't be changed.");
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/login').send({ email: DEMO, password: PASSWORD }).expect(200); // still works
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('"forgot password" sends no code, and a reset is refused', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    const before = await prisma.passwordResetCode.count({ where: { userId: demo.user.id } });
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/forgot-password').send({ email: DEMO }).expect(200); // same answer as any email
    // await = wait for a Promise (async result) before continuing
    // new = create an object from a class (e.g. new Date())
    // Promise = a value that arrives later; Promise.all waits for several at once
    // => = an arrow function (a short function)
    // setTimeout = run a function once after a delay (ms)
    await new Promise((r) => setTimeout(r, 300)); // the work runs after replying
    // expect(value) = check a value; the test fails if the check is false
    // await = wait for a Promise (async result) before continuing
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    // .toBe = exactly equal (===)
    expect(await prisma.passwordResetCode.count({ where: { userId: demo.user.id } })).toBe(before);

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const res = await api
      // api.post = send a POST request into the app
      .post('/api/auth/reset-password')
      // .send = the JSON body of the request
      .send({ email: DEMO, code: '123456', newPassword: 'hijacked-password' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(403);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test("admins can't block or delete it, and the list marks it as protected", async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const admin = await createUser({ role: 'ADMIN' });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .query = add ?key=value to the URL
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const list = await api.get('/api/admin/customers').query({ q: DEMO }).set(auth(admin.accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toMatchObject = has at least these properties
    expect(list.body.items[0]).toMatchObject({ email: DEMO, protected: true });

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const block = await api.post(`/api/admin/customers/${demo.user.id}/block`).set(auth(admin.accessToken)).send({});
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(block.status).toBe(403);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(block.body.error.message).toBe("This is a shared demo account: it can't be blocked or deleted.");
    // await = wait for a Promise (async result) before continuing
    // api.delete = send a DELETE request into the app
    // `text ${x}` = a template string: text with values inserted
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.delete(`/api/admin/customers/${demo.user.id}`).set(auth(admin.accessToken)).expect(403);

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.user = the User table (model in prisma/schema.prisma)
    // findUnique = read one row by a unique field (id, email); null if missing
    // where = Prisma filter: which rows
    const user = await prisma.user.findUnique({ where: { id: demo.user.id } });
    // expect(value) = check a value; the test fails if the check is false
    // .toBeNull = is null
    expect(user.blockedAt).toBeNull();
    // expect(value) = check a value; the test fails if the check is false
    // .toBeNull = is null
    expect(user.deletedAt).toBeNull();
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('other accounts are not affected', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const normal = await createUser();
    // await = wait for a Promise (async result) before continuing
    await api
      // api.post = send a POST request into the app
      .post('/api/auth/change-password')
      // .set = add a request header (e.g. Authorization: Bearer <token>)
      .set(auth(normal.accessToken))
      // .send = the JSON body of the request
      .send({ currentPassword: PASSWORD, newPassword: 'a-new-password' })
      // .expect = supertest: fail if the response doesn't match
      .expect(200);
  });
});
