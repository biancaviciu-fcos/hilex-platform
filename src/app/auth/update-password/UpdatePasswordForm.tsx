"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function prepareSession() {
      async function markReadyIfSessionExists() {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (session) {
          setIsReady(true);
          return true;
        }

        return false;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (await markReadyIfSessionExists()) return;
          setMessage("Linkul de setare parolă a expirat sau nu este valid. Cere un link nou.");
          return;
        }
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          if (await markReadyIfSessionExists()) return;
          setMessage("Linkul de setare parolă a expirat sau nu este valid. Cere un link nou.");
          return;
        }
      }

      if (tokenHash && (type === "recovery" || type === "invite")) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type
        });

        if (error) {
          if (await markReadyIfSessionExists()) return;
          setMessage("Linkul de setare parolă a expirat sau nu este valid. Cere un link nou.");
          return;
        }
      }

      if (!(await markReadyIfSessionExists())) {
        setMessage("Nu am putut valida sesiunea. Deschide linkul primit pe email în același browser.");
      }
    }

    prepareSession();
  }, [searchParams, supabase.auth]);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Parolele nu coincid.");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/library");
  }

  return (
    <form className="card form" onSubmit={updatePassword}>
      <div className="field">
        <label>Parola nouă</label>
        <input
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      <div className="field">
        <label>Confirmă parola</label>
        <input
          minLength={8}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          type="password"
          value={confirmPassword}
        />
      </div>
      {message ? <p className="notice-text">{message}</p> : null}
      <button className="btn primary" disabled={!isReady || isSaving} type="submit">
        {isSaving ? "Se salvează..." : "Setează parola și intră în platformă"}
      </button>
    </form>
  );
}
