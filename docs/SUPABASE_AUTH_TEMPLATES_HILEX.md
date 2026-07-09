# HILEX Supabase Auth Email Templates

Use these in Supabase:

Authentication -> Emails -> Templates

Important:

- The email that says "You've been invited" is controlled by the **Invite user** template.
- The email from "Am uitat parola" is controlled by the **Reset password** template.
- Keep `{{ .ConfirmationURL }}` exactly as written. Supabase replaces it with the secure link.
- In Authentication -> Emails -> SMTP Settings, use sender name `HILEX Membership` and sender email `membership@hilex.co.uk`.

## Invite user

Use this for new paid members. The platform sends this after Stripe confirms payment.

Subject:

```text
Bun venit la HILEX - setează parola contului tău
```

HTML body:

```html
<div style="background:#f6f7fb;margin:0;padding:32px 0;">
  <div style="background:#ffffff;border:1px solid #e7e8f0;border-radius:14px;color:#080b3f;font-family:Arial,sans-serif;margin:0 auto;max-width:640px;overflow:hidden;">
    <div style="background:#05083f;padding:28px 34px;">
      <div style="color:#ffffff;font-size:28px;font-weight:800;">Hi<span style="color:#d9047c;">Lex</span></div>
      <p style="color:#d9dced;font-size:14px;margin:8px 0 0;">Resurse juridice practice pentru membri</p>
    </div>

    <div style="padding:34px;">
      <h1 style="font-size:30px;line-height:1.2;margin:0 0 16px;">Bun venit la HILEX</h1>

      <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
        Contul tău de membru HILEX a fost creat, iar abonamentul tău este activ.
      </p>

      <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
        Pentru a intra în platformă, setează parola contului tău folosind butonul de mai jos.
      </p>

      <p style="margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="background:#d9047c;border-radius:8px;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;padding:14px 22px;text-decoration:none;">
          Setează parola și intră în platformă
        </a>
      </p>

      <p style="color:#33384d;font-size:15px;line-height:1.6;margin:0 0 14px;">
        După setarea parolei, vei putea accesa Resurse HILEX și materialele incluse în planul tău.
      </p>

      <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
        Dacă butonul nu funcționează, copiază linkul acesta în browser:<br />
        <a href="{{ .ConfirmationURL }}" style="color:#c9287a;">{{ .ConfirmationURL }}</a>
      </p>

      <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
        HILEX<br />
        membership@hilex.co.uk
      </p>
    </div>
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
  <div style="background:#ffffff;border:1px solid #e7e8f0;border-radius:14px;color:#080b3f;font-family:Arial,sans-serif;margin:0 auto;max-width:640px;overflow:hidden;">
    <div style="background:#05083f;padding:28px 34px;">
      <div style="color:#ffffff;font-size:28px;font-weight:800;">Hi<span style="color:#d9047c;">Lex</span></div>
      <p style="color:#d9dced;font-size:14px;margin:8px 0 0;">Resetare parolă</p>
    </div>

    <div style="padding:34px;">
      <h1 style="font-size:30px;line-height:1.2;margin:0 0 16px;">Resetare parolă HILEX</h1>

      <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
        Am primit o cerere de resetare a parolei pentru contul tău HILEX.
      </p>

      <p style="color:#33384d;font-size:16px;line-height:1.6;margin:0 0 14px;">
        Alege o parolă nouă folosind butonul de mai jos.
      </p>

      <p style="margin:28px 0;">
        <a href="{{ .ConfirmationURL }}" style="background:#d9047c;border-radius:8px;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;padding:14px 22px;text-decoration:none;">
          Setează o parolă nouă
        </a>
      </p>

      <p style="color:#33384d;font-size:15px;line-height:1.6;margin:0 0 14px;">
        Dacă nu ai cerut resetarea parolei, poți ignora acest email. Contul tău rămâne în siguranță.
      </p>

      <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
        Dacă butonul nu funcționează, copiază linkul acesta în browser:<br />
        <a href="{{ .ConfirmationURL }}" style="color:#c9287a;">{{ .ConfirmationURL }}</a>
      </p>

      <p style="color:#6c7084;font-size:13px;line-height:1.5;margin:24px 0 0;">
        HILEX<br />
        membership@hilex.co.uk
      </p>
    </div>
  </div>
</div>
```
