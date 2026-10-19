// import = bring in code from another file or package
// randomUUID = a random unique id, e.g. "3b241101-e2bb-..."
import { randomUUID } from 'node:crypto';
// import = bring in code from another file or package
import request from 'supertest';
// import = bring in code from another file or package
import { createApp } from '../../src/app.js';
// import = bring in code from another file or package
import { prisma } from '../../src/lib/prisma.js';

// Supertest sends requests straight into the Express app: no server, no port.
// export = other files can import this
// const = a name for a value that is never reassigned
export const api = request(createApp());

// export = other files can import this
// const = a name for a value that is never reassigned
export const PASSWORD = 'correct-horse-battery';

// Every test makes its own data with unique emails/slugs, so tests never depend on each other.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// randomUUID = a random unique id, e.g. "3b241101-e2bb-..."
// .slice = a copy of part of an array/string
const unique = () => randomUUID().slice(0, 8);

// Signs up a new user through the real API. Returns the user and an access token.
// role: 'ADMIN' promotes the user in the database, then logs in again so the token carries the role.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
// { a, b } = destructuring: take properties a and b out of an object
export async function createUser({ role = 'CUSTOMER' } = {}) {
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  const email = `user-${unique()}@test.dev`;
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // api.post = send a POST request into the app
  // .send = the JSON body of the request
  const res = await api.post('/api/auth/register').send({ name: 'Test User', email, password: PASSWORD });
  // if (...) = run the next part only when the condition is true
  // res.status = the HTTP status code of the response
  // !== = not strictly equal
  // throw = stop here with an error
  // new = create an object from a class (e.g. new Date())
  // Error = an error object with a message (and a stack trace)
  // `text ${x}` = a template string: text with values inserted
  // JSON.parse / JSON.stringify = text <-> object
  // JSON.stringify = object -> JSON text
  // res.body = the JSON the API answered
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);

  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // res.body = the JSON the API answered
  if (role === 'CUSTOMER') return { ...res.body, email };

  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // res.body = the JSON the API answered
  // data = Prisma: the values to write
  await prisma.user.update({ where: { id: res.body.user.id }, data: { role } });
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // api.post = send a POST request into the app
  // .send = the JSON body of the request
  const login = await api.post('/api/auth/login').send({ email, password: PASSWORD });
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // res.body = the JSON the API answered
  return { ...login.body, email };
}

// Adds a product with one variant directly in the database (faster than the admin API).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// x = value (in parameters) = the default used when x is not given
// { a, b } = destructuring: take properties a and b out of an object
export async function createProduct({ price = 2500, stock = 5, isActive = true } = {}) {
  // const = a name for a value that is never reassigned
  const id = unique();
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  const product = await prisma.product.create({
    // data = Prisma: the values to write
    data: {
      // `text ${x}` = a template string: text with values inserted
      name: `Test Product ${id}`,
      // `text ${x}` = a template string: text with values inserted
      slug: `test-product-${id}`,
      description: 'Made by a test',
      basePrice: price,
      isActive,
      // `text ${x}` = a template string: text with values inserted
      category: { create: { name: `Test Category ${id}`, slug: `test-category-${id}` } },
      // `text ${x}` = a template string: text with values inserted
      variants: { create: { sku: `TEST-${id}`, name: 'Default', price, stock } },
    },
    // include = Prisma: also load the related rows (a JOIN)
    include: { variants: true },
  });
  // return = give this value back and stop the function here
  return { product, variant: product.variants[0] };
}

// "Authorization: Bearer <token>"
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

// The refresh token cookie from a response, ready to send back in a Cookie header.
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
export const refreshCookie = (res) =>
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // ?.() = call only if the function exists
  // obj[key] = read the property whose name is stored in key
  // res.headers = the response headers
  // a ?? b = a, unless a is null/undefined, then b
  // .find = the first item that passes a test (or undefined)
  // => = an arrow function (a short function)
  // .startsWith = true if the text begins with this
  // .split = cut a string into an array
  (res.headers['set-cookie'] ?? []).find((c) => c.startsWith('refreshToken='))?.split(';')[0];
