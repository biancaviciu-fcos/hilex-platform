import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { FavoriteHeartButton } from "@/components/FavoriteHeartButton";

export type EssentialVideoMaterial = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_provider: string | null;
  video_asset_id: string | null;
  video_playback_id: string | null;
  categoryName: string;
  categorySlug: string;
  isFavorite: boolean;
};

export function EssentialVideoGrid({ materials }: { materials: EssentialVideoMaterial[] }) {
  return (
    <div className="essential-video-grid" id="materiale">
      {materials.map(material => (
        <article className="essential-video-card" key={material.id}>
          <Link className="essential-video-image" href={`/essential/materiale/${material.slug}`} aria-label={`Vizionează: ${material.title}`}>
            {material.thumbnail_url && <img alt="" src={material.thumbnail_url} loading="lazy" />}
            <span className="essential-play-icon"><Play size={20} fill="currentColor" strokeWidth={1.5} /></span>
          </Link>
          <div className="essential-video-category">{material.categoryName}</div>
          <h3><Link href={`/essential/materiale/${material.slug}`}>{material.title}</Link></h3>
          <div className="essential-video-actions">
            <FavoriteHeartButton initialIsFavorite={material.isFavorite} lessonId={material.id} variant="essential" />
            <Link href={`/essential/materiale/${material.slug}`}>Vizionează <ArrowRight size={18} /></Link>
          </div>
        </article>
      ))}
    </div>
  );
}
