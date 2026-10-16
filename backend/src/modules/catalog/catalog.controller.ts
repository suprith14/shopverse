import type { Request, Response } from 'express';
import * as catalogService from './catalog.service.js';

export async function listCategories(_req: Request, res: Response) {
  res.json({ categories: await catalogService.listCategories() });
}

export async function listProducts(_req: Request, res: Response) {
  res.json(await catalogService.listProducts(res.locals.query));
}

export async function listBrands(req: Request, res: Response) {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  res.json({ brands: await catalogService.listBrands(category) });
}

export async function getProduct(_req: Request, res: Response) {
  res.json({ product: await catalogService.getProductBySlug(res.locals.params.slug) });
}
