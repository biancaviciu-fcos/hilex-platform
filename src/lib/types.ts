export type AccessLevel = "basic" | "premium";
export type ContentStatus = "draft" | "published" | "archived";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string[];
  key_points: string[];
  access_level: AccessLevel;
  status: ContentStatus;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_provider: "cloudflare_stream" | "mux" | "external" | null;
  video_asset_id: string | null;
  video_playback_id: string | null;
  category?: Category;
};
