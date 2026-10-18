import { randomBytes } from 'node:crypto';
import { prisma } from '../../../lib/prisma.js';
import { badRequest, notFound } from '../../../lib/http-error.js';

// "Online" = made a logged-in request in the last 15 minutes. lastSeenAt is written at most every
// 5 minutes (lib/activity.js), so this is precise to about 5 minutes: same rule as the dashboard.
export const ONLINE_WINDOW_MS = 15 * 60 * 1000;

const onlineSince = () => new Date(Date.now() - ONLINE_WINDOW_MS);

// Only customers, never admins, and never already-deleted (anonymised) accounts.
const customerWhere = { role: 'CUSTOMER', deletedAt: null };

export async function listCustomers(query) {
  const where = {
    ...customerWhere,
    ...(query.status === 'online' && { lastSeenAt: { gte: onlineSince() } }),
    ...(query.status === 'blocked' && { blockedAt: { not: null } }),
    ...(query.q && {
      OR: [
        { email: { contains: query.q, mode: 'insensitive' } },
        { name: { contains: query.q, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      // Most recently active first; never-active accounts last (newest sign-ups first among them).
      orderBy: [{ lastSeenAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        lastSeenAt: true,
        blockedAt: true,
        blockedReason: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  // Total spent per customer on THIS page, in one query (not one per customer).
  const spent = await prisma.order.groupBy({
    by: ['userId'],
    where: { userId: { in: users.map((u) => u.id) }, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
    _sum: { total: true },
  });
  const spentBy = Object.fromEntries(spent.map((s) => [s.userId, s._sum.total ?? 0]));
  const since = onlineSince();

  return {
    items: users.map(({ _count, ...u }) => ({
      ...u,
      online: Boolean(u.lastSeenAt && u.lastSeenAt >= since),
      orderCount: _count.orders,
      totalSpent: spentBy[u.id] ?? 0,
    })),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

async function findCustomer(id) {
  const user = await prisma.user.findFirst({ where: { id, ...customerWhere } });
  // Admins and deleted accounts are "not found" here: this page can't touch them.
  if (!user) throw notFound('Customer not found');
  return user;
}

// Block: no login, no checkout, no password reset. Their sessions are deleted now, so they're
// logged out as soon as their current access token expires (15 minutes at most).
export async function blockCustomer(id, reason) {
  await findCustomer(id);
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { blockedAt: new Date(), blockedReason: reason || null } }),
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
  ]);
}

export async function unblockCustomer(id) {
  await findCustomer(id);
  await prisma.user.update({ where: { id }, data: { blockedAt: null, blockedReason: null } });
}

// Delete, the way real stores must do it:
//  - No orders: delete the account completely (cart, wishlist, addresses... go with it: onDelete Cascade).
//  - Has orders: those orders and their invoices must be kept (tax and accounting rules), and
//    they point at this user. So instead, ANONYMISE: wipe everything that identifies the person
//    and keep an empty shell the orders can still point to. This is also what the GDPR
//    "right to erasure" asks for, within the legal duty to keep invoices.
//    (Orders keep their address snapshot: an invoice must show where it was delivered.)
export async function deleteCustomer(id) {
  const user = await findCustomer(id);
  const orderCount = await prisma.order.count({ where: { userId: id } });

  if (orderCount === 0) {
    await prisma.user.delete({ where: { id } });
    return { mode: 'deleted' };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        name: 'Deleted customer',
        // Unique and obviously fake (.invalid is reserved and never delivers email), so the
        // person can sign up again with their real email if they ever want to.
        email: `deleted-${user.id}@deleted.invalid`,
        // Not a bcrypt hash, so no password can ever match it.
        passwordHash: `deleted:${randomBytes(16).toString('hex')}`,
        phone: null,
        dateOfBirth: null,
        avatarUrl: null,
        defaultAddressId: null,
        lastSeenAt: null,
        blockedAt: null,
        blockedReason: null,
        deletedAt: new Date(),
      },
    }),
    prisma.address.deleteMany({ where: { userId: id } }),
    prisma.cartItem.deleteMany({ where: { userId: id } }),
    prisma.wishlistItem.deleteMany({ where: { userId: id } }),
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
    prisma.passwordResetCode.deleteMany({ where: { userId: id } }),
  ]);
  return { mode: 'anonymised', orderCount };
}

export function assertNotSelf(adminId, customerId) {
  if (adminId === customerId) throw badRequest('You cannot do this to your own account');
}
