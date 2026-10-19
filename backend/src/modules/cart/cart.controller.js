import * as cartService from './cart.service.js';

// The user id always comes from the verified access token (res.locals.user),
// never from the request body. So nobody can read or change another user's cart.
const userId = (res) => res.locals.user.id;

export async function getCart(_req, res) {
  res.json({ cart: await cartService.getCart(userId(res)) });
}

export async function addItem(_req, res) {
  res.status(201).json({ cart: await cartService.addItem(userId(res), res.locals.body) });
}

export async function updateItem(_req, res) {
  const { variantId } = res.locals.params;
  res.json({ cart: await cartService.updateQuantity(userId(res), variantId, res.locals.body.quantity) });
}

export async function removeItem(_req, res) {
  res.json({ cart: await cartService.removeItem(userId(res), res.locals.params.variantId) });
}

export async function clearCart(_req, res) {
  res.json({ cart: await cartService.clearCart(userId(res)) });
}
