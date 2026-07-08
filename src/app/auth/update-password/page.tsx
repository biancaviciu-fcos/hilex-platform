import { Suspense } from "react";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Setează parola HILEX</h1>
          <p>
            Alege o parolă pentru contul tău. După salvare, vei intra direct în
            resursele membrilor.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <Suspense fallback={<div className="card">Se încarcă...</div>}>
            <UpdatePasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
