import * as wishlistService from './wishlist.service.js';

// As in the cart, the user id only ever comes from the verified access token.
const userId = (res) => res.locals.user.id;

export async function getWishlist(_req, res) {
  res.json({ items: await wishlistService.getWishlist(userId(res)) });
}

export async function addProduct(_req, res) {
  res.json({ items: await wishlistService.addProduct(userId(res), res.locals.params.productId) });
}

export async function removeProduct(_req, res) {
  res.json({ items: await wishlistService.removeProduct(userId(res), res.locals.params.productId) });
}
