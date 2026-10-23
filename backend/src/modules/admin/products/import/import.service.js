import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../lib/prisma.js';
import { badRequest } from '../../../../lib/http-error.js';
import { readWorkbook, WorkbookError } from './workbook.js';

// Bulk product import from the Excel template (workbook.js), in three phases:
//   1. read + validate every row  -> a list of errors by sheet/row/column (the admin's preview)
//   2. compare with the database  -> what would be created / updated / left alone
//   3. apply, only if there are no errors, in ONE transaction: all rows are saved or none
// A dry run stops after phase 2, so the admin always sees exactly what Import will do.

export const MAX_ROWS = 5000;

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// "author: James Clear; pages: 320" -> { author: 'James Clear', pages: 320 }
function parsePairs(text, { numbers }) {
  const result = {};
  for (const part of text.split(/;|\n/)) {
    if (!part.trim()) continue;
    const i = part.indexOf(':');
    if (i < 1) throw new Error(`"${part.trim()}" should look like "key: value"`);
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    result[key] = numbers && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
  }
  return result;
}

const yesNo = { yes: true, y: true, true: true, 1: true, no: false, n: false, false: false, 0: false };

// One field per check, so every problem in a row is reported at once (not one per upload)
const productFields = {
  name: z.string().min(2, 'At least 2 characters').max(120),
  category: z.string().min(1, 'Required'),
  brand: z.string().max(60),
  description: z.string().min(10, 'At least 10 characters').max(5000),
  images: z
    .string()
    .transform((s) => s.split(/[\n|]/).map((u) => u.trim()).filter(Boolean))
    .pipe(z.array(z.url({ protocol: /^https$/, error: 'Must be an https:// link' })).min(1, 'At least one image').max(8, 'At most 8 images')),
  details: z.string().transform((s, ctx) => {
    try {
      return parsePairs(s, { numbers: true });
    } catch (err) {
      ctx.addIssue({ code: 'custom', message: err.message });
      return z.NEVER;
    }
  }),
  active: z
    .string()
    .transform((s) => (s ? yesNo[s.toLowerCase()] : true))
    .refine((v) => v !== undefined, 'Use Yes or No'),
};

const variantFields = {
  handle: z
    .string()
    .min(1, 'Required')
    .max(120)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase letters, digits and dashes only, e.g. sony-wh-1000xm5'),
  variantName: z.string().min(1, 'Required').max(80),
  sku: z
    .string()
    .min(1, 'Required')
    .max(64)
    .transform((s) => s.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9._-]+$/, 'Letters, digits, - _ . only')),
  options: z.string().transform((s, ctx) => {
    try {
      return Object.fromEntries(Object.entries(parsePairs(s, { numbers: false })).map(([k, v]) => [k, String(v)]));
    } catch (err) {
      ctx.addIssue({ code: 'custom', message: err.message });
      return z.NEVER;
    }
  }),
  price: z
    .string()
    .min(1, 'Required')
    .transform((s) => Number(s.replace(/[$,\s]/g, '')))
    .refine((n) => Number.isFinite(n) && n >= 0.01 && n <= 100_000, 'A price between 0.01 and 100000, e.g. 129.99')
    .transform((n) => Math.round(n * 100)), // stored in cents
  stock: z
    .string()
    .transform((s) => (s === '' ? 0 : Number(s)))
    .refine((n) => Number.isInteger(n) && n >= 0 && n <= 100_000, 'A whole number from 0 to 100000'),
};

const categoryFields = {
  name: z.string().min(2, 'At least 2 characters').max(60),
  description: z.string().max(500),
};

const HEADERS = {
  handle: 'Handle', name: 'Product name', category: 'Category', brand: 'Brand', description: 'Description',
  images: 'Image URLs', details: 'Details', active: 'Visible in shop', variantName: 'Variant name', sku: 'SKU',
  options: 'Options', price: 'Price (USD)', stock: 'Stock',
};

// Checks each field on its own; returns the clean values, or records an error per bad field
function check(fields, values, where, errors, headers) {
  const out = {};
  for (const [key, schema] of Object.entries(fields)) {
    const result = schema.safeParse(values[key] ?? '');
    if (result.success) out[key] = result.data;
    else errors.push({ ...where, column: headers[key] ?? key, message: result.error.issues[0].message });
  }
  return out;
}

// ------------------------------------------------------------------ phase 1: validate

