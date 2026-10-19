// import = bring in code from another file or package
import * as wishlistService from './wishlist.service.js';

// As in the cart, the user id only ever comes from the verified access token.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// res.locals = data for this one request (the validated input, the logged-in user)
// res.locals.user = the logged-in user (set by requireAuth from the access token)
const userId = (res) => res.locals.user.id;

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getWishlist(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ items: await wishlistService.getWishlist(userId(res)) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function addProduct(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ items: await wishlistService.addProduct(userId(res), res.locals.params.productId) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeProduct(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ items: await wishlistService.removeProduct(userId(res), res.locals.params.productId) });
}
