import * as service from './customers.service.js';

export async function listCustomers(_req, res) {
  res.json(await service.listCustomers(res.locals.query));
}

export async function blockCustomer(_req, res) {
  service.assertNotSelf(res.locals.user.id, res.locals.params.id);
  await service.blockCustomer(res.locals.params.id, res.locals.body.reason);
  res.status(204).end();
}

export async function unblockCustomer(_req, res) {
  await service.unblockCustomer(res.locals.params.id);
  res.status(204).end();
}

export async function deleteCustomer(_req, res) {
  service.assertNotSelf(res.locals.user.id, res.locals.params.id);
  res.json(await service.deleteCustomer(res.locals.params.id));
}
