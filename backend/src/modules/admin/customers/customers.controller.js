// import = bring in code from another file or package
import * as service from './customers.service.js';

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listCustomers(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await service.listCustomers(res.locals.query));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function blockCustomer(_req, res) {
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  service.assertNotSelf(res.locals.user.id, res.locals.params.id);
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  await service.blockCustomer(res.locals.params.id, res.locals.body.reason);
  // res.status(code) = set the HTTP status code (201 created, 404...)
  res.status(204).end();
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function unblockCustomer(_req, res) {
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  await service.unblockCustomer(res.locals.params.id);
  // res.status(code) = set the HTTP status code (201 created, 404...)
  res.status(204).end();
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteCustomer(_req, res) {
  // res.locals = data for this one request (the validated input, the logged-in user)
  // res.locals.user = the logged-in user (set by requireAuth from the access token)
  service.assertNotSelf(res.locals.user.id, res.locals.params.id);
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await service.deleteCustomer(res.locals.params.id));
}
