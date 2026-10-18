import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { forbidden, unauthorized } from '../lib/http-error.js';

// The CMS has NO login and NO users of its own. Admins log in to the SHOP API as usual, which
// gives them a signed access token. The CMS knows the same secret (JWT_ACCESS_SECRET), so it can
// check that signature itself: no call to the shop API, no shared database.
// This is how separate services commonly share one login ("stateless" JWT verification).
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(unauthorized());

  let payload;
  try {
    payload = jwt.verify(header.slice('Bearer '.length), env.JWT_ACCESS_SECRET);
  } catch {
    // Expired or tampered. The admin app reacts to 401 by refreshing the token and retrying.
    return next(unauthorized('Invalid or expired token'));
  }
  if (payload.role !== 'ADMIN') return next(forbidden());

  res.locals.user = { id: payload.sub, role: payload.role };
  next();
}
