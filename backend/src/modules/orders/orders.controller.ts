import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.js';
import * as ordersService from './orders.service.js';

const userId = (res: Response) => (res.locals.user as AuthUser).id;

export async function createOrder(_req: Request, res: Response) {
  res.status(201).json({ order: await ordersService.createOrder(userId(res), res.locals.body) });
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
