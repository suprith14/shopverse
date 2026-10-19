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
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';
// import = bring in code from another file or package
import * as controller from './auth.controller.js';

// Mounted at /api/auth
// export = other files can import this
// const = a name for a value that is never reassigned
// Router = a group of routes mounted under one path (e.g. /api/cart)
export const authRouter = Router();

// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
authRouter.post('/register', validate(registerSchema), controller.register);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
authRouter.post('/login', validate(loginSchema), controller.login);
// .post(path, ...) = handle POST requests (create / do something)
authRouter.post('/refresh', controller.refresh);
// .post(path, ...) = handle POST requests (create / do something)
authRouter.post('/logout', controller.logout);
// .get(path, ...handlers) = handle GET requests (read) to this path
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
authRouter.get('/me', requireAuth, controller.me);
// Under /api/auth because the refresh cookie is only sent to /api/auth/* (needed to issue the new session).
// .post(path, ...) = handle POST requests (create / do something)
// requireAuth = middleware: needs a valid access token; puts the user on res.locals.user
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
authRouter.post('/change-password', requireAuth, validate(changePasswordSchema), controller.changePassword);

// Forgot password (public): 1) email me a code  2) code + new password
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
authRouter.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
// .post(path, ...) = handle POST requests (create / do something)
// validate(schema, part) = check req.body/query/params with Zod; result in res.locals
authRouter.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
