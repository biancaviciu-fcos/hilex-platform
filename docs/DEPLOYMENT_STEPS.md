# HILEX deployment steps

## 1. GitHub

Create a private repository, for example:

`hilex-platform`

Upload the contents of this folder to the repository:

`outputs/hilex-full-platform`

Do not upload `.env` files.

## 2. Vercel

1. Go to Vercel.
2. Import the GitHub repository.
3. Framework should be detected as `Next.js`.
4. Build command: `npm run build`
5. Install command: `npm install`
6. Output directory: leave empty/default.

Add environment variables from `.env.example`.

## 3. Supabase

1. Create/open the HILEX project.
2. Go to SQL Editor.
3. Run `database/schema.sql`.
4. Run `database/policies.sql`.
5. Copy project URL and keys into Vercel environment variables.

## 4. Stripe

Create two annual recurring prices:

- Basic: `£120 + VAT / year`
- Premium: `£240 + VAT / year`

Add the Stripe price IDs to Vercel:

- `STRIPE_BASIC_PRICE_ID`
- `STRIPE_PREMIUM_PRICE_ID`

Webhook endpoint:

`https://YOUR-VERCEL-DOMAIN/api/stripe/webhook`

Events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## 5. Domain

Use the staging domain first:

`demo.hilex.co.uk`

Point it to the Vercel deployment after the app is running.

## 6. Video

Use Cloudflare Stream or Mux. Do not upload final protected videos directly to GitHub.
