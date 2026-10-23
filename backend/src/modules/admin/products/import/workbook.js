import ExcelJS from 'exceljs';

// The spreadsheet format for bulk product import, in ONE place: the downloadable template is
// built from these definitions and the parser reads files with them, so they can't drift apart.
//
// Layout (the same idea as Shopify's product CSV):
//   "Products"   one row per VARIANT. Rows with the same Handle are one product; its product
//                columns (name, category, ...) only need filling on its first row.
//   "Categories" name + description. Missing categories are created, existing ones updated.

export const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const PRODUCT_COLUMNS = [
  {
    key: 'handle',
    header: 'Handle',
    width: 30,
    note: 'Unique product id in lowercase-with-dashes, e.g. sony-wh-1000xm5. It becomes the product URL. Rows with the same handle are variants of one product. Importing a handle that already exists UPDATES that product.',
  },
  { key: 'name', header: 'Product name', width: 36, note: '2-120 characters.' },
  { key: 'category', header: 'Category', width: 22, note: 'Pick from the list (sheet "Categories"). Add a row there for a new category.' },
  { key: 'brand', header: 'Brand', width: 18, note: 'Optional.' },
  { key: 'description', header: 'Description', width: 60, note: '10-5000 characters.' },
  { key: 'images', header: 'Image URLs', width: 50, note: '1-8 https:// links, one per line or separated by |. The first one is the main image.' },
  { key: 'details', header: 'Details', width: 40, note: 'Optional facts shown on the product page: "key: value; key: value", e.g. "author: James Clear; pages: 320".' },
  { key: 'active', header: 'Visible in shop', width: 15, note: 'Yes or No. Empty = Yes.' },
  { key: 'variantName', header: 'Variant name', width: 24, note: 'What the customer picks, e.g. "UK 9 / Black", "256GB", "Paperback".' },
  { key: 'sku', header: 'SKU', width: 24, note: 'Unique stock code per variant: letters, digits, - _ . (saved in capitals).' },
  { key: 'options', header: 'Options', width: 28, note: 'Optional: "size: 9; color: Black".' },
  { key: 'price', header: 'Price (USD)', width: 13, note: 'e.g. 129.99' },
  {
    key: 'stock',
    header: 'Stock',
    width: 10,
    note: 'Starting stock for NEW variants only. Stock of existing variants is never overwritten by an import (it could undo a sale made meanwhile): use "Adjust stock" in admin.',
  },
];

export const CATEGORY_COLUMNS = [
  { key: 'name', header: 'Name', width: 26, note: 'Category name as customers see it.' },
  { key: 'description', header: 'Description', width: 60, note: 'Optional.' },
];

// ------------------------------------------------------------------ writing

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

function addSheet(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = columns.map(({ key, header, width }) => ({ key, header, width }));
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = HEADER_FILL;
  header.alignment = { vertical: 'middle' };
  header.height = 22;
  columns.forEach((column, i) => {
    if (column.note) header.getCell(i + 1).note = column.note; // hover a header for help
  });
  for (const row of rows) sheet.addRow(row);
  sheet.eachRow((row, n) => {
    if (n > 1) row.alignment = { vertical: 'top', wrapText: true };
  });
  return sheet;
}

const INSTRUCTIONS = [
  ['ShopVerse product import'],
  [''],
  ['1. Fill the "Products" sheet: one row per variant (size, colour, format...).'],
  ['   Rows with the same Handle belong to one product. Product columns only need filling on its first row.'],
  ['2. Use a category from the "Categories" sheet, or add a new one there.'],
  ['3. In admin: Products > Import > choose this file. You first get a PREVIEW listing every problem by row.'],
  ['   Nothing is saved until the preview is clean and you press Import. Then everything is saved at once, or nothing.'],
  [''],
  ['Importing again is safe: existing handles and SKUs are UPDATED, never duplicated. Products missing from the file are left alone.'],
  ['Stock is only set for NEW variants. Existing stock changes through "Adjust stock" in admin, so a sale made meanwhile is never undone.'],
  ['Hover a column header for help on that column.'],
];

// rows: { products: [{ handle, name, ... }], categories: [{ name, description }], credits?: [[...]] }
export async function buildWorkbook({ products = [], categories = [], credits = null }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ShopVerse';
  workbook.created = new Date();

  const info = workbook.addWorksheet('Instructions');
  INSTRUCTIONS.forEach((line) => info.addRow(line));
  info.getColumn(1).width = 120;
  info.getRow(1).font = { bold: true, size: 14 };

  const productSheet = addSheet(workbook, 'Products', PRODUCT_COLUMNS, products);
  addSheet(workbook, 'Categories', CATEGORY_COLUMNS, categories);

  // Category cells get a dropdown of the names on the Categories sheet (and a warning otherwise)
  const categoryCol = PRODUCT_COLUMNS.findIndex((c) => c.key === 'category') + 1;
  const lastRow = Math.max(products.length + 1, 2000);
  for (let r = 2; r <= lastRow; r++) {
    productSheet.getCell(r, categoryCol).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['Categories!$A$2:$A$500'],
      showErrorMessage: true,
      errorStyle: 'warning',
      errorTitle: 'Unknown category',
      error: 'Pick a category from the list, or add it to the "Categories" sheet first.',
    };
  }

  if (credits) {
    addSheet(
      workbook,
      'Image credits',
      [
        { key: 'product', header: 'Product', width: 36 },
        { key: 'image', header: 'Image', width: 60 },
        { key: 'source', header: 'Source page', width: 60 },
        { key: 'author', header: 'Author', width: 30 },
        { key: 'license', header: 'License', width: 18 },
      ],
      credits,
    );
  }

  workbook.views = [{ activeTab: 1 }]; // open on "Products"
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

// ------------------------------------------------------------------ reading

// A cell can hold text, a number, a date, a link, rich text or a formula: always give back text
function cellText(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if ('richText' in value) return value.richText.map((part) => part.text).join('');
    if ('hyperlink' in value) return cellText(value.text ?? value.hyperlink);
    if ('result' in value) return cellText(value.result);
    if ('error' in value) return '';
  }
  return String(value).trim();
}

// Reads a sheet into [{ row, values: { key: text } }], finding columns by their header text
// (so reordered or extra columns still work). Fully empty rows are skipped.
function readSheet(sheet, columns, errors) {
  if (!sheet) return [];
  const byHeader = new Map();
  sheet.getRow(1).eachCell((cell, col) => byHeader.set(cellText(cell.value).toLowerCase(), col));
  const positions = {};
  for (const { key, header } of columns) {
    const col = byHeader.get(header.toLowerCase());
    if (col) positions[key] = col;
    else errors.push({ sheet: sheet.name, row: 1, column: header, message: `Missing column "${header}"` });
  }
  const rows = [];
  sheet.eachRow((row, n) => {
    if (n === 1) return;
    const values = {};
    for (const [key, col] of Object.entries(positions)) values[key] = cellText(row.getCell(col).value);
    if (Object.values(values).some(Boolean)) rows.push({ row: n, values });
  });
  return rows;
}

export class WorkbookError extends Error {}

export async function readWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer);
  } catch {
    throw new WorkbookError("This file couldn't be read as an Excel .xlsx file");
  }
  const errors = [];
  const productSheet = workbook.getWorksheet('Products');
  if (!productSheet) throw new WorkbookError('The file has no "Products" sheet. Start from the template.');
  const products = readSheet(productSheet, PRODUCT_COLUMNS, errors);
  const categories = readSheet(workbook.getWorksheet('Categories'), CATEGORY_COLUMNS, errors);
  return { products, categories, errors };
}
