import * as catalogService from './catalog.service.js';
import { suggest } from './search.js';

export async function listCategories(_req, res) {
  res.json({ categories: await catalogService.listCategories() });
}

export async function listProducts(_req, res) {
  res.json(await catalogService.listProducts(res.locals.query));
}

export async function suggestions(_req, res) {
  res.json(await suggest(res.locals.query.q));
}

export async function getProduct(_req, res) {
  res.json({ product: await catalogService.getProductBySlug(res.locals.params.slug) });
}