function validateRows(sheetRows, errors) {
  // categories sheet
  const categories = new Map(); // lower-case name -> { name, description, row }
  for (const { row, values } of sheetRows.categories) {
    const where = { sheet: 'Categories', row };
    const c = check(categoryFields, values, where, errors, { name: 'Name', description: 'Description' });
    if (!c.name) continue;
    const key = c.name.toLowerCase();
    if (categories.has(key)) errors.push({ ...where, column: 'Name', message: `"${c.name}" is listed twice (row ${categories.get(key).row})` });
    else categories.set(key, { ...c, row });
  }

  // products sheet: group variant rows by handle
  const products = new Map(); // handle -> { fields, row, variants: [] }
  const skus = new Map(); // sku -> row
  for (const { row, values } of sheetRows.products) {
    const where = { sheet: 'Products', row };
    const v = check(variantFields, values, where, errors, HEADERS);
    if (v.sku) {
      if (skus.has(v.sku)) errors.push({ ...where, column: 'SKU', message: `${v.sku} is also used on row ${skus.get(v.sku)}` });
      else skus.set(v.sku, row);
    }
    if (!v.handle) continue;

    let product = products.get(v.handle);
    if (!product) {
      // first row of this product: the product columns are required here
      product = { handle: v.handle, row, firstValues: values, fields: check(productFields, values, where, errors, HEADERS), variants: [] };
      products.set(v.handle, product);
    } else {
      // later rows may leave product columns empty; if filled, they must match the first row
      for (const key of Object.keys(productFields)) {
        if (values[key] && values[key] !== product.firstValues[key]) {
          errors.push({ ...where, column: HEADERS[key], message: `Differs from row ${product.row} (same handle). Leave it empty or make it the same.` });
        }
      }
    }
    if (v.variantName && v.sku && v.price !== undefined && v.stock !== undefined) {
      product.variants.push({ row, name: v.variantName, sku: v.sku, options: v.options ?? {}, price: v.price, stock: v.stock });
    }
  }
  if (sheetRows.products.length === 0) errors.push({ sheet: 'Products', row: 2, column: 'Handle', message: 'The Products sheet is empty' });
  return { categories, products };
}

// ------------------------------------------------------------------ phase 2: plan

// Compares JSON values ignoring key order: PostgreSQL jsonb stores keys in its own order
// (shortest first), so { connectivity, battery } comes back as { battery, connectivity }.
const canonical = (value) =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]))
      : value;
const sameJson = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

async function plan({ categories, products }, errors, warnings) {
  const handles = [...products.keys()];
  const skus = [...products.values()].flatMap((p) => p.variants.map((v) => v.sku));
  const [dbCategories, dbProducts, dbVariants] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({ where: { slug: { in: handles } }, include: { variants: true, category: { select: { name: true } } } }),
    prisma.productVariant.findMany({ where: { sku: { in: skus } }, select: { sku: true, product: { select: { slug: true } } } }),
  ]);

  // Categories: create the new ones, update changed descriptions
  const categoryByName = new Map(dbCategories.map((c) => [c.name.toLowerCase(), c]));
  const categoryBySlug = new Map(dbCategories.map((c) => [c.slug, c]));
  const categoryPlan = { create: [], update: [] };
  for (const [key, c] of categories) {
    const existing = categoryByName.get(key);
    const description = c.description || null;
    if (!existing) {
      const slug = slugify(c.name);
      if (categoryBySlug.has(slug)) {
        errors.push({ sheet: 'Categories', row: c.row, column: 'Name', message: `Too close to the existing category "${categoryBySlug.get(slug).name}"` });
      } else {
        categoryPlan.create.push({ name: c.name, slug, description });
      }
    } else if (description && description !== existing.description) {
      categoryPlan.update.push({ id: existing.id, description });
    }
  }
  const knownCategory = (name) => categoryByName.has(name.toLowerCase()) || categories.has(name.toLowerCase());

  // SKUs that already belong to ANOTHER product can't be moved by an import
  const skuOwner = new Map(dbVariants.map((v) => [v.sku, v.product.slug]));
  const dbBySlug = new Map(dbProducts.map((p) => [p.slug, p]));
  const productPlan = { create: [], update: [], unchanged: 0 };
  const variantPlan = { create: 0, update: 0, unchanged: 0 };
  const preview = [];

  for (const p of products.values()) {
    const f = p.fields;
    if (f.category && !knownCategory(f.category)) {
      errors.push({ sheet: 'Products', row: p.row, column: 'Category', message: `Unknown category "${f.category}". Add it to the Categories sheet.` });
    }
    if (p.variants.length === 0) continue; // its rows already have errors
    for (const v of p.variants) {
      const owner = skuOwner.get(v.sku);
      if (owner && owner !== p.handle) errors.push({ sheet: 'Products', row: v.row, column: 'SKU', message: `${v.sku} already belongs to the product "${owner}"` });
    }

    const existing = dbBySlug.get(p.handle);
    const data = {
      name: f.name,
      description: f.description,
      brand: f.brand || null,
      images: f.images,
      attributes: f.details ?? {},
      isActive: f.active,
      categoryName: f.category,
    };
    if (!existing) {
      productPlan.create.push({ handle: p.handle, data, variants: p.variants });
      variantPlan.create += p.variants.length;
      preview.push({ handle: p.handle, name: f.name, category: f.category, action: 'create', variants: p.variants.length });
      continue;
    }

    const changed =
      existing.name !== data.name ||
      existing.description !== data.description ||
      existing.brand !== data.brand ||
      !sameJson(existing.images, data.images) ||
      !sameJson(existing.attributes, data.attributes) ||
      existing.isActive !== data.isActive ||
      existing.category.name.toLowerCase() !== (data.categoryName ?? '').toLowerCase();
    const bySku = new Map(existing.variants.map((v) => [v.sku, v]));
    const variants = { create: [], update: [] };
    for (const v of p.variants) {
      const old = bySku.get(v.sku);
      if (!old) {
        variants.create.push(v);
      } else {
        if (old.name !== v.name || old.price !== v.price || !sameJson(old.options, v.options)) variants.update.push({ id: old.id, ...v });
        else variantPlan.unchanged++;
        if (v.stock !== old.stock) {
          warnings.push({ sheet: 'Products', row: v.row, column: 'Stock', message: `${v.sku}: stock stays ${old.stock} (existing variant; use "Adjust stock")` });
        }
      }
    }
    variantPlan.create += variants.create.length;
    variantPlan.update += variants.update.length;
    if (changed || variants.create.length || variants.update.length) {
      productPlan.update.push({ id: existing.id, changed, data, variants });
      preview.push({ handle: p.handle, name: f.name, category: f.category, action: 'update', variants: p.variants.length });
    } else {
      productPlan.unchanged++;
      preview.push({ handle: p.handle, name: f.name, category: f.category, action: 'unchanged', variants: p.variants.length });
    }
  }

  return { categoryPlan, productPlan, variantPlan, preview, dbCategories };
}

