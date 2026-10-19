import Stripe from 'stripe';
import { env } from '../config/env.js';

// One shared Stripe client. The secret key lives only on the server: whoever has it
// can create charges and refunds on this Stripe account.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);
