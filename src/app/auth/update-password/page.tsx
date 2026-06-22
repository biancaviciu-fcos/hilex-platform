import { Suspense } from "react";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function UpdatePasswordPage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Seteaza parola HILEX</h1>
          <p>
            Alege o parola pentru contul tau. Dupa salvare, vei intra direct in
            resursele membrilor.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <Suspense fallback={<div className="card">Se incarca...</div>}>
            <UpdatePasswordForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
