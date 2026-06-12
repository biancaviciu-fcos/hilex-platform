import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function updateLesson(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const accessLevel = String(formData.get("access_level") || "basic");
  const status = String(formData.get("status") || "draft");
  const excerpt = String(formData.get("excerpt") || "");
  const videoProvider = String(formData.get("video_provider") || "") || null;
  const videoAssetId = String(formData.get("video_asset_id") || "") || null;
  const videoPlaybackId = String(formData.get("video_playback_id") || "") || null;
  const body = String(formData.get("body") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const keyPoints = String(formData.get("key_points") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  await supabase
    .from("lessons")
    .update({
      title,
      slug,
      access_level: accessLevel,
      status,
      excerpt,
      video_provider: videoProvider,
      video_asset_id: videoAssetId,
      video_playback_id: videoPlaybackId,
      body,
      key_points: keyPoints,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
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

  if (!profile || !["admin", "owner"].includes(profile.role)) redirect("/library");

  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", id).single();
  if (!lesson) notFound();

  const body = Array.isArray(lesson.body) ? lesson.body.join("\n\n") : "";
  const keyPoints = Array.isArray(lesson.key_points) ? lesson.key_points.join("\n") : "";

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Editeaza lectia</h1>
          <p>{lesson.title}</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={updateLesson}>
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
              <label>Acces</label>
              <select name="access_level" defaultValue={lesson.access_level}>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
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
              <label>Descriere scurta</label>
              <textarea name="excerpt" rows={3} defaultValue={lesson.excerpt || ""} />
            </div>
            <div className="field">
              <label>Video provider</label>
              <select name="video_provider" defaultValue={lesson.video_provider || ""}>
                <option value="">Fara video</option>
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
              <label>Text articol, cate un paragraf pe rand</label>
              <textarea name="body" rows={10} defaultValue={body} />
            </div>
            <div className="field">
              <label>Idei cheie, cate una pe rand</label>
              <textarea name="key_points" rows={6} defaultValue={keyPoints} />
            </div>
            <button className="btn primary" type="submit">
              Salveaza
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
