import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import * as controller from './auth.controller.js';

// Mounted at /api/auth
export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), controller.register);
authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', requireAuth, controller.me);
// Under /api/auth because the refresh cookie is only sent to /api/auth/* (needed to issue the new session).
authRouter.post('/change-password', requireAuth, validate(changePasswordSchema), controller.changePassword);

// Forgot password (public): 1) email me a code  2) code + new password
authRouter.post('/forgot-password', validate(forgotPasswordSchema), controller.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), controller.resetPassword);
