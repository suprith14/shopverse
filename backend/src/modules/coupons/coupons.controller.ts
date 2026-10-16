import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.js';
import * as couponsService from './coupons.service.js';

export async function previewCoupon(_req: Request, res: Response) {
  const { id } = res.locals.user as AuthUser;
  res.json({ preview: await couponsService.previewCoupon(id, res.locals.query.code) });
}
