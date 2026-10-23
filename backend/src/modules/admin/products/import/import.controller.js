import { badRequest } from '../../../../lib/http-error.js';
import { prisma } from '../../../../lib/prisma.js';
import { buildWorkbook, fileTypeProblem, XLSX_TYPE } from './workbook.js';
import { importProducts } from './import.service.js';

// Two example rows in the template: one product with two variants, so the "same handle = same
// product" rule is visible at a glance. The handle starts with "example-", which the import refuses
// (import.service.js): an example row left in the file can never create or overwrite a real product.
const exampleRows = (category) => [
  {
    handle: 'example-notebook',
    name: 'Example: A5 Notebook (delete these two rows)',
    category,
    brand: 'Example Brand',
    description: 'Shows how to fill each column. Replace these rows with your own products.',
    images: 'https://placehold.co/800x800/png?text=Example',
    details: 'pages: 192; paper: 80 gsm',
    active: 'No',
    variantName: 'Ruled',
    sku: 'EXAMPLE-NOTE-RULED',
    options: 'style: Ruled',
    price: 4.99,
    stock: 10,
  },
  { handle: 'example-notebook', variantName: 'Plain', sku: 'EXAMPLE-NOTE-PLAIN', options: 'style: Plain', price: 4.49, stock: 5 },
];

export async function downloadTemplate(_req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' }, select: { name: true, description: true } });
  const file = await buildWorkbook({
    products: exampleRows(categories[0]?.name ?? 'Books'),
    categories: categories.map((c) => ({ ...c, description: c.description ?? '' })),
  });
  res
    .set({
      'Content-Type': XLSX_TYPE,
      'Content-Disposition': 'attachment; filename="shopverse-products-template.xlsx"',
      'Cache-Control': 'no-store',
    })
    .send(file);
}

export async function importFile(req, res) {
  // .xlsx files are ZIP archives, which always start with "PK"; anything else gets a clear reason
  const problem = fileTypeProblem(req.body);
  if (problem) throw badRequest(problem);
  const result = await importProducts(req.body, { dryRun: res.locals.query.dryRun });
  // A dry run with problems is still a successful check (200). A real import that was refused
  // because of problems is 422: nothing was saved.
  res.status(!result.dryRun && !result.applied ? 422 : 200).json(result);
}
