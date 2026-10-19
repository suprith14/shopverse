// import = bring in code from another file or package
import * as cartService from './cart.service.js';

// The user id always comes from the verified access token (res.locals.user),
// never from the request body. So nobody can read or change another user's cart.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// res.locals = data for this one request (the validated input, the logged-in user)
// res.locals.user = the logged-in user (set by requireAuth from the access token)
const userId = (res) => res.locals.user.id;

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getCart(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ cart: await cartService.getCart(userId(res)) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function addItem(_req, res) {
  // res.status(code) = set the HTTP status code (201 created, 404...)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.status(201).json({ cart: await cartService.addItem(userId(res), res.locals.body) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateItem(_req, res) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // res.locals = data for this one request (the validated input, the logged-in user)
  const { variantId } = res.locals.params;
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ cart: await cartService.updateQuantity(userId(res), variantId, res.locals.body.quantity) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeItem(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ cart: await cartService.removeItem(userId(res), res.locals.params.variantId) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function clearCart(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ cart: await cartService.clearCart(userId(res)) });
}
