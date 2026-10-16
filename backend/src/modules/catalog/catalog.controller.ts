import type { Request, Response } from 'express';
import * as catalogService from './catalog.service.js';
import { suggest } from './search.js';

export async function listCategories(_req: Request, res: Response) {
  res.json({ categories: await catalogService.listCategories() });
}

export async function listProducts(_req: Request, res: Response) {
  res.json(await catalogService.listProducts(res.locals.query));
}

export async function suggestions(_req: Request, res: Response) {
  res.json(await suggest(res.locals.query.q));
}

export async function getProduct(_req: Request, res: Response) {
  res.json({ product: await catalogService.getProductBySlug(res.locals.params.slug) });
}
