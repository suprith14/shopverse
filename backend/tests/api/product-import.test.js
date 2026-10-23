import { randomUUID } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import ExcelJS from 'exceljs';
import { prisma } from '../../src/lib/prisma.js';
import { buildWorkbook, XLSX_TYPE } from '../../src/modules/admin/products/import/workbook.js';
import { api, auth, createProduct, createUser } from './helpers.js';

// Each test uses its own handles, SKUs and category names, so tests never see each other's data
const unique = () => randomUUID().slice(0, 8);
// SKUs are always stored in capitals (the API, the import and the seed all uppercase them)
const SKU = (u) => u.toUpperCase();

function upload(token, file, { dryRun }) {
  return api
    .post('/api/admin/products/import')
    .query({ dryRun: String(dryRun) })
    .set(auth(token))
    .set('Content-Type', XLSX_TYPE)
    .send(file);
}

// A small valid file: one new category with one product in two variants
async function sampleFile(u, overrides = {}) {
  const category = `Import Cat ${u}`;
  return {
    category,
    file: await buildWorkbook({
      categories: [{ name: category, description: 'Created by the import test' }],
      products: [
        {
          handle: `lamp-${u}`,
          name: 'Arc Floor Lamp',
          category,
          brand: 'Lumen',
          description: 'A tall arc lamp with a marble base and a linen shade.',
          images: 'https://example.com/lamp-1.jpg | https://example.com/lamp-2.jpg',
          details: 'material: Steel; height cm: 190',
          active: 'Yes',
          variantName: 'Black',
          sku: `LAMP-${SKU(u)}-BLK`,
          options: 'color: Black',
          price: '149.99',
          stock: '7',
          ...overrides,
        },
        { handle: `lamp-${u}`, variantName: 'White', sku: `LAMP-${SKU(u)}-WHT`, options: 'color: White', price: '139.50', stock: '3' },
      ],
    }),
  };
}

describe('admin: product import template', () => {
  test('downloads an Excel file with the Products and Categories sheets', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const res = await api
      .get('/api/admin/products/import/template')
      .set(auth(admin.accessToken))
      .buffer(true)
      .parse((r, done) => {
        const chunks = [];
        r.on('data', (c) => chunks.push(c)).on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);

    expect(res.headers['content-type']).toContain(XLSX_TYPE);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(res.body);
    expect(workbook.getWorksheet('Products').getRow(1).getCell(1).value).toBe('Handle');
    expect(workbook.getWorksheet('Categories')).toBeDefined();
  });

  test('customers cannot use the import', async () => {
    const customer = await createUser();
    await api.get('/api/admin/products/import/template').set(auth(customer.accessToken)).expect(403);
    const { file } = await sampleFile(unique());
    await upload(customer.accessToken, file, { dryRun: true }).expect(403);
  });
});

