import * as service from './orders.service.js';
import { sendPdf } from '../../../lib/send-pdf.js';

export async function listOrders(_req, res) {
  res.json(await service.listOrders(res.locals.query));
}

export async function getOrder(_req, res) {
  res.json({ order: await service.getOrder(res.locals.params.id) });
}

export async function updateStatus(_req, res) {
  res.json({ order: await service.updateStatus(res.locals.params.id, res.locals.body.status) });
}

export async function refundOrder(_req, res) {
  res.json({ order: await service.refundOrder(res.locals.params.id, res.locals.body.restock) });
}

export async function getInvoice(_req, res) {
  sendPdf(res, await service.getInvoice(res.locals.params.id));
}
