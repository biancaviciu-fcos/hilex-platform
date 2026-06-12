export function isAdminUser(profileRole?: string | null, email?: string | null) {
  if (profileRole === "admin" || profileRole === "owner") return true;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return email ? adminEmails.includes(email.toLowerCase()) : false;
}
