import express, { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../../../middleware/validate.js';
import { XLSX_TYPE } from './workbook.js';
import * as controller from './import.controller.js';

// Mounted at /api/admin/products/import (admin only).
//   GET  /template        -> the Excel template, with the current categories filled in
//   POST /?dryRun=true    -> check the file and report what WOULD change (nothing is saved)
//   POST /?dryRun=false   -> the same checks, then save everything in one transaction
export const productImportRouter = Router();

const importQuery = z.object({
  dryRun: z
    .enum(['true', 'false'])
    .default('true') // safe by default: a forgotten flag never writes
    .transform((v) => v === 'true'),
});

// The file is sent as the raw request body (no multipart form): simpler on both sides, and the
// size limit applies before anything is parsed.
const xlsxBody = express.raw({ type: [XLSX_TYPE, 'application/octet-stream'], limit: '5mb' });

productImportRouter.get('/template', controller.downloadTemplate);
productImportRouter.post('/', validate(importQuery, 'query'), xlsxBody, controller.importFile);
