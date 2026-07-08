import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { canAccessLesson } from "@/lib/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AccessLevel } from "@/lib/types";

type LessonCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  access_level: string;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  categories?: unknown;
};

function relationName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0] as { name?: string } | undefined;
    return first?.name;
  }

  return (value as { name?: string } | null)?.name;
}

function favoriteIds(rows: { lesson_id: string }[] | null) {
  return new Set((rows || []).map((item) => item.lesson_id));
}

const quickFilters = [
  { label: "Familie", href: "/library?category=dreptul-familiei" },
  { label: "Imigrare", href: "/library?category=imigratie" },
  { label: "Penal", href: "/library?category=drept-penal" },
  { label: "Munca", href: "/library?q=munca" },
  { label: "Locuinte", href: "/library?q=locuinte" },
  { label: "HMRC", href: "/library?q=HMRC" },
  { label: "Politie", href: "/library?q=politie" },
  { label: "Business", href: "/library?q=business" },
  { label: "Soferi", href: "/library?q=soferi" }
];

function sortForAccess(lessons: LessonCardData[], userAccess: AccessLevel | null) {
  if (userAccess === "premium") return lessons;

  return [...lessons].sort((first, second) => {
    const firstLocked = !canAccessLesson(userAccess, first.access_level as AccessLevel);
    const secondLocked = !canAccessLesson(userAccess, second.access_level as AccessLevel);

    if (firstLocked === secondLocked) return 0;
    return firstLocked ? 1 : -1;
  });
}

function LessonCard({
  lesson,
  userAccess,
  isFavorite,
  isCompleted,
  next
}: {
  lesson: LessonCardData;
  userAccess: AccessLevel | null;
  isFavorite: boolean;
  isCompleted: boolean;
  next: string;
}) {
  const lessonAccess = lesson.access_level as AccessLevel;
  const locked = !canAccessLesson(userAccess, lessonAccess);
  const categoryName = relationName(lesson.categories);

  return (
    <article className={`lesson-card ${locked ? "locked" : ""}`}>
      <Link className="lesson-card-main" href={`/library/${lesson.slug}`}>
        <div className="lesson-thumb">
          {lesson.thumbnail_url ? <img alt="" src={lesson.thumbnail_url} /> : <span>▶</span>}
          {locked ? (
            <div className="locked-overlay">
              <strong>Premium</strong>
              <small>Fa upgrade la Premium pentru a avea acces</small>
            </div>
          ) : null}
        </div>
        <div className="lesson-content">
          <div className="tag-row">
            <span className={`tag ${lesson.access_level === "premium" ? "premium" : ""}`}>{lesson.access_level}</span>
            {lesson.duration_minutes ? <span className="tag">{lesson.duration_minutes} min</span> : null}
            {categoryName ? <span className="tag">{categoryName}</span> : null}
            {isCompleted ? <span className="tag completed">Parcurs</span> : null}
          </div>
          <h3>{lesson.title}</h3>
          <p className="muted">{lesson.excerpt}</p>
          {locked ? <p className="upgrade-note">Fa upgrade la Premium pentru a avea acces la acest material.</p> : null}
        </div>
      </Link>
      <form action={`/api/favorites/${lesson.id}`} method="POST">
        <input name="next" type="hidden" value={next} />
        <button className={`favorite-btn ${isFavorite ? "active" : ""}`} type="submit">
          {isFavorite ? "Salvat" : "Salveaza pentru mai tarziu"}
        </button>
      </form>
    </article>
  );
}

