// import = bring in code from another file or package
import * as service from './analytics.service.js';

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function summary(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await service.getSummary(res.locals.query.days));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function sales(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // res.locals = data for this one request (the validated input, the logged-in user)
  // await = wait for a Promise (async result) before continuing
  res.json({ days: res.locals.query.days, series: await service.getSalesOverTime(res.locals.query.days) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function topProducts(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ items: await service.getTopProducts(res.locals.query.days, res.locals.query.limit) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function salesByCategory(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ items: await service.getSalesByCategory(res.locals.query.days) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function ordersByStatus(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ items: await service.getOrdersByStatus() });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function lowStock(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json(await service.getLowStock());
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function customers(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json(await service.getCustomerStats(res.locals.query.days));
}
