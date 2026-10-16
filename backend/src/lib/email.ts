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
}

export async function sendEmail(message: EmailMessage) {
  let { to, subject } = message;

  // Development safety net: never email real people from a laptop. Everything goes to the
  // developer's own inbox, and the subject shows who it was meant for.
  if (!isProd && env.EMAIL_DEV_REDIRECT_TO) {
    subject = `[DEV, to: ${to}] ${subject}`;
    to = env.EMAIL_DEV_REDIRECT_TO;
  }

  if (!resend) {
    console.log(`[email] (not sent, no RESEND_API_KEY) to=${to} subject="${subject}"\n${message.text}`);
    return;
  }

  const { data, error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html: message.html, text: message.text });
  if (error) throw new Error(`Email failed: ${error.message}`);
  console.log(`[email] sent to=${to} subject="${subject}" id=${data?.id}`);
}
