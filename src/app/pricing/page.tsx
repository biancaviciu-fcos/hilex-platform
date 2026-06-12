export default function PricingPage() {
  const basicItems = [
    "Acces la platforma HiLex",
    "Acces la video-uri informative si ghiduri utile pentru viata in UK",
    "Pana la 45 minute credit anual",
    "Credit utilizabil pentru consultanta sau asistenta juridica punctuala",
    "Raspuns in maximum 24h",
    "Beneficii si resurse exclusive pentru membri",
    "Discount-uri preferentiale pentru anumite servicii juridice Forest & Co"
  ];

  const premiumItems = [
    "Acces complet la ecosistemul HiLex",
    "Pana la 90 minute credit anual",
    "Credit utilizabil pentru consultanta sau asistenta juridica premium",
    "Acces prioritar",
    "Materiale si resurse exclusive",
    "Acces anticipat la anumite materiale si update-uri",
    "Discount-uri preferentiale extinse pentru servicii juridice Forest & Co"
  ];

  return (
    <main className="page">
      <section className="hero">
        <div className="inner">
          <h1>Alege pachetul care se potriveste cel mai bine nevoilor tale.</h1>
          <p>Acces anual la platforma HILEX, cu resurse juridice si credit inclus pentru suport.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner grid">
          <form className="card pricing-large" action="/api/stripe/checkout" method="POST">
            <h3>Pachet Basic</h3>
            <div className="big-price">£120 <span>+TVA / an</span></div>
            <p className="muted">Pentru momentele in care ai nevoie de claritate si vrei sa iei decizia corecta.</p>
            <ul className="feature-list">
              {basicItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <input type="hidden" name="plan" value="basic" />
            <button className="btn" type="submit">
              Activeaza protectia ta →
            </button>
            <p className="soft-note">Acces complet pentru 12 luni de la activare.</p>
          </form>
          <form className="card pricing-large featured" action="/api/stripe/checkout" method="POST">
            <strong className="recommended-label">RECOMANDAT</strong>
            <h3>Pachet Premium</h3>
            <div className="big-price">£240 <span>+TVA / an</span></div>
            <p className="muted">Pentru cei care isi doresc suport mai rapid si acces prioritar.</p>
            <p>
              <strong>Include tot ce este in Pachetul BASIC, plus:</strong>
            </p>
            <ul className="feature-list pink">
              {premiumItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <input type="hidden" name="plan" value="premium" />
            <button className="btn primary" type="submit">
              Activeaza protectia prioritara →
            </button>
            <p className="soft-note">Prioritate in raspunsuri si suport dedicat.</p>
          </form>
        </div>
      </section>
    </main>
  );
}
