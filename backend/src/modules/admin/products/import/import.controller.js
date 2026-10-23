import { badRequest } from '../../../../lib/http-error.js';
import { prisma } from '../../../../lib/prisma.js';
import { buildWorkbook, XLSX_TYPE } from './workbook.js';
import { importProducts } from './import.service.js';

// Two example rows in the template: one product (a book) with two variants, so the
// "same handle = same product" rule is visible at a glance.
const EXAMPLE = [
  {
    handle: 'atomic-habits',
    name: 'Atomic Habits',
    category: 'Books',
    brand: 'Avery',
    description: 'An easy and proven way to build good habits and break bad ones, by James Clear.',
    images: 'https://covers.openlibrary.org/b/id/12539702-L.jpg',
    details: 'author: James Clear; pages: 320; published: 2018',
    active: 'Yes',
    variantName: 'Paperback',
    sku: 'BK-ATOMIC-PB',
    options: 'format: Paperback',
    price: 18.99,
    stock: 40,
  },
  { handle: 'atomic-habits', variantName: 'Hardcover', sku: 'BK-ATOMIC-HC', options: 'format: Hardcover', price: 27.99, stock: 15 },
];

export async function downloadTemplate(_req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' }, select: { name: true, description: true } });
  const file = await buildWorkbook({ products: EXAMPLE, categories: categories.map((c) => ({ ...c, description: c.description ?? '' })) });
  res
    .set({
      'Content-Type': XLSX_TYPE,
      'Content-Disposition': 'attachment; filename="shopverse-products-template.xlsx"',
      'Cache-Control': 'no-store',
    })
    .send(file);
}

export async function importFile(req, res) {
  // .xlsx files are ZIP archives, which always start with "PK"
  if (!Buffer.isBuffer(req.body) || req.body.length < 4 || req.body.toString('latin1', 0, 2) !== 'PK') {
    throw badRequest('Upload an Excel .xlsx file (start from the template)');
  }
  const result = await importProducts(req.body, { dryRun: res.locals.query.dryRun });
  // A dry run with problems is still a successful check (200). A real import that was refused
  // because of problems is 422: nothing was saved.
  res.status(!result.dryRun && !result.applied ? 422 : 200).json(result);
}
