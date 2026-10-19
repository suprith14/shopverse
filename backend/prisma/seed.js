// Fills the database with demo data. Run with: npm run db:seed
// Safe to re-run: it wipes catalog/order data first.
// import = bring in code from another file or package
import { PrismaClient } from '@prisma/client';
// import = bring in code from another file or package
// bcrypt = slow, salted password hashing (hard to brute-force)
import bcrypt from 'bcryptjs';

// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
const prisma = new PrismaClient();

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
// `text ${x}` = a template string: text with values inserted
const img = (seed, n = 3) => Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${seed}-${i}/800/800`);

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const slugify = (s) =>
  s
    // .toLowerCase = the text in small letters
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Helpers that generate typical variant sets per category.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// x = value (in parameters) = the default used when x is not given
const sizes = (price, colors, stock = 8) =>
  // .flatMap = map, then flatten one level
  // => = an arrow function (a short function)
  colors.flatMap((color) =>
    // .map = make a new array by transforming each item
    // => = an arrow function (a short function)
    ['7', '8', '9', '10', '11'].map((size) => ({
      // `text ${x}` = a template string: text with values inserted
      name: `UK ${size} / ${color}`,
      options: { size, color },
      price,
      // a ? b : c = ternary: if a then b else c
      // === = strictly equal (same value AND same type)
      stock: size === '11' ? 0 : stock, // some sold-out sizes to show "out of stock" states
    })),
  );

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const storage = (base, options) =>
  // .map = make a new array by transforming each item
  // => = an arrow function (a short function)
  options.map((opt, i) => ({ name: opt, options: { storage: opt }, price: base + i * 10000, stock: 12 - i * 3 }));

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const bookFormats = (paperback) => [
  { name: 'Paperback', options: { format: 'Paperback' }, price: paperback, stock: 40 },
  { name: 'Hardcover', options: { format: 'Hardcover' }, price: paperback + 1000, stock: 15 },
];

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// .map = make a new array by transforming each item
const finishes = (price, list) => list.map((finish) => ({ name: finish, options: { finish }, price, stock: 6 }));

// const = a name for a value that is never reassigned
const catalog = {
  Sneakers: {
    description: 'Running, lifestyle and court shoes',
    products: [
      {
        name: 'Air Stride Runner',
        brand: 'Nike',
        description: 'Lightweight daily running shoe with responsive foam cushioning and a breathable mesh upper.',
        attributes: { material: 'Engineered mesh', use: 'Running' },
        variants: sizes(12999, ['Black', 'White']),
      },
      {
        name: 'Ultraboost Light',
        brand: 'Adidas',
        description: 'Energy-returning Boost midsole built for long-distance comfort.',
        attributes: { material: 'Primeknit', use: 'Running' },
        variants: sizes(17999, ['Core Black', 'Cloud White']),
      },
      {
        name: 'Classic Court 70',
        brand: 'Converse',
        description: 'Timeless canvas high-top with a vintage rubber sole.',
        attributes: { material: 'Canvas', use: 'Lifestyle' },
        variants: sizes(7499, ['Black', 'Parchment']),
      },
      {
        name: 'Suede Heritage',
        brand: 'Puma',
        description: 'Iconic suede sneaker first released in 1968, now with a softer footbed.',
        attributes: { material: 'Suede', use: 'Lifestyle' },
        variants: sizes(6999, ['Navy', 'Red']),
      },
      {
        name: 'Gel Trail Pro',
        brand: 'Asics',
        description: 'Rugged trail shoe with GEL cushioning and a grippy outsole for uneven terrain.',
        attributes: { material: 'Ripstop mesh', use: 'Trail' },
        variants: sizes(13999, ['Olive']),
      },
      {
        name: '990v6 Made in USA',
        brand: 'New Balance',
        description: 'Premium pigskin and mesh classic with ENCAP midsole support.',
        attributes: { material: 'Pigskin suede / mesh', use: 'Lifestyle' },
        variants: sizes(19999, ['Grey']),
      },
    ],
  },
  Electronics: {
    description: 'Phones, laptops, audio and smart devices',
    products: [
      {
        name: 'Pixel Pro 10',
        brand: 'Google',
        description: 'Flagship Android phone with an AI-powered camera and 7 years of updates.',
        attributes: { specs: { display: '6.7" OLED 120Hz', battery: '5000 mAh', camera: '50MP triple' } },
        variants: storage(99900, ['128GB', '256GB', '512GB']),
      },
      {
        name: 'Galaxy S26',
        brand: 'Samsung',
        description: 'Compact flagship with a bright AMOLED display and all-day battery.',
        attributes: { specs: { display: '6.2" AMOLED 120Hz', battery: '4000 mAh', camera: '50MP triple' } },
        variants: storage(89900, ['128GB', '256GB']),
      },
      {
        name: 'ZenBook 14 OLED',
        brand: 'Asus',
        description: 'Ultra-thin 14" laptop with an OLED display, 16GB RAM and 15-hour battery.',
        attributes: { specs: { cpu: 'Intel Core Ultra 7', ram: '16GB', display: '14" 2.8K OLED' } },
        variants: storage(119900, ['512GB', '1TB']),
      },
      {
        name: 'WH-1000XM6',
        brand: 'Sony',
        description: 'Industry-leading noise cancelling over-ear headphones with 30-hour battery.',
        attributes: { specs: { battery: '30 h', anc: 'Yes', connectivity: 'Bluetooth 5.3' } },
        variants: finishes(39900, ['Black', 'Silver']),
      },
      {
        name: 'Watch Series Fit',
        brand: 'Fitbit',
        description: 'Smartwatch with heart-rate, sleep and SpO2 tracking plus built-in GPS.',
        attributes: { specs: { battery: '6 days', water: '5 ATM', gps: 'Built-in' } },
        variants: finishes(24900, ['Graphite', 'Rose Gold']),
      },
      {
        name: 'SoundCore Mini Speaker',
        brand: 'Anker',
        description: 'Pocket-sized waterproof Bluetooth speaker with surprisingly big bass.',
        attributes: { specs: { battery: '15 h', water: 'IPX7', power: '5W' } },
        variants: finishes(3999, ['Black', 'Blue', 'Red']),
      },
    ],
  },
  Books: {
    description: 'Fiction, non-fiction and tech books',
    products: [
      {
        name: 'Atomic Habits',
        brand: 'Penguin',
        description: 'An easy and proven way to build good habits and break bad ones.',
        attributes: { author: 'James Clear', pages: 320, genre: 'Self-help' },
        variants: bookFormats(1699),
      },
      {
        name: 'Clean Code',
        brand: 'Prentice Hall',
        description: 'A handbook of agile software craftsmanship.',
        attributes: { author: 'Robert C. Martin', pages: 464, genre: 'Programming' },
        variants: bookFormats(3999),
      },
      {
        name: 'Designing Data-Intensive Applications',
        brand: "O'Reilly",
        description: 'The big ideas behind reliable, scalable and maintainable systems.',
        attributes: { author: 'Martin Kleppmann', pages: 616, genre: 'Programming' },
        variants: bookFormats(4599),
      },
      {
        name: 'Project Hail Mary',
        brand: 'Ballantine',
        description: 'A lone astronaut must save the Earth from disaster in this sci-fi thriller.',
        attributes: { author: 'Andy Weir', pages: 496, genre: 'Science fiction' },
        variants: bookFormats(1899),
      },
      {
        name: 'Sapiens',
        brand: 'Harper',
        description: 'A brief history of humankind, from the Stone Age to the present.',
        attributes: { author: 'Yuval Noah Harari', pages: 464, genre: 'History' },
        variants: bookFormats(2199),
      },
      {
        name: 'The Pragmatic Programmer',
        brand: 'Addison-Wesley',
        description: 'Your journey to mastery, 20th anniversary edition.',
        attributes: { author: 'David Thomas, Andrew Hunt', pages: 352, genre: 'Programming' },
        variants: bookFormats(4299),
      },
    ],
  },
  'Home Decor': {
    description: 'Furniture, lighting and accessories',
    products: [
      {
        name: 'Nordic Oak Coffee Table',
        brand: 'Hemma',
        description: 'Solid oak coffee table with rounded edges and a lower storage shelf.',
        attributes: { dimensions: '110 x 60 x 45 cm', material: 'Solid oak' },
        variants: finishes(24900, ['Natural Oak', 'Dark Walnut']),
      },
      {
        name: 'Arc Floor Lamp',
        brand: 'Lumen',
        description: 'Sweeping arc lamp with a marble base and dimmable warm LED.',
        attributes: { dimensions: 'Height 200 cm', material: 'Steel / marble' },
        variants: finishes(15900, ['Brass', 'Matte Black']),
      },
      {
        name: 'Velvet Accent Chair',
        brand: 'Hemma',
        description: 'Mid-century accent chair upholstered in soft velvet with tapered legs.',
        attributes: { dimensions: '75 x 80 x 85 cm', material: 'Velvet / beech' },
        variants: finishes(32900, ['Emerald', 'Mustard', 'Blush']),
      },
      {
        name: 'Handwoven Jute Rug',
        brand: 'Terra',
        description: 'Natural jute rug, handwoven, adds warmth and texture to any room.',
        attributes: { dimensions: '160 x 230 cm', material: 'Jute' },
        variants: finishes(12900, ['Natural']),
      },
      {
        name: 'Ceramic Vase Set',
        brand: 'Terra',
        description: 'Set of three matte ceramic vases in complementary shapes.',
        attributes: { dimensions: '15 / 22 / 30 cm', material: 'Stoneware' },
        variants: finishes(4900, ['Sand', 'Charcoal']),
      },
      {
        name: 'Linen Throw Blanket',
        brand: 'Cozy Co',
        description: 'Stonewashed linen throw, breathable and softer with every wash.',
        attributes: { dimensions: '130 x 170 cm', material: '100% linen' },
        variants: finishes(6900, ['Oat', 'Sage', 'Terracotta']),
      },
    ],
  },
};

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function main() {
  // console.log / warn / error = print to the server log
  console.log('Clearing old data...');
  // Delete children before parents to respect foreign keys.
  // await = wait for a Promise (async result) before continuing
  // prisma.stockReservation = the StockReservation table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.stockReservation.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.orderItem = the OrderItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.orderItem.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.order = the Order table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.order.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.cartItem = the CartItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.cartItem.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.wishlistItem = the WishlistItem table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.wishlistItem.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.review = the Review table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.review.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.productVariant = the ProductVariant table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.productVariant.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.product.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.category = the Category table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.category.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.coupon = the Coupon table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.coupon.deleteMany();
  // All orders are gone, so invoice numbering starts again from 1.
  // await = wait for a Promise (async result) before continuing
  // prisma.invoiceCounter = the InvoiceCounter table (model in prisma/schema.prisma)
  // upsert = update the row if it exists, otherwise create it
  await prisma.invoiceCounter.upsert({
    // where = Prisma filter: which rows
    where: { id: 'invoice' },
    create: { id: 'invoice', value: 0 },
    update: { value: 0 },
  });
  // await = wait for a Promise (async result) before continuing
  // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.refreshToken.deleteMany();
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // deleteMany = remove every row that matches; no error if none
  await prisma.user.deleteMany();

  // console.log / warn / error = print to the server log
  console.log('Creating users...');
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  await prisma.user.create({
    // data = Prisma: the values to write
    data: {
      name: 'Admin',
      email: 'admin@shopverse.dev',
      // await = wait for a Promise (async result) before continuing
      // bcrypt = slow, salted password hashing (hard to brute-force)
      // bcrypt.hash = turn the password into a salted hash (store this, never the password)
      passwordHash: await bcrypt.hash('Admin@12345', 12),
      role: 'ADMIN',
    },
  });
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  await prisma.user.create({
    // data = Prisma: the values to write
    // await = wait for a Promise (async result) before continuing
    // bcrypt = slow, salted password hashing (hard to brute-force)
    // bcrypt.hash = turn the password into a salted hash (store this, never the password)
    data: { name: 'Demo Customer', email: 'demo@shopverse.dev', passwordHash: await bcrypt.hash('Demo@12345', 12) },
  });

  // console.log / warn / error = print to the server log
  console.log('Creating catalog...');
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // { a, b } = destructuring: take properties a and b out of an object
  // Object.entries = [key, value] pairs of an object
  for (const [categoryName, { description, products }] of Object.entries(catalog)) {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // prisma.category = the Category table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    const category = await prisma.category.create({
      // data = Prisma: the values to write
      data: { name: categoryName, slug: slugify(categoryName), description },
    });

    // const = a name for a value that is never reassigned
    for (const p of products) {
      // const = a name for a value that is never reassigned
      const slug = slugify(p.name);
      // await = wait for a Promise (async result) before continuing
      // prisma.product = the Product table (model in prisma/schema.prisma)
      // create = insert one new row (INSERT)
      await prisma.product.create({
        // data = Prisma: the values to write
        data: {
          name: p.name,
          slug,
          brand: p.brand,
          description: p.description,
          attributes: p.attributes,
          images: img(slug),
          categoryId: category.id,
          // Math = number helpers (min, max, round, floor, ceil...)
          // ...x = spread: copy all items/properties of x into here
          // .map = make a new array by transforming each item
          // => = an arrow function (a short function)
          basePrice: Math.min(...p.variants.map((v) => v.price)),
          variants: {
            // .map = make a new array by transforming each item
            // => = an arrow function (a short function)
            create: p.variants.map((v) => ({
              // ...x = spread: copy all items/properties of x into here
              ...v,
              // `text ${x}` = a template string: text with values inserted
              // .toUpperCase = the text in capital letters
              sku: `${slug}-${slugify(v.name)}`.toUpperCase(),
            })),
          },
        },
      });
    }
  }

  // console.log / warn / error = print to the server log
  console.log('Creating coupons...');
  // await = wait for a Promise (async result) before continuing
  // prisma.coupon = the Coupon table (model in prisma/schema.prisma)
  // createMany = insert many rows in one go
  await prisma.coupon.createMany({
    // data = Prisma: the values to write
    data: [
      { code: 'WELCOME10', type: 'PERCENT', value: 10 },
      { code: 'SAVE20', type: 'FIXED', value: 2000, minOrderAmount: 10000 },
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      { code: 'EXPIRED5', type: 'PERCENT', value: 5, expiresAt: new Date('2024-01-01') },
      { code: 'FLASH50', type: 'PERCENT', value: 50, maxUses: 100, usedCount: 100 }, // all uses taken
    ],
  });

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.product = the Product table (model in prisma/schema.prisma)
  // count = how many rows match
  const count = await prisma.product.count();
  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  console.log(`Done. ${count} products seeded.`);
  // console.log / warn / error = print to the server log
  console.log('Logins: admin@shopverse.dev / Admin@12345, demo@shopverse.dev / Demo@12345');
}

main()
  // => = an arrow function (a short function)
  .catch((e) => {
    // console.log / warn / error = print to the server log
    console.error(e);
    // process = the running Node program (process.env = settings, process.exit = stop)
    // process.exit = stop the program (0 = ok, 1 = error)
    process.exit(1);
  })
  // => = an arrow function (a short function)
  // prisma.$disconnect = close the database connections
  .finally(() => prisma.$disconnect());
