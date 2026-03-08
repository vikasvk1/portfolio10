# Portfolio10

Modern static portfolio with an internal Node.js contact API.

## Run locally

1. Install dependencies:
   npm install
2. Create env file:
   copy .env.example .env
3. Fill Brevo SMTP values in `.env`.
4. Start server:
   npm start
5. Open:
   http://localhost:5500

## Brevo setup notes

- In Brevo, go to Settings > SMTP & API and create/get your SMTP credentials.
- Use SMTP credentials (login + SMTP key), not Brevo API key.
- SMTP host: `smtp-relay.brevo.com`
- SMTP port: `587` (or `465` for SSL/TLS)
- `CONTACT_FROM_EMAIL` is the sender address shown in email clients.
- `CONTACT_TO_EMAIL` is where form messages are delivered.
- Contact form submits to your own `/api/contact` backend route.

## No domain case

- With no custom domain, sending can still work using your single email.
- Deliverability and sender branding may be limited compared to a verified custom domain.