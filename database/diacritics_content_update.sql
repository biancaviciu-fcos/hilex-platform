update public.categories set
  name = 'Imigrație',
  description = 'Vize, cetățenie, statut, familie și aplicații în UK.',
  updated_at = now()
where slug = 'imigratie';

update public.categories set
  description = 'Divorț, copii, acord parental și aranjamente familiale.',
  updated_at = now()
where slug = 'dreptul-familiei';

update public.categories set
  description = 'Contracte, datorii, proprietate, răspundere și litigii civile.',
  updated_at = now()
where slug = 'drept-civil';

update public.categories set
  description = 'Cazier, acuzații, proceduri și efecte juridice.',
  updated_at = now()
where slug = 'drept-penal';

update public.subcategories set name = 'Divorț', description = 'Proceduri, documente și pași importanți în divorț.', updated_at = now()
where slug = 'divort';

update public.subcategories set description = 'Child arrangements, contact, rezidență și responsabilitate parentală.', updated_at = now()
where slug = 'copii-si-aranjamente-parentale';

update public.subcategories set name = 'Călătorii cu minorul', description = 'Acord parental, călătorii în afara UK și restricții.', updated_at = now()
where slug = 'calatorii-cu-minorul';

update public.subcategories set name = 'Finanțe după separare', description = 'Bunuri, venituri, pensii și înțelegeri financiare.', updated_at = now()
where slug = 'finante-dupa-separare';

update public.subcategories set description = 'Contracte, clauze, obligații și riscuri.', updated_at = now()
where slug = 'contracte';

update public.subcategories set name = 'Datorii și recuperări', description = 'Datorii, notificări, plăți și recuperări.', updated_at = now()
where slug = 'datorii-si-recuperari';

update public.subcategories set description = 'Dispute civile legate de proprietate, chirie și locuire.', updated_at = now()
where slug = 'proprietate-si-locuire';

update public.subcategories set name = 'Cetățenie', description = 'Naturalizare, aplicații și documente pentru cetățenie.', updated_at = now()
where slug = 'cetatenie';

update public.subcategories set description = 'Aplicații pentru parteneri și soți.', updated_at = now()
where slug = 'spouse-visa';

update public.subcategories set description = 'Aplicații de familie și documente justificative.', updated_at = now()
where slug = 'family-visa';

update public.subcategories set description = 'Status, aplicații și probleme frecvente EUSS.', updated_at = now()
where slug = 'eu-settlement-scheme';

update public.subcategories set name = 'Poliție și investigații', description = 'Interacțiuni cu poliția, interviuri și investigații.', updated_at = now()
where slug = 'politie-si-investigatii';

update public.subcategories set name = 'Instanța penală', description = 'Proceduri, termene și etape în instanță.', updated_at = now()
where slug = 'instanta-penala';

update public.lessons set
  title = 'Călătoria cu copilul în afara UK: este necesar acordul celuilalt părinte?',
  excerpt = 'Când ai nevoie de acordul celuilalt părinte și ce rol are hotărârea judecătorească.',
  body = '[
    "Aceasta este una dintre cele mai frecvente întrebări în practică și trebuie analizată pornind de la un element cheie: există sau nu o hotărâre judecătorească ce stabilește rezidența copilului.",
    "În situația în care există o astfel de hotărâre, este important să verifici dacă aceasta a fost emisă de o instanță din UK.",
    "Dacă ai un Child Arrangements Order emis în UK, care confirmă că minorul locuiește cu tine, în mod obișnuit ai dreptul să călătorești cu copilul în afara UK pentru o perioadă de până la 28 de zile."
  ]'::jsonb,
  key_points = '[
    "Verifică dacă există o hotărâre judecătorească emisă în UK.",
    "Hotărârile din alte țări nu produc automat efecte în UK.",
    "Nu încălca programul de contact fără acordul celuilalt părinte."
  ]'::jsonb,
  updated_at = now()
where slug = 'calatoria-cu-copilul-in-afara-uk';

update public.lessons set
  title = 'Divorțul în UK: pașii principali și documentele necesare',
  excerpt = 'Ce trebuie să știi înainte să începi procedura de divorț.',
  body = '[
    "Procedura de divorț trebuie pregătită corect de la început, mai ales când există copii, bunuri comune sau aspecte internaționale.",
    "Înainte de depunerea cererii, este util să verifici actele de stare civilă, datele partenerului și eventualele documente legate de copii sau bunuri."
  ]'::jsonb,
  key_points = '[
    "Verifică documentele de identitate.",
    "Pregătește certificatul de căsătorie.",
    "Separarea financiară este o discuție distinctă."
  ]'::jsonb,
  updated_at = now()
where slug = 'divortul-in-uk';

update public.lessons set
  title = 'Spouse Visa: condiții esențiale pentru aplicație',
  excerpt = 'Elementele care trebuie probate într-o aplicație de tip spouse visa.',
  body = '[
    "Aplicația de spouse visa este analizată pe mai multe criterii: relația, venitul, cazarea, limba engleză și documentele justificative.",
    "O aplicație puternică trebuie să fie coerentă, completă și susținută cu documente clare."
  ]'::jsonb,
  key_points = '[
    "Dovedește relația reală și continuă.",
    "Verifică pragul financiar.",
    "Include documente de cazare."
  ]'::jsonb,
  updated_at = now()
where slug = 'spouse-visa-conditii-esentiale';

update public.lessons set
  title = 'Contracte civile: clauze pe care trebuie să le înțelegi',
  excerpt = 'Cum citești un contract și ce clauze merită atenție specială.',
  body = '[
    "Un contract trebuie citit ca un set de obligații, termene, riscuri și remedii.",
    "Este important să urmărești clauzele privind plata, încetarea, penalitățile și răspunderea."
  ]'::jsonb,
  key_points = '[
    "Identifică părțile corect.",
    "Verifică termenii de plată.",
    "Citește clauzele de încetare."
  ]'::jsonb,
  updated_at = now()
where slug = 'contracte-civile-clauze';

update public.lessons set
  title = 'Cazierul și impactul asupra vieții profesionale',
  excerpt = 'Când poate conta cazierul și cum poate afecta anumite proceduri.',
  body = '[
    "Cazierul poate avea efecte în mai multe contexte: angajare, imigrație, călătorii sau proceduri administrative.",
    "Impactul depinde de natura faptei, vechimea condamnării și tipul verificării solicitate."
  ]'::jsonb,
  key_points = '[
    "Verifică tipul verificării cerute.",
    "Diferențiază condamnările spent și unspent.",
    "Analizează efectul asupra aplicațiilor de imigrație."
  ]'::jsonb,
  updated_at = now()
where slug = 'cazierul-si-impactul-profesional';
