// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// notFound = HttpError 404: doesn't exist
import { badRequest, notFound } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { deleteImage, imageUrlPrefix, signImageUpload } from '../../lib/cloudinary.js';
// import = bring in code from another file or package
import { MAX_ADDRESSES } from './profile.schema.js';

// Everything here works on "my" profile: the user id always comes from the access token,
// never from the URL or body, so one customer can never read or change another's details.

// const = a name for a value that is never reassigned
const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  dateOfBirth: true,
  avatarUrl: true,
  defaultAddressId: true,
  createdAt: true,
};

// DATE column -> "1998-04-21" (no time, no time zone shift).
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// a ? b : c = ternary: if a then b else c
// .slice = a copy of part of an array/string
const toDateString = (d) => (d ? d.toISOString().slice(0, 10) : null);

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getProfile(userId) {
  // const = a name for a value that is never reassigned
  // [a, b] = destructuring: take the first and second items of an array
  // await = wait for a Promise (async result) before continuing
  // Promise = a value that arrives later; Promise.all waits for several at once
  const [user, addresses] = await Promise.all([
    // prisma.user = the User table (model in prisma/schema.prisma)
    // findUniqueOrThrow = like findUnique, but throws if the row is missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: profileSelect }),
    // prisma.address = the Address table (model in prisma/schema.prisma)
    // findMany = read many rows (SELECT ... WHERE)
    // where = Prisma filter: which rows
    // orderBy = Prisma: sort order (asc / desc)
    prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ]);
  // return = give this value back and stop the function here
  return {
    // ...x = spread: copy all items/properties of x into here
    ...user,
    dateOfBirth: toDateString(user.dateOfBirth),
    // The default address first, then newest first.
    addresses: addresses
      // .map = make a new array by transforming each item
      // => = an arrow function (a short function)
      // ...x = spread: copy all items/properties of x into here
      // === = strictly equal (same value AND same type)
      .map((a) => ({ ...a, isDefault: a.id === user.defaultAddressId }))
      // .sort = put the items in order (changes the array)
      // => = an arrow function (a short function)
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
  };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateProfile(userId, input) {
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  await prisma.user.update({
    // where = Prisma filter: which rows
    where: { id: userId },
    // data = Prisma: the values to write
    data: {
      name: input.name,
      phone: input.phone,
      // "1998-04-21" -> a Date at midnight UTC; the DATE column keeps only the day.
      dateOfBirth:
        // a ? b : c = ternary: if a then b else c
        // === = strictly equal (same value AND same type)
        // a && b = AND; in JSX: show b only when a is true
        // new = create an object from a class (e.g. new Date())
        // Date = a point in time (Date.now() = milliseconds since 1970)
        // `text ${x}` = a template string: text with values inserted
        input.dateOfBirth === undefined ? undefined : input.dateOfBirth && new Date(`${input.dateOfBirth}T00:00:00Z`),
    },
  });
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// ------------------------------------------------------------------ Profile photo

// Each user has exactly one image id, so a new upload replaces the old file (no leftovers).
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// `text ${x}` = a template string: text with values inserted
const avatarPublicId = (userId) => `shopverse/avatars/${userId}`;

// Step 1 of an upload: the browser asks for permission and gets signed upload fields.
// export = other files can import this
// function = a named, reusable block of code
export function getAvatarUploadSignature(userId) {
  // return = give this value back and stop the function here
  return signImageUpload({
    publicId: avatarPublicId(userId),
    // 400x400 square, cropped around the face, stored as a small image
    transformation: 'c_fill,g_face,w_400,h_400,q_auto',
    allowedFormats: 'jpg,jpeg,png,webp', // no SVG (can contain scripts) or other files
  });
}

// Step 2: after uploading to Cloudinary, the browser sends back the image URL.
// We only accept a URL pointing at THIS user's avatar in OUR Cloudinary account, so nobody
// can set their photo to some other site's image (e.g. a tracking pixel).
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function saveAvatar(userId, url) {
  // const = a name for a value that is never reassigned
  const prefix = imageUrlPrefix();
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // .startsWith = true if the text begins with this
  // .slice = a copy of part of an array/string
  const path = url.startsWith(prefix) ? url.slice(prefix.length).replace(/^v\d+\//, '') : null; // drop the version part
  // const = a name for a value that is never reassigned
  const expected = avatarPublicId(userId);
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // === = strictly equal (same value AND same type)
  // .startsWith = true if the text begins with this
  // `text ${x}` = a template string: text with values inserted
  if (!path || !(path === expected || path.startsWith(`${expected}.`))) {
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    throw badRequest('That is not your uploaded profile photo');
  }
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: url } });
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeAvatar(userId) {
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.user.update({ where: { id: userId }, data: { avatarUrl: null } });
  // Delete the file too (privacy: a removed photo shouldn't stay online). If Cloudinary is
  // briefly unavailable the profile is still updated; the file is replaced on the next upload anyway.
  // await = wait for a Promise (async result) before continuing
  // => = an arrow function (a short function)
  // console.log / warn / error = print to the server log
  await deleteImage(avatarPublicId(userId)).catch((err) => console.error('[avatar] delete failed', err));
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// ------------------------------------------------------------------ Address book

// Finds one of MY addresses. Filtering by userId too means guessing another customer's
// address id gives "not found", not their address.
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function findMyAddress(userId, id) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.address = the Address table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  // where = Prisma filter: which rows
  const address = await prisma.address.findFirst({ where: { id, userId } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!address) throw notFound('Address not found');
  // return = give this value back and stop the function here
  return address;
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
// ...rest = collect the remaining items/properties
export async function addAddress(userId, { makeDefault, ...fields }) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.address = the Address table (model in prisma/schema.prisma)
  // count = how many rows match
  // where = Prisma filter: which rows
  const count = await prisma.address.count({ where: { userId } });
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // badRequest = HttpError 400: the request is invalid
  // `text ${x}` = a template string: text with values inserted
  if (count >= MAX_ADDRESSES) throw badRequest(`You can save up to ${MAX_ADDRESSES} addresses`);

  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  await prisma.$transaction(async (tx) => {
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // tx.address = the Address table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    // data = Prisma: the values to write
    // ...x = spread: copy all items/properties of x into here
    const address = await tx.address.create({ data: { ...fields, userId } });
    // The first address is always the default; later ones only if asked.
    // if (...) = run the next part only when the condition is true
    // a || b = OR: a if it is truthy, else b
    // === = strictly equal (same value AND same type)
    if (makeDefault || count === 0) {
      // await = wait for a Promise (async result) before continuing
      // tx.user = the User table (model in prisma/schema.prisma)
      // update = change one row found by a unique field (UPDATE)
      // where = Prisma filter: which rows
      // data = Prisma: the values to write
      await tx.user.update({ where: { id: userId }, data: { defaultAddressId: address.id } });
    }
  });
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateAddress(userId, id, input) {
  // await = wait for a Promise (async result) before continuing
  await findMyAddress(userId, id);
  // Past orders are NOT affected: they keep the copy made at checkout.
  // await = wait for a Promise (async result) before continuing
  // prisma.address = the Address table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.address.update({ where: { id }, data: input });
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function setDefaultAddress(userId, id) {
  // await = wait for a Promise (async result) before continuing
  await findMyAddress(userId, id); // the database can't check ownership of the default slot, so we do
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  await prisma.user.update({ where: { id: userId }, data: { defaultAddressId: id } });
  // return = give this value back and stop the function here
  return getProfile(userId);
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteAddress(userId, id) {
  // await = wait for a Promise (async result) before continuing
  await findMyAddress(userId, id);
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  // => = an arrow function (a short function)
  // async = this function works with await and returns a Promise
  await prisma.$transaction(async (tx) => {
    // If it was the default, the database clears the slot by itself (onDelete: SetNull)...
    // await = wait for a Promise (async result) before continuing
    // tx.address = the Address table (model in prisma/schema.prisma)
    // delete = remove one row by a unique field (DELETE)
    // where = Prisma filter: which rows
    await tx.address.delete({ where: { id } });
    // ...and we promote the newest remaining address, so there's always a default when any exist.
    // const = a name for a value that is never reassigned
    // await = wait for a Promise (async result) before continuing
    // tx.user = the User table (model in prisma/schema.prisma)
    // findUniqueOrThrow = like findUnique, but throws if the row is missing
    // where = Prisma filter: which rows
    // select = Prisma: return only these columns
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { defaultAddressId: true } });
    // if (...) = run the next part only when the condition is true
    // ! = NOT: flips true/false
    if (!user.defaultAddressId) {
      // const = a name for a value that is never reassigned
      // next() = pass to the next middleware; next(error) = jump to the error handler
      // await = wait for a Promise (async result) before continuing
      // tx.address = the Address table (model in prisma/schema.prisma)
      // findFirst = read the first row that matches (null if none)
      const next = await tx.address.findFirst({
        // where = Prisma filter: which rows
        where: { userId },
        // orderBy = Prisma: sort order (asc / desc)
        orderBy: { createdAt: 'desc' },
        // select = Prisma: return only these columns
        select: { id: true },
      });
      // if (...) = run the next part only when the condition is true
      // next() = pass to the next middleware; next(error) = jump to the error handler
      // await = wait for a Promise (async result) before continuing
      // tx.user = the User table (model in prisma/schema.prisma)
      // update = change one row found by a unique field (UPDATE)
      // where = Prisma filter: which rows
      // data = Prisma: the values to write
      if (next) await tx.user.update({ where: { id: userId }, data: { defaultAddressId: next.id } });
    }
  });
  // return = give this value back and stop the function here
  return getProfile(userId);
}
