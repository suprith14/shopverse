import type { Request, Response } from 'express';
import type { AuthUser } from '../../middleware/auth.js';
import * as service from './profile.service.js';

const userId = (res: Response) => (res.locals.user as AuthUser).id;

export async function getProfile(_req: Request, res: Response) {
  res.json({ profile: await service.getProfile(userId(res)) });
}

export async function updateProfile(_req: Request, res: Response) {
  res.json({ profile: await service.updateProfile(userId(res), res.locals.body) });
}

export function getAvatarUploadSignature(_req: Request, res: Response) {
  res.json(service.getAvatarUploadSignature(userId(res)));
}

export async function saveAvatar(_req: Request, res: Response) {
  res.json({ profile: await service.saveAvatar(userId(res), res.locals.body.url) });
}

export async function removeAvatar(_req: Request, res: Response) {
  res.json({ profile: await service.removeAvatar(userId(res)) });
}

export async function addAddress(_req: Request, res: Response) {
  res.status(201).json({ profile: await service.addAddress(userId(res), res.locals.body) });
}

export async function updateAddress(_req: Request, res: Response) {
  res.json({ profile: await service.updateAddress(userId(res), res.locals.params.id, res.locals.body) });
}

export async function setDefaultAddress(_req: Request, res: Response) {
  res.json({ profile: await service.setDefaultAddress(userId(res), res.locals.params.id) });
}

export async function deleteAddress(_req: Request, res: Response) {
  res.json({ profile: await service.deleteAddress(userId(res), res.locals.params.id) });
}
