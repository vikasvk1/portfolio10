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

## GitHub Pages note (important)

GitHub Pages hosts only static files, so `/api/contact` will return `405`.

To make the contact form work on `https://vikasvk1.github.io/portfolio10/`:

1. Deploy this backend (`server.js`) on a server platform (Render/Railway/VPS).
2. Set this value in `index.html` before `index.js`:
   `window.CONTACT_API_BASE = "https://your-backend-domain.com";`
3. Enable CORS on backend if frontend and backend are on different domains.

## Cloudflare Worker option (same repo)

This repo now includes a worker backend at `worker/`.

Quick start:

1. `npm i -g wrangler`
2. `wrangler login`
3. `cd worker`
4. `wrangler secret put BREVO_API_KEY`
5. `wrangler deploy`
6. Put the deployed worker URL in `index.html`:
   `window.CONTACT_API_BASE = "https://your-worker-subdomain.workers.dev";`

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
