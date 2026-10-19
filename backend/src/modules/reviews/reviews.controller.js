// import = bring in code from another file or package
import * as reviewsService from './reviews.service.js';

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// res.locals = data for this one request (the validated input, the logged-in user)
// res.locals.user = the logged-in user (set by requireAuth from the access token)
const userId = (res) => res.locals.user.id;

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listReviews(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await reviewsService.listReviews(res.locals.params.productId, res.locals.query));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyReviewStatus(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await reviewsService.getMyReviewStatus(userId(res), res.locals.params.productId));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function upsertMyReview(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ review: await reviewsService.upsertMyReview(userId(res), res.locals.params.productId, res.locals.body) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteMyReview(_req, res) {
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  await reviewsService.deleteMyReview(userId(res), res.locals.params.productId);
  // res.status(code) = set the HTTP status code (201 created, 404...)
  res.status(204).end();
}
