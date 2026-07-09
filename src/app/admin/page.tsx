import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  if (status === "published") return "Publicat";
  if (status === "archived") return "Arhivat";
  return "Draft";
}

function emailTestMessage(value?: string | string[]) {
  const status = Array.isArray(value) ? value[0] : value;

  if (status === "sent") {
    return "Emailul test a fost trimis. Verifică inboxul și spamul.";
  }

  if (status === "failed") {
    return "Emailul test nu a putut fi trimis. Verifică RESEND_API_KEY, EMAIL_FROM și domeniul din Resend.";
  }

  if (status === "missing-email") {
    return "Nu am găsit o adresă de email pentru contul de admin.";
  }

  if (status === "forbidden") {
    return "Nu ai acces pentru această verificare.";
  }

  if (status === "login") {
    return "Trebuie să fii logată ca admin pentru a trimite emailul test.";
  }

  return "";
}

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ emailTest?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const emailMessage = emailTestMessage(resolvedSearchParams.emailTest);
  const emailMessageIsSuccess = resolvedSearchParams.emailTest === "sent";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminUser(profile?.role, user.email)) redirect("/library");
  if (!(await hasAdminPanelAccess())) redirect("/admin/access?next=/admin");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,status,access_level,excerpt,thumbnail_url")
    .order("created_at", { ascending: false });

  const allLessons = lessons || [];
  const draftLessons = allLessons.filter((lesson) => lesson.status === "draft");
  const publishedLessons = allLessons.filter((lesson) => lesson.status === "published");
  const archivedLessons = allLessons.filter((lesson) => lesson.status === "archived");

  function renderMaterials(materials: typeof allLessons) {
    if (!materials.length) {
      return <p className="muted">Nu există materiale în această secțiune.</p>;
    }

    return (
      <div className="lesson-grid">
        {materials.map((lesson) => (
          <Link className="lesson-card admin-lesson" href={`/admin/lessons/${lesson.id}`} key={lesson.id}>
            <div className="lesson-thumb">
              {lesson.thumbnail_url ? (
                <img alt="" src={lesson.thumbnail_url} />
              ) : (
                <span>▶</span>
              )}
            </div>
            <div className="lesson-content">
              <div className="tag-row">
                <span className="tag">{statusLabel(lesson.status)}</span>
                <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>
                  {lesson.access_level === "premium" ? "Premium" : "Essential"}
                </span>
              </div>
              <h3>{lesson.title}</h3>
              <p className="muted">{lesson.excerpt || "Fără descriere încă."}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Admin HILEX</h1>
          <p>Gestionează conținutul resurselor, drafturile și publicarea.</p>
          <Link className="btn primary" href="/admin/lessons/new">
            Material nou
          </Link>
        </div>
      </section>
      <section className="section">
        <div className="inner admin-sections">
          <section className="card">
            <div className="section-title compact-title">
              <div>
                <h2>Verificare emailuri</h2>
                <p className="muted">
                  Trimite un email test către contul tău de admin pentru a verifica dacă Resend este configurat corect.
                </p>
              </div>
              <form action="/api/admin/test-email" method="POST">
                <button className="btn primary" type="submit">
                  Trimite email test
                </button>
              </form>
            </div>
            {emailMessage ? (
              <p className={emailMessageIsSuccess ? "success-box" : "error-box"}>{emailMessage}</p>
            ) : null}
          </section>

          <section>
            <div className="section-title">
              <h2>Drafturi ({draftLessons.length})</h2>
            </div>
            {renderMaterials(draftLessons)}
          </section>

          <section>
            <div className="section-title">
              <h2>Publicate ({publishedLessons.length})</h2>
            </div>
            {renderMaterials(publishedLessons)}
          </section>

          <section>
            <div className="section-title">
              <h2>Arhivate ({archivedLessons.length})</h2>
            </div>
            {renderMaterials(archivedLessons)}
          </section>
        </div>
      </section>
    </main>
  );
}
