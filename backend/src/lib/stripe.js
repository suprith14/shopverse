// import = bring in code from another file or package
// Stripe = the payments service client
import Stripe from 'stripe';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../config/env.js';

// One shared Stripe client. The secret key lives only on the server: whoever has it
// can create charges and refunds on this Stripe account.
// export = other files can import this
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// Stripe = the payments service client
// env = the checked settings from .env (config/env.js)
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
