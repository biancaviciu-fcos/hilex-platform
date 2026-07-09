export function accessLabel(accessLevel?: string | null) {
  return accessLevel === "premium" ? "Premium" : "Essential";
}

export function categoryIcon(slug?: string | null, name?: string | null) {
  const value = `${slug || ""} ${name || ""}`.toLowerCase();

  if (value.includes("famil")) return "👨‍👩‍👧";
  if (value.includes("imig") || value.includes("visa") || value.includes("viza")) return "🛂";
  if (value.includes("penal") || value.includes("politie") || value.includes("poliție")) return "🛡️";
  if (value.includes("civil")) return "⚖️";
  if (value.includes("munc")) return "💼";
  if (value.includes("locuin")) return "🏠";
  if (value.includes("hmrc") || value.includes("tax")) return "💷";
  if (value.includes("business")) return "📊";
  if (value.includes("sofer") || value.includes("șofer")) return "🚗";

  return "📚";
}
