export default function PricingPage() {
  const basicItems = [
    "Acces la platforma HiLex",
    "Acces la video-uri informative și ghiduri utile pentru viața în UK",
    "Până la 45 minute credit anual",
    "Credit utilizabil pentru consultanță sau asistență juridică punctuală",
    "Răspuns în maximum 24h",
    "Beneficii și resurse exclusive pentru membri",
    "Discount-uri preferențiale pentru anumite servicii juridice Forest & Co"
  ];

  const premiumItems = [
    "Acces complet la ecosistemul HiLex",
    "Până la 90 minute credit anual",
    "Credit utilizabil pentru consultanță sau asistență juridică premium",
    "Acces prioritar",
    "Materiale și resurse exclusive",
    "Acces anticipat la anumite materiale și update-uri",
    "Discount-uri preferențiale extinse pentru servicii juridice Forest & Co"
  ];

  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Alege pachetul care se potrivește cel mai bine nevoilor tale.</h1>
          <p>Acces anual la platforma HILEX, cu resurse juridice și credit inclus pentru suport.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner grid">
          <form className="card pricing-large" action="/api/stripe/checkout" method="POST">
            <h3>Pachet Basic</h3>
            <div className="big-price">£120 <span>+TVA / an</span></div>
            <p className="muted">Pentru momentele în care ai nevoie de claritate și vrei să iei decizia corectă.</p>
            <ul className="feature-list">
              {basicItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <input type="hidden" name="plan" value="basic" />
            <button className="btn" type="submit">
              Activează protecția ta →
            </button>
            <p className="soft-note">Acces complet pentru 12 luni de la activare.</p>
          </form>
          <form className="card pricing-large featured" action="/api/stripe/checkout" method="POST">
            <strong className="recommended-label">RECOMANDAT</strong>
            <h3>Pachet Premium</h3>
            <div className="big-price">£240 <span>+TVA / an</span></div>
            <p className="muted">Pentru cei care își doresc suport mai rapid și acces prioritar.</p>
            <p>
              <strong>Include tot ce este în Pachetul BASIC, plus:</strong>
            </p>
            <ul className="feature-list pink">
              {premiumItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <input type="hidden" name="plan" value="premium" />
            <button className="btn primary" type="submit">
              Activează protecția prioritară →
            </button>
            <p className="soft-note">Prioritate în răspunsuri și suport dedicat.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
