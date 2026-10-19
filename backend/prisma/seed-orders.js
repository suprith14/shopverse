// Demo sales history for the admin dashboard. Run with: npm run db:seed-orders
//
// Creates 40 demo customers (…@demo.shopverse.dev) and ~90 days of orders using the real
// catalog's variants and prices: more orders on weekends, slow growth over time, a few
// cancellations and refunds, some WELCOME10 discounts.
//
// Safe to re-run: it first deletes everything belonging to the demo customers.
// It does NOT touch real customers, products or stock (this is past sales, already shipped).
// Demo orders have no Stripe payment, so they can be shipped but not refunded from the admin.
// import = bring in code from another file or package
import { PrismaClient } from '@prisma/client';
// import = bring in code from another file or package
// bcrypt = slow, salted password hashing (hard to brute-force)
import bcrypt from 'bcryptjs';

// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
const prisma = new PrismaClient();

// const = a name for a value that is never reassigned
const DEMO_DOMAIN = 'demo.shopverse.dev';
// const = a name for a value that is never reassigned
const DAYS = 90;
// const = a name for a value that is never reassigned
const DAY_MS = 24 * 60 * 60 * 1000;

// Seeded random numbers: the same data every run, so screenshots and tests are repeatable.
// let = a name whose value can be changed later
let seed = 42;
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  // return = give this value back and stop the function here
  return seed / 2 ** 32;
};
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// obj[key] = read the property whose name is stored in key
// Math = number helpers (min, max, round, floor, ceil...)
const pick = (items) => items[Math.floor(random() * items.length)];
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// Math = number helpers (min, max, round, floor, ceil...)
const between = (min, max) => min + Math.floor(random() * (max - min + 1));

// const = a name for a value that is never reassigned
const firstNames = [
  'Aarav',
  'Diya',
  'Liam',
  'Emma',
  'Noah',
  'Ananya',
  'Mia',
  'Rohan',
  'Sofia',
  'Kabir',
  'Olivia',
  'Arjun',
  'Zara',
  'Ethan',
  'Isha',
  'Lucas',
  'Meera',
  'Ava',
  'Vihaan',
  'Chloe',
];
// const = a name for a value that is never reassigned
const lastNames = ['Sharma', 'Smith', 'Patel', 'Garcia', 'Iyer', 'Brown', 'Khan', 'Lee', 'Reddy', 'Martin'];

