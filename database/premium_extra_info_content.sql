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

update public.lessons
set extra_info = $json$
[
  {
    "question": "Dacă sunt acuzat, înseamnă automat că voi fi condamnat?",
    "answer": "Nu. O acuzație penală reprezintă începutul unei proceduri judiciare, nu dovada vinovăției. Acuzarea trebuie să demonstreze, în fața instanței, că infracțiunea a fost comisă și că există suficiente probe pentru o condamnare. Beneficiați de prezumția de nevinovăție până la pronunțarea unei hotărâri definitive."
  },
  {
    "question": "Ar trebui să explic imediat poliției versiunea mea asupra evenimentelor?",
    "answer": "Este firesc să doriți să vă explicați poziția, însă este recomandat să înțelegeți mai întâi natura acuzațiilor și drepturile pe care le aveți. Declarațiile făcute într-un stadiu incipient pot avea un impact important asupra întregii proceduri, motiv pentru care este prudent să solicitați consiliere juridică înainte de a răspunde la întrebări."
  },
  {
    "question": "Ce se întâmplă dacă poliția îmi confiscă telefonul, laptopul sau alte dispozitive?",
    "answer": "În anumite investigații, autoritățile pot ridica dispozitive electronice pentru examinare, dacă apreciază că acestea conțin probe relevante. Analiza poate dura o perioadă considerabilă, în funcție de complexitatea investigației. Este important să cunoașteți drepturile pe care le aveți în această etapă și posibilitățile de contestare, acolo unde legea le permite."
  },
  {
    "question": "Pot continua să lucrez dacă sunt cercetat pentru o infracțiune?",
    "answer": "Depinde de natura acuzației, de profesia dumneavoastră și de obligațiile contractuale pe care le aveți. În anumite domenii reglementate, o investigație penală poate avea consecințe asupra activității profesionale, chiar înainte de pronunțarea unei hotărâri definitive."
  },
  {
    "question": "Ce înseamnă să fiu eliberat pe cauțiune și ce obligații pot avea?",
    "answer": "Eliberarea pe cauțiune nu înseamnă că procedura s-a încheiat. Pot exista condiții precum prezentarea periodică la poliție, interdicția de a contacta anumite persoane sau restricții privind deplasările. Încălcarea acestor obligații poate avea consecințe importante asupra cazului."
  },
  {
    "question": "Dacă aleg să mă declar vinovat, voi primi automat o pedeapsă mai mică?",
    "answer": "Nu există o regulă aplicabilă în toate cazurile. Modul în care instanța stabilește pedeapsa depinde de numeroși factori, inclusiv de natura infracțiunii, circumstanțele personale și momentul în care este făcută recunoașterea. O astfel de decizie ar trebui luată doar după ce înțelegeți pe deplin implicațiile juridice."
  },
  {
    "question": "Ce greșeli fac cel mai des persoanele acuzate de o infracțiune?",
    "answer": "Printre cele mai frecvente greșeli se numără discutarea cazului cu alte persoane, publicarea de informații pe rețelele sociale, distrugerea unor documente sau mesaje, contactarea presupusei victime fără recomandare juridică și furnizarea unor declarații fără a înțelege consecințele acestora."
  },
  {
    "question": "Dacă sunt achitat, vor rămâne informațiile despre acuzație în evidențele autorităților?",
    "answer": "Situația diferă în funcție de tipul evidențelor și de circumstanțele fiecărui caz. În anumite situații, informațiile pot continua să existe în registrele autorităților sau pot apărea în verificări specifice, chiar dacă procedura penală s-a încheiat favorabil."
  },
  {
    "question": "Pot călători în afara UK dacă sunt cercetat sau acuzat?",
    "answer": "Depinde de măsurile dispuse în cazul dumneavoastră. Uneori nu există nicio restricție privind deplasările, însă în alte situații instanța sau poliția pot impune condiții care limitează posibilitatea de a părăsi țara. Este recomandat să verificați aceste aspecte înainte de a face orice plan de călătorie."
  },
  {
    "question": "Când ar trebui să contactez un avocat specializat în drept penal?",
    "answer": "Ideal, imediat ce aflați că sunteți investigat, chemat la interviu sau informat că există suspiciuni privind implicarea dumneavoastră într-o infracțiune. Primele decizii luate într-un dosar penal pot influența semnificativ evoluția cazului, iar asistența juridică din timp vă poate ajuta să vă protejați drepturile și să evitați greșeli care pot fi dificil de remediat ulterior."
  }
]$json$::jsonb
where slug in ('am-fost-acuzat-de-o-infractiune-grava', 'acuzat-infractiune-grava')
   or lower(title) like '%acuzat%infracțiune%grav%'
   or lower(title) like '%acuzat%infractiune%grav%';

