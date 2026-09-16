"use client";

import { useState } from "react";
import { FavoriteHeartButton } from "@/components/FavoriteHeartButton";
import { VideoCoverPlayer } from "@/components/VideoCoverPlayer";

export type EssentialVideoMaterial = {
  id: string;
  title: string;
  excerpt: string | null;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_provider: string | null;
  video_asset_id: string | null;
  video_playback_id: string | null;
  categoryName: string;
  isFavorite: boolean;
};

export function EssentialVideoGrid({ materials }: { materials: EssentialVideoMaterial[] }) {
  const [activeMaterial, setActiveMaterial] = useState<EssentialVideoMaterial | null>(null);

  const activePlaybackId = activeMaterial?.video_playback_id || activeMaterial?.video_asset_id || "";

  function openMaterial(material: EssentialVideoMaterial) {
    setActiveMaterial(material);
    fetch(`/api/views/${material.id}`, {
      method: "POST",
      keepalive: true
    }).catch(() => {
      // Viewing history is useful, but it should never block opening a video.
    });
  }

  return (
    <>
      <div className="essential-material-grid" id="materiale">
        {materials.map((material) => (
          <article className="essential-material-card" key={material.id}>
            <button className="essential-material-open" onClick={() => openMaterial(material)} type="button">
              <div className="essential-material-thumb">
                {material.thumbnail_url ? <img alt="" src={material.thumbnail_url} /> : <span>▶</span>}
              </div>
              <div className="essential-material-copy">
                <div className="tag-row">
                  {material.duration_minutes ? <span className="tag">{material.duration_minutes} min</span> : null}
                  {material.categoryName ? <span className="tag">{material.categoryName}</span> : null}
                </div>
                <h3>{material.title}</h3>
                {material.excerpt ? <p className="muted">{material.excerpt}</p> : null}
              </div>
            </button>
            <FavoriteHeartButton initialIsFavorite={material.isFavorite} lessonId={material.id} />
          </article>
        ))}
      </div>

      {activeMaterial ? (
        <div className="essential-video-modal-backdrop" role="presentation">
          <div aria-labelledby="essential-video-title" aria-modal="true" className="essential-video-modal" role="dialog">
            <button
              aria-label="Închide"
              className="essential-video-modal-close"
              onClick={() => setActiveMaterial(null)}
              type="button"
            >
              ×
            </button>
            <div className="essential-video-modal-heading">
              <span className="eyebrow">Material video Essential</span>
              <h2 id="essential-video-title">{activeMaterial.title}</h2>
              <div className="tag-row">
                {activeMaterial.duration_minutes ? <span className="tag">{activeMaterial.duration_minutes} min</span> : null}
                {activeMaterial.categoryName ? <span className="tag">{activeMaterial.categoryName}</span> : null}
              </div>
            </div>
            <div className="essential-video-modal-player">
              {activePlaybackId ? (
                <VideoCoverPlayer
                  playbackId={activePlaybackId}
                  thumbnailUrl={activeMaterial.thumbnail_url}
                  title={activeMaterial.title}
                />
              ) : (
                <div className="video-placeholder">
                  <span>▶</span>
                  <p>Material video pentru membri Essential</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
