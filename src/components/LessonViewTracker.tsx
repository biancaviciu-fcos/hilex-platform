"use client";

import { useEffect } from "react";

export function LessonViewTracker({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    fetch(`/api/views/${lessonId}`, {
      method: "POST",
      keepalive: true
    }).catch(() => {
      // Viewing progress is helpful, but it should never block the material page.
    });
  }, [lessonId]);

  return null;
}
