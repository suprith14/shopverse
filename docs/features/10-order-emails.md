# Feature 10: Order Confirmation Emails

**Status:** ✅ Done (Phase 3, step 5)

When an order becomes `PAID`, the customer gets a receipt email with the items, discount, total
and a link to the order page.

## Backend side

Files: [`backend/src/lib/email.js`](../../backend/src/lib/email.js) (sending) and
[`backend/src/modules/orders/order-emails.js`](../../backend/src/modules/orders/order-emails.js) (content).

**Provider:** [Resend](https://resend.com). All sending goes through `sendEmail()` in `lib/email.js`,
so changing provider (SendGrid, Amazon SES) touches one file.

**Config** (`backend/.env`):

| Variable | Meaning |
|---|---|
| `RESEND_API_KEY` | `re_...`. Optional: without it, emails are **printed to the console** instead of sent |
| `EMAIL_FROM` | Defaults to `ShopVerse <onboarding@resend.dev>`, which works without owning a domain |
| `EMAIL_DEV_REDIRECT_TO` | Outside production, **every** email goes here, with `[DEV, to: <real recipient>]` in the subject |

**When it's sent:** in `markOrderPaid`, only when the order *just* became paid (`PAID_NOW`) and
**after** the transaction committed:
- **After commit:** the email never confirms a change that could still be rolled back.
- **Only on `PAID_NOW`:** a duplicate webhook returns early, so no second email.
- **Failure doesn't fail the webhook:** the error is logged and Stripe still gets 200. The payment
  is recorded either way. A production system would use an **outbox** (save "email to send" in the
  same transaction, then a job sends and retries it) so no email is ever lost.

**Email content:**
- HTML with **inline styles and tables**, because many email apps ignore `<style>` tags and modern CSS.
- A **plain-text** version too.
- Product names are **HTML-escaped**.
- Prices come from the order snapshot. The order number matches the website (`#` + last 8 characters of the id).

## Free Resend account limits

Without a verified domain, Resend only delivers to the email address you signed up with. That's why
`EMAIL_DEV_REDIRECT_TO` exists: in development all mail goes to your own inbox. To email real
customers, verify a domain in Resend and set `EMAIL_FROM` to an address on it.

## Concepts to be able to explain

1. What's a transactional email, and why use a provider instead of sending from our own server?
2. Why send the email after the transaction commits, not inside it?
3. How do we make sure a duplicate webhook doesn't send two emails?
4. What's the outbox pattern and what problem does it solve?
5. Why redirect all emails to the developer in development?
