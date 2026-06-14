# HILEX Supabase Email Template

Use this for the Supabase **Reset Password** email. In HILEX, this email is used as the onboarding email after a paid subscription is created.

## Subject

```text
Bun venit in HILEX - seteaza parola contului tau
```

## Body

```html
<h2>Bun venit in HILEX</h2>

<p>Contul tau de membru a fost creat cu succes.</p>

<p>
  Pentru a intra in platforma, seteaza parola contului tau folosind butonul de mai jos.
</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#d9047c;color:#ffffff;padding:14px 20px;border-radius:8px;text-decoration:none;font-weight:700;">
    Seteaza parola HILEX
  </a>
</p>

<p>
  Dupa setarea parolei, vei putea accesa biblioteca HILEX si materialele incluse in abonamentul tau.
</p>

<p>
  Daca nu ai achizitionat un abonament HILEX, poti ignora acest email.
</p>

<p>
  Echipa HILEX
</p>
```

## Where to paste it

1. Open Supabase.
2. Go to **Authentication**.
3. Go to **Emails**.
4. Open **Reset Password**.
5. Replace the subject and body with the content above.
6. Save.

Keep `{{ .ConfirmationURL }}` exactly as it is. Supabase replaces it automatically with the secure password setup link.
