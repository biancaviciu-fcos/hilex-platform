# HILEX Supabase Auth Email Templates

Use these in Supabase:

Authentication -> Emails -> Templates

## Invite user

Use this for new paid members. The platform sends this after Stripe confirms payment.

Subject:

```text
Bun venit la HILEX - seteaza parola contului tau
```

HTML body:

```html
<div style="background:#f6f7fb;margin:0;padding:32px 0;">
  <div style="background:#ffffff;color:#080b3f;font-family:Arial,sans-serif;margin:0 auto;max-width:640px;padding:36px;">
    <h1 style="font-size:30px;line-height:1.2;margin:0 0 16px;">Bun venit la HILEX</h1>

    <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
      Contul tau de membru HILEX a fost creat, iar abonamentul tau este activ.
    </p>

    <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
      Pentru a intra in platforma, seteaza parola contului tau folosind butonul de mai jos.
    </p>

    <p style="margin:28px 0;">
      <a href="{{ .ConfirmationURL }}" style="background:#c9287a;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;padding:14px 22px;text-decoration:none;">
        Seteaza parola si intra in platforma
      </a>
    </p>

    <p style="color:#33384d;font-size:15px;line-height:1.6;margin:0 0 14px;">
      Dupa setarea parolei, vei putea accesa Resurse HiLex si materialele incluse in pachetul tau.
    </p>

    <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
      Daca butonul nu functioneaza, copiaza linkul acesta in browser:<br />
      <a href="{{ .ConfirmationURL }}" style="color:#c9287a;">{{ .ConfirmationURL }}</a>
    </p>

    <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
      HILEX<br />
      membership@hilex.co.uk
    </p>
  </div>
</div>
```

## Reset password

Use this for the "Am uitat parola" button.

Subject:

```text
Resetare parola HILEX
```

HTML body:

```html
<div style="background:#f6f7fb;margin:0;padding:32px 0;">
  <div style="background:#ffffff;color:#080b3f;font-family:Arial,sans-serif;margin:0 auto;max-width:640px;padding:36px;">
    <h1 style="font-size:30px;line-height:1.2;margin:0 0 16px;">Resetare parola HILEX</h1>

    <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
      Am primit o cerere de resetare a parolei pentru contul tau HILEX.
    </p>

    <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
      Alege o parola noua folosind butonul de mai jos.
    </p>

    <p style="margin:28px 0;">
      <a href="{{ .ConfirmationURL }}" style="background:#c9287a;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;padding:14px 22px;text-decoration:none;">
        Seteaza o parola noua
      </a>
    </p>

    <p style="color:#33384d;font-size:15px;line-height:1.6;margin:0 0 14px;">
      Daca nu ai cerut resetarea parolei, poti ignora acest email. Contul tau ramane in siguranta.
    </p>

    <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
      Daca butonul nu functioneaza, copiaza linkul acesta in browser:<br />
      <a href="{{ .ConfirmationURL }}" style="color:#c9287a;">{{ .ConfirmationURL }}</a>
    </p>

    <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
      HILEX<br />
      membership@hilex.co.uk
    </p>
  </div>
</div>
```
