-- Run this once in Supabase SQL Editor.
-- It creates the extra_info column if needed, then adds Premium-only content for selected materials.

alter table public.lessons
add column if not exists extra_info jsonb not null default '[]'::jsonb;

update public.lessons
set extra_info = $json$
[
  {
    "question": "Pot începe procedura de divorț dacă nu cunosc adresa actuală a soțului meu?",
    "answer": "Da, în anumite situații este posibil să începeți procedura chiar dacă nu cunoașteți adresa actuală a celuilalt soț. Totuși, instanța va dori să vadă că ați făcut demersuri rezonabile pentru a încerca să îl localizați. Dacă acest lucru nu este posibil, există proceduri speciale prin care puteți solicita instanței să permită continuarea divorțului fără notificarea obișnuită."
  },
  {
    "question": "Ce se întâmplă dacă soțul meu refuză să răspundă la cererea de divorț?",
    "answer": "În prezent, divorțul în Anglia și Țara Galilor funcționează pe principiul “no-fault divorce”, ceea ce înseamnă că, în majoritatea cazurilor, celălalt soț nu poate împiedica divorțul doar pentru că nu este de acord cu acesta. Lipsa unui răspuns poate întârzia anumite etape procedurale, însă nu înseamnă automat că divorțul nu poate continua."
  },
  {
    "question": "Pot divorța în UK dacă celălalt soț locuiește într-o altă țară?",
    "answer": "Da. Multe divorțuri implică soți care locuiesc în state diferite. Ceea ce contează este dacă instanțele din Anglia și Țara Galilor au competența de a soluționa cazul, în funcție de domiciliu, reședință sau alte criterii prevăzute de lege. În astfel de situații este important ca documentele să fie comunicate corect în străinătate."
  },
  {
    "question": "Divorțul pronunțat în UK este recunoscut automat în România?",
    "answer": "În multe situații, divorțul poate produce efecte și în România, însă este posibil să fie necesare formalități administrative pentru actualizarea actelor de stare civilă românești. Procedura diferă în funcție de circumstanțele fiecărui caz, motiv pentru care este recomandat să verificați din timp pașii necesari."
  },
  {
    "question": "Pot finaliza divorțul înainte de a ajunge la un acord privind împărțirea bunurilor?",
    "answer": "Da. În practică, divorțul și soluționarea aspectelor financiare sunt două proceduri distincte. Cu toate acestea, este recomandat ca acordul financiar să fie formalizat printr-o hotărâre sau un ordin al instanței, deoarece divorțul, în sine, nu stinge automat toate obligațiile financiare dintre foștii soți."
  },
  {
    "question": "Ce se întâmplă dacă unul dintre soți ascunde bunuri sau venituri?",
    "answer": "Ambele părți au obligația de a face o prezentare completă și sinceră a situației financiare. Dacă instanța constată că informațiile au fost ascunse intenționat, acest lucru poate influența semnificativ soluția finală și poate conduce inclusiv la redeschiderea unor hotărâri sau la aplicarea unor sancțiuni."
  },
  {
    "question": "Cum poate influența divorțul statutul meu de imigrare în UK?",
    "answer": "În anumite situații, dreptul dumneavoastră de ședere poate depinde de relația cu soțul sau partenerul. Dacă baza legală a vizei sau a permisului de ședere este căsătoria, divorțul poate avea consecințe importante asupra statutului de imigrare. Este recomandat să solicitați consiliere juridică înainte de finalizarea divorțului pentru a analiza opțiunile disponibile."
  },
  {
    "question": "Pot modifica ulterior înțelegerea privind aspectele financiare?",
    "answer": "Depinde de natura acordului și de modul în care acesta a fost aprobat de instanță. Unele obligații pot fi modificate dacă apar schimbări semnificative ale situației financiare, în timp ce alte dispoziții sunt definitive. Din acest motiv este important ca orice înțelegere să fie analizată cu atenție înainte de a fi acceptată."
  },
  {
    "question": "Ce greșeli fac cel mai frecvent persoanele care divorțează în UK?",
    "answer": "Printre cele mai întâlnite greșeli se numără semnarea unor acorduri fără consiliere juridică, neglijarea aspectelor financiare, lipsa documentelor justificative, comunicarea conflictuală cu celălalt soț și presupunerea că divorțul rezolvă automat toate problemele privind bunurile sau copiii. O planificare atentă încă de la început poate evita costuri și litigii suplimentare."
  },
  {
    "question": "Când este recomandat să solicit asistență juridică?",
    "answer": "Ideal este să solicitați consultanță încă înainte de depunerea cererii de divorț, mai ales dacă există copii minori, proprietăți comune, afaceri, pensii sau elemente internaționale. Obținerea unei opinii juridice din timp vă poate ajuta să înțelegeți drepturile și obligațiile pe care le aveți și să evitați decizii care ar putea avea consecințe pe termen lung."
  }
]$json$::jsonb
where slug in ('divortul-in-uk', 'divort-in-uk')
   or lower(title) like '%divor%uk%';

