"use client";

import { UpgradePremiumModal } from "@/components/UpgradePremiumModal";

type LockedPremiumCardProps = {
  title: string;
  excerpt: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number | null;
  categoryName?: string;
  isCompleted: boolean;
};

export function LockedPremiumCard({
  title,
  excerpt,
  thumbnailUrl,
  durationMinutes,
  categoryName,
  isCompleted
}: LockedPremiumCardProps) {
  return (
    <UpgradePremiumModal
      triggerClassName="lesson-card-main locked-card-trigger"
      triggerContent={
        <>
          <span className="lesson-thumb">
            {thumbnailUrl ? <img alt="" src={thumbnailUrl} /> : <span>▶</span>}
            <span className="locked-overlay">
              <strong>Premium</strong>
              <small>Fă upgrade la Premium pentru a avea acces</small>
            </span>
          </span>
          <span className="lesson-content">
            <span className="tag-row">
              <span className="tag premium">Premium</span>
              {durationMinutes ? <span className="tag">{durationMinutes} min</span> : null}
              {categoryName ? <span className="tag">{categoryName}</span> : null}
              {isCompleted ? <span className="tag completed">Parcurs</span> : null}
            </span>
            <span className="lesson-card-title">{title}</span>
            {excerpt ? <span className="muted lesson-card-excerpt">{excerpt}</span> : null}
            <span className="upgrade-note">Fă upgrade la Premium pentru a avea acces la acest material.</span>
          </span>
        </>
      }
    />
  );
}
