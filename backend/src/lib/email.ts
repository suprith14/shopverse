import { Resend } from 'resend';
import { env, isProd } from '../config/env.js';

// One place that sends every email in the app. Features call sendEmail() and don't care
// which provider is behind it, so switching from Resend to SendGrid/SES touches only this file.

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string; // plain-text version: some email apps and spam filters prefer it
  attachments?: { filename: string; content: Buffer }[]; // e.g. the invoice PDF
}

export async function sendEmail(message: EmailMessage) {
  let { to, subject } = message;

  // Safety net: when EMAIL_DEV_REDIRECT_TO is set, every email goes to that inbox instead, and
  // the subject shows who it was meant for. Used on the laptop AND on the live demo (a free
  // Resend account can only send to its owner). A real store would simply not set it.
  if (env.EMAIL_DEV_REDIRECT_TO) {
    subject = `[DEV, to: ${to}] ${subject}`;
    to = env.EMAIL_DEV_REDIRECT_TO;
  }

  if (!resend) {
    // On a laptop, printing the email is handy (e.g. to read a reset code). Never in production:
    // emails can contain one-time codes, and logs are read by people and tools that must not see them.
    console.log(`[email] (not sent, no RESEND_API_KEY) to=${to} subject="${subject}"${isProd ? '' : `\n${message.text}`}`);
    return;
  }

  const { data, error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html: message.html, text: message.text, attachments: message.attachments });
  if (error) throw new Error(`Email failed: ${error.message}`);
  console.log(`[email] sent to=${to} subject="${subject}" id=${data?.id}`);
}
