with family as (
  select id from public.categories where slug = 'dreptul-familiei' limit 1
), immigration as (
  select id from public.categories where slug = 'imigratie' limit 1
), civil as (
  select id from public.categories where slug = 'drept-civil' limit 1
), penal as (
  select id from public.categories where slug = 'drept-penal' limit 1
)
insert into public.lessons (
  category_id,
  title,
  slug,
  excerpt,
  body,
  key_points,
  access_level,
  status,
  duration_minutes,
  published_at
) values
(
  (select id from family),
  'Călătoria cu copilul în afara UK: este necesar acordul celuilalt părinte?',
  'calatoria-cu-copilul-in-afara-uk',
  'Când ai nevoie de acordul celuilalt părinte și ce rol are hotărârea judecătorească.',
  '[
    "Aceasta este una dintre cele mai frecvente întrebări în practică și trebuie analizată pornind de la un element cheie: există sau nu o hotărâre judecătorească ce stabilește rezidența copilului.",
    "În situația în care există o astfel de hotărâre, este important să verifici dacă aceasta a fost emisă de o instanță din UK.",
    "Dacă ai un Child Arrangements Order emis în UK, care confirmă că minorul locuiește cu tine, în mod obișnuit ai dreptul să călătorești cu copilul în afara UK pentru o perioadă de până la 28 de zile."
  ]'::jsonb,
  '[
    "Verifică dacă există o hotărâre judecătorească emisă în UK.",
    "Hotărârile din alte țări nu produc automat efecte în UK.",
    "Nu încălca programul de contact fără acordul celuilalt părinte."
  ]'::jsonb,
  'basic',
  'published',
  12,
  now()
),
(
  (select id from family),
  'Divorțul în UK: pașii principali și documentele necesare',
  'divortul-in-uk',
  'Ce trebuie să știi înainte să începi procedura de divorț.',
  '[
    "Procedura de divorț trebuie pregătită corect de la început, mai ales când există copii, bunuri comune sau aspecte internaționale.",
    "Înainte de depunerea cererii, este util să verifici actele de stare civilă, datele partenerului și eventualele documente legate de copii sau bunuri."
  ]'::jsonb,
  '[
    "Verifică documentele de identitate.",
    "Pregătește certificatul de căsătorie.",
    "Separarea financiară este o discuție distinctă."
  ]'::jsonb,
  'basic',
  'published',
  10,
  now()
),
(
  (select id from immigration),
  'Spouse Visa: condiții esențiale pentru aplicație',
  'spouse-visa-conditii-esentiale',
  'Elementele care trebuie probate într-o aplicație de tip spouse visa.',
  '[
    "Aplicația de spouse visa este analizată pe mai multe criterii: relația, venitul, cazarea, limba engleză și documentele justificative.",
    "O aplicație puternică trebuie să fie coerentă, completă și susținută cu documente clare."
  ]'::jsonb,
  '[
    "Dovedește relația reală și continuă.",
    "Verifică pragul financiar.",
    "Include documente de cazare."
  ]'::jsonb,
  'premium',
  'published',
  18,
  now()
),
(
  (select id from civil),
  'Contracte civile: clauze pe care trebuie să le înțelegi',
  'contracte-civile-clauze',
  'Cum citești un contract și ce clauze merită atenție specială.',
  '[
    "Un contract trebuie citit ca un set de obligații, termene, riscuri și remedii.",
    "Este important să urmărești clauzele privind plata, încetarea, penalitățile și răspunderea."
  ]'::jsonb,
  '[
    "Identifică părțile corect.",
    "Verifică termenii de plată.",
    "Citește clauzele de încetare."
  ]'::jsonb,
  'basic',
  'published',
  9,
  now()
),
(
  (select id from penal),
  'Cazierul și impactul asupra vieții profesionale',
  'cazierul-si-impactul-profesional',
  'Când poate conta cazierul și cum poate afecta anumite proceduri.',
  '[
    "Cazierul poate avea efecte în mai multe contexte: angajare, imigrație, călătorii sau proceduri administrative.",
    "Impactul depinde de natura faptei, vechimea condamnării și tipul verificării solicitate."
  ]'::jsonb,
  '[
    "Verifică tipul verificării cerute.",
    "Diferențiază condamnările spent și unspent.",
    "Analizează efectul asupra aplicațiilor de imigrație."
  ]'::jsonb,
  'premium',
  'published',
  14,
  now()
)
on conflict (slug) do nothing;
