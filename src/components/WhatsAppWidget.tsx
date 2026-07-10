const whatsappNumber = "447908790689";
const whatsappMessage = encodeURIComponent(
  "Bună! Am nevoie de ajutor cu contul sau resursele HiLex."
);

export function WhatsAppWidget() {
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
      <span className="whatsapp-widget-text">WhatsApp</span>
    </a>
  );
}
