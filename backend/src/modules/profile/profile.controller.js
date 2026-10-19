// import = bring in code from another file or package
import * as service from './profile.service.js';

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// res.locals = data for this one request (the validated input, the logged-in user)
// res.locals.user = the logged-in user (set by requireAuth from the access token)
const userId = (res) => res.locals.user.id;

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getProfile(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ profile: await service.getProfile(userId(res)) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateProfile(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ profile: await service.updateProfile(userId(res), res.locals.body) });
}

// export = other files can import this
// function = a named, reusable block of code
export function getAvatarUploadSignature(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  res.json(service.getAvatarUploadSignature(userId(res)));
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function saveAvatar(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ profile: await service.saveAvatar(userId(res), res.locals.body.url) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function removeAvatar(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  res.json({ profile: await service.removeAvatar(userId(res)) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function addAddress(_req, res) {
  // res.status(code) = set the HTTP status code (201 created, 404...)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.status(201).json({ profile: await service.addAddress(userId(res), res.locals.body) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function updateAddress(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ profile: await service.updateAddress(userId(res), res.locals.params.id, res.locals.body) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function setDefaultAddress(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ profile: await service.setDefaultAddress(userId(res), res.locals.params.id) });
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function deleteAddress(_req, res) {
  // res.json = send this object as JSON (status 200 unless set)
  // await = wait for a Promise (async result) before continuing
  // res.locals = data for this one request (the validated input, the logged-in user)
  res.json({ profile: await service.deleteAddress(userId(res), res.locals.params.id) });
}
