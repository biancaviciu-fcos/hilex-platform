"use client";

import type { MouseEvent } from "react";
import { useState } from "react";

type FavoriteHeartButtonProps = {
  initialIsFavorite: boolean;
  lessonId: string;
  variant?: "card" | "hero";
};

export function FavoriteHeartButton({
  initialIsFavorite,
  lessonId,
  variant = "card"
}: FavoriteHeartButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSaving, setIsSaving] = useState(false);

  async function toggleFavorite(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (isSaving) return;

    const previousValue = isFavorite;
    setIsSaving(true);
    setIsFavorite(!previousValue);

    try {
      const response = await fetch(`/api/favorites/${lessonId}`, {
        body: JSON.stringify({ favorite: !previousValue }),
        credentials: "same-origin",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        setIsFavorite(previousValue);
        return;
      }

      const result = (await response.json()) as { isFavorite?: boolean };
      if (typeof result.isFavorite === "boolean") {
        setIsFavorite(result.isFavorite);
      }
    } catch {
      setIsFavorite(previousValue);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      aria-label={isFavorite ? "Scoate de la favorite" : "Adaugă la favorite"}
      className={`favorite-heart-button ${variant === "hero" ? "hero-heart" : ""} ${
        isFavorite ? "active" : ""
      } ${isSaving ? "saving" : ""}`}
      aria-pressed={isFavorite}
      disabled={isSaving}
      onClick={toggleFavorite}
      title={isFavorite ? "Salvat la favorite" : "Adaugă la favorite"}
      type="button"
    >
      <span aria-hidden="true">♥</span>
    </button>
  );
}
