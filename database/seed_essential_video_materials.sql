with family as (
  select id from public.categories where slug = 'dreptul-familiei' limit 1
), immigration as (
  select id from public.categories where slug = 'imigratie' limit 1
), civil as (
  select id from public.categories where slug = 'drept-civil' limit 1
), penal as (
  select id from public.categories where slug = 'drept-penal' limit 1
), materials(category_id, title, slug, sort_order) as (
  values
    (
      (select id from civil),
      'Vocea și imaginea ta după plecarea din companie: ce poate folosi angajatorul?',
      'vocea-si-imaginea-ta-dupa-plecarea-din-companie',
      1
    ),
    (
      (select id from penal),
      'Extrădarea din UK: cum funcționează și când poate fi contestată',
      'extradarea-din-uk-cum-functioneaza-si-cand-poate-fi-contestata',
      2
    ),
    (
      (select id from family),
      'Separarea legală în Anglia și Țara Galilor: alternativa la divorț',
      'separarea-legala-in-anglia-si-tara-galilor',
      3
    ),
    (
      (select id from immigration),
      'Divorțul în UK: ce se întâmplă cu statutul tău de imigrație?',
      'divortul-in-uk-statutul-tau-de-imigratie',
      4
    ),
    (
      (select id from civil),
      'Deepfake: ce se întâmplă când AI creează materiale false cu tine?',
      'deepfake-ce-se-intampla-cand-ai-creeaza-materiale-false-cu-tine',
      5
    ),
    (
      (select id from penal),
      'Beneficiile sociale în UK: cum eviți riscul unei investigații pentru fraudă',
      'beneficiile-sociale-in-uk-investigatie-pentru-frauda',
      6
    ),
    (
      (select id from penal),
      'Proceeds of Crime Act: confiscarea banilor și bunurilor provenite din infracțiuni',
      'proceeds-of-crime-act-confiscarea-banilor-si-bunurilor',
      7
    ),
    (
      (select id from immigration),
      'Migranți clandestini în vehicule: amenzi și contestarea lor în UK',
      'migranti-clandestini-in-vehicule-amenzi-si-contestare',
      8
    )
)
insert into public.lessons (
  category_id,
  title,
  slug,
  excerpt,
  body,
  key_points,
  extra_info,
  access_level,
  status,
  duration_minutes,
  thumbnail_url,
  video_provider,
  video_asset_id,
  video_playback_id,
  platform,
  published_at
)
select
  category_id,
  title,
  slug,
  null,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'basic',
  'published',
  null,
  null,
  null,
  null,
  null,
  'essential',
  now() - (sort_order || ' minutes')::interval
from materials
where category_id is not null
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  key_points = excluded.key_points,
  extra_info = excluded.extra_info,
  access_level = excluded.access_level,
  status = excluded.status,
  platform = excluded.platform,
  updated_at = now();
