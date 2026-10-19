// import = bring in code from another file or package
// Router = a group of routes mounted under one path (e.g. /api/cart)
import { Router } from 'express';
// import = bring in code from another file or package
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
import { validate } from '../../middleware/validate.js';
// import = bring in code from another file or package
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
import { requireAuth } from '../../middleware/auth.js';
// import = bring in code from another file or package
import {
  addressIdParams,
  createAddressSchema,
  saveAvatarSchema,
  updateAddressSchema,
  updateProfileSchema,
} from './profile.schema.js';
// import = bring in code from another file or package
import * as controller from './profile.controller.js';

// Mounted at /api/profile: always "MY" profile (the logged-in user), never /users/:id,
// so there is no id in the URL that someone could change to read another customer's data.
// Every response returns the full updated profile + address book.
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const profileRouter = Router();

// .use = add middleware (runs for every request) or mount a router under a path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
profileRouter.use(requireAuth);

// const = a name for a value that is never reassigned
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
const params = validate(addressIdParams, 'params');

// .get(path, ...handlers) = handle GET requests (read) to this path
profileRouter.get('/', controller.getProfile);
// .patch(path, ...) = handle PATCH requests (change some fields)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
profileRouter.patch('/', validate(updateProfileSchema), controller.updateProfile);

// Photo: 1) get a signed upload  2) browser uploads to Cloudinary  3) save the returned URL
// .post(path, ...) = handle POST requests (create / do something)
profileRouter.post('/avatar/signature', controller.getAvatarUploadSignature);
// .put(path, ...) = handle PUT requests (set to this value; repeat-safe)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
profileRouter.put('/avatar', validate(saveAvatarSchema), controller.saveAvatar);
// .delete(path, ...) = handle DELETE requests (remove)
profileRouter.delete('/avatar', controller.removeAvatar);

// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
profileRouter.post('/addresses', validate(createAddressSchema), controller.addAddress);
// .patch(path, ...) = handle PATCH requests (change some fields)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
profileRouter.patch('/addresses/:id', params, validate(updateAddressSchema), controller.updateAddress);
// .post(path, ...) = handle POST requests (create / do something)
profileRouter.post('/addresses/:id/default', params, controller.setDefaultAddress);
// .delete(path, ...) = handle DELETE requests (remove)
profileRouter.delete('/addresses/:id', params, controller.deleteAddress);
