// import = bring in code from another file or package
// Resend = the email-sending service client
import { Resend } from 'resend';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env, isProd } from '../config/env.js';

// One place that sends every email in the app. Features call sendEmail() and don't care
// which provider is behind it, so switching from Resend to SendGrid/SES touches only this file.

// const = a name for a value that is never reassigned
// a ? b : c = ternary: if a then b else c
// env = the checked settings from .env (config/env.js)
// new = create an object from a class (e.g. new Date())
// Resend = the email-sending service client
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function sendEmail(message) {
  // let = a name whose value can be changed later
  // { a, b } = destructuring: take properties a and b out of an object
  let { to, subject } = message;

  // Safety net: when EMAIL_DEV_REDIRECT_TO is set, every email goes to that inbox instead, and
  // the subject shows who it was meant for. Used on the laptop AND on the live demo (a free
  // Resend account can only send to its owner). A real store would simply not set it.
  // if (...) = run the next part only when the condition is true
  // env = the checked settings from .env (config/env.js)
  if (env.EMAIL_DEV_REDIRECT_TO) {
    // `text ${x}` = a template string: text with values inserted
    subject = `[DEV, to: ${to}] ${subject}`;
    // env = the checked settings from .env (config/env.js)
    to = env.EMAIL_DEV_REDIRECT_TO;
  }

  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  if (!resend) {
    // On a laptop, printing the email is handy (e.g. to read a reset code). Never in production:
    // emails can contain one-time codes, and logs are read by people and tools that must not see them.
    // console.log / warn / error = print to the server log
    console.log(
      // `text ${x}` = a template string: text with values inserted
      // a ? b : c = ternary: if a then b else c
      `[email] (not sent, no RESEND_API_KEY) to=${to} subject="${subject}"${isProd ? '' : `\n${message.text}`}`,
    );
    // return = give this value back and stop the function here
    return;
  }

  // const = a name for a value that is never reassigned
  // { a, b } = destructuring: take properties a and b out of an object
  // data = Prisma: the values to write
  // await = wait for a Promise (async result) before continuing
  // resend.emails.send = send an email through Resend
  const { data, error } = await resend.emails.send({
    // env = the checked settings from .env (config/env.js)
    from: env.EMAIL_FROM,
    to,
    subject,
    html: message.html,
    text: message.text,
    attachments: message.attachments,
  });
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // new = create an object from a class (e.g. new Date())
  // Error = an error object with a message (and a stack trace)
  // `text ${x}` = a template string: text with values inserted
  if (error) throw new Error(`Email failed: ${error.message}`);
  // console.log / warn / error = print to the server log
  // `text ${x}` = a template string: text with values inserted
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  console.log(`[email] sent to=${to} subject="${subject}" id=${data?.id}`);
}
