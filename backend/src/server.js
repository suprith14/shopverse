// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from './config/env.js';
// import = bring in code from another file or package
import { createApp } from './app.js';
// import = bring in code from another file or package
import { prisma } from './lib/prisma.js';
// import = bring in code from another file or package
import { startExpireOrdersJob } from './jobs/expire-orders.job.js';

// const = a name for a value that is never reassigned
const app = createApp();

// const = a name for a value that is never reassigned
// .listen(port) = start the HTTP server on this port
// env = the checked settings from .env (config/env.js)
// => = an arrow function (a short function)
const server = app.listen(env.PORT, () => {
  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  // env = the checked settings from .env (config/env.js)
  console.log(`ShopVerse API running on http://localhost:${env.PORT}`);
});

// const = a name for a value that is never reassigned
const stopExpireOrdersJob = startExpireOrdersJob();

// Graceful shutdown: finish in-flight requests and close DB connections.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function shutdown() {
  stopExpireOrdersJob();
  server.close();
  // await = wait for a Promise (async result) before continuing
  // prisma.$disconnect = close the database connections
  await prisma.$disconnect();
  // process = the running Node program (process.env = settings, process.exit = stop)
  // process.exit = stop the program (0 = ok, 1 = error)
  process.exit(0);
}
// process = the running Node program (process.env = settings, process.exit = stop)
// process.on = react to a program event (e.g. SIGTERM = the host is stopping us)
process.on('SIGINT', shutdown);
// process = the running Node program (process.env = settings, process.exit = stop)
// process.on = react to a program event (e.g. SIGTERM = the host is stopping us)
process.on('SIGTERM', shutdown);
