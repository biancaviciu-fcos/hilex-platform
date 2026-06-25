"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendResetEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSending(true);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/auth/update-password`
    });

    setIsSending(false);

    if (error) {
      setMessage("Nu am putut trimite emailul. Te rugam sa incerci din nou.");
      return;
    }

    setEmail("");
    setMessage(
      "Daca exista un cont asociat acestei adrese, vei primi in cateva minute un email cu linkul de resetare."
    );
  }

  return (
    <form className="card form" onSubmit={sendResetEmail}>
      <div className="field">
        <label>Email</label>
        <input
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>
      {message ? <p className="notice-text">{message}</p> : null}
      <button className="btn primary" disabled={isSending} type="submit">
        {isSending ? "Se trimite..." : "Trimite linkul de resetare"}
      </button>
      <Link className="btn" href="/login">
        Inapoi la login
      </Link>
    </form>
  );
}
