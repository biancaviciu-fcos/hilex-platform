# Plan de implementare HILEX

## Faza 1: Fundatia

- Setup Next.js
- Setup Supabase
- Schema baza de date
- Login/register prin link de setare parola
- Layout resurse
- Migrare design din demo

## Faza 2: Continut

- Admin categorii
- Admin subcategorii
- Admin materiale
- Editor text
- PDF resources
- Linkuri recomandate
- Publicare/draft

## Faza 3: Video

- Alegere Cloudflare Stream sau Mux
- Upload video din admin
- Salvare `video_provider_asset_id`
- Player securizat in materiale
- Restrictionare acces Basic/Premium

## Faza 4: Stripe

- Produse Basic si Premium in Stripe
- Checkout anual
- Webhook-uri
- Activare abonament
- Portal client pentru card/facturi/anulare

## Faza 5: Email

- Email setare parola dupa plata
- Email confirmare abonament
- Email plata esuata
- Email reinnoire/expirare

## Faza 6: Lansare

- Staging pe `demo.hilex.co.uk`
- Teste cu Stripe test mode
- GDPR/cookies/legal disclaimer
- Productie pe domeniul final

## Decizii de confirmat

- Reinnoire automata anuala sau plata manuala anuala
- Cloudflare Stream sau Mux
- Daca Premium include toate PDF-urile sau doar clipuri extra
- Cine are rol admin
