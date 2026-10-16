import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.js';
import * as ordersService from './orders.service.js';
import { sendPdf } from '../../lib/send-pdf.js';

const userId = (res: Response) => (res.locals.user as AuthUser).id;

// Returns the new order plus the Stripe URL the browser should go to.
export async function checkout(_req: Request, res: Response) {
  res.status(201).json(await ordersService.checkout(userId(res), res.locals.body));
}

export async function getPaymentUrl(_req: Request, res: Response) {
  res.json({ checkoutUrl: await ordersService.getPaymentUrl(userId(res), res.locals.params.id) });
}

export async function listMyOrders(_req: Request, res: Response) {
  res.json({ orders: await ordersService.listMyOrders(userId(res)) });
}

export async function getMyOrder(_req: Request, res: Response) {
  res.json({ order: await ordersService.getMyOrder(userId(res), res.locals.params.id) });
}

export async function cancelMyOrder(_req: Request, res: Response) {
  res.json({ order: await ordersService.cancelMyOrder(userId(res), res.locals.params.id) });
}

export async function getMyInvoice(_req: Request, res: Response) {
  sendPdf(res, await ordersService.getMyInvoice(userId(res), res.locals.params.id));
}