update public.lessons
set extra_info = $json$
[
  {
    "question": "Dacă nu am fost căsătoriți, am aceleași drepturi asupra copilului?",
    "answer": "Nu întotdeauna. În UK, drepturile și responsabilitățile parentale nu depind exclusiv de faptul că părinții au fost căsătoriți. În anumite situații, un părinte necăsătorit poate avea nevoie să obțină oficial Parental Responsibility pentru a putea participa la deciziile importante privind educația, sănătatea sau locul de domiciliu al copilului."
  },
  {
    "question": "Poate un părinte să decidă singur unde va locui copilul?",
    "answer": "Nu în mod automat. Dacă ambii părinți au responsabilitate parentală, deciziile importante privind locuința permanentă a copilului ar trebui luate împreună. În lipsa unui acord, instanța poate interveni și poate stabili ce este în interesul superior al copilului."
  },
  {
    "question": "Ce se întâmplă dacă fostul partener nu respectă programul stabilit pentru copil?",
    "answer": "Dacă există un ordin al instanței, acesta trebuie respectat. Încălcarea repetată a programului poate avea consecințe juridice și poate determina instanța să reanalizeze aranjamentele existente. Totuși, înainte de orice demers, este recomandat să încercați soluționarea amiabilă a conflictului."
  },
  {
    "question": "Poate unul dintre părinți să se mute în alt oraș sau în altă țară împreună cu copilul?",
    "answer": "Depinde de circumstanțe. O mutare care afectează semnificativ relația copilului cu celălalt părinte poate necesita acordul acestuia sau aprobarea instanței. Dacă relocarea este internațională, regulile sunt și mai stricte, iar plecarea fără acord poate avea consecințe serioase."
  },
  {
    "question": "Ce ia în considerare instanța atunci când decide ce este în interesul copilului?",
    "answer": "Instanța analizează fiecare caz individual și urmărește în primul rând bunăstarea copilului. Sunt evaluate factori precum nevoile emoționale și educaționale, relația cu fiecare părinte, stabilitatea mediului în care va locui și orice risc care ar putea afecta dezvoltarea copilului."
  },
  {
    "question": "Poate copilul să decidă cu care dintre părinți dorește să locuiască?",
    "answer": "Nu există o vârstă la care copilul decide singur. Dacă are suficientă maturitate, opinia sa poate fi luată în considerare, însă aceasta reprezintă doar unul dintre factorii analizați de instanță. Decizia finală va fi întotdeauna luată în funcție de interesul superior al copilului."
  },
  {
    "question": "Este posibil să modific un Child Arrangements Order dacă situația s-a schimbat?",
    "answer": "Da. Dacă au intervenit schimbări importante în viața copilului sau a părinților, instanța poate modifica ordinul existent. Este necesar să demonstrați că modificarea solicitată servește interesului copilului și că există motive întemeiate pentru schimbarea aranjamentelor actuale."
  },
  {
    "question": "Ce se întâmplă dacă există acuzații de violență domestică sau abuz?",
    "answer": "Instanța tratează cu maximă seriozitate orice acuzație privind siguranța copilului sau a unui părinte. În funcție de dovezile disponibile, pot fi dispuse măsuri speciale privind contactul dintre copil și unul dintre părinți, inclusiv contact supravegheat sau suspendarea temporară a acestuia."
  },
  {
    "question": "Dacă plătesc pensie alimentară, am automat dreptul să îmi văd copilul?",
    "answer": "Nu. Pensia alimentară și dreptul de a avea contact cu copilul sunt două aspecte juridice distincte. Plata sau neplata pensiei alimentare nu determină automat dreptul de vizitare, iar instanța analizează fiecare situație separat."
  },
  {
    "question": "Când este recomandat să solicit asistență juridică într-un litigiu privind copiii?",
    "answer": "Este recomandat să solicitați consiliere juridică imediat ce apar neînțelegeri importante privind locuința copilului, programul de vizitare, relocarea sau responsabilitatea parentală. Intervenția din timp poate preveni escaladarea conflictului și poate contribui la găsirea unei soluții care protejează interesele copilului și drepturile ambilor părinți."
  }
]$json$::jsonb
where slug in ('drepturi-copil-dupa-divort-separare', 'cum-se-stabilesc-drepturile-asupra-copilului')
   or lower(title) like '%drepturile asupra copilului%'
   or lower(title) like '%copilului%divor%separare%';

