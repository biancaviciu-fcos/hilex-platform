# Custom HILEX Email Sender

This is for replacing the default Supabase sender with a branded email such as:

```text
membership@hilex.co.uk
```

## Recommended setup

Use a transactional email provider such as Resend, Postmark, Mailgun, or SendGrid. Resend is the simplest option for a lightweight setup.

## Steps

1. Create an account with the email provider.
2. Add the domain `hilex.co.uk`.
3. The provider will show DNS records.
4. Add those DNS records in GoDaddy or wherever the DNS for `hilex.co.uk` is managed.
5. Wait until the domain is verified.
6. Create an SMTP/API sender for `membership@hilex.co.uk`.
7. Open Supabase.
8. Go to **Project Settings**.
9. Go to **Authentication**.
10. Open **SMTP Settings**.
11. Enable custom SMTP.
12. Add the SMTP host, port, username and password from the provider.
13. Set sender name to `HILEX`.
14. Set sender email to `membership@hilex.co.uk`.
15. Save.

## Email template

After SMTP is configured, use:

```text
docs/SUPABASE_EMAIL_TEMPLATE.md
```

for the branded password setup email.

## Important

Do not paste SMTP passwords or API keys into GitHub. They belong only in Supabase settings.
