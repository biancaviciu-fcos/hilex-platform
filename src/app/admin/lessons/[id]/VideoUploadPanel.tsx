"use client";

import type { ChangeEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function VideoUploadPanel({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const [uploadUrl, setUploadUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    setMessage("Linkul de upload a fost creat. Alege fișierul video și încarcă-l.");
  }

  async function saveVideoToLesson(assetId: string) {
    const saveData = new FormData();
    saveData.append("video_asset_id", assetId);

    const response = await fetch(`/api/admin/lessons/${lessonId}/video`, {
      method: "POST",
      body: saveData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || "Nu am putut salva video-ul pe material.");
    }
  }

  async function uploadVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !uploadUrl || !videoId) {
      return;
    }

    setIsUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });

    setIsUploading(false);

    if (!response.ok) {
      setMessage("Upload-ul video nu a reușit. Încearcă din nou sau încarcă manual în Cloudflare.");
      return;
    }

    try {
      await saveVideoToLesson(videoId);
      setMessage("Video-ul a fost încărcat și salvat pe material.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Video-ul a fost încărcat, dar nu a putut fi salvat pe material.");
    }
  }

  return (
    <section className="card form">
      <h2>Video Cloudflare Stream</h2>
      <p className="muted">
        Creează un link privat de upload, încarcă video-ul în Cloudflare, apoi
        salvează automat ID-ul video pe material.
      </p>
      <button className="btn primary" disabled={isLoading} onClick={createUploadUrl} type="button">
        {isLoading ? "Se creează..." : "Creează link upload video"}
      </button>
      {message ? <p className="notice-text">{message}</p> : null}
      {uploadUrl ? (
        <div className="form">
          <div className="field">
            <label>Alege fișierul video</label>
            <input accept="video/*" disabled={isUploading} onChange={uploadVideo} type="file" />
          </div>
          <form action={`/api/admin/lessons/${lessonId}/video`} method="POST" className="form">
            <div className="field">
              <label>Video ID</label>
              <input name="video_asset_id" readOnly value={videoId} />
            </div>
            <button className="btn primary" type="submit">
              {isUploading ? "Se încarcă..." : "Salvează din nou video pe material"}
            </button>
          </form>
        </div>
      ) : null}
      <form action={`/api/admin/lessons/${lessonId}/video`} method="POST" className="form">
        <div className="field">
          <label>Ai încărcat deja video în Cloudflare? Pune Video ID aici</label>
          <input name="video_asset_id" placeholder="Ex: 2f7c..." />
        </div>
        <button className="btn" type="submit">
          Salvează Video ID manual
        </button>
      </form>
    </section>
  );
}
