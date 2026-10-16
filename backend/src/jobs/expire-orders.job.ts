import { expireStaleOrders } from '../modules/orders/orders.service.js';

// A background job: every minute, cancel unpaid orders whose 30 minutes ran out
// and put their stock back on sale. Without it, abandoned payment pages would keep
// stock locked forever and the store would show "sold out" for items nobody bought.
//
// A simple timer is enough for one server. Bigger systems use a job queue
// (BullMQ, a cron service) so the job runs once even with many servers.
const EVERY_MINUTE = 60 * 1000;

export function startExpireOrdersJob() {
  let running = false;

  const run = async () => {
    if (running) return; // the previous run is still going: skip this tick
    running = true;
    try {
      const released = await expireStaleOrders();
      if (released > 0) console.log(`[expire-orders] cancelled ${released} unpaid order(s), stock returned`);
    } catch (err) {
      console.error('[expire-orders] failed', err); // log and try again next minute
    } finally {
      running = false;
    }
  };

  void run(); // also run once at startup, to catch orders that expired while the server was down
  const timer = setInterval(run, EVERY_MINUTE);
  return () => clearInterval(timer);
}
