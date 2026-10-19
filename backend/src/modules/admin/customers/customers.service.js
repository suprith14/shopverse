// import = bring in code from another file or package
// randomBytes = cryptographically secure random bytes (for tokens)
import { randomBytes } from 'node:crypto';
// import = bring in code from another file or package
import { prisma } from '../../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// forbidden = HttpError 403: logged in, but not allowed
// notFound = HttpError 404: doesn't exist
import { badRequest, forbidden, notFound } from '../../../lib/http-error.js';
// import = bring in code from another file or package
import { PROTECTED_ACCOUNT, isProtectedAccount } from '../../../lib/account-status.js';

// "Online" = made a logged-in request in the last 15 minutes. lastSeenAt is written at most every
// 5 minutes (lib/activity.js), so this is precise to about 5 minutes: same rule as the dashboard.
// export = other files can import this
// const = a name for a value that is never reassigned
export const ONLINE_WINDOW_MS = 15 * 60 * 1000;

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// new = create an object from a class (e.g. new Date())
// Date = a point in time (Date.now() = milliseconds since 1970)
const onlineSince = () => new Date(Date.now() - ONLINE_WINDOW_MS);

// Only customers, never admins, and never already-deleted (anonymised) accounts.
// const = a name for a value that is never reassigned
const customerWhere = { role: 'CUSTOMER', deletedAt: null };

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function listCustomers(query) {
  // const = a name for a value that is never reassigned
  const where = {
    // ...x = spread: copy all items/properties of x into here
    ...customerWhere,
    // ...x = spread: copy all items/properties of x into here
    // === = strictly equal (same value AND same type)
    // a && b = AND; in JSX: show b only when a is true
    // gte = greater than or equal (>=)
    ...(query.status === 'online' && { lastSeenAt: { gte: onlineSince() } }),
    // ...x = spread: copy all items/properties of x into here
    // === = strictly equal (same value AND same type)
    // a && b = AND; in JSX: show b only when a is true
    // not = Prisma: is not this value
    ...(query.status === 'blocked' && { blockedAt: { not: null } }),
    // ...x = spread: copy all items/properties of x into here
    // a && b = AND; in JSX: show b only when a is true
    ...(query.q && {
      // OR = Prisma: any of these conditions
      OR: [
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { email: { contains: query.q, mode: 'insensitive' } },
        // contains = Prisma: text includes this (SQL LIKE %x%)
        // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
        { name: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
  };

  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  const [total, users] = await prisma.$transaction([
    // prisma.user = the User table (model in prisma/schema.prisma)
    // count = how many rows match
    // where = Prisma filter: which rows
    prisma.user.count({ where }),
    // prisma.user = the User table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    prisma.user.findMany({
      // where = Prisma filter: which rows
      where,
      // Most recently active first; never-active accounts last (newest sign-ups first among them).
      // orderBy = Prisma: sort order (asc / desc)
      orderBy: [{ lastSeenAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      // skip = Prisma: skip the first N rows (OFFSET, for pages)
      skip: (query.page - 1) * query.limit,
      // take = Prisma: at most N rows (LIMIT)
      take: query.limit,
      // select = Prisma: return only these columns
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        lastSeenAt: true,
        blockedAt: true,
        blockedReason: true,
        // _count = Prisma: count rows (or related rows)
        // select = Prisma: return only these columns
        _count: { select: { orders: true } },
      },
    }),
  ]);

  // Total spent per customer on THIS page, in one query (not one per customer).
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // groupBy = totals per group (GROUP BY)
  const spent = await prisma.order.groupBy({
    // by = Prisma groupBy: the columns to group on
    by: ['userId'],
    // where = Prisma filter: which rows
    // in = Prisma: the value is one of this list
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    where: { userId: { in: users.map((u) => u.id) }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    // _sum = Prisma: add up a column
    _sum: { total: true },
  });
  // const = a name for a value that is never reassigned
  // Object.fromEntries = build an object from [key, value] pairs
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  // a ?? b = a, unless a is null/undefined, then b
  const spentBy = Object.fromEntries(spent.map((s) => [s.userId, s._sum.total ?? 0]));
  // const = a name for a value that is never reassigned
  const since = onlineSince();

  // return = give this value back and stop the function here
  return {
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    // { a, b } = destructuring: take properties a and b out of an object
    // _count = Prisma: count rows (or related rows)
    // ...rest = collect the remaining items/properties
    items: users.map(({ _count, ...u }) => ({
      // ...x = spread: copy all items/properties of x into here
      ...u,
      // a && b = AND; in JSX: show b only when a is true
      online: Boolean(u.lastSeenAt && u.lastSeenAt >= since),
      protected: isProtectedAccount(u.email), // the admin page shows "Demo" instead of Block/Delete
      orderCount: _count.orders,
      // obj[key] = read the property whose name is stored in key
      // a ?? b = a, unless a is null/undefined, then b
      totalSpent: spentBy[u.id] ?? 0,
    })),
    page: query.page,
    limit: query.limit,
    total,
    // Math = number helpers (min, max, round, floor, ceil...)
    totalPages: Math.ceil(total / query.limit),
  };
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function findCustomer(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  // ...x = spread: copy all items/properties of x into here
  const user = await prisma.user.findFirst({ where: { id, ...customerWhere } });
  // Admins and deleted accounts are "not found" here: this page can't touch them.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!user) throw notFound('Customer not found');
  // return = give this value back and stop the function here
  return user;
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function findChangeableCustomer(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const user = await findCustomer(id);
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (isProtectedAccount(user.email)) throw forbidden(PROTECTED_ACCOUNT);
  // return = give this value back and stop the function here
  return user;
}

// Block: no login, no checkout, no password reset. Their sessions are deleted now, so they're
// logged out as soon as their current access token expires (15 minutes at most).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function blockCustomer(id, reason) {
  // await = wait for a Promise (async result) before continuing
  await findChangeableCustomer(id);
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  await prisma.$transaction([
    // prisma.user = the User table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    // a || b = OR: a if it is truthy, else b
    prisma.user.update({ where: { id }, data: { blockedAt: new Date(), blockedReason: reason || null } }),
    // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
  ]);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function unblockCustomer(id) {
  // await = wait for a Promise (async result) before continuing
  await findCustomer(id);
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.user.update({ where: { id }, data: { blockedAt: null, blockedReason: null } });
}

// Delete, the way real stores must do it:
//  - No orders: delete the account completely (cart, wishlist, addresses... go with it: onDelete Cascade).
//  - Has orders: those orders and their invoices must be kept (tax and accounting rules), and
//    they point at this user. So instead, ANONYMISE: wipe everything that identifies the person
//    and keep an empty shell the orders can still point to. This is also what the GDPR
//    "right to erasure" asks for, within the legal duty to keep invoices.
//    (Orders keep their address snapshot: an invoice must show where it was delivered.)
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteCustomer(id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  const user = await findChangeableCustomer(id);
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // count = how many rows match
  // where = Prisma filter: which rows
  const orderCount = await prisma.order.count({ where: { userId: id } });

  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  if (orderCount === 0) {
    // await = wait for a Promise (async result) before continuing
    // prisma.user = the User table (model in prisma/schema.prisma)
    // delete = remove one row by a unique field (DELETE)
    // where = Prisma filter: which rows
    await prisma.user.delete({ where: { id } });
    // return = give this value back and stop the function here
    // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
    return { mode: 'deleted' };
  }

  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  await prisma.$transaction([
    // prisma.user = the User table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    prisma.user.update({
      // where = Prisma filter: which rows
      where: { id },
      // data = Prisma: the values to write
      data: {
        name: 'Deleted customer',
        // Unique and obviously fake (.invalid is reserved and never delivers email), so the
        // person can sign up again with their real email if they ever want to.
        // `text ${x}` = a template string: text with values inserted
        email: `deleted-${user.id}@deleted.invalid`,
        // Not a bcrypt hash, so no password can ever match it.
        // `text ${x}` = a template string: text with values inserted
        // randomBytes = cryptographically secure random bytes (for tokens)
        passwordHash: `deleted:${randomBytes(16).toString('hex')}`,
        phone: null,
        dateOfBirth: null,
        avatarUrl: null,
        defaultAddressId: null,
        lastSeenAt: null,
        blockedAt: null,
        blockedReason: null,
        // new = create an object from a class (e.g. new Date())
        // Date = a point in time (Date.now() = milliseconds since 1970)
        deletedAt: new Date(),
      },
    }),
    // prisma.address = the Address table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.address.deleteMany({ where: { userId: id } }),
    // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.cartItem.deleteMany({ where: { userId: id } }),
    // prisma.wishlistItem = the WishlistItem table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.wishlistItem.deleteMany({ where: { userId: id } }),
    // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.passwordResetCode.deleteMany({ where: { userId: id } }),
  ]);
  // return = give this value back and stop the function here
  // mode = Prisma: 'insensitive' ignores upper/lower case; Stripe: 'payment' = a one-time payment
  return { mode: 'anonymised', orderCount };
}

// export = other files can import this
// function = a named, reusable block of code
export function assertNotSelf(adminId, customerId) {
  // if (...) = run the next part only when the condition is true
  // === = strictly equal (same value AND same type)
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  if (adminId === customerId) throw badRequest('You cannot do this to your own account');
}
