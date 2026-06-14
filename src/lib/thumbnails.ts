import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const THUMBNAIL_BUCKET = "lesson-thumbnails";

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const name = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${name || "thumbnail"}.${extension}`;
}

export async function uploadMaterialThumbnail(file: File, materialId: string) {
  if (!file.size) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("Thumbnail-ul trebuie sa fie o imagine.");
  }

  const supabase = createSupabaseAdminClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket) => bucket.id === THUMBNAIL_BUCKET);

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(THUMBNAIL_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"]
    });

    if (error) throw error;
  }

  const path = `${materialId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
