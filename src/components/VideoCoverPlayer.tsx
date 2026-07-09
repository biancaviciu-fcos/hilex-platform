"use client";

import { useState } from "react";

type VideoCoverPlayerProps = {
  playbackId: string;
  title: string;
  thumbnailUrl?: string | null;
};

export function VideoCoverPlayer({ playbackId, title, thumbnailUrl }: VideoCoverPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = `https://iframe.videodelivery.net/${playbackId}?autoplay=true`;

  if (isPlaying) {
    return (
      <iframe
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="video-embed"
        src={videoUrl}
        title={title}
      />
    );
  }

  return (
    <button className="video-cover-player" onClick={() => setIsPlaying(true)} type="button">
      {thumbnailUrl ? (
        <img alt="" src={thumbnailUrl} />
      ) : (
        <span className="video-cover-fallback">HILEX</span>
      )}
      <span className="video-cover-shade" />
      <span className="video-cover-play" aria-hidden="true">
        ▶
      </span>
      <span className="video-cover-text">
        <strong>Redă materialul video</strong>
        <small>Click pentru a porni clipul</small>
      </span>
    </button>
  );
}
