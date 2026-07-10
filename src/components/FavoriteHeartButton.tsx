"use client";

import { useState, useTransition } from "react";

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
  const [isPending, startTransition] = useTransition();

  function toggleFavorite() {
    const previousValue = isFavorite;
    setIsFavorite(!previousValue);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/favorites/${lessonId}`, {
          method: "POST",
          headers: {
            Accept: "application/json"
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
      }
    });
  }

  return (
    <button
      aria-label={isFavorite ? "Scoate de la favorite" : "Adaugă la favorite"}
      className={`favorite-heart-button ${variant === "hero" ? "hero-heart" : ""} ${
        isFavorite ? "active" : ""
      } ${isPending ? "saving" : ""}`}
      disabled={isPending}
      onClick={toggleFavorite}
      title={isFavorite ? "Salvat la favorite" : "Adaugă la favorite"}
      type="button"
    >
      <span aria-hidden="true">♥</span>
    </button>
  );
}
