// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { api, auth, createUser, PASSWORD, refreshCookie } from './helpers.js';

// describe = a group of related tests
// => = an arrow function (a short function)
describe('POST /api/auth/register', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('creates the account, returns a token and sets a secure refresh cookie', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const res = await api
      // api.post = send a POST request into the app
      .post('/api/auth/register')
      // .send = the JSON body of the request
      .send({ name: 'Asha', email: 'Asha@Test.dev', password: PASSWORD });

    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(201);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toMatchObject = has at least these properties
    expect(res.body.user).toMatchObject({ name: 'Asha', email: 'asha@test.dev', role: 'CUSTOMER' });
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toEqual = same contents (deep compare)
    expect(res.body.accessToken).toEqual(expect.any(String));
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBeUndefined = is undefined
    expect(res.body.user.passwordHash).toBeUndefined(); // never leaves the server

    // const = a name for a value that is never reassigned
    // obj[key] = read the property whose name is stored in key
    // res.headers = the response headers
    // .find = the first item that passes a test (or undefined)
    // => = an arrow function (a short function)
    // .startsWith = true if the text begins with this
    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('refreshToken='));
    // expect(value) = check a value; the test fails if the check is false
    // .toContain = the list/text contains this
    expect(cookie).toContain('HttpOnly'); // JavaScript (and so XSS) can't read it
    // expect(value) = check a value; the test fails if the check is false
    // .toContain = the list/text contains this
    expect(cookie).toContain('Path=/api/auth'); // only sent to auth endpoints
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('rejects an email that is already registered', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { email } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const res = await api.post('/api/auth/register').send({ name: 'Again', email, password: PASSWORD });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(409);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('rejects a short password with a field-level message', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const res = await api.post('/api/auth/register').send({ name: 'Asha', email: 'short@test.dev', password: '123' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(400);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toContainEqual = the list contains an item equal to this
    expect(res.body.error.details).toContainEqual({
      field: 'password',
      message: 'Password must be at least 8 characters',
    });
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('POST /api/auth/login', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('logs in with the right password', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { email } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const res = await api.post('/api/auth/login').send({ email, password: PASSWORD });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(200);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toEqual = same contents (deep compare)
    expect(res.body.accessToken).toEqual(expect.any(String));
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('wrong password and unknown email get the SAME answer (no account enumeration)', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { email } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const wrongPassword = await api.post('/api/auth/login').send({ email, password: 'not-the-password' });
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const unknownEmail = await api.post('/api/auth/login').send({ email: 'nobody@test.dev', password: 'whatever1' });

    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(wrongPassword.status).toBe(401);
    // expect(value) = check a value; the test fails if the check is false
    // .toBe = exactly equal (===)
    expect(unknownEmail.status).toBe(401);
    // expect(value) = check a value; the test fails if the check is false
    // .toEqual = same contents (deep compare)
    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('locks the account for 15 minutes after 5 wrong passwords, even for the right one', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { email } = await createUser();
    // let = a name whose value can be changed later
    for (let i = 0; i < 5; i++) {
      // await = wait for a Promise (async result) before continuing
      // api.post = send a POST request into the app
      // .send = the JSON body of the request
      // .expect = supertest: fail if the response doesn't match
      await api.post('/api/auth/login').send({ email, password: 'wrong-password' }).expect(401);
    }

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    const res = await api.post('/api/auth/login').send({ email, password: PASSWORD });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(429);
    // expect(value) = check a value; the test fails if the check is false
    // obj[key] = read the property whose name is stored in key
    // res.headers = the response headers
    // .toBeGreaterThan = is a bigger number
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(14 * 60); // seconds
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('GET /api/auth/me', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('needs a token', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/auth/me').expect(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('rejects a fake token', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.get('/api/auth/me').set(auth('not.a.real-token')).expect(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('returns the logged-in user', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken, email } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.get = send a GET request into the app (no real server needed)
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.get('/api/auth/me').set(auth(accessToken));
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(200);
    // expect(value) = check a value; the test fails if the check is false
    // JSON.parse / JSON.stringify = text <-> object
    // JSON.stringify = object -> JSON text
    // res.body = the JSON the API answered
    // .toContain = the list/text contains this
    expect(JSON.stringify(res.body)).toContain(email);
  });
});

// describe = a group of related tests
// => = an arrow function (a short function)
describe('POST /api/auth/refresh (token rotation)', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a refresh token works once and is replaced by a new one', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const register = await api
      // api.post = send a POST request into the app
      .post('/api/auth/register')
      // .send = the JSON body of the request
      .send({ name: 'Ravi', email: 'ravi@test.dev', password: PASSWORD });
    // const = a name for a value that is never reassigned
    const first = refreshCookie(register);

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const res = await api.post('/api/auth/refresh').set('Cookie', first);
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(200);
    // expect(value) = check a value; the test fails if the check is false
    // .not = the opposite of the next check
    // .toBe = exactly equal (===)
    expect(refreshCookie(res)).not.toBe(first);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('reusing an old refresh token is treated as theft: every session is ended', async () => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    const register = await api
      // api.post = send a POST request into the app
      .post('/api/auth/register')
      // .send = the JSON body of the request
      .send({ name: 'Meera', email: 'meera@test.dev', password: PASSWORD });
    // const = a name for a value that is never reassigned
    const stolen = refreshCookie(register);

    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    const rotated = await api.post('/api/auth/refresh').set('Cookie', stolen); // the real user refreshes
    // const = a name for a value that is never reassigned
    const current = refreshCookie(rotated);

    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/refresh').set('Cookie', stolen).expect(401); // the thief replays the old one
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/auth/refresh').set('Cookie', current).expect(401); // the real session is gone too
  });
});
