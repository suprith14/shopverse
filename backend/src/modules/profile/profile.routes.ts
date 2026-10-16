import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { addressIdParams, createAddressSchema, updateAddressSchema, updateProfileSchema } from './profile.schema.js';
import * as controller from './profile.controller.js';

// Mounted at /api/profile: always "MY" profile (the logged-in user), never /users/:id,
// so there is no id in the URL that someone could change to read another customer's data.
// Every response returns the full updated profile + address book.
export const profileRouter = Router();

profileRouter.use(requireAuth);

const params = validate(addressIdParams, 'params');

profileRouter.get('/', controller.getProfile);
profileRouter.patch('/', validate(updateProfileSchema), controller.updateProfile);

profileRouter.post('/addresses', validate(createAddressSchema), controller.addAddress);
profileRouter.patch('/addresses/:id', params, validate(updateAddressSchema), controller.updateAddress);
profileRouter.post('/addresses/:id/default', params, controller.setDefaultAddress);
profileRouter.delete('/addresses/:id', params, controller.deleteAddress);
