"use strict";
const sectors = [
  {
    id: "weltbilder",
    name: "Archiv der Weltbilder",
    icon: "◉",
    color: "#f7b95e",
    x: 0.25,
    y: 0.2,
    image: "assets/scenes/weltbilder.webp",
    scene:
      "Im historischen Archiv konkurrieren zwei Himmelsmaschinen. Nur eine Kette aus Beobachtung, Modell und Erklärung öffnet den Datenkern.",
    tasks: [
      {
        taskId: "retrograd",
        type: "choice",
        question:
          "Welche Aussage beschreibt die rückläufige Marsbewegung fachlich sauber?",
        options: [
          "Mars kehrt auf seiner Bahn tatsächlich um.",
          "Mars erscheint vor dem Fixsternhintergrund zeitweise rückläufig, weil die Erde ihn auf ihrer inneren Bahn überholt.",
          "Ein Epizykel beweist, dass die Erde ruht.",
          "Die Rückläufigkeit kann nur durch die ART erklärt werden.",
        ],
        answer: 1,
        hint: "Unterscheidet beobachtete Bewegung am Himmel und reale Bahnbewegung.",
      },
      {
        taskId: "evidence-chain",
        type: "sequence",
        question:
          "Ordnet die Entwicklung vom Datenfund zur physikalischen Erklärung.",
        items: [
          "Newton: Gravitation erklärt die Bahnen",
          "Tycho Brahe: präzise Positionsdaten",
          "Bessel: Sternparallaxe gemessen",
          "Kepler: Ellipsen aus Daten",
        ],
        answer: [
          "Tycho Brahe: präzise Positionsdaten",
          "Kepler: Ellipsen aus Daten",
          "Newton: Gravitation erklärt die Bahnen",
          "Bessel: Sternparallaxe gemessen",
        ],
        hint: "Daten → mathematische Beschreibung → physikalische Erklärung → später direkter Nachweis der Erdbewegung.",
      },
      {
        taskId: "model-claim",
        type: "choice",
        question:
          "Warum war das geozentrische Modell nicht einfach „unwissenschaftlicher Unsinn“?",
        options: [
          "Es erklärte mit Zusatzkonstruktionen viele beobachtete Planetenpositionen, wurde aber kompliziert und besaß keine überzeugende Dynamik.",
          "Es sagte alle Messungen genauer voraus als Kepler.",
          "Epizykel sind grundsätzlich verboten.",
          "Es beruhte ausschließlich auf Religion.",
        ],
        answer: 0,
        hint: "Bewertet ein Modell danach, was es erklären und vorhersagen konnte – in seinem historischen Kontext.",
      },
      {
        taskId: "venus-phases",
        type: "choice",
        question:
          "Galilei beobachtete bei der Venus nahezu alle Phasen sowie deutliche Größenänderungen. Welche Folgerung wird dadurch besonders gestützt?",
        options: [
          "Die Venus kreist ausschließlich um die Erde.",
          "Die Venus umläuft die Sonne; ihre Beleuchtungsgeometrie ändert sich dabei.",
          "Alle Planeten bewegen sich auf perfekten Kreisen.",
          "Die Erde steht sicher im Mittelpunkt des Universums.",
        ],
        answer: 1,
        hint: "Überlegt, auf welcher Seite der Sonne Venus bei einer fast voll beleuchteten Phase stehen muss.",
      },
      {
        taskId: "tycho-model",
        type: "choice",
        question: "Was kennzeichnet Tycho Brahes geoheliozentrisches Modell?",
        options: [
          "Alle Körper einschließlich der Sonne kreisen direkt um die Erde.",
          "Die Erde kreist um die Sonne, alle anderen Planeten um die Erde.",
          "Die Planeten kreisen um die Sonne, während die Sonne die ruhende Erde umläuft.",
          "Es verwendet bereits Keplers Ellipsen und Newtons Gravitation.",
        ],
        answer: 2,
        hint: "Tycho verband eine ruhende Erde mit Planetenbahnen um die Sonne.",
      },
      {
        taskId: "copernicus-circles",
        type: "choice",
        question:
          "Welche Einschränkung besaß das ursprüngliche kopernikanische Modell?",
        options: [
          "Kopernikus verwendete Ellipsen, aber keine Beobachtungsdaten.",
          "Kopernikus hielt an gleichförmigen Kreisbewegungen fest und benötigte weiterhin Epizykel.",
          "Es konnte die Reihenfolge der Planeten nicht angeben.",
          "Es erklärte die Rückläufigkeit nur mit der ART.",
        ],
        answer: 1,
        hint: "Ellipsenbahnen wurden erst durch Kepler eingeführt.",
      },
    ],
  },
  {
    id: "kepler",
    name: "Kepler-Observatorium",
    icon: "⬭",
    color: "#5ab6ff",
    x: 0.66,
    y: 0.18,
    image: "assets/scenes/kepler.webp",
    scene:
      "Das Planetarium läuft unrund. Drei Gesetze müssen wieder in die Steuerung geladen werden.",
    tasks: [
      {
        taskId: "focus",
        type: "choice",
        question:
          "Welche Aussage entspricht dem 1. Keplerschen Gesetz für eine elliptische Planetenbahn?",
        options: [
          "Ellipse, Sonne außerhalb der Bahn",
          "Ellipse, Sonne in einem Brennpunkt",
          "Ellipse, Sonne im Mittelpunkt",
          "Beliebige Kurve, Sonne außerhalb",
        ],
        answer: 1,
        hint: "Eine Ellipse besitzt zwei Brennpunkte. Die Sonne sitzt nicht im geometrischen Mittelpunkt.",
      },
      {
        taskId: "mars-period",
        type: "number",
        question:
          "Für die Erde gilt T = 1 a und a = 1 AE. Mars besitzt a = 1,52 AE. Berechnet mit (T / 1 Jahr)² = (a / 1 AE)³ die Umlaufzeit in Jahren (auf zwei Dezimalen).",
        answer: 1.87,
        tolerance: 0.03,
        unit: "a",
        hint: "T = √(a³). Setzt 1,52 für a ein.",
      },
      {
        taskId: "equal-areas",
        type: "choice",
        question: "Was besagt das 2. Keplersche Gesetz?",
        options: [
          "In gleichen Zeiten überstreicht die Verbindungslinie Sonne–Planet gleich große Flächen.",
          "Alle Planeten legen in gleichen Zeiten gleiche Wege zurück.",
          "Die Bahngeschwindigkeit ist überall konstant.",
          "Die Sonne liegt im Mittelpunkt jeder Ellipse.",
        ],
        answer: 0,
        hint: "Vergleicht Flächen, nicht Weglängen oder Winkel.",
      },
      {
        taskId: "perihelion-speed",
        type: "choice",
        question:
          "Ein Planet bewegt sich vom Aphel zum Perihel. Wie verändert sich seine Bahngeschwindigkeit?",
        options: [
          "Sie nimmt ab.",
          "Sie bleibt konstant.",
          "Sie nimmt zu und ist im Perihel am größten.",
          "Sie wird im Perihel null.",
        ],
        answer: 2,
        hint: "Gleiche Flächen in gleichen Zeiten: In Sonnennähe muss der Planet einen längeren Bahnbogen durchlaufen.",
      },
      {
        taskId: "jupiter-period",
        type: "number",
        question:
          "Jupiter besitzt eine große Halbachse von ungefähr 5,20 AE. Berechnet mit (T / 1 Jahr)² = (a / 1 AE)³ seine Umlaufzeit in Jahren (auf zwei Dezimalen).",
        answer: 11.86,
        tolerance: 0.08,
        unit: "a",
        hint: "Berechnet T = √(5,20³).",
      },
      {
        taskId: "kepler-laws-order",
        type: "sequence",
        question:
          "Ordnet den drei Keplerschen Gesetzen ihre Aussagen in der Reihenfolge 1 → 2 → 3 zu.",
        items: [
          "T² ist proportional zu a³",
          "Gleiche Flächen in gleichen Zeiten",
          "Ellipse mit der Sonne in einem Brennpunkt",
        ],
        answer: [
          "Ellipse mit der Sonne in einem Brennpunkt",
          "Gleiche Flächen in gleichen Zeiten",
          "T² ist proportional zu a³",
        ],
        hint: "Zuerst Bahnform, dann Flächensatz, dann Zusammenhang zwischen Umlaufzeit und Bahngröße.",
      },
    ],
  },
  {
    id: "exoplaneten",
    name: "Exoplaneten-Labor",
    icon: "◌",
    color: "#4fe0d0",
    x: 0.79,
    y: 0.56,
    image: "assets/scenes/exoplaneten.webp",
    scene:
      "Ein fremdes Signal wurde als „zweite Erde“ gemeldet. Prüft die Daten, bevor AION die Nachricht sendet.",
    tasks: [
      {
        taskId: "transit",
        type: "choice",
        diagram: "transit",
        question:
          "Welche Lichtkurve spricht am ehesten für einen periodisch vorbeiziehenden Planeten?",
        options: [
          "A: einzelne unregelmäßige Ausreißer",
          "B: regelmäßig wiederkehrende, ähnlich tiefe Helligkeitsabfälle",
          "C: dauerhaft linear steigende Helligkeit",
          "D: völlig konstante Helligkeit",
        ],
        answer: 1,
        hint: "Ein Umlauf erzeugt wiederkehrende Transits in annähernd gleichen Zeitabständen.",
      },
      {
        taskId: "radial",
        type: "choice",
        question:
          "Was wird bei der Radialgeschwindigkeitsmethode direkt beobachtet?",
        options: [
          "Das Foto der Planetenoberfläche",
          "Die periodische Dopplerverschiebung der Spektrallinien des Sterns",
          "Die Temperatur des Planetenkerns",
          "Ein Funksignal des Planeten",
        ],
        answer: 1,
        hint: "Der Planet bleibt meist unsichtbar. Gemessen wird die Bewegung des Sterns um den gemeinsamen Schwerpunkt.",
      },
      {
        taskId: "habitable",
        type: "choice",
        question:
          "Welche Schlussfolgerung ist aus „Planet liegt in der habitablen Zone“ zulässig?",
        options: [
          "Auf ihm existiert sicher Leben.",
          "An seiner Oberfläche herrscht sicher Erdtemperatur.",
          "Bei geeigneter Atmosphäre könnte flüssiges Wasser möglich sein; Bewohnbarkeit ist damit nicht bewiesen.",
          "Er besitzt automatisch Sauerstoff.",
        ],
        answer: 2,
        hint: "Die habitable Zone ist eine notwendige Orientierung, aber keine Lebensgarantie.",
      },
      {
        taskId: "transit-depth",
        type: "number",
        question:
          "Bei einem Transit sinkt die Sternhelligkeit um 1 %. Näherungsweise gilt ΔI/I = (Rₚ/R★)². Bestimmt das Verhältnis Rₚ/R★.",
        answer: 0.1,
        tolerance: 0.01,
        unit: "",
        hint: "1 % = 0,01. Zieht anschließend die Quadratwurzel.",
      },
      {
        taskId: "radial-limit",
        type: "choice",
        question:
          "Welche Grenze besitzt die Radialgeschwindigkeitsmethode ohne bekannte Bahnneigung?",
        options: [
          "Sie liefert nur eine Mindestmasse, weil nur die Geschwindigkeitskomponente entlang der Sichtlinie gemessen wird.",
          "Sie kann keinerlei Masse abschätzen.",
          "Sie misst den Planetenradius direkt.",
          "Sie funktioniert nur im Sonnensystem.",
        ],
        answer: 0,
        hint: "Eine unbekannte Neigung kann die gemessene Geschwindigkeitskomponente verkleinern.",
      },
      {
        taskId: "methods-combine",
        type: "choice",
        question:
          "Ein Planet wird sowohl per Transit als auch per Radialgeschwindigkeit nachgewiesen. Welcher zusätzliche Erkenntnisgewinn ist möglich?",
        options: [
          "Aus Radius und Masse lässt sich die mittlere Dichte abschätzen.",
          "Damit ist Leben bewiesen.",
          "Die Oberflächenfarbe ist eindeutig bekannt.",
          "Die Atmosphäre besteht sicher aus Sauerstoff.",
        ],
        answer: 0,
        hint: "Transit liefert vor allem einen Radius, Radialgeschwindigkeit eine Masseninformation.",
      },
    ],
  },
  {
    id: "unsichtbar",
    name: "Das unsichtbare Universum",
    icon: "◍",
    color: "#a67cff",
    x: 0.48,
    y: 0.82,
    image: "assets/scenes/unsichtbar.webp",
    scene:
      "Sterne bewegen sich in AIONs Galaxienmodell zu schnell. Eine unsichtbare Massenkarte muss rekonstruiert werden.",
    tasks: [
      {
        taskId: "rotation",
        type: "choice",
        diagram: "rotation",
        question:
          "Was ist der zentrale Befund flacher Galaxien-Rotationskurven?",
        options: [
          "Außensterne stehen still.",
          "Die Umlaufgeschwindigkeit fällt deutlich stärker als aus sichtbarer Materie erwartet.",
          "Außensterne bewegen sich schneller als durch die sichtbare Massenverteilung erwartet.",
          "Sie beweisen direkt ein bestimmtes Dunkle-Materie-Teilchen.",
        ],
        answer: 2,
        hint: "Vergleicht erwartete und beobachtete Geschwindigkeit im Außenbereich – und trennt Befund von Deutung.",
      },
      {
        taskId: "matter-status",
        type: "choice",
        question: "Welche Aussage entspricht dem heutigen Erkenntnisstand?",
        options: [
          "Dunkle Materie ist einfach kaltes, nicht leuchtendes Gas.",
          "Ihre gravitative Wirkung ist durch mehrere unabhängige Beobachtungen gestützt; ihre mikroskopische Natur ist ungeklärt.",
          "Dunkle Materie und Schwarze Löcher sind dasselbe.",
          "Gravitationslinsen sind optische Fehler.",
        ],
        answer: 1,
        hint: "Wir kennen starke indirekte Evidenz, aber noch keine bestätigte Teilchenidentität.",
      },
      {
        taskId: "core-expansion",
        type: "choice",
        question:
          "Was bedeutet „Urknall“ im heutigen kosmologischen Modell am ehesten?",
        options: [
          "Materie explodierte von einem Mittelpunkt in einen bereits vorhandenen leeren Raum.",
          "Das frühe Universum befand sich in einem extrem heißen, dichten Zustand; seitdem expandiert der Raum.",
          "Eine Galaxie explodierte und erzeugte alle anderen Galaxien.",
          "Der Urknall fand an einer heute bekannten Stelle statt.",
        ],
        answer: 1,
        hint: "Es geht um die Expansion des Raums, nicht um eine Explosion an einem Ort im Raum.",
      },
      {
        taskId: "core-cmb",
        type: "choice",
        question:
          "Welche Beobachtung stützt das Modell eines frühen heißen Universums besonders?",
        options: [
          "Die nahezu isotrope kosmische Mikrowellen-Hintergrundstrahlung mit etwa 2,7 K",
          "Die Jahreszeiten auf der Erde",
          "Die tägliche Bewegung der Sonne",
          "Die Existenz von Epizykeln",
        ],
        answer: 0,
        hint: "Gesucht ist eine Reststrahlung, die aus allen Richtungen nahezu gleich ankommt.",
      },
      {
        taskId: "lensing-mass",
        type: "choice",
        question:
          "Ein Galaxienhaufen lenkt Hintergrundlicht stärker ab, als seine sichtbare Materie erwarten lässt. Was folgt zunächst?",
        options: [
          "Die Masseverteilung enthält mehr gravitative Masse als sichtbar erfasst.",
          "Ein bestimmtes Dunkle-Materie-Teilchen ist direkt fotografiert.",
          "Die ART ist dadurch widerlegt.",
          "Der Haufen enthält keine Sterne.",
        ],
        answer: 0,
        hint: "Gravitationslinsen messen eine Wirkung der gesamten Masse; die Teilchenart bleibt offen.",
      },
      {
        taskId: "cmb-fluctuations",
        type: "choice",
        question:
          "Warum sind die kleinen Temperaturfluktuationen der kosmischen Hintergrundstrahlung bedeutsam?",
        options: [
          "Sie zeigen geringe Dichteunterschiede, aus denen sich später großräumige Strukturen entwickeln konnten.",
          "Sie markieren das Zentrum des Universums.",
          "Sie sind Bilder einzelner heutiger Galaxien.",
          "Sie beweisen, dass das Universum überall exakt gleich ist.",
        ],
        answer: 0,
        hint: "Kleine frühe Unterschiede dienen als Keime späterer Strukturen.",
      },
    ],
  },
  {
    id: "horizont",
    name: "Der Horizont",
    icon: "●",
    color: "#ff8a58",
    x: 0.19,
    y: 0.64,
    image: "assets/scenes/horizont.webp",
    scene:
      "Am Rand eines Schwarzen Lochs laufen Uhren auseinander. Im letzten Archiv muss gesichertes Wissen von Spekulation getrennt werden.",
    tasks: [
      {
        taskId: "eht",
        type: "choice",
        question: "Was zeigt ein EHT-Bild eines Schwarzen Lochs?",
        options: [
          "Die Singularität als schwarze Kugel",
          "Den Schattenbereich vor leuchtendem Plasma; Lichtwege werden durch starke Gravitation geprägt",
          "Hawking-Strahlung als hellen Ring",
          "Die Oberfläche des Ereignishorizonts",
        ],
        answer: 1,
        hint: "Beobachtet wird Strahlung aus der Umgebung und ein dunkler Schatten – nicht die Singularität selbst.",
      },
      {
        taskId: "certainty",
        type: "choice",
        question:
          "Welche Aussage trennt gesicherten Befund und offene Forschung korrekt?",
        options: [
          "Hawking-Strahlung wurde bei astrophysikalischen Schwarzen Löchern bereits direkt gemessen.",
          "Gravitationswellen und Schwarze Löcher sind stark beobachtungsbasiert bestätigt; Hawking-Strahlung ist theoretisch begründet, aber astrophysikalisch noch nicht direkt nachgewiesen.",
          "Das Innere eines Schwarzen Lochs ist vollständig beobachtet.",
          "Ein Multiversum folgt zwingend aus dem EHT-Bild.",
        ],
        answer: 1,
        hint: "Fragt bei jeder Aussage: direkt beobachtet, indirekt erschlossen, theoretisch vorhergesagt oder spekulativ?",
      },
      {
        taskId: "core-equivalence",
        type: "choice",
        question:
          "Welche Aussage trifft das Äquivalenzprinzip der ART am besten?",
        options: [
          "Gravitation und Beschleunigung sind überall und über beliebig große Räume identisch.",
          "In einem hinreichend kleinen abgeschlossenen Labor sind ein homogenes Gravitationsfeld und gleichförmige Beschleunigung lokal nicht unterscheidbar.",
          "Nur Licht reagiert auf Gravitation.",
          "Träge und schwere Masse haben verschiedene Einheiten.",
        ],
        answer: 1,
        hint: "Das Prinzip ist lokal formuliert. Gezeitenkräfte können ausgedehnte Gravitationsfelder verraten.",
      },
      {
        taskId: "event-horizon",
        type: "choice",
        question: "Was ist der Ereignishorizont eines Schwarzen Lochs?",
        options: [
          "Eine feste materielle Oberfläche.",
          "Eine Grenze der Raumzeit, aus deren Innerem kein Lichtsignal zu weit entfernten Beobachtern gelangen kann.",
          "Der Ort, an dem jede Materie sofort verschwindet.",
          "Ein leuchtender Ring aus Hawking-Strahlung.",
        ],
        answer: 1,
        hint: "Der Horizont ist eine kausale Grenze, keine feste Schale.",
      },
      {
        taskId: "time-dilation",
        type: "choice",
        question:
          "Zwei baugleiche Uhren ruhen in unterschiedlichen Abständen außerhalb derselben kugelförmigen Masse. Was sagt die ART beim Vergleich voraus?",
        options: [
          "Die massenahe Uhr läuft relativ zur weiter entfernten Uhr langsamer.",
          "Beide laufen immer exakt gleich.",
          "Die massenahe Uhr läuft schneller.",
          "Nur mechanische Uhren sind betroffen.",
        ],
        answer: 0,
        hint: "Gravitative Zeitdilatation betrifft alle physikalischen Prozesse, nicht nur ein Uhrwerk.",
      },
      {
        taskId: "black-hole-size",
        type: "choice",
        question:
          "Wie verändert sich bei einem nicht rotierenden Schwarzen Loch der Schwarzschildradius, wenn seine Masse verdoppelt wird?",
        options: [
          "Er halbiert sich.",
          "Er bleibt gleich.",
          "Er verdoppelt sich.",
          "Er vervierfacht sich.",
        ],
        answer: 2,
        hint: "Für den Schwarzschildradius gilt rₛ = 2GM/c².",
      },
    ],
  },
];
const bonusTasks = [
  {
    taskId: "bonus-cmb",
    type: "choice",
    question:
      "Zwei Modelle konkurrieren: A erwartet ein kaltes, ewiges Universum; B einen frühen heißen Zustand. Welcher Messbefund unterscheidet sie am stärksten?",
    options: [
      "Jahreszeiten auf der Erde",
      "Nahezu isotrope Mikrowellenstrahlung mit etwa 2,7 K und kleinen Fluktuationen",
      "Die tägliche Sonnenbewegung",
      "Ein einzelner Exoplanet",
    ],
    answer: 1,
    hint: "Gesucht ist eine universelle Reststrahlung.",
    reflection:
      "Begründet in 2–3 Sätzen, warum dieser Befund Modell B stützt, es aber nicht als „endgültige Wahrheit“ beweist.",
  },
  {
    taskId: "bonus-expansion",
    type: "choice",
    question:
      "In einem Spektrum wachsen Rotverschiebungen im Mittel mit der Entfernung. Welche Deutung passt zum Standardmodell?",
    options: [
      "Explosion von einem Mittelpunkt im Raum",
      "Expansion des Raums zwischen weit entfernten, nicht gebundenen Strukturen",
      "Alle Atome werden größer",
      "Nur die Milchstraße wächst",
    ],
    answer: 1,
    hint: "Expansion des Raums – nicht Explosion an einem Ort im Raum.",
    reflection:
      "Formuliert eine Erklärung, die ausdrücklich den verbreiteten Fehler „Explosion in leeren Raum“ vermeidet.",
  },
  {
    taskId: "bonus-drake",
    type: "choice",
    question:
      "Zwei Teams erhalten mit der Drake-Gleichung 0,2 bzw. 20 000 Zivilisationen. Was folgt daraus?",
    options: [
      "Eines der Teams muss sich verrechnet haben.",
      "Unterschiedliche, stark unsichere Annahmen können die Ergebnisse drastisch verändern.",
      "Die größere Zahl ist automatisch richtiger.",
      "Die Gleichung ist eine Messung.",
    ],
    answer: 1,
    hint: "Prüft die unsicheren Faktoren, nicht nur das Endergebnis.",
    reflection:
      "Nennt zwei besonders unsichere Faktoren und erklärt, welche zusätzliche Beobachtung einen davon besser eingrenzen könnte.",
  },
  {
    taskId: "bonus-art",
    type: "choice",
    question:
      "Eine geschlossene Kabine misst eine konstante Kraft nach unten. Welche Schlussfolgerung ist lokal möglich?",
    options: [
      "Sicher steht sie auf einem Planeten.",
      "Sie könnte in einem Gravitationsfeld ruhen oder im leeren Raum gleichförmig beschleunigen.",
      "Nur Licht reagiert auf Gravitation.",
      "Träge und schwere Masse sind verschieden.",
    ],
    answer: 1,
    hint: "Achtet auf „lokal“ und „hinreichend klein“.",
    reflection:
      "Beschreibt eine Messung über einen größeren Raumbereich, mit der Gezeitenkräfte die beiden Situationen unterscheiden könnten.",
  },
  {
    taskId: "bonus-principle",
    type: "choice",
    question:
      "Ein Katalog zeigt lokal Filamente und Leerräume, auf sehr großen Skalen aber keine ausgezeichnete Richtung. Was ist damit vereinbar?",
    options: [
      "Wir liegen im Zentrum.",
      "Das Universum ist großräumig näherungsweise homogen und isotrop, obwohl lokale Strukturen existieren.",
      "Jede Galaxie ist identisch.",
      "Das Universum ist zeitlich unveränderlich.",
    ],
    answer: 1,
    hint: "Das kosmologische Prinzip gilt näherungsweise auf großen Skalen.",
    reflection:
      "Grenzt „homogen und isotrop“ gegen die falsche Aussage „überall sieht es lokal gleich aus“ ab.",
  },
];
