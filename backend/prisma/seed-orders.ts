// Demo sales history for the admin dashboard. Run with: npm run db:seed-orders
//
// Creates 40 demo customers (…@demo.shopverse.dev) and ~90 days of orders using the real
// catalog's variants and prices: more orders on weekends, slow growth over time, a few
// cancellations and refunds, some WELCOME10 discounts.
//
// Safe to re-run: it first deletes everything belonging to the demo customers.
// It does NOT touch real customers, products or stock (this is past sales, already shipped).
// Demo orders have no Stripe payment, so they can be shipped but not refunded from the admin.
import { PrismaClient, type OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_DOMAIN = 'demo.shopverse.dev';
const DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

// Seeded random numbers: the same data every run, so screenshots and tests are repeatable.
let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) % 2 ** 32;
  return seed / 2 ** 32;
};
const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)]!;
const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

const firstNames = ['Aarav', 'Diya', 'Liam', 'Emma', 'Noah', 'Ananya', 'Mia', 'Rohan', 'Sofia', 'Kabir', 'Olivia', 'Arjun', 'Zara', 'Ethan', 'Isha', 'Lucas', 'Meera', 'Ava', 'Vihaan', 'Chloe'];
const lastNames = ['Sharma', 'Smith', 'Patel', 'Garcia', 'Iyer', 'Brown', 'Khan', 'Lee', 'Reddy', 'Martin'];

// The status an order would have by now, given how many days ago it was placed.
function statusForAge(ageDays: number): OrderStatus {
  const r = random();
  if (r < 0.04) return 'CANCELLED'; // never paid
  if (ageDays > 7 && r < 0.08) return 'REFUNDED';
  if (ageDays <= 1) return 'PAID'; // not shipped yet
  if (ageDays <= 4) return r < 0.5 ? 'PAID' : 'SHIPPED';
  if (ageDays <= 9) return r < 0.6 ? 'SHIPPED' : 'DELIVERED';
  return 'DELIVERED';
}

async function main() {
  console.log('Removing previous demo data...');
  const oldUsers = await prisma.user.findMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } }, select: { id: true } });
  const oldIds = oldUsers.map((u) => u.id);
  await prisma.order.deleteMany({ where: { userId: { in: oldIds } } }); // items + reservations cascade
  await prisma.user.deleteMany({ where: { id: { in: oldIds } } });

  console.log('Creating demo customers...');
  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  const now = Date.now();
  const customers: { id: string }[] = [];
  for (let i = 1; i <= 40; i++) {
    customers.push(
      await prisma.user.create({
        data: {
          name: `${pick(firstNames)} ${pick(lastNames)}`,
          email: `customer${i}@${DEMO_DOMAIN}`,
          passwordHash,
          createdAt: new Date(now - between(0, DAYS + 30) * DAY_MS), // sign-ups spread over time
        },
      }),
    );
  }

  const variants = await prisma.productVariant.findMany({
    where: { product: { isActive: true } },
    select: { id: true, name: true, price: true, product: { select: { name: true } } },
  });
  const welcome = await prisma.coupon.findUnique({ where: { code: 'WELCOME10' } });

  console.log(`Creating ${DAYS} days of orders...`);
  let created = 0;
  for (let age = DAYS - 1; age >= 0; age--) {
    const day = new Date(now - age * DAY_MS);
    const weekend = day.getUTCDay() === 0 || day.getUTCDay() === 6;
    const growth = 1 + (DAYS - age) / DAYS; // ~2x more orders now than 90 days ago
    const count = Math.round((between(2, 5) + (weekend ? 3 : 0)) * growth * 0.7);

    const orders = Array.from({ length: count }, () => {
      const items = Array.from({ length: random() < 0.7 ? 1 : between(2, 3) }, () => {
        const v = pick(variants);
        return { variantId: v.id, productName: v.product.name, variantName: v.name, unitPrice: v.price, quantity: random() < 0.85 ? 1 : 2 };
      });
      const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const useCoupon = welcome && random() < 0.15;
      const discount = useCoupon ? Math.floor(subtotal * 0.1) : 0;
      const createdAt = new Date(day.getTime() - between(0, 20 * 60) * 60 * 1000); // spread through the day
      return prisma.order.create({
        data: {
          userId: pick(customers).id,
          status: statusForAge(age),
          subtotal,
          discount,
          total: subtotal - discount,
          couponId: useCoupon ? welcome.id : null,
          createdAt,
          items: { create: items },
        },
      });
    });
    await Promise.all(orders); // one day's orders in parallel
    created += count;
    if (age % 15 === 0) process.stdout.write(`  ${DAYS - age}/${DAYS} days, ${created} orders\n`);
  }

  // Paid demo orders get invoice numbers like real ones (continuing the counter, in date order).
  // Demo data only: deleting old demo orders on a re-run leaves gaps, which real data never has.
  console.log('Numbering invoices...');
  await prisma.invoiceCounter.upsert({ where: { id: 'invoice' }, create: { id: 'invoice', value: 0 }, update: {} });
  await prisma.$executeRaw`
    WITH start AS (SELECT value FROM "InvoiceCounter" WHERE id = 'invoice'),
    numbered AS (
      SELECT id, "createdAt", (SELECT value FROM start) + ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS n
      FROM "Order"
      WHERE status IN ('PAID', 'SHIPPED', 'DELIVERED', 'REFUNDED') AND "invoiceNumber" IS NULL
    )
    UPDATE "Order" o SET "invoiceNumber" = numbered.n, "invoiceIssuedAt" = numbered."createdAt"
    FROM numbered WHERE o.id = numbered.id`;
  await prisma.$executeRaw`
    UPDATE "InvoiceCounter" SET value = (SELECT COALESCE(MAX("invoiceNumber"), 0) FROM "Order") WHERE id = 'invoice'`;

  console.log(`Done. ${customers.length} demo customers, ${created} orders over ${DAYS} days.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