// ------------------------------------------------------------------ phase 3: apply

async function apply({ categoryPlan, productPlan, dbCategories }) {
  // Big imports are many queries; the default 5 s transaction limit is too short for them
  await prisma.$transaction(
    async (tx) => {
      if (categoryPlan.create.length) await tx.category.createMany({ data: categoryPlan.create });
      for (const c of categoryPlan.update) await tx.category.update({ where: { id: c.id }, data: { description: c.description } });

      const categoryId = new Map(dbCategories.map((c) => [c.name.toLowerCase(), c.id]));
      if (categoryPlan.create.length) {
        const created = await tx.category.findMany({ where: { slug: { in: categoryPlan.create.map((c) => c.slug) } } });
        created.forEach((c) => categoryId.set(c.name.toLowerCase(), c.id));
      }
      const productData = ({ categoryName, ...data }) => ({ ...data, categoryId: categoryId.get(categoryName.toLowerCase()) });

      // New products: one insert for all products, one for all their variants
      if (productPlan.create.length) {
        const created = await tx.product.createManyAndReturn({
          data: productPlan.create.map((p) => ({
            ...productData(p.data),
            slug: p.handle,
            basePrice: Math.min(...p.variants.map((v) => v.price)),
          })),
          select: { id: true, slug: true },
        });
        const idBySlug = new Map(created.map((p) => [p.slug, p.id]));
        await tx.productVariant.createMany({
          data: productPlan.create.flatMap((p) =>
            p.variants.map((v) => ({ productId: idBySlug.get(p.handle), sku: v.sku, name: v.name, options: v.options, price: v.price, stock: v.stock })),
          ),
        });
      }

      // Existing products: update what changed; stock of existing variants is never touched
      for (const p of productPlan.update) {
        if (p.changed) await tx.product.update({ where: { id: p.id }, data: productData(p.data) });
        if (p.variants.create.length) {
          await tx.productVariant.createMany({
            data: p.variants.create.map((v) => ({ productId: p.id, sku: v.sku, name: v.name, options: v.options, price: v.price, stock: v.stock })),
          });
        }
        for (const v of p.variants.update) {
          await tx.productVariant.update({ where: { id: v.id }, data: { name: v.name, options: v.options, price: v.price } });
        }
      }

      // Product.basePrice = cheapest variant, recalculated for every updated product at once
      const ids = productPlan.update.map((p) => p.id);
      if (ids.length) {
        await tx.$executeRaw`
          UPDATE "Product" p
          SET "basePrice" = (SELECT MIN(v.price) FROM "ProductVariant" v WHERE v."productId" = p.id)
          WHERE p.id IN (${Prisma.join(ids)})`;
      }
    },
    { timeout: 120_000, maxWait: 10_000 },
  );
}

// ------------------------------------------------------------------ entry point

export async function importProducts(buffer, { dryRun }) {
  let sheets;
  try {
    sheets = await readWorkbook(buffer);
  } catch (err) {
    if (err instanceof WorkbookError) throw badRequest(err.message);
    throw err;
  }
  if (sheets.products.length > MAX_ROWS) throw badRequest(`Too many rows: at most ${MAX_ROWS} per file`);

  const errors = [...sheets.errors];
  const warnings = [];
  const valid = validateRows(sheets, errors);
  const result = await plan(valid, errors, warnings);

  const sortByRow = (a, b) => a.sheet.localeCompare(b.sheet) || a.row - b.row;
  const applied = !dryRun && errors.length === 0;
  if (applied) await apply(result);

  return {
    dryRun,
    applied,
    summary: {
      categories: { create: result.categoryPlan.create.length, update: result.categoryPlan.update.length },
      products: { create: result.productPlan.create.length, update: result.productPlan.update.length, unchanged: result.productPlan.unchanged },
      variants: result.variantPlan,
    },
    errors: errors.sort(sortByRow).slice(0, 500),
    errorCount: errors.length,
    warnings: warnings.sort(sortByRow).slice(0, 200),
    products: result.preview,
  };
}
