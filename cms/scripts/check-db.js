import 'dotenv/config';

// Runs before every migration command. The CMS has its OWN database, named "cms". Pointing it at
// a shop database by mistake (they live on the same Neon server, and their URLs look alike) would
// make `prisma migrate dev` offer to RESET it, wiping every user, product and order.
// So: refuse unless the database name in DATABASE_URL is exactly "cms".
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set in cms/.env');
  process.exit(1);
}

const database = new URL(url).pathname.slice(1);
if (database !== 'cms') {
  console.error(
    `Refusing to run: DATABASE_URL points at the database "${database}", not "cms".\n` +
      'The CMS must use its own database. In Neon: your branch > Databases > New database "cms",\n' +
      'then use a connection string that ends in /cms?sslmode=require...',
  );
  process.exit(1);
}
