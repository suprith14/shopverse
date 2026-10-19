// import = bring in code from another file or package
import * as ordersService from './orders.service.js';
// import = bring in code from another file or package
import { sendPdf } from '../../lib/send-pdf.js';

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// res.locals = data for this one request (the validated input, the logged-in user)
// res.locals.user = the logged-in user (set by requireAuth from the access token)
const userId = (res) => res.locals.user.id;

// Returns the new order plus the Stripe URL the browser should go to.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function checkout(req, res) {
  // res.status(code) = set the HTTP status code (201 created, 404...)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  // req.get(name) = read one request header
  res.status(201).json(await ordersService.checkout(userId(res), res.locals.body, req.get('origin')));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getPaymentUrl(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ checkoutUrl: await ordersService.getPaymentUrl(userId(res), res.locals.params.id) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listMyOrders(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ orders: await ordersService.listMyOrders(userId(res)) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyOrder(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ order: await ordersService.getMyOrder(userId(res), res.locals.params.id) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function cancelMyOrder(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ order: await ordersService.cancelMyOrder(userId(res), res.locals.params.id) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMyInvoice(_req, res) {
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  sendPdf(res, await ordersService.getMyInvoice(userId(res), res.locals.params.id));
}