describe('admin: product import', () => {
  test('a file that is not .xlsx is refused', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const res = await upload(admin.accessToken, Buffer.from('name,price\nLamp,10'), { dryRun: true });
    expect(res.status).toBe(400);
  });

  test('dry run reports what would change and saves nothing; import then saves it all', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const u = unique();
    const { file, category } = await sampleFile(u);

    const preview = await upload(admin.accessToken, file, { dryRun: true }).expect(200);
    expect(preview.body).toMatchObject({
      dryRun: true,
      applied: false,
      errorCount: 0,
      summary: { categories: { create: 1 }, products: { create: 1 }, variants: { create: 2 } },
    });
    expect(await prisma.product.findUnique({ where: { slug: `lamp-${u}` } })).toBeNull();

    const done = await upload(admin.accessToken, file, { dryRun: false }).expect(200);
    expect(done.body.applied).toBe(true);

    const product = await prisma.product.findUnique({
      where: { slug: `lamp-${u}` },
      include: { variants: { orderBy: { sku: 'asc' } }, category: true },
    });
    expect(product).toMatchObject({
      name: 'Arc Floor Lamp',
      brand: 'Lumen',
      basePrice: 13950, // the cheaper variant, in cents
      images: ['https://example.com/lamp-1.jpg', 'https://example.com/lamp-2.jpg'],
      attributes: { material: 'Steel', 'height cm': 190 },
      isActive: true,
    });
    expect(product.category.name).toBe(category);
    expect(product.variants.map((v) => [v.sku, v.price, v.stock, v.options])).toEqual([
      [`LAMP-${SKU(u)}-BLK`, 14999, 7, { color: 'Black' }],
      [`LAMP-${SKU(u)}-WHT`, 13950, 3, { color: 'White' }],
    ]);
  });

  test('importing again updates instead of duplicating, and never overwrites stock', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const u = unique();
    await upload(admin.accessToken, (await sampleFile(u)).file, { dryRun: false }).expect(200);

    // new price and stock for the black lamp
    const again = await upload(admin.accessToken, (await sampleFile(u, { price: '99.00', stock: '50' })).file, { dryRun: false }).expect(200);

    expect(again.body.summary).toMatchObject({ categories: { create: 0 }, products: { create: 0, update: 1 }, variants: { create: 0, update: 1, unchanged: 1 } });
    expect(again.body.warnings).toEqual([expect.objectContaining({ column: 'Stock', message: expect.stringContaining('stock stays 7') })]);
    const variants = await prisma.productVariant.findMany({ where: { sku: { startsWith: `LAMP-${SKU(u)}` } }, orderBy: { sku: 'asc' } });
    expect(variants.map((v) => [v.price, v.stock])).toEqual([
      [9900, 7], // price updated, stock kept
      [13950, 3],
    ]);
    expect((await prisma.product.findUnique({ where: { slug: `lamp-${u}` } })).basePrice).toBe(9900);
  });

  test('an unchanged file is reported as unchanged, even though the database reorders JSON keys', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const u = unique();
    // jsonb stores keys shortest-first, so { zeta, a } comes back as { a, zeta }
    const { file } = await sampleFile(u, { details: 'zeta: 1; a: 2', options: 'size: XL; color: Black' });
    await upload(admin.accessToken, file, { dryRun: false }).expect(200);

    const again = await upload(admin.accessToken, file, { dryRun: true }).expect(200);

    expect(again.body.summary.products).toMatchObject({ create: 0, update: 0, unchanged: 1 });
    expect(again.body.summary.variants).toMatchObject({ create: 0, update: 0, unchanged: 2 });
  });

  test('every problem is reported by row and column, and nothing is saved', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const u = unique();
    const file = await buildWorkbook({
      categories: [],
      products: [
        { handle: `bad-${u}`, name: 'X', category: 'No Such Category', description: 'short', images: 'http://insecure.example.com/a.jpg', variantName: 'One', sku: `BAD-${u}`, price: 'free', stock: '-1' },
        { handle: `bad-${u}`, variantName: 'Two', sku: `BAD-${u}`, price: '10' }, // same SKU again
        { handle: 'Not A Handle', name: 'Fine name', category: 'No Such Category', description: 'Long enough description', images: 'https://example.com/a.jpg', variantName: 'One', sku: `OK-${u}`, price: '10' },
      ],
    });

    const res = await upload(admin.accessToken, file, { dryRun: false });

    expect(res.status).toBe(422);
    expect(res.body.applied).toBe(false);
    const problems = res.body.errors.map((e) => `${e.row}:${e.column}`);
    expect(problems).toEqual(
      expect.arrayContaining(['2:Product name', '2:Description', '2:Image URLs', '2:Price (USD)', '2:Stock', '2:Category', '3:SKU', '4:Handle']),
    );
    expect(await prisma.product.count({ where: { slug: `bad-${u}` } })).toBe(0);
  });

  test('a SKU that belongs to another product is refused', async () => {
    const admin = await createUser({ role: 'ADMIN' });
    const other = await createProduct();
    // the test helper writes straight to the database, so normalise its SKU like the API would
    const sku = other.variant.sku.toUpperCase();
    await prisma.productVariant.update({ where: { id: other.variant.id }, data: { sku } });
    const u = unique();
    const { file } = await sampleFile(u, { sku });

    const res = await upload(admin.accessToken, file, { dryRun: true }).expect(200);

    expect(res.body.errors).toContainEqual(expect.objectContaining({ column: 'SKU', message: expect.stringContaining('already belongs') }));
  });
});
