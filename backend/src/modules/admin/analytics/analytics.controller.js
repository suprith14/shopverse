import * as service from './analytics.service.js';

export async function summary(_req, res) {
  res.json(await service.getSummary(res.locals.query.days));
}

export async function sales(_req, res) {
  res.json({ days: res.locals.query.days, series: await service.getSalesOverTime(res.locals.query.days) });
}

export async function topProducts(_req, res) {
  res.json({ items: await service.getTopProducts(res.locals.query.days, res.locals.query.limit) });
}

export async function salesByCategory(_req, res) {
  res.json({ items: await service.getSalesByCategory(res.locals.query.days) });
}

export async function ordersByStatus(_req, res) {
  res.json({ items: await service.getOrdersByStatus() });
}

export async function lowStock(_req, res) {
  res.json(await service.getLowStock());
}

export async function customers(_req, res) {
  res.json(await service.getCustomerStats(res.locals.query.days));
}
