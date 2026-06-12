import type { AccessLevel } from "./types";

export function canAccessLesson(userAccess: AccessLevel | null, lessonAccess: AccessLevel) {
  if (!userAccess) return false;
  if (userAccess === "premium") return true;
  return lessonAccess === "basic";
}
