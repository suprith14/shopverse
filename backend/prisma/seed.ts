// Fills the database with demo data. Run with: npm run db:seed
// Safe to re-run: it wipes catalog/order data first.
import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const img = (seed: string, n = 3) =>
  Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/800`);

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

interface SeedVariant {
  name: string;
  options: Record<string, string>;
  price: number; // cents
  stock: number;
}

interface SeedProduct {
  name: string;
  brand: string;
  description: string;
  attributes: Prisma.InputJsonValue;
  variants: SeedVariant[];
}

// Helpers that generate typical variant sets per category.
const sizes = (price: number, colors: string[], stock = 8): SeedVariant[] =>
  colors.flatMap((color) =>
    ['7', '8', '9', '10', '11'].map((size) => ({
      name: `UK ${size} / ${color}`,
      options: { size, color },
      price,
      stock: size === '11' ? 0 : stock, // some sold-out sizes to show "out of stock" states
    })),
  );

const storage = (base: number, options: string[]): SeedVariant[] =>
  options.map((opt, i) => ({ name: opt, options: { storage: opt }, price: base + i * 10000, stock: 12 - i * 3 }));

const bookFormats = (paperback: number): SeedVariant[] => [
  { name: 'Paperback', options: { format: 'Paperback' }, price: paperback, stock: 40 },
  { name: 'Hardcover', options: { format: 'Hardcover' }, price: paperback + 1000, stock: 15 },
];

const finishes = (price: number, list: string[]): SeedVariant[] =>
  list.map((finish) => ({ name: finish, options: { finish }, price, stock: 6 }));

const catalog: Record<string, { description: string; products: SeedProduct[] }> = {
  Sneakers: {
    description: 'Running, lifestyle and court shoes',
    products: [
      { name: 'Air Stride Runner', brand: 'Nike', description: 'Lightweight daily running shoe with responsive foam cushioning and a breathable mesh upper.', attributes: { material: 'Engineered mesh', use: 'Running' }, variants: sizes(12999, ['Black', 'White']) },
      { name: 'Ultraboost Light', brand: 'Adidas', description: 'Energy-returning Boost midsole built for long-distance comfort.', attributes: { material: 'Primeknit', use: 'Running' }, variants: sizes(17999, ['Core Black', 'Cloud White']) },
      { name: 'Classic Court 70', brand: 'Converse', description: 'Timeless canvas high-top with a vintage rubber sole.', attributes: { material: 'Canvas', use: 'Lifestyle' }, variants: sizes(7499, ['Black', 'Parchment']) },
      { name: 'Suede Heritage', brand: 'Puma', description: 'Iconic suede sneaker first released in 1968, now with a softer footbed.', attributes: { material: 'Suede', use: 'Lifestyle' }, variants: sizes(6999, ['Navy', 'Red']) },
      { name: 'Gel Trail Pro', brand: 'Asics', description: 'Rugged trail shoe with GEL cushioning and a grippy outsole for uneven terrain.', attributes: { material: 'Ripstop mesh', use: 'Trail' }, variants: sizes(13999, ['Olive']) },
      { name: '990v6 Made in USA', brand: 'New Balance', description: 'Premium pigskin and mesh classic with ENCAP midsole support.', attributes: { material: 'Pigskin suede / mesh', use: 'Lifestyle' }, variants: sizes(19999, ['Grey']) },
    ],
  },
  Electronics: {
    description: 'Phones, laptops, audio and smart devices',
    products: [
      { name: 'Pixel Pro 10', brand: 'Google', description: 'Flagship Android phone with an AI-powered camera and 7 years of updates.', attributes: { specs: { display: '6.7" OLED 120Hz', battery: '5000 mAh', camera: '50MP triple' } }, variants: storage(99900, ['128GB', '256GB', '512GB']) },
      { name: 'Galaxy S26', brand: 'Samsung', description: 'Compact flagship with a bright AMOLED display and all-day battery.', attributes: { specs: { display: '6.2" AMOLED 120Hz', battery: '4000 mAh', camera: '50MP triple' } }, variants: storage(89900, ['128GB', '256GB']) },
      { name: 'ZenBook 14 OLED', brand: 'Asus', description: 'Ultra-thin 14" laptop with an OLED display, 16GB RAM and 15-hour battery.', attributes: { specs: { cpu: 'Intel Core Ultra 7', ram: '16GB', display: '14" 2.8K OLED' } }, variants: storage(119900, ['512GB', '1TB']) },
      { name: 'WH-1000XM6', brand: 'Sony', description: 'Industry-leading noise cancelling over-ear headphones with 30-hour battery.', attributes: { specs: { battery: '30 h', anc: 'Yes', connectivity: 'Bluetooth 5.3' } }, variants: finishes(39900, ['Black', 'Silver']) },
      { name: 'Watch Series Fit', brand: 'Fitbit', description: 'Smartwatch with heart-rate, sleep and SpO2 tracking plus built-in GPS.', attributes: { specs: { battery: '6 days', water: '5 ATM', gps: 'Built-in' } }, variants: finishes(24900, ['Graphite', 'Rose Gold']) },
      { name: 'SoundCore Mini Speaker', brand: 'Anker', description: 'Pocket-sized waterproof Bluetooth speaker with surprisingly big bass.', attributes: { specs: { battery: '15 h', water: 'IPX7', power: '5W' } }, variants: finishes(3999, ['Black', 'Blue', 'Red']) },
    ],
  },
  Books: {
    description: 'Fiction, non-fiction and tech books',
    products: [
      { name: 'Atomic Habits', brand: 'Penguin', description: 'An easy and proven way to build good habits and break bad ones.', attributes: { author: 'James Clear', pages: 320, genre: 'Self-help' }, variants: bookFormats(1699) },
      { name: 'Clean Code', brand: 'Prentice Hall', description: 'A handbook of agile software craftsmanship.', attributes: { author: 'Robert C. Martin', pages: 464, genre: 'Programming' }, variants: bookFormats(3999) },
      { name: 'Designing Data-Intensive Applications', brand: "O'Reilly", description: 'The big ideas behind reliable, scalable and maintainable systems.', attributes: { author: 'Martin Kleppmann', pages: 616, genre: 'Programming' }, variants: bookFormats(4599) },
      { name: 'Project Hail Mary', brand: 'Ballantine', description: 'A lone astronaut must save the Earth from disaster in this sci-fi thriller.', attributes: { author: 'Andy Weir', pages: 496, genre: 'Science fiction' }, variants: bookFormats(1899) },
      { name: 'Sapiens', brand: 'Harper', description: 'A brief history of humankind, from the Stone Age to the present.', attributes: { author: 'Yuval Noah Harari', pages: 464, genre: 'History' }, variants: bookFormats(2199) },
      { name: 'The Pragmatic Programmer', brand: 'Addison-Wesley', description: 'Your journey to mastery, 20th anniversary edition.', attributes: { author: 'David Thomas, Andrew Hunt', pages: 352, genre: 'Programming' }, variants: bookFormats(4299) },
    ],
  },
  'Home Decor': {
    description: 'Furniture, lighting and accessories',
    products: [
      { name: 'Nordic Oak Coffee Table', brand: 'Hemma', description: 'Solid oak coffee table with rounded edges and a lower storage shelf.', attributes: { dimensions: '110 x 60 x 45 cm', material: 'Solid oak' }, variants: finishes(24900, ['Natural Oak', 'Dark Walnut']) },
      { name: 'Arc Floor Lamp', brand: 'Lumen', description: 'Sweeping arc lamp with a marble base and dimmable warm LED.', attributes: { dimensions: 'Height 200 cm', material: 'Steel / marble' }, variants: finishes(15900, ['Brass', 'Matte Black']) },
      { name: 'Velvet Accent Chair', brand: 'Hemma', description: 'Mid-century accent chair upholstered in soft velvet with tapered legs.', attributes: { dimensions: '75 x 80 x 85 cm', material: 'Velvet / beech' }, variants: finishes(32900, ['Emerald', 'Mustard', 'Blush']) },
      { name: 'Handwoven Jute Rug', brand: 'Terra', description: 'Natural jute rug, handwoven, adds warmth and texture to any room.', attributes: { dimensions: '160 x 230 cm', material: 'Jute' }, variants: finishes(12900, ['Natural']) },
      { name: 'Ceramic Vase Set', brand: 'Terra', description: 'Set of three matte ceramic vases in complementary shapes.', attributes: { dimensions: '15 / 22 / 30 cm', material: 'Stoneware' }, variants: finishes(4900, ['Sand', 'Charcoal']) },
      { name: 'Linen Throw Blanket', brand: 'Cozy Co', description: 'Stonewashed linen throw, breathable and softer with every wash.', attributes: { dimensions: '130 x 170 cm', material: '100% linen' }, variants: finishes(6900, ['Oat', 'Sage', 'Terracotta']) },
    ],
  },
};

async function main() {
  console.log('Clearing old data...');
  // Delete children before parents to respect foreign keys.
  await prisma.stockReservation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  await prisma.user.create({
    data: { name: 'Admin', email: 'admin@shopverse.dev', passwordHash: await bcrypt.hash('Admin@12345', 12), role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { name: 'Demo Customer', email: 'demo@shopverse.dev', passwordHash: await bcrypt.hash('Demo@12345', 12) },
  });

  console.log('Creating catalog...');
  for (const [categoryName, { description, products }] of Object.entries(catalog)) {
    const category = await prisma.category.create({
      data: { name: categoryName, slug: slugify(categoryName), description },
    });

    for (const p of products) {
      const slug = slugify(p.name);
      await prisma.product.create({
        data: {
          name: p.name,
          slug,
          brand: p.brand,
          description: p.description,
          attributes: p.attributes,
          images: img(slug),
          categoryId: category.id,
          basePrice: Math.min(...p.variants.map((v) => v.price)),
          variants: {
            create: p.variants.map((v) => ({
              ...v,
              sku: `${slug}-${slugify(v.name)}`.toUpperCase(),
            })),
          },
        },
      });
    }
  }

  console.log('Creating coupons...');
  await prisma.coupon.createMany({
    data: [
      { code: 'WELCOME10', type: 'PERCENT', value: 10 },
      { code: 'SAVE20', type: 'FIXED', value: 2000, minOrderAmount: 10000 },
      { code: 'EXPIRED5', type: 'PERCENT', value: 5, expiresAt: new Date('2024-01-01') },
      { code: 'FLASH50', type: 'PERCENT', value: 50, maxUses: 100, usedCount: 100 }, // all uses taken
    ],
  });

  const count = await prisma.product.count();
  console.log(`Done. ${count} products seeded.`);
  console.log('Logins: admin@shopverse.dev / Admin@12345, demo@shopverse.dev / Demo@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
