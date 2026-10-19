// import = bring in code from another file or package
import * as couponsService from './coupons.service.js';

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function previewCoupon(_req, res) {
  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  const { id } = res.locals.user;
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ preview: await couponsService.previewCoupon(id, res.locals.query.code) });
}
