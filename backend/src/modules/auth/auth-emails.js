// import = bring in code from another file or package
import { sendEmail } from '../../lib/email.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "Your password was changed": if it wasn't them, they find out right away.
// Security emails never contain the password itself, or a link that logs you in.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function sendPasswordChangedEmail(user) {
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  const when = new Date().toUTCString();
  // const = a name for a value that is never reassigned
  // `text ${x}` = a template string: text with values inserted
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h1 style="color:#4f46e5;font-size:22px">ShopVerse</h1>
    <h2 style="font-size:18px">Your password was changed</h2>
    <p>Hi ${escapeHtml(user.name)}, the password for your ShopVerse account was changed on <b>${when}</b>.</p>
    <p>For your security we signed you out on all other devices.</p>
    <p style="background:#fef3c7;padding:12px;border-radius:8px"><b>Wasn't you?</b> Someone may have access to your account.
      Log in at <a href="${env.CLIENT_URL}/login">${env.CLIENT_URL}/login</a> and change your password straight away.</p>
  </div>`;
  // const = a name for a value that is never reassigned
  const text = [
    // `text ${x}` = a template string: text with values inserted
    `Hi ${user.name}, the password for your ShopVerse account was changed on ${when}.`,
    'For your security we signed you out on all other devices.',
    // `text ${x}` = a template string: text with values inserted
    // env = the checked settings from .env (config/env.js)
    `Wasn't you? Log in at ${env.CLIENT_URL}/login and change your password straight away.`,
  // .join = turn an array into one string with a separator
  ].join('\n\n');

  // await = wait for a Promise (async result) before continuing
  await sendEmail({ to: user.email, subject: 'Your ShopVerse password was changed', html, text });
}
