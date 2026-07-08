"use client";

export function DeleteLessonForm({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  return (
    <form
      action={`/api/admin/lessons/${lessonId}/delete`}
      method="POST"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Ștergi definitiv materialul "${lessonTitle}"? Această acțiune nu poate fi anulată.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button className="btn danger-btn" type="submit">
        Șterge definitiv materialul
      </button>
    </form>
  );
}
