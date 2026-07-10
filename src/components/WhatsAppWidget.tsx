import { createSupabaseServerClient } from "@/lib/supabase/server";

const whatsappNumber = "447908790689";
const whatsappMessage = encodeURIComponent(
  "Bună! Am nevoie de ajutor cu contul sau resursele HiLex."
);

export async function WhatsAppWidget() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status")
    .eq("user_id", user.id)
    .eq("access_level", "premium")
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription) return null;

  return (
    <a
      aria-label="Contactează HILEX pe WhatsApp"
      className="whatsapp-widget"
      href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
      rel="noreferrer"
      target="_blank"
    >
      <span className="whatsapp-widget-icon" aria-hidden="true">
        WA
      </span>
      <span className="whatsapp-widget-text">Contactează-ne pe WhatsApp</span>
    </a>
  );
}