export default async function LibraryPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string; access?: string; favorites?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const access = params.access === "basic" || params.access === "premium" ? params.access : "";
  const onlyFavorites = params.favorites === "1";
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("access_level,status,current_period_end")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .or(`current_period_end.is.null,current_period_end.gt.${new Date().toISOString()}`)
    .order("access_level", { ascending: false })
    .limit(1)
    .maybeSingle();

  const userAccess = (subscription?.access_level || null) as AccessLevel | null;

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order");

  const selectedCategory = categories?.find((item) => item.slug === category);

  const { data: categoryLessonRows } = await supabase
    .from("lessons")
    .select("category_id")
    .eq("status", "published");

  const categoryCounts = new Map<string, number>();
  (categoryLessonRows || []).forEach((lesson) => {
    if (lesson.category_id) {
      categoryCounts.set(lesson.category_id, (categoryCounts.get(lesson.category_id) || 0) + 1);
    }
  });

  const { data: favorites } = await supabase
    .from("favorite_lessons")
    .select("lesson_id")
    .eq("user_id", user.id);

  const savedIds = favoriteIds(favorites);

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);

  const completedIds = favoriteIds(progressRows);

  let lessonsQuery = supabase
    .from("lessons")
    .select("id,title,slug,excerpt,access_level,duration_minutes,status,thumbnail_url,categories(name,slug)")
    .eq("status", "published");

  if (query) {
    lessonsQuery = lessonsQuery.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
  }

  if (category && selectedCategory) {
    lessonsQuery = lessonsQuery.eq("category_id", selectedCategory.id);
  }

  if (access) {
    lessonsQuery = lessonsQuery.eq("access_level", access);
  }

  const { data: allLessons } = await lessonsQuery.order("published_at", { ascending: false });
  const filteredLessons = onlyFavorites
    ? (allLessons || []).filter((lesson) => savedIds.has(lesson.id))
    : allLessons || [];
  const lessons = sortForAccess(filteredLessons as LessonCardData[], userAccess);
  const next = `/library?${new URLSearchParams({
    ...(query ? { q: query } : {}),
    ...(category ? { category } : {}),
    ...(access ? { access } : {}),
    ...(onlyFavorites ? { favorites: "1" } : {})
  }).toString()}`;

  return (
    <main className="page member-shell">
      <AppHeader />
      <section className="hero library-hero">
        <div className="inner">
          <h1>Resurse HILEX</h1>
          <p>Un centru de soluții juridice practice pentru membri.</p>
          <form className="search-row" action="/library">
            <input
              aria-label="Cauta"
              defaultValue={query}
              name="q"
              placeholder="Cauta dupa tema, categorie sau cuvant cheie"
            />
            <button className="btn primary" type="submit">
              Cauta
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="topic-grid library-topic-grid">
            {(categories || []).map((item) => (
              <Link
                className={`topic-card library-topic-card ${category === item.slug ? "active" : ""}`}
                href={`/library?category=${item.slug}`}
                key={item.id}
              >
                <h3>
                  {item.name} ({categoryCounts.get(item.id) || 0})
                </h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="subcategory-filter">
            <span className="eyebrow">Filtre rapide</span>
            <div className="tag-row">
              {quickFilters.map((item) => (
                <Link className="tag filter-tag" href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <form className="filter-panel library-filter-panel" action="/library">
            <input name="q" type="hidden" value={query} />
            <div className="field">
              <label htmlFor="category">Aria de drept</label>
              <select defaultValue={category} id="category" name="category">
                <option value="">Toate ariile de drept</option>
                {(categories || []).map((item) => (
                  <option key={item.id} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="access">Pachet</label>
              <select defaultValue={access} id="access" name="access">
                <option value="">Basic si Premium</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <label className="checkbox-filter">
              <input defaultChecked={onlyFavorites} name="favorites" type="checkbox" value="1" />
              Doar favorite
            </label>
            <button className="btn primary" type="submit">
              Aplica
            </button>
            <Link className="btn" href="/library">
              Reseteaza
            </Link>
          </form>

          <div className="section-title">
            <div>
              <h2>Materiale disponibile</h2>
              <p className="muted">{lessons.length} rezultate</p>
            </div>
          </div>

          <div className="lesson-grid">
            {lessons.map((lesson) => (
              <LessonCard
                isFavorite={savedIds.has(lesson.id)}
                isCompleted={completedIds.has(lesson.id)}
                key={lesson.id}
                lesson={lesson}
                next={next}
                userAccess={userAccess}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
