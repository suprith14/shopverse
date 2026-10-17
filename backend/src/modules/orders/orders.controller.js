import * as ordersService from './orders.service.js';
import { sendPdf } from '../../lib/send-pdf.js';

const userId = (res) => res.locals.user.id;

// Returns the new order plus the Stripe URL the browser should go to.
export async function checkout(req, res) {
  res.status(201).json(await ordersService.checkout(userId(res), res.locals.body, req.get('origin')));
}

export async function getPaymentUrl(_req, res) {
  res.json({ checkoutUrl: await ordersService.getPaymentUrl(userId(res), res.locals.params.id) });
}

export async function listMyOrders(_req, res) {
  res.json({ orders: await ordersService.listMyOrders(userId(res)) });
}

export async function getMyOrder(_req, res) {
  res.json({ order: await ordersService.getMyOrder(userId(res), res.locals.params.id) });
}

export async function cancelMyOrder(_req, res) {
  res.json({ order: await ordersService.cancelMyOrder(userId(res), res.locals.params.id) });
}

export async function getMyInvoice(_req, res) {
  sendPdf(res, await ordersService.getMyInvoice(userId(res), res.locals.params.id));
}
