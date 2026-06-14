with family as (
  select id from public.categories where slug = 'dreptul-familiei' limit 1
), civil as (
  select id from public.categories where slug = 'drept-civil' limit 1
), immigration as (
  select id from public.categories where slug = 'imigratie' limit 1
), penal as (
  select id from public.categories where slug = 'drept-penal' limit 1
)
insert into public.subcategories (category_id, name, slug, description, sort_order) values
((select id from family), 'Divort', 'divort', 'Proceduri, documente si pasi importanti in divort.', 1),
((select id from family), 'Copii si aranjamente parentale', 'copii-si-aranjamente-parentale', 'Child arrangements, contact, rezidenta si responsabilitate parentala.', 2),
((select id from family), 'Calatorii cu minorul', 'calatorii-cu-minorul', 'Acord parental, calatorii in afara UK si restrictii.', 3),
((select id from family), 'Finante dupa separare', 'finante-dupa-separare', 'Bunuri, venituri, pensii si intelegeri financiare.', 4),
((select id from civil), 'Contracte', 'contracte', 'Contracte, clauze, obligatii si riscuri.', 1),
((select id from civil), 'Datorii si recuperari', 'datorii-si-recuperari', 'Datorii, notificari, plati si recuperari.', 2),
((select id from civil), 'Proprietate si locuire', 'proprietate-si-locuire', 'Dispute civile legate de proprietate, chirie si locuire.', 3),
((select id from civil), 'Small claims', 'small-claims', 'Cereri civile cu valoare redusa si pasi practici.', 4),
((select id from immigration), 'Cetatenie', 'cetatenie', 'Naturalizare, aplicatii si documente pentru cetatenie.', 1),
((select id from immigration), 'Spouse Visa', 'spouse-visa', 'Aplicatii pentru parteneri si soti.', 2),
((select id from immigration), 'Family Visa', 'family-visa', 'Aplicatii de familie si documente justificative.', 3),
((select id from immigration), 'Indefinite Leave to Remain', 'indefinite-leave-to-remain', 'ILR, eligibilitate si documente.', 4),
((select id from immigration), 'EU Settlement Scheme', 'eu-settlement-scheme', 'Status, aplicatii si probleme frecvente EUSS.', 5),
((select id from penal), 'Cazier', 'cazier', 'Cazier, DBS, spent si unspent convictions.', 1),
((select id from penal), 'Politie si investigatii', 'politie-si-investigatii', 'Interactiuni cu politia, interviuri si investigatii.', 2),
((select id from penal), 'Instanta penala', 'instanta-penala', 'Proceduri, termene si etape in instanta.', 3)
on conflict (category_id, slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();
