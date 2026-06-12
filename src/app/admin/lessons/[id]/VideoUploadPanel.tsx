"use client";

import { useState } from "react";

export function VideoUploadPanel({ lessonId }: { lessonId: string }) {
  const [uploadUrl, setUploadUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function createUploadUrl() {
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/video/upload-url", {
      method: "POST"
    });
    const payload = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setMessage(payload.error || "Nu am putut crea linkul de upload.");
      return;
    }

    setUploadUrl(payload.uploadUrl);
    setVideoId(payload.videoId);
    setMessage("Linkul de upload a fost creat. Deschide-l si incarca video-ul.");
  }

  return (
    <section className="card form">
      <h2>Video Cloudflare Stream</h2>
      <p className="muted">
        Creeaza un link privat de upload, incarca video-ul in Cloudflare, apoi
        salveaza ID-ul video pe lectie.
      </p>
      <button className="btn primary" disabled={isLoading} onClick={createUploadUrl} type="button">
        {isLoading ? "Se creeaza..." : "Creeaza link upload video"}
      </button>
      {message ? <p className="notice-text">{message}</p> : null}
      {uploadUrl ? (
        <div className="form">
          <a className="btn" href={uploadUrl} rel="noreferrer" target="_blank">
            Deschide upload Cloudflare
          </a>
          <form action={`/api/admin/lessons/${lessonId}/video`} method="POST" className="form">
            <div className="field">
              <label>Video ID</label>
              <input name="video_asset_id" readOnly value={videoId} />
            </div>
            <button className="btn primary" type="submit">
              Salveaza video pe lectie
            </button>
          </form>
        </div>
      ) : null}
      <form action={`/api/admin/lessons/${lessonId}/video`} method="POST" className="form">
        <div className="field">
          <label>Ai incarcat deja video in Cloudflare? Pune Video ID aici</label>
          <input name="video_asset_id" placeholder="Ex: 2f7c..." />
        </div>
        <button className="btn" type="submit">
          Salveaza Video ID manual
        </button>
      </form>
    </section>
  );
}