update public.lessons
set extra_info = $json$
[
  {
    "question": "Dacă mi-a fost înghețat contul bancar, înseamnă că sunt acuzat de o infracțiune?",
    "answer": "Nu. Înghețarea unui cont bancar nu înseamnă automat că veți fi acuzat sau condamnat pentru o infracțiune. În multe situații, autoritățile utilizează această măsură pentru a investiga proveniența fondurilor înainte de a lua o decizie cu privire la eventuale proceduri ulterioare."
  },
  {
    "question": "Pot continua să îmi încasez salariul dacă există un Account Freezing Order?",
    "answer": "Depinde de condițiile impuse prin ordinul emis de instanță și de circumstanțele fiecărui caz. În anumite situații, pot exista posibilități de a solicita acces la fonduri pentru cheltuieli esențiale sau pentru venituri care nu fac obiectul suspiciunilor investigate."
  },
  {
    "question": "Ce tip de documente pot demonstra proveniența legală a banilor?",
    "answer": "Autoritățile analizează întregul traseu al fondurilor, nu doar un singur document. Contractele de muncă, extrasele bancare, facturile, contractele comerciale, documentele fiscale, contractele de vânzare sau alte înscrisuri relevante pot contribui la demonstrarea provenienței legale a banilor."
  },
  {
    "question": "Dacă nu mai am toate documentele justificative, înseamnă că voi pierde banii?",
    "answer": "Nu neapărat. Lipsa unor documente nu conduce automat la confiscarea fondurilor. În funcție de circumstanțe, pot exista și alte mijloace prin care proveniența banilor poate fi explicată și susținută. Cu toate acestea, este recomandat să începeți cât mai repede reconstruirea istoricului financiar."
  },
  {
    "question": "Autoritățile pot îngheța orice sumă aflată în cont?",
    "answer": "Fiecare caz este analizat individual. Măsura trebuie să fie justificată și proporțională cu scopul investigației. Dacă apreciați că ordinul este nejustificat sau afectează în mod disproporționat situația dumneavoastră, există proceduri prin care acesta poate fi contestat."
  },
  {
    "question": "Ce greșeli fac cel mai des persoanele cărora le este înghețat contul?",
    "answer": "Cele mai frecvente greșeli sunt ignorarea corespondenței primite de la autorități, furnizarea incompletă a documentelor, încercarea de a explica situația fără o analiză juridică prealabilă și amânarea solicitării de asistență. Timpul este adesea un factor important în aceste proceduri."
  },
  {
    "question": "Dacă banii provin din activități desfășurate în numerar, îi pot justifica?",
    "answer": "Da, însă poate fi necesară o documentație mai amplă. Activitățile desfășurate legal în numerar nu sunt, prin ele însele, ilegale, însă este important să existe dovezi care să susțină modul în care au fost obținute și utilizate fondurile."
  },
  {
    "question": "Pot contesta un Account Freezing Order înainte ca autoritățile să decidă confiscarea banilor?",
    "answer": "Da. În funcție de circumstanțele cazului, legislația permite contestarea anumitor măsuri dispuse în cadrul procedurii. Este important să acționați rapid și să respectați termenele aplicabile, deoarece acestea pot influența posibilitățile de apărare."
  },
  {
    "question": "Dacă autoritățile decid confiscarea banilor, cazul este definitiv închis?",
    "answer": "Nu întotdeauna. În funcție de situația concretă și de hotărârea pronunțată, pot exista căi de atac sau alte demersuri juridice disponibile. Opțiunile diferă de la un caz la altul și trebuie analizate individual."
  },
  {
    "question": "Când este recomandat să contactez un avocat într-un caz POCA?",
    "answer": "Imediat ce aflați despre înghețarea contului, reținerea banilor sau solicitarea unor explicații privind proveniența fondurilor. Cu cât analiza juridică începe mai devreme, cu atât există mai multe posibilități de a pregăti documentația necesară și de a răspunde eficient solicitărilor autorităților."
  }
]$json$::jsonb
where slug in ('conturi-inghetate-si-bani-retinuti-in-uk-poca', 'conturi-inghetate-poca', 'bani-retinuti-poca')
   or lower(title) like '%conturi%înghețate%'
   or lower(title) like '%conturi%inghetate%'
   or lower(title) like '%poca%'
   or lower(title) like '%account freezing%';

