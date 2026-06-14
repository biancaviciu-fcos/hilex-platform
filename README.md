# HILEX Full Platform

Platforma HILEX mare: biblioteca digitala cu abonamente, conturi, categorii, clipuri video securizate, PDF-uri si panou admin.

## Stack recomandat

- Next.js pentru aplicatia web
- Supabase pentru autentificare, baza de date si storage pentru PDF-uri
- Stripe pentru checkout, facturi si abonamente anuale
- Cloudflare Stream sau Mux pentru video securizat
- Netlify sau Vercel pentru hosting

## Functionalitati incluse in plan

- Login si setare parola de catre utilizator
- Roluri: membru Basic, membru Premium, admin
- Categorii si subcategorii
- Materiale cu video, text, idei cheie, PDF-uri, thumbnail-uri uploadate din calculator si linkuri
- Acces diferentiat Basic/Premium
- Stripe Checkout
- Stripe webhook pentru activarea abonamentului
- Email automat dupa plata
- Admin pentru continut
- Status abonament in contul utilizatorului

## Fisiere importante

- `database/schema.sql`: structura bazei de date
- `database/policies.sql`: reguli de acces
- `.env.example`: variabilele necesare
- `docs/ARCHITECTURE.md`: arhitectura completa
- `docs/IMPLEMENTATION_PLAN.md`: ordinea de construire

## Ce urmeaza

1. Cream proiect Supabase.
2. Cream produsele Basic si Premium in Stripe.
3. Alegem video provider: Cloudflare Stream sau Mux.
4. Implementam aplicatia Next.js.
5. Conectam domeniul `demo.hilex.co.uk` pentru staging.
6. Mutam pe domeniul final cand este gata.
