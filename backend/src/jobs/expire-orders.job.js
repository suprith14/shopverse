// import = bring in code from another file or package
import { expireStaleOrders } from '../modules/orders/orders.service.js';

// A background job: every minute, cancel unpaid orders whose 30 minutes ran out
// and put their stock back on sale. Without it, abandoned payment pages would keep
// stock locked forever and the store would show "sold out" for items nobody bought.
//
// A simple timer is enough for one server. Bigger systems use a job queue
// (BullMQ, a cron service) so the job runs once even with many servers.
// const = a name for a value that is never reassigned
const EVERY_MINUTE = 60 * 1000;

// export = other files can import this
// function = a named, reusable block of code
export function startExpireOrdersJob() {
  // let = a name whose value can be changed later
  let running = false;

  // const = a name for a value that is never reassigned
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  const run = async () => {
    // if (...) = run the next part only when the condition is true
    // return = give this value back and stop the function here
    if (running) return; // the previous run is still going: skip this tick
    running = true;
    // try / catch = if the code inside fails, run the catch part instead of crashing
    try {
      // const = a name for a value that is never reassigned
      // await = wait for a Promise (async result) before continuing
      const released = await expireStaleOrders();
      // if (...) = run the next part only when the condition is true
      // console.log / warn / error = print to the server log
      // `text ${x}` = a template string: text with values inserted
      if (released > 0) console.log(`[expire-orders] cancelled ${released} unpaid order(s), stock returned`);
    } catch (err) {
      // console.log / warn / error = print to the server log
      console.error('[expire-orders] failed', err); // log and try again next minute
    } finally {
      running = false;
    }
  };

  void run(); // also run once at startup, to catch orders that expired while the server was down
  // const = a name for a value that is never reassigned
  // setInterval = run a function repeatedly every N ms
  const timer = setInterval(run, EVERY_MINUTE);
  // return = give this value back and stop the function here
  // => = an arrow function (a short function)
  // clearInterval = stop a setInterval
  return () => clearInterval(timer);
}
