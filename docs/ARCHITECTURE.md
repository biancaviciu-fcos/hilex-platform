# Arhitectura HILEX

## Scop

HILEX este o zona privata de resurse digitale pentru continut legal in romana. Utilizatorii primesc acces dupa plata unui abonament anual Basic sau Premium.

## Flux utilizator

1. Utilizatorul alege Basic sau Premium.
2. Este trimis catre Stripe Checkout.
3. Dupa plata, Stripe trimite webhook catre platforma.
4. Platforma creeaza profilul utilizatorului si abonamentul.
5. Utilizatorul primeste email cu link de setare parola.
6. Utilizatorul isi seteaza parola.
7. Dupa login vede continutul permis de abonamentul sau.

## Roluri

- `member`: utilizator platitor
- `admin`: poate crea si edita continut
- `owner`: acces complet la platforma si setari

## Niveluri de acces

- `basic`: vede continut Basic
- `premium`: vede continut Basic si Premium

## Continut

Un material poate contine:

- titlu
- slug
- categorie
- subcategorie
- nivel de acces
- status: draft/publicat
- descriere scurta
- video securizat
- text lung
- idei cheie
- PDF-uri
- linkuri recomandate
- data publicarii

## Video

Recomandare: video-urile nu se incarca pe YouTube. Se foloseste Cloudflare Stream sau Mux.

Masuri de protectie:

- player privat
- URL-uri semnate sau playback securizat
- acces generat doar pentru utilizatori logati
- optional watermark vizibil cu emailul utilizatorului

Nu exista protectie 100% impotriva filmarii ecranului, dar descarcarea directa poate fi facuta mult mai dificila.

## Stripe

Stripe gestioneaza:

- checkout
- abonamente anuale
- facturi
- reinnoiri
- anulare
- carduri

Platforma asculta webhook-uri:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Email

Emailuri automate:

- cont activat
- setare parola
- abonament activ
- plata esuata
- abonament expirat/anulat

## Admin

Adminul trebuie sa permita:

- adaugare/editare categorii
- adaugare/editare materiale
- upload video
- upload PDF
- setare Basic/Premium
- draft/publicat
- cautare continut
- vizualizare membri si abonamente
