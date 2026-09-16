update public.lessons
set
  thumbnail_url = '/essential-covers/vocea-si-imaginea-dupa-plecarea-din-companie.png',
  platform = 'essential',
  access_level = 'basic',
  status = 'published',
  updated_at = now()
where lower(title) like lower('%Vocea%imaginea%plecarea%companie%');

delete from public.lessons
where slug = 'vocea-si-imaginea-ta-dupa-plecarea-din-companie'
  and video_asset_id is null
  and video_playback_id is null;

with family as (
  select id from public.categories where slug = 'dreptul-familiei' limit 1
), immigration as (
  select id from public.categories where slug = 'imigratie' limit 1
), civil as (
  select id from public.categories where slug = 'drept-civil' limit 1
), penal as (
  select id from public.categories where slug = 'drept-penal' limit 1
), materials(category_id, title, slug, thumbnail_url, sort_order) as (
  values
    (
      (select id from penal),
      'Extrădarea din UK: cum funcționează și când poate fi contestată',
      'extradarea-din-uk-cum-functioneaza-si-cand-poate-fi-contestata',
      '/essential-covers/extradarea-din-uk.png',
      2
    ),
    (
      (select id from family),
      'Separarea legală în Anglia și Țara Galilor: alternativa la divorț',
      'separarea-legala-in-anglia-si-tara-galilor',
      '/essential-covers/separarea-legala.png',
      3
    ),
    (
      (select id from immigration),
      'Divorțul în UK: ce se întâmplă cu statutul tău de imigrație?',
      'divortul-in-uk-statutul-tau-de-imigratie',
      '/essential-covers/divortul-in-uk-statut-imigratie.png',
      4
    ),
    (
      (select id from civil),
      'Deepfake: ce se întâmplă când AI creează materiale false cu tine?',
      'deepfake-ce-se-intampla-cand-ai-creeaza-materiale-false-cu-tine',
      '/essential-covers/deepfake-ai-materiale-false.png',
      5
    ),
    (
      (select id from penal),
      'Beneficiile sociale în UK: cum eviți riscul unei investigații pentru fraudă',
      'beneficiile-sociale-in-uk-investigatie-pentru-frauda',
      '/essential-covers/beneficiile-sociale-frauda.png',
      6
    ),
    (
      (select id from penal),
      'Proceeds of Crime Act: confiscarea banilor și bunurilor provenite din infracțiuni',
      'proceeds-of-crime-act-confiscarea-banilor-si-bunurilor',
      '/essential-covers/poca-confiscarea-banilor.png',
      7
    ),
    (
      (select id from immigration),
      'Migranți clandestini în vehicule: amenzi și contestarea lor în UK',
      'migranti-clandestini-in-vehicule-amenzi-si-contestare',
      '/essential-covers/migranti-clandestini-vehicule.png',
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
  thumbnail_url,
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
  thumbnail_url = excluded.thumbnail_url,
  platform = excluded.platform,
  updated_at = now();
