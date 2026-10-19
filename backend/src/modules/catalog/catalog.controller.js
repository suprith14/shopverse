// import = bring in code from another file or package
import * as catalogService from './catalog.service.js';
// import = bring in code from another file or package
import { suggest } from './search.js';

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listCategories(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ categories: await catalogService.listCategories() });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listProducts(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await catalogService.listProducts(res.locals.query));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function suggestions(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await suggest(res.locals.query.q));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getProduct(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ product: await catalogService.getProductBySlug(res.locals.params.slug) });
}