// The status an order would have by now, given how many days ago it was placed.
// function = a named, reusable block of code
function statusForAge(ageDays) {
  // const = a name for a value that is never reassigned
  const r = random();
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (r < 0.04) return 'CANCELLED'; // never paid
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // return = give this value back and stop the function here
  if (ageDays > 7 && r < 0.08) return 'REFUNDED';
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (ageDays <= 1) return 'PAID'; // not shipped yet
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  if (ageDays <= 4) return r < 0.5 ? 'PAID' : 'SHIPPED';
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  // a ? b : c = ternary: if a then b else c
  if (ageDays <= 9) return r < 0.6 ? 'SHIPPED' : 'DELIVERED';
  // return = give this value back and stop the function here
  return 'DELIVERED';
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function main() {
  // console.log / warn / error = print to the server log
  console.log('Removing previous demo data...');
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const oldUsers = await prisma.user.findMany({
    // where = Prisma filter: which rows
    // `text ${x}` = a template string: text with values inserted
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    // select = Prisma: return only these columns
    select: { id: true },
  });
  // const = a name for a value that is never reassigned
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  const oldIds = oldUsers.map((u) => u.id);
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  // where = Prisma filter: which rows
  // in = Prisma: the value is one of this list
  await prisma.order.deleteMany({ where: { userId: { in: oldIds } } }); // items + reservations cascade
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  // where = Prisma filter: which rows
  // in = Prisma: the value is one of this list
  await prisma.user.deleteMany({ where: { id: { in: oldIds } } });

  // console.log / warn / error = print to the server log
  console.log('Creating demo customers...');
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // bcrypt = slow, salted password hashing (hard to brute-force)
  // bcrypt.hash = turn the password into a salted hash (store this, never the password)
  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  // const = a name for a value that is never reassigned
  // Date = a point in time (Date.now() = milliseconds since 1970)
  const now = Date.now();
  // const = a name for a value that is never reassigned
  const customers = [];
  // let = a name whose value can be changed later
  for (let i = 1; i <= 40; i++) {
    customers.push(
      // await = wait for a Promise (async result) before continuing
      // prisma.user = the User table (model in prisma/schema.prisma)
      // create = insert one new row (INSERT)
      await prisma.user.create({
        // data = Prisma: the values to write
        data: {
          // `text ${x}` = a template string: text with values inserted
          name: `${pick(firstNames)} ${pick(lastNames)}`,
          // `text ${x}` = a template string: text with values inserted
          email: `customer${i}@${DEMO_DOMAIN}`,
          passwordHash,
          // new = create an object from a class (e.g. new Date())
          // Date = a point in time (Date.now() = milliseconds since 1970)
          createdAt: new Date(now - between(0, DAYS + 30) * DAY_MS), // sign-ups spread over time
          // Last visits spread over the past two weeks (a few will fall in "active today").
          // Never "active now": that number should only ever show real people.
          // new = create an object from a class (e.g. new Date())
          // Date = a point in time (Date.now() = milliseconds since 1970)
          lastSeenAt: new Date(now - between(60, 14 * 24 * 60) * 60 * 1000),
        },
      }),
    );
  }

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // findMany = read many rows (SELECT ... WHERE)
  const variants = await prisma.productVariant.findMany({
    // where = Prisma filter: which rows
    where: { product: { isActive: true } },
    // select = Prisma: return only these columns
    select: { id: true, name: true, price: true, product: { select: { name: true } } },
  });
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.coupon = the Coupon table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const welcome = await prisma.coupon.findUnique({ where: { code: 'WELCOME10' } });

  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  console.log(`Creating ${DAYS} days of orders...`);
  // let = a name whose value can be changed later
  let created = 0;
  // let = a name whose value can be changed later
  for (let age = DAYS - 1; age >= 0; age--) {
    // const = a name for a value that is never reassigned
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    const day = new Date(now - age * DAY_MS);
    // const = a name for a value that is never reassigned
    // === = strictly equal (same value AND same type)
    // a || b = OR: a if it is truthy, else b
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    // const = a name for a value that is never reassigned
    const growth = 1 + (DAYS - age) / DAYS; // ~2x more orders now than 90 days ago
    // const = a name for a value that is never reassigned
    // Math = number helpers (min, max, round, floor, ceil...)
    // a ? b : c = ternary: if a then b else c
    const count = Math.round((between(2, 5) + (weekend ? 3 : 0)) * growth * 0.7);

    // const = a name for a value that is never reassigned
    // => = an arrow function (a short function)
    const orders = Array.from({ length: count }, () => {
      // const = a name for a value that is never reassigned
      // a ? b : c = ternary: if a then b else c
      // => = an arrow function (a short function)
      const items = Array.from({ length: random() < 0.7 ? 1 : between(2, 3) }, () => {
        // const = a name for a value that is never reassigned
        const v = pick(variants);
        // return = give this value back and stop the function here
        return {
          variantId: v.id,
          productName: v.product.name,
          variantName: v.name,
          unitPrice: v.price,
          // a ? b : c = ternary: if a then b else c
          quantity: random() < 0.85 ? 1 : 2,
        };
      });
      // const = a name for a value that is never reassigned
      // .reduce = combine all items into one value (e.g. a sum)
      // => = an arrow function (a short function)
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      // const = a name for a value that is never reassigned
      // a && b = AND; in JSX: show b only when a is true
      const useCoupon = welcome && random() < 0.15;
      // const = a name for a value that is never reassigned
      // a ? b : c = ternary: if a then b else c
      // Math = number helpers (min, max, round, floor, ceil...)
      const discount = useCoupon ? Math.floor(subtotal * 0.1) : 0;
      // const = a name for a value that is never reassigned
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      const createdAt = new Date(day.getTime() - between(0, 20 * 60) * 60 * 1000); // spread through the day
      // return = give this value back and stop the function here
      // prisma.order = the Order table (model in prisma/schema.prisma)
      // create = insert one new row (INSERT)
      return prisma.order.create({
        // data = Prisma: the values to write
        data: {
          userId: pick(customers).id,
          status: statusForAge(age),
          subtotal,
          discount,
          total: subtotal - discount,
          // a ? b : c = ternary: if a then b else c
          couponId: useCoupon ? welcome.id : null,
          createdAt,
          items: { create: items },
        },
      });
    });
    // await = wait for a Promise (async result) before continuing
    // Promise = a value that arrives later; Promise.all waits for several at once
    await Promise.all(orders); // one day's orders in parallel
    created += count;
    // if (...) = run the next part only when the condition is true
    // === = strictly equal (same value AND same type)
    // process = the running Node program (process.env = settings, process.exit = stop)
    // process.stdout = the terminal output
    // `text ${x}` = a template string: text with values inserted
    if (age % 15 === 0) process.stdout.write(`  ${DAYS - age}/${DAYS} days, ${created} orders\n`);
  }

  // Paid demo orders get invoice numbers like real ones (continuing the counter, in date order).
  // Demo data only: deleting old demo orders on a re-run leaves gaps, which real data never has.
  // console.log / warn / error = print to the server log
  console.log('Numbering invoices...');
  // await = wait for a Promise (async result) before continuing
  // prisma.invoiceCounter = the InvoiceCounter table (model in prisma/schema.prisma)
  // upsert = update the row if it exists, otherwise create it
  // where = Prisma filter: which rows
  await prisma.invoiceCounter.upsert({ where: { id: 'invoice' }, create: { id: 'invoice', value: 0 }, update: {} });
  // await = wait for a Promise (async result) before continuing
  // prisma.$executeRaw = run a hand-written SQL command
  // `text ${x}` = a template string: text with values inserted
  await prisma.$executeRaw`
    WITH start AS (SELECT value FROM "InvoiceCounter" WHERE id = 'invoice'),
    numbered AS (
      SELECT id, "createdAt", (SELECT value FROM start) + ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS n
      FROM "Order"
      WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED', 'REFUNDED') AND "invoiceNumber" IS NULL
    )
    UPDATE "Order" o SET "invoiceNumber" = numbered.n, "invoiceIssuedAt" = numbered."createdAt",
      "invoiceToken" = replace(gen_random_uuid()::text, '-', '') || left(replace(gen_random_uuid()::text, '-', ''), 16)
    FROM numbered WHERE o.id = numbered.id`;
  // await = wait for a Promise (async result) before continuing
  // prisma.$executeRaw = run a hand-written SQL command
  // `text ${x}` = a template string: text with values inserted
  await prisma.$executeRaw`
    UPDATE "InvoiceCounter" SET value = (SELECT COALESCE(MAX("invoiceNumber"), 0) FROM "Order") WHERE id = 'invoice'`;

  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  console.log(`Done. ${customers.length} demo customers, ${created} orders over ${DAYS} days.`);
}

main()
  // => = an arrow function (a short function)
  .catch((e) => {
    // console.log / warn / error = print to the server log
    console.error(e);
    // process = the running Node program (process.env = settings, process.exit = stop)
    // process.exit = stop the program (0 = ok, 1 = error)
    process.exit(1);
  })
  // => = an arrow function (a short function)
  // prisma.$disconnect = close the database connections
  .finally(() => prisma.$disconnect());