update public.lessons
set extra_info = $json$
[
  {
    "question": "Cum pot afla dacă sunt suspect, martor sau doar o persoană de interes în anchetă?",
    "answer": "Faptul că ați fost contactat de poliție nu înseamnă automat că sunteți suspect. Rolul dumneavoastră în cadrul investigației influențează drepturile și obligațiile pe care le aveți, motiv pentru care este important să înțelegeți în ce calitate sunteți chemat înainte de orice discuție sau interviu."
  },
  {
    "question": "Dacă mă prezint voluntar la secția de poliție, pot fi arestat?",
    "answer": "Da, este posibil în anumite circumstanțe. Prezentarea voluntară nu exclude posibilitatea ca poliția să decidă arestarea dacă apreciază că sunt îndeplinite condițiile prevăzute de lege. Din acest motiv, este recomandat să solicitați consiliere juridică înainte de interviu, indiferent dacă ați fost invitat sau obligat să vă prezentați."
  },
  {
    "question": "Poliția mi-a spus că este doar o discuție informală. Ar trebui să tratez situația cu seriozitate?",
    "answer": "Da. Chiar dacă întâlnirea este prezentată ca fiind informală, informațiile pe care le furnizați pot avea relevanță în cadrul investigației. Este important să înțelegeți scopul întâlnirii și consecințele declarațiilor făcute înainte de a răspunde la întrebări."
  },
  {
    "question": "Poate poliția să îmi solicite telefonul mobil sau parola dispozitivului?",
    "answer": "În anumite situații, autoritățile pot solicita acces la dispozitive electronice sau pot ridica aceste dispozitive pentru examinare. Drepturile și obligațiile dumneavoastră depind de natura investigației și de temeiul legal pe care se bazează solicitarea. Este recomandat să înțelegeți implicațiile juridice înainte de a lua o decizie."
  },
  {
    "question": "Ce se întâmplă dacă aleg să nu răspund la întrebările poliției?",
    "answer": "Dreptul la tăcere există în anumite situații, însă exercitarea acestuia poate avea implicații juridice care trebuie înțelese în contextul fiecărui caz. Decizia de a răspunde sau nu la întrebări ar trebui luată după ce ați primit consiliere juridică și ați înțeles natura investigației."
  },
  {
    "question": "Pot discuta cazul meu cu familia, colegii sau pe rețelele sociale?",
    "answer": "Este recomandat să manifestați prudență. Comentariile făcute în spațiul public sau comunicările cu alte persoane pot deveni relevante în cadrul investigației și, în anumite situații, pot afecta desfășurarea procedurilor. În general, este indicat să evitați discutarea detaliilor cazului până când primiți recomandări juridice."
  },
  {
    "question": "Cât timp poate dura o investigație fără ca poliția să decidă dacă mă acuză sau nu?",
    "answer": "Nu există un termen unic aplicabil tuturor cazurilor. Durata unei investigații depinde de complexitatea probelor, numărul persoanelor implicate și natura presupusei infracțiuni. Unele investigații se finalizează rapid, în timp ce altele pot dura luni sau chiar mai mult."
  },
  {
    "question": "Dacă poliția nu mă mai contactează, înseamnă că investigația s-a încheiat?",
    "answer": "Nu neapărat. Lipsa comunicării nu înseamnă automat că dosarul a fost închis. În unele situații, investigațiile continuă fără ca persoanele implicate să primească actualizări periodice. Dacă aveți nelămuriri cu privire la stadiul cazului, este recomandat să solicitați consiliere juridică."
  },
  {
    "question": "Ce greșeli fac cel mai des persoanele contactate de poliție?",
    "answer": "Printre cele mai frecvente greșeli se numără prezentarea la interviu fără pregătire, presupunerea că situația este lipsită de importanță, furnizarea unor explicații incomplete sau contradictorii, ștergerea mesajelor ori documentelor relevante și discutarea cazului cu persoane care ar putea deveni martori."
  },
  {
    "question": "Când este momentul potrivit să contactez un avocat?",
    "answer": "Cel mai bun moment este înainte de primul interviu sau de prima discuție cu poliția. Chiar dacă apreciați că nu ați făcut nimic greșit, înțelegerea drepturilor și obligațiilor dumneavoastră de la început poate influența semnificativ modul în care evoluează investigația și vă poate ajuta să evitați consecințe nedorite."
  }
]$json$::jsonb
where slug in ('m-a-contactat-politia-ce-trebuie-sa-fac', 'm-a-contactat-politia')
   or lower(title) like '%contactat%poliția%'
   or lower(title) like '%contactat%politia%';
