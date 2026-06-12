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
  'Calatoria cu copilul in afara UK: este necesar acordul celuilalt parinte?',
  'calatoria-cu-copilul-in-afara-uk',
  'Cand ai nevoie de acordul celuilalt parinte si ce rol are hotararea judecatoreasca.',
  '[
    "Aceasta este una dintre cele mai frecvente intrebari in practica si trebuie analizata pornind de la un element cheie: exista sau nu o hotarare judecatoreasca ce stabileste rezidenta copilului.",
    "In situatia in care exista o astfel de hotarare, este important sa verifici daca aceasta a fost emisa de o instanta din UK.",
    "Daca ai un Child Arrangements Order emis in UK, care confirma ca minorul locuieste cu tine, in mod obisnuit ai dreptul sa calatoresti cu copilul in afara UK pentru o perioada de pana la 28 de zile."
  ]'::jsonb,
  '[
    "Verifica daca exista o hotarare judecatoreasca emisa in UK.",
    "Hotararile din alte tari nu produc automat efecte in UK.",
    "Nu incalca programul de contact fara acordul celuilalt parinte."
  ]'::jsonb,
  'basic',
  'published',
  12,
  now()
),
(
  (select id from family),
  'Divortul in UK: pasii principali si documentele necesare',
  'divortul-in-uk',
  'Ce trebuie sa stii inainte sa incepi procedura de divort.',
  '[
    "Procedura de divort trebuie pregatita corect de la inceput, mai ales cand exista copii, bunuri comune sau aspecte internationale.",
    "Inainte de depunerea cererii, este util sa verifici actele de stare civila, datele partenerului si eventualele documente legate de copii sau bunuri."
  ]'::jsonb,
  '[
    "Verifica documentele de identitate.",
    "Pregateste certificatul de casatorie.",
    "Separarea financiara este o discutie distincta."
  ]'::jsonb,
  'basic',
  'published',
  10,
  now()
),
(
  (select id from immigration),
  'Spouse Visa: conditii esentiale pentru aplicatie',
  'spouse-visa-conditii-esentiale',
  'Elementele care trebuie probate intr-o aplicatie de tip spouse visa.',
  '[
    "Aplicatia de spouse visa este analizata pe mai multe criterii: relatia, venitul, cazarea, limba engleza si documentele justificative.",
    "O aplicatie puternica trebuie sa fie coerenta, completa si sustinuta cu documente clare."
  ]'::jsonb,
  '[
    "Dovedeste relatia reala si continua.",
    "Verifica pragul financiar.",
    "Include documente de cazare."
  ]'::jsonb,
  'premium',
  'published',
  18,
  now()
),
(
  (select id from civil),
  'Contracte civile: clauze pe care trebuie sa le intelegi',
  'contracte-civile-clauze',
  'Cum citesti un contract si ce clauze merita atentie speciala.',
  '[
    "Un contract trebuie citit ca un set de obligatii, termene, riscuri si remedii.",
    "Este important sa urmaresti clauzele privind plata, incetarea, penalitatile si raspunderea."
  ]'::jsonb,
  '[
    "Identifica partile corect.",
    "Verifica termenii de plata.",
    "Citeste clauzele de incetare."
  ]'::jsonb,
  'basic',
  'published',
  9,
  now()
),
(
  (select id from penal),
  'Cazierul si impactul asupra vietii profesionale',
  'cazierul-si-impactul-profesional',
  'Cand poate conta cazierul si cum poate afecta anumite proceduri.',
  '[
    "Cazierul poate avea efecte in mai multe contexte: angajare, imigratie, calatorii sau proceduri administrative.",
    "Impactul depinde de natura faptei, vechimea condamnarii si tipul verificarii solicitate."
  ]'::jsonb,
  '[
    "Verifica tipul verificarii cerute.",
    "Diferentiaza condamnarile spent si unspent.",
    "Analizeaza efectul asupra aplicatiilor de imigratie."
  ]'::jsonb,
  'premium',
  'published',
  14,
  now()
)
on conflict (slug) do nothing;
