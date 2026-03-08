# Cloudflare Worker Contact API

## 1. Install and login

```bash
npm i -g wrangler
wrangler login
```

## 2. Deploy from this folder

```bash
cd worker
wrangler deploy
```

## 3. Add secret (required)

```bash
wrangler secret put BREVO_API_KEY
```

## 4. Optional vars in `wrangler.toml`

- `CLIENT_ORIGIN` (default: `https://vikasvk1.github.io`)
- `TO_EMAIL`
- `FROM_EMAIL`

## 5. Update frontend API base

After deploy, copy the worker URL and set in `index.html`:

```js
window.CONTACT_API_BASE = "https://your-worker-subdomain.workers.dev";
```

The form will call:

`https://your-worker-subdomain.workers.dev/api/contact`