import * as couponsService from './coupons.service.js';

export async function previewCoupon(_req, res) {
  const { id } = res.locals.user;
  res.json({ preview: await couponsService.previewCoupon(id, res.locals.query.code) });
}
