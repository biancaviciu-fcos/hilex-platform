import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { hasAdminPanelAccess } from "@/lib/adminAccess";
import { accessLabel } from "@/lib/labels";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMaterialThumbnail } from "@/lib/thumbnails";
import { DeleteLessonForm } from "./DeleteLessonForm";
import { VideoUploadPanel } from "./VideoUploadPanel";

function parseExtraInfo(value: string) {
  return value
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [question = "", ...answerLines] = block.split("\n");

      return {
        question: question.trim(),
        answer: answerLines.join("\n").trim()
      };
    })
    .filter((item) => item.question && item.answer);
}

function formatExtraInfo(value: unknown) {
  if (!Array.isArray(value)) return "";

  return value
    .map((item) => {
      const entry = item as { question?: unknown; answer?: unknown };
      const question = typeof entry.question === "string" ? entry.question : "";
      const answer = typeof entry.answer === "string" ? entry.answer : "";
      return question && answer ? `${question}\n${answer}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

async function updateLesson(formData: FormData) {
  "use server";

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

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const categoryId = String(formData.get("category_id") || "");
  const subcategoryId = String(formData.get("subcategory_id") || "");
  const accessLevel = String(formData.get("access_level") || "basic");
  const status = String(formData.get("status") || "draft");
  const excerpt = String(formData.get("excerpt") || "");
  const thumbnail = formData.get("thumbnail");
  const videoProvider = String(formData.get("video_provider") || "") || null;
  const videoAssetId = String(formData.get("video_asset_id") || "") || null;
  const videoPlaybackId = String(formData.get("video_playback_id") || "") || null;
  const durationMinutes = Number(formData.get("duration_minutes") || 0) || null;
  const body = String(formData.get("body") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const keyPoints = String(formData.get("key_points") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const extraInfo = parseExtraInfo(String(formData.get("extra_info") || ""));

  let thumbnailUrl: string | null = null;

  if (thumbnail instanceof File && thumbnail.size > 0) {
    thumbnailUrl = await uploadMaterialThumbnail(thumbnail, id);
  }

  const updatePayload: Record<string, unknown> = {
    title,
    slug,
    category_id: categoryId,
    subcategory_id: subcategoryId || null,
    access_level: accessLevel,
    status,
    excerpt,
    duration_minutes: durationMinutes,
    video_provider: videoProvider,
    video_asset_id: videoAssetId,
    video_playback_id: videoPlaybackId,
    body,
    key_points: keyPoints,
    extra_info: extraInfo,
    published_at: status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  if (thumbnailUrl) {
    updatePayload.thumbnail_url = thumbnailUrl;
  }

  const adminSupabase = createSupabaseAdminClient();

  if (profile?.role !== "admin" && profile?.role !== "owner") {
    await adminSupabase.from("profiles").upsert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || user.email || "Admin HILEX",
      role: "admin",
      updated_at: new Date().toISOString()
    });
  }

  await adminSupabase
    .from("lessons")
    .update(updatePayload)
    .eq("id", id);

  redirect("/admin");
}

export default async function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
  if (!(await hasAdminPanelAccess())) redirect(`/admin/access?next=/admin/lessons/${id}`);

  const adminSupabase = createSupabaseAdminClient();

  if (profile?.role !== "admin" && profile?.role !== "owner") {
    await adminSupabase.from("profiles").upsert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || user.email || "Admin HILEX",
      role: "admin",
      updated_at: new Date().toISOString()
    });
  }

  const { data: lesson } = await adminSupabase
    .from("lessons")
    .select("*, lesson_resources(id,title,resource_type,url,access_level)")
    .eq("id", id)
    .single();
  if (!lesson) notFound();

  const { data: categories } = await adminSupabase
    .from("categories")
    .select("id,name")
    .order("sort_order");

  const { data: subcategories } = await adminSupabase
    .from("subcategories")
    .select("id,name,category_id")
    .order("sort_order");

  const body = Array.isArray(lesson.body) ? lesson.body.join("\n\n") : "";
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points.join("\n") : "";
  const extraInfo = formatExtraInfo(lesson.extra_info);
  const resources = Array.isArray(lesson.lesson_resources) ? lesson.lesson_resources : [];

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Editează materialul</h1>
          <p>{lesson.title}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={updateLesson} encType="multipart/form-data">
            <input type="hidden" name="id" value={lesson.id} />
            <div className="field">
              <label>Titlu</label>
              <input name="title" defaultValue={lesson.title} required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" defaultValue={lesson.slug} required />
            </div>
            <div className="field">
              <label>Aria de drept / filtru principal</label>
              <select name="category_id" defaultValue={lesson.category_id} required>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="field-hint">Asta este categoria principală după care membrii pot filtra materialele.</p>
            </div>
            <div className="field">
              <label>Subcategorie internă (opțional)</label>
              <select name="subcategory_id" defaultValue={lesson.subcategory_id || ""}>
                <option value="">Fără subcategorie</option>
                {(subcategories || []).map((subcategory) => {
                  const categoryName = categories?.find((category) => category.id === subcategory.category_id)?.name;

                  return (
                    <option key={subcategory.id} value={subcategory.id}>
                      {categoryName ? `${categoryName} - ` : ""}
                      {subcategory.name}
                    </option>
                  );
                })}
              </select>
              <p className="field-hint">Momentan nu afișăm subcategoriile ca filtru public în resurse.</p>
            </div>
            <div className="field">
              <label>Pachet material</label>
              <select name="access_level" defaultValue={lesson.access_level}>
                <option value="basic">Essential - inclus pentru toți membrii</option>
                <option value="premium">Premium - blocat pentru membrii Essential</option>
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select name="status" defaultValue={lesson.status}>
                <option value="draft">Draft</option>
                <option value="published">Publicat</option>
                <option value="archived">Arhivat</option>
              </select>
            </div>
            <div className="field">
              <label>Descriere scurtă</label>
              <textarea name="excerpt" rows={3} defaultValue={lesson.excerpt || ""} />
            </div>
            <div className="field">
              <label>Durată video, în minute</label>
              <input
                min="0"
                name="duration_minutes"
                placeholder="Ex: 12"
                type="number"
                defaultValue={lesson.duration_minutes || ""}
              />
            </div>
            <div className="field">
              <label>Thumbnail / imagine de copertă</label>
              {lesson.thumbnail_url ? (
                <img alt="" className="thumbnail-preview" src={lesson.thumbnail_url} />
              ) : null}
              <input accept="image/*" name="thumbnail" type="file" />
            </div>
            <div className="field">
              <label>Video provider</label>
              <select name="video_provider" defaultValue={lesson.video_provider || ""}>
                <option value="">Fără video</option>
                <option value="cloudflare_stream">Cloudflare Stream</option>
                <option value="mux">Mux</option>
                <option value="external">External</option>
              </select>
            </div>
            <div className="field">
              <label>Video asset id</label>
              <input name="video_asset_id" defaultValue={lesson.video_asset_id || ""} />
            </div>
            <div className="field">
              <label>Video playback id</label>
              <input name="video_playback_id" defaultValue={lesson.video_playback_id || ""} />
            </div>
            <div className="field">
              <label>Text articol, câte un paragraf pe rând</label>
              <textarea name="body" rows={10} defaultValue={body} />
            </div>
            <div className="field">
              <label>Idei cheie, câte una pe rând</label>
              <textarea name="key_points" rows={6} defaultValue={keyPoints} />
            </div>
            <div className="field">
              <label>Ce mai trebuie să știi</label>
              <textarea
                name="extra_info"
                rows={8}
                defaultValue={extraInfo}
                placeholder={"Scrie întrebarea pe primul rând, apoi răspunsul dedesubt.\n\nPentru mai multe întrebări, lasă o linie goală între fiecare bloc."}
              />
              <p className="field-hint">
                Această secțiune apare pe pagina materialului, sub text și idei cheie.
              </p>
            </div>
            <button className="btn primary" type="submit">
              Salvează
            </button>
          </form>

          <VideoUploadPanel lessonId={lesson.id} />

          <div className="admin-panels">
            <section className="card form">
              <h2>Adaugă PDF</h2>
              <form action="/api/admin/resources/upload" encType="multipart/form-data" method="POST" className="form">
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <div className="field">
                  <label>Titlu resursă</label>
                  <input name="title" placeholder="Ex: Checklist documente" />
                </div>
                <div className="field">
                  <label>Acces</label>
                  <select name="access_level" defaultValue="basic">
                    <option value="basic">Essential</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="field">
                  <label>Fișier PDF</label>
                  <input accept="application/pdf" name="file" required type="file" />
                </div>
                <button className="btn primary" type="submit">
                  Încarcă PDF
                </button>
              </form>
            </section>

            <section className="card form">
              <h2>Adaugă link</h2>
              <form action="/api/admin/resources/link" method="POST" className="form">
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <div className="field">
                  <label>Titlu link</label>
                  <input name="title" required />
                </div>
                <div className="field">
                  <label>URL</label>
                  <input name="url" required type="url" />
                </div>
                <div className="field">
                  <label>Acces</label>
                  <select name="access_level" defaultValue="basic">
                    <option value="basic">Essential</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <button className="btn primary" type="submit">
                  Adaugă link
                </button>
              </form>
            </section>
          </div>

          <section className="card form">
            <h2>Resurse atașate</h2>
            {resources.length ? (
              <div className="resource-list">
                {resources.map((resource: { id: string; title: string; resource_type: string; url: string; access_level: string }) => (
                  <div className="resource-row" key={resource.id}>
                    <span>
                      <strong>{resource.title}</strong>
                      <br />
                      <small>{resource.resource_type} · {accessLabel(resource.access_level)}</small>
                    </span>
                    <form action={`/api/admin/resources/${resource.id}/delete`} method="POST">
                      <button className="btn" type="submit">
                        Șterge
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">Nu există resurse atașate încă.</p>
            )}
          </section>

          <section className="card danger-zone">
            <div>
              <span className="eyebrow">Atenție</span>
              <h2>Ștergere definitivă</h2>
              <p className="muted">
                Ștergerea materialului elimină materialul, progresul, favoritele și resursele atașate. Acțiunea nu poate
                fi anulată.
              </p>
            </div>
            <DeleteLessonForm lessonId={lesson.id} lessonTitle={lesson.title} />
          </section>
        </div>
      </section>
    </main>
  );
}
