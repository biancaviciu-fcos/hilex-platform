"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type UpgradePremiumModalProps = {
  compact?: boolean;
  triggerClassName?: string;
  triggerContent?: ReactNode;
};

export function UpgradePremiumModal({ compact = false, triggerClassName, triggerContent }: UpgradePremiumModalProps) {
  const [open, setOpen] = useState(false);
  const className = triggerClassName || `btn primary ${compact ? "upgrade-trigger-full" : ""}`;

  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        {triggerContent || (compact ? "Upgrade la Premium" : "Vezi opțiunea Premium")}
      </button>
      {open ? (
        <div className="upgrade-modal-backdrop" role="presentation">
          <div aria-labelledby="upgrade-premium-title" aria-modal="true" className="upgrade-modal-card" role="dialog">
            <button aria-label="Închide" className="upgrade-modal-close" onClick={() => setOpen(false)} type="button">
              ×
            </button>
            <span className="eyebrow">Upgrade Premium</span>
            <h3 id="upgrade-premium-title">Deblochează materialele Premium</h3>
            <p className="muted">
              Pentru upgrade de la Essential la Premium achiți doar diferența: <strong>£100 + TVA</strong>.
            </p>
            <ul className="feature-list pink">
              <li>Acces la materialele Premium</li>
              <li>Resurse și ghiduri exclusive</li>
              <li>Acces prioritar la anumite materiale noi</li>
            </ul>
            <form action="/api/stripe/checkout" method="POST">
              <input name="plan" type="hidden" value="premium_upgrade" />
              <button className="btn primary upgrade-pay-button" type="submit">
                Fă upgrade acum
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
