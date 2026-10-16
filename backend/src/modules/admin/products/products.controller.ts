import type { Request, Response } from 'express';
import * as service from './products.service.js';

export async function listProducts(_req: Request, res: Response) {
  res.json(await service.listProducts(res.locals.query));
}

export async function listCategories(_req: Request, res: Response) {
  res.json({ categories: await service.listCategories() });
}

export async function getProduct(_req: Request, res: Response) {
  res.json({ product: await service.getProduct(res.locals.params.id) });
}

export async function createProduct(_req: Request, res: Response) {
  res.status(201).json({ product: await service.createProduct(res.locals.body) });
}

export async function updateProduct(_req: Request, res: Response) {
  res.json({ product: await service.updateProduct(res.locals.params.id, res.locals.body) });
}

export async function addVariant(_req: Request, res: Response) {
  res.status(201).json({ product: await service.addVariant(res.locals.params.id, res.locals.body) });
}

export async function updateVariant(_req: Request, res: Response) {
  res.json({ product: await service.updateVariant(res.locals.params.variantId, res.locals.body) });
}

export async function deleteVariant(_req: Request, res: Response) {
  res.json({ product: await service.deleteVariant(res.locals.params.variantId) });
}

export async function adjustStock(_req: Request, res: Response) {
  res.json({ product: await service.adjustStock(res.locals.params.variantId, res.locals.body.delta) });
}
