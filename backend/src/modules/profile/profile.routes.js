import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  addressIdParams,
  createAddressSchema,
  saveAvatarSchema,
  updateAddressSchema,
  updateProfileSchema,
} from './profile.schema.js';
import * as controller from './profile.controller.js';

// Mounted at /api/profile: always "MY" profile (the logged-in user), never /users/:id,
// so there is no id in the URL that someone could change to read another customer's data.
// Every response returns the full updated profile + address book.
export const profileRouter = Router();

profileRouter.use(requireAuth);

const params = validate(addressIdParams, 'params');

profileRouter.get('/', controller.getProfile);
profileRouter.patch('/', validate(updateProfileSchema), controller.updateProfile);

// Photo: 1) get a signed upload  2) browser uploads to Cloudinary  3) save the returned URL
profileRouter.post('/avatar/signature', controller.getAvatarUploadSignature);
profileRouter.put('/avatar', validate(saveAvatarSchema), controller.saveAvatar);
profileRouter.delete('/avatar', controller.removeAvatar);

profileRouter.post('/addresses', validate(createAddressSchema), controller.addAddress);
profileRouter.patch('/addresses/:id', params, validate(updateAddressSchema), controller.updateAddress);
profileRouter.post('/addresses/:id/default', params, controller.setDefaultAddress);
profileRouter.delete('/addresses/:id', params, controller.deleteAddress);
