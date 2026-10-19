// import = bring in code from another file or package
// describe = a group of related tests
// expect(value) = check a value; the test fails if the check is false
// test = one test
import { describe, expect, test } from 'vitest';
// import = bring in code from another file or package
import { api, auth, createUser } from './helpers.js';

// vitest.config.js sets GUIDE_PASSWORD=test-guide-password
// describe = a group of related tests
// => = an arrow function (a short function)
describe('POST /api/guide/unlock (project guide)', () => {
  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('needs a logged-in user', async () => {
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .send = the JSON body of the request
    // .expect = supertest: fail if the response doesn't match
    await api.post('/api/guide/unlock').send({ password: 'test-guide-password' }).expect(401);
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('a wrong password is refused (403, so the store does not try to refresh the login)', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'nope-nope' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(403);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBe = exactly equal (===)
    expect(res.body.error.message).toBe('Wrong guide password');
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toBeUndefined = is undefined
    expect(res.body.html).toBeUndefined();
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('the right password returns the guide, never cached', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'test-guide-password' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(200);
    // expect(value) = check a value; the test fails if the check is false
    // res.body = the JSON the API answered
    // .toContain = the list/text contains this
    expect(res.body.html).toContain('<title>ShopVerse System Map</title>');
    // expect(value) = check a value; the test fails if the check is false
    // obj[key] = read the property whose name is stored in key
    // res.headers = the response headers
    // .toBe = exactly equal (===)
    expect(res.headers['cache-control']).toBe('no-store');
  });

  // test = one test
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  test('5 wrong passwords lock that user out for 15 minutes, even with the right one', async () => {
    // const = a name for a value that is never reassigned
    // { a, b } = destructuring: take properties a and b out of an object
    // await = wait for a Promise (async result) before continuing
    const { accessToken } = await createUser();
    // let = a name whose value can be changed later
    for (let i = 0; i < 5; i++) {
      // await = wait for a Promise (async result) before continuing
      // api.post = send a POST request into the app
      // .set = add a request header (e.g. Authorization: Bearer <token>)
      // .send = the JSON body of the request
      // `text ${x}` = a template string: text with values inserted
      // .expect = supertest: fail if the response doesn't match
      await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: `wrong-${i}` }).expect(403);
    }
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // api.post = send a POST request into the app
    // .set = add a request header (e.g. Authorization: Bearer <token>)
    // .send = the JSON body of the request
    const res = await api.post('/api/guide/unlock').set(auth(accessToken)).send({ password: 'test-guide-password' });
    // expect(value) = check a value; the test fails if the check is false
    // res.status = the HTTP status code of the response
    // .toBe = exactly equal (===)
    expect(res.status).toBe(429);
    // expect(value) = check a value; the test fails if the check is false
    // obj[key] = read the property whose name is stored in key
    // res.headers = the response headers
    // .toBeGreaterThan = is a bigger number
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(14 * 60);
  });
});
