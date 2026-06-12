# Conturi necesare pentru platforma finala

## Supabase

Avem nevoie de:

- Project URL
- anon public key
- service role key

In Supabase rulam:

1. `database/schema.sql`
2. `database/policies.sql`

## Stripe

Cream doua produse:

- HILEX Basic, abonament anual: `£120 + TVA / an`
- HILEX Premium, abonament anual: `£240 + TVA / an`

Avem nevoie de:

- secret key
- publishable key
- price id pentru Basic
- price id pentru Premium
- webhook secret

Webhook URL:

`https://demo.hilex.co.uk/api/stripe/webhook`

## Cloudflare Stream

Avem nevoie de:

- Cloudflare account id
- Stream API token

Tokenul trebuie sa poata crea direct upload URLs si citi asset-uri video.

## Email

Recomandare: Resend.

Avem nevoie de:

- API key
- domeniu/email verificat, de exemplu `no-reply@hilex.co.uk`

## Hosting

Pentru versiunea finala Next.js, folosim Netlify sau Vercel.

Pentru staging:

`https://demo.hilex.co.uk`

Pentru productie:

un domeniu/subdomeniu stabilit separat.
