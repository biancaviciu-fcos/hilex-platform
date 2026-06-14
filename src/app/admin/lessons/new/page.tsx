import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { isAdminUser } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadMaterialThumbnail } from "@/lib/thumbnails";

async function createLesson(formData: FormData) {
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

  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "");
  const categoryId = String(formData.get("category_id") || "");
  const subcategoryId = String(formData.get("subcategory_id") || "");
  const accessLevel = String(formData.get("access_level") || "basic");
  const excerpt = String(formData.get("excerpt") || "");
  const thumbnail = formData.get("thumbnail");
  const body = String(formData.get("body") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const keyPoints = String(formData.get("key_points") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const { data: material, error } = await supabase
    .from("lessons")
    .insert({
      title,
      slug,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      access_level: accessLevel,
      excerpt,
      body,
      key_points: keyPoints,
      status: "draft",
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !material) redirect("/admin");

  if (thumbnail instanceof File && thumbnail.size > 0) {
    const thumbnailUrl = await uploadMaterialThumbnail(thumbnail, material.id);

    if (thumbnailUrl) {
      await supabase
        .from("lessons")
        .update({ thumbnail_url: thumbnailUrl, updated_at: new Date().toISOString() })
        .eq("id", material.id);
    }
  }

  redirect("/admin");
}

export default async function NewLessonPage() {
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

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .order("sort_order");

  const { data: subcategories } = await supabase
    .from("subcategories")
    .select("id,name,category_id")
    .order("sort_order");

  return (
    <main className="page">
      <AppHeader />
      <section className="hero">
        <div className="inner">
          <h1>Material nou</h1>
          <p>Adauga un clip, articol sau ghid in biblioteca HILEX.</p>
        </div>
      </section>
      <section className="section">
        <div className="inner">
          <form className="card form" action={createLesson} encType="multipart/form-data">
            <div className="field">
              <label>Titlu</label>
              <input name="title" required />
            </div>
            <div className="field">
              <label>Slug</label>
              <input name="slug" placeholder="ex: calatoria-cu-copilul" required />
            </div>
            <div className="field">
              <label>Categorie</label>
              <select name="category_id" required>
                {(categories || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subcategorie</label>
              <select name="subcategory_id">
                <option value="">Fara subcategorie</option>
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
            </div>
            <div className="field">
              <label>Acces</label>
              <select name="access_level">
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="field">
              <label>Descriere scurta</label>
              <textarea name="excerpt" rows={3} />
            </div>
            <div className="field">
              <label>Thumbnail / imagine de coperta</label>
              <input accept="image/*" name="thumbnail" type="file" />
            </div>
            <div className="field">
              <label>Text articol, cate un paragraf pe rand</label>
              <textarea name="body" rows={8} />
            </div>
            <div className="field">
              <label>Idei cheie, cate una pe rand</label>
              <textarea name="key_points" rows={5} />
            </div>
            <button className="btn primary" type="submit">
              Salveaza draft
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
