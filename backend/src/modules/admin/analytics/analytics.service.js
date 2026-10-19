import { prisma } from '../../../lib/prisma.js';
import { LOW_STOCK_THRESHOLD } from '../products/products.service.js';

// Only these orders count as sales. PENDING isn't paid yet, CANCELLED never was,
// REFUNDED gave the money back.
const SOLD = ['PAID', 'SHIPPED', 'DELIVERED'];

const DAY_MS = 24 * 60 * 60 * 1000;

// Percentage change vs the previous period: 120 vs 100 -> +20. null when there's nothing to compare.
const change = (current, previous) =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;

// The KPI cards: revenue, orders, average order value and customers, for the last N days,
// each compared with the N days before that ("+12% vs previous 30 days").
export async function getSummary(days) {
  const now = Date.now();
  const start = new Date(now - days * DAY_MS);
  const previousStart = new Date(now - 2 * days * DAY_MS);

  const period = async (from, to) => {
    const where = { status: { in: [...SOLD] }, createdAt: { gte: from, lt: to } };
    const [agg, buyers, signups] = await Promise.all([
      prisma.order.aggregate({ where, _sum: { total: true }, _count: { _all: true } }),
      prisma.order.groupBy({ by: ['userId'], where, orderBy: { userId: 'asc' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: from, lt: to } } }),
    ]);
    const revenue = agg._sum.total ?? 0;
    const orders = agg._count._all;
    return {
      revenue,
      orders,
      averageOrderValue: orders ? Math.round(revenue / orders) : 0,
      customers: buyers.length,
      newCustomers: signups,
    };
  };

  const [current, previous] = await Promise.all([period(start, new Date(now)), period(previousStart, start)]);
  return {
    days,
    current,
    previous,
    change: {
      revenue: change(current.revenue, previous.revenue),
      orders: change(current.orders, previous.orders),
      averageOrderValue: change(current.averageOrderValue, previous.averageOrderValue),
      customers: change(current.customers, previous.customers),
    },
  };
}

// Revenue and order count per day, for the line chart.
// generate_series creates a row for EVERY day, then LEFT JOIN attaches that day's orders.
// Days without orders come out as 0 instead of being missing, which would make the chart lie.
// Days are UTC days (the database stores times in UTC).
export async function getSalesOverTime(days) {
  const rows = await prisma.$queryRaw`
    SELECT d::date AS day,
           COALESCE(SUM(o.total), 0)::int AS revenue,
           COUNT(o.id)::int AS orders
    FROM generate_series(
      (now() AT TIME ZONE 'UTC')::date - (${days}::int - 1),
      (now() AT TIME ZONE 'UTC')::date,
      interval '1 day'
    ) AS d
    LEFT JOIN "Order" o
      ON o."createdAt"::date = d::date
     AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
    GROUP BY d
    ORDER BY d`;
  return rows.map((r) => ({ date: r.day.toISOString().slice(0, 10), revenue: r.revenue, orders: r.orders }));
}

// Best sellers by revenue. Uses the price snapshot in OrderItem (what customers actually paid
// per item), so later price changes don't rewrite history. Order-level coupon discounts
// aren't split across items, so this is revenue before discounts.
export async function getTopProducts(days, limit) {
  const since = new Date(Date.now() - days * DAY_MS);
  const rows = await prisma.$queryRaw`
    SELECT p.id AS "productId", p.name, p.slug,
           SUM(oi."unitPrice" * oi.quantity)::int AS revenue,
           SUM(oi.quantity)::int AS units
    FROM "OrderItem" oi
    JOIN "Order" o ON o.id = oi."orderId"
    JOIN "ProductVariant" v ON v.id = oi."variantId"
    JOIN "Product" p ON p.id = v."productId"
    WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED') AND o."createdAt" >= ${since}
    GROUP BY p.id, p.name, p.slug
    ORDER BY revenue DESC
    LIMIT ${limit}`;
  return rows;
}

// Revenue per category, for the "where does the money come from" chart.
// Every category is listed, even with $0. The order filters sit in the JOIN (not in WHERE):
// a WHERE would drop categories whose orders are all outside the period.
// FILTER (WHERE o.id IS NOT NULL) only counts items whose order matched.
export async function getSalesByCategory(days) {
  const since = new Date(Date.now() - days * DAY_MS);
  return prisma.$queryRaw`
    SELECT c.name AS category,
           COALESCE(SUM(oi."unitPrice" * oi.quantity) FILTER (WHERE o.id IS NOT NULL), 0)::int AS revenue,
           COALESCE(SUM(oi.quantity) FILTER (WHERE o.id IS NOT NULL), 0)::int AS units
    FROM "Category" c
    LEFT JOIN "Product" p ON p."categoryId" = c.id
    LEFT JOIN "ProductVariant" v ON v."productId" = p.id
    LEFT JOIN "OrderItem" oi ON oi."variantId" = v.id
    LEFT JOIN "Order" o ON o.id = oi."orderId"
                       AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
                       AND o."createdAt" >= ${since}
    GROUP BY c.name
    ORDER BY revenue DESC`;
}

// How many orders are in each state right now: "3 waiting to ship" is an admin's to-do list.
// Customer numbers for the dashboard (admins are not counted).
//   total        every customer account
//   new          sign-ups in the last N days, vs the N days before
//   activeNow    made a logged-in request in the last 15 minutes  (User.lastSeenAt)
//   activeToday  ... in the last 24 hours
//   signedIn     have a valid login session right now (unexpired, not logged out)
// "Active" is precise to ~5 minutes, because lastSeenAt is written at most every 5 minutes.
export async function getCustomerStats(days) {
  const now = Date.now();
  const start = new Date(now - days * DAY_MS);
  const previousStart = new Date(now - 2 * days * DAY_MS);
  const customer = { role: 'CUSTOMER', deletedAt: null }; // deleted (anonymised) accounts don't count

  const [total, newCurrent, newPrevious, activeNow, activeToday, signedIn] = await prisma.$transaction([
    prisma.user.count({ where: customer }),
    prisma.user.count({ where: { ...customer, createdAt: { gte: start } } }),
    prisma.user.count({ where: { ...customer, createdAt: { gte: previousStart, lt: start } } }),
    prisma.user.count({ where: { ...customer, lastSeenAt: { gte: new Date(now - 15 * 60 * 1000) } } }),
    prisma.user.count({ where: { ...customer, lastSeenAt: { gte: new Date(now - DAY_MS) } } }),
    prisma.user.count({
      where: { ...customer, refreshTokens: { some: { revokedAt: null, expiresAt: { gt: new Date(now) } } } },
    }),
  ]);

  return {
    days,
    total,
    newCustomers: newCurrent,
    newChange: change(newCurrent, newPrevious),
    activeNow,
    activeToday,
    signedIn,
  };
}

export async function getOrdersByStatus() {
  const rows = await prisma.order.groupBy({ by: ['status'], _count: { _all: true }, orderBy: { status: 'asc' } });
  return rows.map((r) => ({ status: r.status, count: r._count._all }));
}

// Variants that are running out, so the admin can restock before customers see "sold out".
export async function getLowStock() {
  const variants = await prisma.productVariant.findMany({
    where: { stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
    orderBy: [{ stock: 'asc' }, { sku: 'asc' }],
    take: 20,
    select: { id: true, sku: true, name: true, stock: true, product: { select: { id: true, name: true } } },
  });
  return { threshold: LOW_STOCK_THRESHOLD, items: variants };
}
