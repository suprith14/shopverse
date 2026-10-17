import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { startExpireOrdersJob } from './jobs/expire-orders.job.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`ShopVerse API running on http://localhost:${env.PORT}`);
});

const stopExpireOrdersJob = startExpireOrdersJob();

// Graceful shutdown: finish in-flight requests and close DB connections.
async function shutdown() {
  stopExpireOrdersJob();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