update public.lessons
set extra_info = $json$
[
  {
    "question": "Pot aplica pentru drept de ședere dacă am avut perioade în care am lipsit din UK?",
    "answer": "Da, însă durata și motivul absențelor pot influența eligibilitatea dumneavoastră. În funcție de tipul aplicației, există limite privind timpul petrecut în afara Regatului Unit. O analiză atentă a istoricului călătoriilor este recomandată înainte de depunerea cererii."
  },
  {
    "question": "Ce se întâmplă dacă aplicația mea este respinsă?",
    "answer": "Un refuz nu înseamnă întotdeauna că nu mai aveți nicio opțiune. În funcție de motivele deciziei, este posibil să puteți solicita o revizuire, să formulați o cale de atac sau să depuneți o nouă aplicație cu documentația completată corespunzător. Este important să nu ignorați termenul-limită menționat în decizia primită."
  },
  {
    "question": "Pot aplica chiar dacă am încălcat anterior condițiile unei vize?",
    "answer": "Depinde de natura încălcării și de circumstanțele fiecărui caz. Unele încălcări pot afecta șansele unei noi aplicații, în timp ce altele pot fi explicate și analizate în context. În astfel de situații, este recomandată o evaluare juridică înainte de depunerea cererii."
  },
  {
    "question": "Cum demonstrez că relația mea este una autentică într-o aplicație bazată pe familie?",
    "answer": "Autoritățile analizează ansamblul dovezilor prezentate, nu doar un singur document. Comunicarea dintre parteneri, documentele financiare comune, dovezile privind locuința și alte elemente relevante pot contribui la demonstrarea caracterului autentic al relației."
  },
  {
    "question": "Ce se întâmplă dacă situația mea se schimbă după ce am depus aplicația?",
    "answer": "În anumite cazuri, schimbările importante — precum schimbarea locului de muncă, a adresei, a statutului familial sau alte modificări relevante — trebuie comunicate autorităților. Nedeclararea unor informații importante poate avea consecințe asupra aplicației."
  },
  {
    "question": "Pot lucra sau studia în timp ce aplicația mea este în curs de soluționare?",
    "answer": "Acest lucru depinde de tipul aplicației și de statutul pe care îl aveți în momentul depunerii acesteia. Drepturile dumneavoastră pe perioada procesării pot varia, motiv pentru care este important să verificați condițiile specifice aplicabile situației dumneavoastră."
  },
  {
    "question": "Ce greșeli duc cel mai frecvent la întârzieri sau refuzuri?",
    "answer": "Printre cele mai întâlnite probleme se numără documentele incomplete, informațiile contradictorii, lipsa dovezilor necesare, utilizarea unor documente expirate sau omiterea unor informații relevante. O aplicație bine pregătită reduce semnificativ riscul unor întârzieri sau solicitări suplimentare din partea autorităților."
  },
  {
    "question": "Dacă primesc drept de ședere, îl pot pierde ulterior?",
    "answer": "Da, în anumite situații. Absențele îndelungate din UK, nerespectarea condițiilor impuse de statutul de imigrare sau alte circumstanțe prevăzute de lege pot afecta dreptul de ședere. Este important să cunoașteți obligațiile care vă revin după aprobarea aplicației."
  },
  {
    "question": "Este recomandat să depun aplicația singur sau cu ajutorul unui avocat?",
    "answer": "Multe persoane depun aplicațiile fără asistență juridică, însă cazurile care implică refuzuri anterioare, situații familiale complexe, perioade de ședere neregulate sau alte elemente sensibile pot beneficia de o analiză juridică înainte de depunere. O pregătire atentă poate reduce riscul unor probleme ulterioare."
  },
  {
    "question": "Când este momentul potrivit să solicit consiliere juridică?",
    "answer": "Ideal este înainte de depunerea aplicației, nu după apariția unui refuz. O evaluare juridică timpurie poate identifica eventualele riscuri, documentele lipsă și opțiunea de imigrare cea mai potrivită pentru situația dumneavoastră, economisind timp și costuri pe termen lung."
  }
]$json$::jsonb
where slug in ('cum-obtii-dreptul-de-sedere-in-uk', 'drept-de-sedere-uk')
   or lower(title) like '%drept%ședere%uk%'
   or lower(title) like '%drept%sedere%uk%';
