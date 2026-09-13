"use strict";
// AION's original questions remain the source; these revisions respect the EVA scope.
const revise = (id, patch) =>
  Object.assign(
    sectors.flatMap((s) => s.tasks).find((t) => t.taskId === id),
    patch,
  );
revise("transit-depth", {
  type: "choice",
  question:
    "Das Labor zeigt ein direkt aufgenommenes Bild eines Exoplaneten. Welche Schwierigkeit muss das Teleskop dabei überwinden?",
  options: [
    "Der Planet ist meist viel lichtschwächer als sein naher Stern.",
    "Planeten senden grundsätzlich kein Licht zu uns.",
    "Alle Exoplaneten befinden sich hinter der Sonne.",
    "Ein Direktbild ist dasselbe wie ein Transitdiagramm.",
  ],
  answer: 0,
  hint: "Der helle Stern überstrahlt den viel schwächeren Planeten. Sein Licht muss möglichst ausgeblendet werden.",
});
revise("radial-limit", {
  question: "Wozu dient die Drake-Gleichung?",
  options: [
    "Sie ordnet Faktoren für eine Abschätzung kommunizierender Zivilisationen; mehrere Faktoren sind sehr unsicher.",
    "Sie misst die genaue Zahl bewohnter Planeten.",
    "Sie beweist außerirdisches Leben.",
    "Sie berechnet Planetenbahnen.",
  ],
  answer: 0,
  hint: "Vor allem die Anteile für Leben, Intelligenz und Kommunikation sowie die Lebensdauer einer Zivilisation sind unsicher.",
});
revise("black-hole-size", {
  question:
    "Wie ist die Singularität im Inneren eines Schwarzen Lochs wissenschaftlich einzuordnen?",
  options: [
    "Sie wurde als unendlich dichter Punkt fotografiert.",
    "Sie ist eine Vorhersage der klassischen ART und zeigt möglicherweise deren Gültigkeitsgrenze.",
    "Sie ist der helle Ring auf einem EHT-Bild.",
    "Sie ist eine feste Oberfläche.",
  ],
  answer: 1,
  hint: "Unendliche Dichte ist eine theoretische Vorhersage, kein direkt beobachteter Messwert. Eine vollständigere Theorie könnte nötig sein.",
});
revise("cmb-fluctuations", {
  question:
    "Das kosmologische Prinzip beschreibt das Universum auf sehr großen Skalen als näherungsweise …",
  options: [
    "homogen und isotrop: statistisch gleichartig an verschiedenen Orten und in verschiedenen Richtungen.",
    "überall völlig strukturlos, auch innerhalb jeder Galaxie.",
    "um die Erde zentriert.",
    "zeitlich unveränderlich.",
  ],
  answer: 0,
  hint: "Homogen betrifft den Ort, isotrop die Richtung. Lokal gibt es trotzdem Galaxien, Filamente und Leerräume.",
});
const lore = [
  {
    short: "Weltbilder",
    person: "Mira · Archivarin",
    item: "Sternkarte",
    glyph: "✦",
    digit: "4",
    roof: "#bf5b4e",
    door: [7, 7],
    stations: ["Mars-Projektor", "Beobachtungsbuch", "Modellregal"],
    notes: [
      "Mars läuft nicht wirklich rückwärts: Die Erde überholt ihn auf der inneren Bahn. Tycho sammelte präzise Daten; Kepler fand daraus Ellipsen; Newton erklärte die Bahnen mit Gravitation. Bessel maß später die Sternparallaxe.",
      "Geozentrische Modelle konnten mit Epizykeln viele Positionen vorhersagen. Die Venusphasen stützen einen Umlauf der Venus um die Sonne, beweisen allein aber noch keine bewegte Erde: Auch Tychos Modell erklärt sie.",
      "Tycho: Planeten um die Sonne, Sonne um die ruhende Erde. Kopernikus: bewegte Erde, aber noch Kreise und Epizykel. Ellipsen kamen erst mit Kepler.",
    ],
    fragment: [
      "TYCHO · Messdaten",
      "KEPLER · Bahngesetze",
      "NEWTON · Gravitation",
    ],
    intro:
      "Jemand hat die Geschichte des Himmels umsortiert. Durchsuche die drei Arbeitsplätze und stelle die Belegkette wieder her.",
    lock: "Die drei Namensplättchen passen in das Zeitenschloss. Setze sie vom frühesten zum spätesten Beitrag ein.",
    solution: [0, 1, 2],
    order: [2, 0, 1],
  },
  {
    short: "Kepler",
    person: "Jona · Mechaniker",
    item: "Sonnenlinse",
    glyph: "☀",
    digit: "7",
    roof: "#537da4",
    door: [22, 7],
    stations: ["Bahnmaschine", "Flächenmesser", "Umlaufrechner"],
    notes: [
      "1. Gesetz: Eine Planetenbahn ist eine Ellipse, die Sonne steht in einem Brennpunkt. Für Sonnenplaneten näherungsweise: (T / 1 Jahr)² = (a / 1 AE)³. Für Mars mit a = 1,52 AE folgt T = √(1,52³) Jahre. Ein Taschenrechner ist hier eingebaut.",
      "2. Gesetz: Die Verbindungslinie Sonne–Planet überstreicht in gleichen Zeiten gleich große Flächen. Deshalb ist der Planet nahe der Sonne schneller und im sonnenfernsten Punkt langsamer.",
      "3. Gesetz: Größere Bahnen bedeuten längere Umlaufzeiten. Für Jupiter mit a = 5,20 AE ergibt √(5,20³) die Umlaufzeit in Jahren. Reihenfolge der Gesetze: Bahnform → Flächen → Umlaufzeiten.",
    ],
    fragment: ["BRENNPUNKT · Sonne", "PERIHEL · schnell", "APHEL · langsam"],
    intro:
      "Ohne die Sonnenlinse bleibt das Tor dunkel. Repariere die Bahnmaschine – aber eine Sonne gehört nicht einfach in die Mitte.",
    lock: "Setze die Sonnenlinse an den richtigen Ort in der elliptischen Bahn. Die drei gesicherten Protokolle helfen.",
  },
  {
    short: "Exoplaneten",
    person: "Nia · Signalwache",
    item: "Signalchip",
    glyph: "▥",
    digit: "2",
    roof: "#579c86",
    door: [24, 15],
    stations: ["Transitmonitor", "Planetenscanner", "Funkempfänger"],
    notes: [
      "Transit: Ein Planet zieht vor seinem Stern vorbei. Regelmäßige kleine Helligkeitsabfälle können so seine Umlaufzeit verraten. Radialgeschwindigkeit: Periodische Dopplerverschiebungen im Sternspektrum zeigen dessen Bewegung um den gemeinsamen Schwerpunkt.",
      "Habitable Zone: Flüssiges Wasser könnte bei geeigneter Atmosphäre an der Oberfläche möglich sein. Das beweist weder Leben noch Sauerstoff. Direktbilder sind schwierig, weil der Stern den Planeten überstrahlt.",
      "Drake ordnet Faktoren zur Abschätzung kommunizierender Zivilisationen. Viele sind unsicher; es ist keine Messung. Transit liefert eine Radiusinformation, Radialgeschwindigkeit eine Masseninformation. Zusammen kann man die mittlere Dichte abschätzen.",
    ],
    fragment: ["DIP · Tag 2", "DIP · Tag 6", "DIP · Tag 10"],
    intro:
      "Der Empfänger meldet „Leben gefunden!“. Die Daten sagen weniger. Prüfe sie und finde den Rhythmus für das Rücksignal.",
    lock: "Die drei Beobachtungsstreifen zeigen Helligkeitseinbrüche an Tag 2, 6 und 10. Stelle das Sendeintervall auf eine Umlaufzeit ein (Tage).",
  },
  {
    short: "Kosmos",
    person: "Lev · Kartograf",
    item: "Massenkarte",
    glyph: "◈",
    digit: "9",
    roof: "#8b6f9c",
    door: [15, 19],
    stations: ["Galaxienkarte", "Urknallspeicher", "Linsenarchiv"],
    notes: [
      "In äußeren Galaxienbereichen sind Umlaufgeschwindigkeiten oft größer als aus der sichtbaren Materie erwartet. Dunkle Materie ist durch mehrere gravitative Befunde gestützt; ihre Teilchennatur ist offen. Sie ist nicht einfach kaltes Gas.",
      "Das frühe Universum war heiß und dicht. Expansion des Raums – nicht Explosion in einen vorhandenen Raum. Die kosmische Hintergrundstrahlung mit etwa 2,7 K ist ein wichtiger Beleg; kleine Fluktuationen hängen mit frühen Dichteunterschieden zusammen.",
      "Gravitationslinsen erlauben Rückschlüsse auf Masse, auch wenn sie nicht leuchtet. Kosmologisches Prinzip: auf sehr großen Skalen statistisch homogen (Orte) und isotrop (Richtungen), trotz lokaler Strukturen.",
    ],
    fragment: [
      "KARTE · sichtbare Sterne",
      "KARTE · Gravitationslinsen",
      "KARTE · Rotationsgeschwindigkeit",
    ],
    intro:
      "Die leuchtenden Sterne sind nicht die ganze Geschichte. Rekonstruiere die fehlende Massenkarte aus unabhängigen Spuren.",
    lock: "Wähle genau die zwei unabhängigen Messspuren aus, die zusätzliche gravitative Masse anzeigen. Bloßes Sternlicht reicht hier nicht.",
  },
  {
    short: "Horizont",
    person: "Ada · Uhrenwache",
    item: "Zeitanker",
    glyph: "◷",
    digit: "3",
    roof: "#b17b4e",
    door: [5, 15],
    stations: ["EHT-Bildarchiv", "Aufzuglabor", "Uhrenvergleich"],
    notes: [
      "Das EHT zeigt einen dunklen Schatten vor leuchtendem Plasma, nicht die Singularität und nicht Hawking-Strahlung. Schwarze Löcher und Gravitationswellen sind stark beobachtungsbasiert bestätigt. Hawking-Strahlung ist theoretisch vorhergesagt, bei astrophysikalischen Schwarzen Löchern aber noch nicht direkt nachgewiesen.",
      "Äquivalenzprinzip: In einem hinreichend kleinen Labor sind die Wirkungen von Gravitation und entsprechender Beschleunigung lokal nicht unterscheidbar. Der Ereignishorizont ist eine kausale Grenze, keine feste Oberfläche. Von innen kommt kein Lichtsignal zu weit entfernten Beobachtern.",
      "Ruhende Uhren nahe einer kugelförmigen Masse gehen beim Vergleich langsamer als weiter entfernte. Die Singularität ist eine Vorhersage der klassischen ART, kein beobachteter unendlich dichter Punkt. Sie kann eine Grenze der Theorie anzeigen.",
    ],
    fragment: [
      "EHT · beobachtet",
      "HAWKING · theoretisch",
      "SINGULARITÄT · Modellgrenze",
    ],
    intro:
      "Der letzte Notruf steckt im Filter fest. AION verwechselt Beobachtetes mit Vorhergesagtem. Du musst die Meldungen richtig einsortieren.",
    lock: "Nur ein überprüfter Beobachtungsbericht darf den Notruf bestätigen. Welches Fundstück gehört in das Fach „beobachtet“?",
  },
];
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const KEY = "aion_pixel_v1";
const fresh = () => ({
  version: 1,
  started: false,
  room: -1,
  player: { x: 15, y: 11 },
  solved: [],
  read: [],
  cores: [],
  hints: 0,
  seconds: 0,
  escaped: false,
  bonus: [],
  sound: false,
});
let state = fresh(),
  keys = new Set(),
  route = [],
  last = 0,
  walkTime = 0,
  toastTimer,
  activeTask = null,
  returnFocus = null,
  audio;
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!d || d.version !== 1) return;
    state = {
      ...fresh(),
      started: d.started === true,
      room:
        Number.isInteger(d.room) && d.room >= -1 && d.room < 5 ? d.room : -1,
      player:
        d.player && Number.isFinite(d.player.x) && Number.isFinite(d.player.y)
          ? {
              x: Math.max(1, Math.min(28, d.player.x)),
              y: Math.max(2, Math.min(20, d.player.y)),
            }
          : { x: 15, y: 11 },
      solved: Array.isArray(d.solved)
        ? [
            ...new Set(
              d.solved.filter((x) =>
                sectors.some((s) => s.tasks.some((t) => t.taskId === x)),
              ),
            ),
          ]
        : [],
      read: Array.isArray(d.read)
        ? d.read.filter((x) => typeof x === "string")
        : [],
      cores: Array.isArray(d.cores)
        ? [
            ...new Set(
              d.cores.filter((x) => Number.isInteger(x) && x >= 0 && x < 5),
            ),
          ]
        : [],
      hints: Number.isFinite(d.hints) ? Math.max(0, d.hints) : 0,
      seconds: Number.isFinite(d.seconds) ? Math.max(0, d.seconds) : 0,
      escaped: d.escaped === true,
      bonus: Array.isArray(d.bonus)
        ? d.bonus.filter((x) => Number.isInteger(x) && x >= 0 && x < 5)
        : [],
      sound: d.sound === true,
    };
  } catch (e) {
    state = fresh();
  }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    $("#saveStatus").textContent = "Automatisch auf diesem Gerät gespeichert.";
  } catch (e) {
    $("#saveStatus").textContent =
      "Speichern blockiert – bitte diesen Tab offen lassen.";
  }
}
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function modal(title, html, label = "AION · ARCHIVVERBINDUNG") {
  keys.clear();
  route = [];
  if (!$("#modal").open) {
    returnFocus = document.activeElement;
    $("#modal").showModal();
  }
  $("#dialogTitle").textContent = title;
  $("#dialogLabel").textContent = label;
  $("#dialogBody").innerHTML = html;
  $("#modal").scrollTop = 0;
  $("#close").focus();
}
function close() {
  activeTask = null;
  $("#modal").close();
  keys.clear();
  (returnFocus?.isConnected ? returnFocus : $("#gameCanvas")).focus();
}
$("#close").onclick = close;
$("#modal").addEventListener("cancel", (e) => {
  e.preventDefault();
  if (state.started) close();
});
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("on"), 3800);
}
function tone(success = true) {
  if (!state.sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    [0, 0.1, 0.2].forEach((delay, i) => {
      const o = audio.createOscillator(),
        g = audio.createGain();
      o.type = "square";
      o.frequency.value = (success ? [392, 494, 587] : [220, 196, 165])[i];
      g.gain.setValueAtTime(0.025, audio.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(
        0.0001,
        audio.currentTime + delay + 0.15,
      );
      o.connect(g).connect(audio.destination);
      o.start(audio.currentTime + delay);
      o.stop(audio.currentTime + delay + 0.16);
    });
  } catch (e) {}
}
function intro() {
  modal(
    "Ein letzter Notruf",
    `<div class="scene-strip">✦ · ☀ · ◈</div><div class="label">EIN PIXEL-ABENTEUER ÜBER UNSEREN PLATZ IM UNIVERSUM</div><div class="hero-title">AION</div><p>Die Nacht fällt über den Aster-Campus. Ein fehlerhaftes Update hat das Archiv verriegelt. Heute soll der letzte Datenzug starten – und das Wissen der Station mitnehmen.</p><p><b>Fünf Räume. Fünf verlorene Werkzeuge. Ein versiegeltes Tor.</b> Untersucht Geräte, sammelt Belege und bringt AION wieder bei, was wir wissen – und was nicht.</p><div class="note">Für Teams von 2–4 · geplant für 60–90 Minuten · kein Zeitlimit<br>Grundlagen aus eurem EVA-Blatt reichen. Alles Weitere findet ihr im Spiel. Kein Googeln nötig; Hinweise sind unbegrenzt.</div><div class="actions">${state.started ? '<button class="primary" id="resume">Fortsetzen</button>' : ""}<button id="begin" class="${state.started ? "" : "primary"}">${state.started ? "Neues Spiel" : "Campus betreten"}</button><button id="introHelp">So funktioniert’s</button></div>`,
    "AION · DAS LETZTE ARCHIV",
  );
  $("#close").hidden = !state.started;
  $("#begin").onclick = () => (state.started ? newGame() : begin());
  if ($("#resume"))
    $("#resume").onclick = () => {
      close();
      renderUI();
    };
  $("#introHelp").onclick = help;
}
function begin() {
  state = fresh();
  state.started = true;
  $("#close").hidden = false;
  save();
  close();
  renderUI();
  toast("AION: Fang in einem beliebigen Gebäude an. Ich begleite euch.");
  $("#gameCanvas").focus();
}
function newGame() {
  modal(
    "Wirklich neu beginnen?",
    '<p>Nur der AION-Spielstand dieser neuen Version wird gelöscht. Das lässt sich nicht rückgängig machen.</p><div class="actions"><button id="confirmReset" class="danger">Spielstand löschen und starten</button><button id="cancelReset">Abbrechen</button></div>',
  );
  $("#confirmReset").onclick = begin;
  $("#cancelReset").onclick = () => (state.started ? close() : intro());
}
function help() {
  modal(
    "Erkunden · verstehen · kombinieren",
    `<p><b>1.</b> Bewege dich mit Pfeiltasten/WASD oder Steuerkreuz. Tippe ein Ziel auf der Karte an, um dorthin zu laufen. E, Enter oder der rote A-Knopf untersucht das nächste Objekt.</p><p><b>2.</b> Die Objektliste neben der Karte ist eine gleichwertige Abkürzung – auch ohne Herumlaufen.</p><p><b>3.</b> Jeder Raum enthält drei Arbeitsplätze mit kurzen Notizen und je zwei Datenprüfungen. Danach erhaltet ihr ein Fundstück.</p><p><b>4.</b> Kombiniert die drei Fundstücke am Raumschloss. Das Werkzeug wandert in euren Rucksack. Erst die fünf Werkzeuge gemeinsam öffnen das Ausgangstor.</p><p><b>Teamregel:</b> Wechselt nach jedem Raum die Steuerperson. Lasst die anderen zuerst erklären. Journal und Hinweise kosten weder Leben noch Punkte.</p><p>Die Uhr zählt nur eure aktive Spielzeit. Es gibt kein Game-over. Das Spiel ist bewusst nicht von eurem Spezialreferat abhängig.</p><div class="actions"><button id="helpBack" class="primary">${state.started ? "Weiter" : "Zum Start"}</button></div>`,
  );
  $("#helpBack").onclick = () => (state.started ? close() : intro());
}
function objects() {
  if (state.room < 0)
    return [
      ...lore.map((l, i) => ({
        id: "room" + i,
        x: l.door[0],
        y: l.door[1],
        label: l.short,
        sub: state.cores.includes(i) ? "Werkzeug geborgen" : "Gebäude betreten",
        action: () => enter(i),
      })),
      {
        id: "gate",
        x: 15,
        y: 4,
        label: "Ausgangstor",
        sub: "Fünf Werkzeuge kombinieren",
        action: gate,
      },
      {
        id: "guide",
        x: 13,
        y: 11,
        label: "AION-Terminal",
        sub: "Nachricht & Hilfe",
        action: help,
      },
    ];
  let r = state.room,
    l = lore[r];
  return [
    ...l.stations.map((name, i) => ({
      id: "station" + i,
      x: [7, 15, 23][i],
      y: 7,
      label: name,
      sub: stationDone(r, i) ? "Fundstück gesichert" : "Untersuchen",
      action: () => station(r, i),
    })),
    {
      id: "lock",
      x: 15,
      y: 13,
      label: "Archivschloss",
      sub: state.cores.includes(r)
        ? "Werkzeug geborgen"
        : "Fundstücke kombinieren",
      action: () => lock(r),
    },
    {
      id: "exit",
      x: 15,
      y: 20,
      label: "Zurück zum Campus",
      sub: "Fortschritt bleibt erhalten",
      action: leave,
    },
  ];
}
function enter(r) {
  state.room = r;
  state.player = { x: 15, y: 18 };
  route = [];
  save();
  renderUI();
  toast(lore[r].person + ": Untersucht die drei Arbeitsplätze.");
}
function leave() {
  clearTimeout(toastTimer);
  $("#toast").classList.remove("on");
  const r = state.room;
  state.room = -1;
  state.player = { x: lore[r].door[0], y: lore[r].door[1] + 1 };
  route = [];
  save();
  renderUI();
}
function stationDone(r, i) {
  return sectors[r].tasks
    .slice(i * 2, i * 2 + 2)
    .every((t) => state.solved.includes(t.taskId));
}
function renderUI() {
  const r = state.room;
  $("#location").textContent =
    r < 0 ? "ASTER-CAMPUS" : lore[r].short.toUpperCase() + " · ARCHIV";
  $("#progress").textContent = state.cores.length + " / 5 Kerne";
  $("#objective").textContent = state.escaped
    ? "Das Archiv ist gerettet"
    : r < 0
      ? "Finde die fünf Werkzeuge"
      : lore[r].item + " bergen";
  $("#missionText").textContent =
    r < 0
      ? "Erkunde die Gebäude in beliebiger Reihenfolge. Kehre mit allen Werkzeugen zum Ausgangstor zurück."
      : lore[r].intro;
  $("#radioText").textContent =
    state.cores.length === 5
      ? "Alle Werkzeuge da! Am Nordtor wartet die letzte Kombination."
      : r < 0
        ? "Ich habe die Türcodes vergessen. Die Belege nicht. Die liegen noch in den Räumen."
        : lore[r].person +
          ": Lesen ist erlaubt. Raten allein repariert hier nichts.";
  $("#objects").innerHTML = objects()
    .map(
      (o, i) =>
        `<button data-object="${i}"><span class="badge">${o.id === "exit" ? "↩" : o.id === "gate" ? "⚑" : o.id === "lock" ? "◇" : i + 1}</span><span>${o.label}<small>${o.sub}</small></span></button>`,
    )
    .join("");
  $$("[data-object]").forEach(
    (b) => (b.onclick = () => objects()[+b.dataset.object].action()),
  );
  $("#sound").textContent = state.sound ? "♪ AN" : "♪ AUS";
  $("#sound").setAttribute("aria-pressed", String(state.sound));
  $("#sound").setAttribute(
    "aria-label",
    state.sound ? "Spieltöne ausschalten" : "Spieltöne einschalten",
  );
}
function station(r, i) {
  const key = r + ":" + i;
  if (!state.read.includes(key)) {
    state.read.push(key);
    save();
  }
  const l = lore[r],
    done = stationDone(r, i);
  modal(
    l.stations[i],
    `<div class="scene-strip">${l.glyph} · ${i + 1} · ${l.glyph}</div><span class="pill">${l.person} · Fundstelle ${i + 1}/3</span><div class="note"><h3>Notiz am Gerät</h3>${l.notes[i]}</div><p>${done ? "Die Reparatur ist abgeschlossen. Euer Fundstück:" : "Lest die Notiz gemeinsam. Prüft dann die beiden gespeicherten Meldungen, um das Fach zu öffnen."}</p>${done ? `<div class="item"><b>${l.fragment[i]}</b><span>Im Rucksack gesichert.</span></div>` : ""}<div class="actions"><button id="stationGo" class="primary">${done ? "Zurück in den Raum" : "Gerät untersuchen"}</button><button id="stationJournal">Forschungsjournal</button></div>`,
  );
  $("#stationGo").onclick = () => (done ? close() : task(r, i));
  $("#stationJournal").onclick = () => journal(() => station(r, i));
}
function diagram(t) {
  if (t.taskId === "focus")
    return '<svg class="diagram" viewBox="0 0 600 220" role="img" aria-label="Ellipse: Mittelpunkt M und zwei Brennpunkte F markiert. Die Sonne ist noch nicht eingesetzt."><ellipse cx="300" cy="100" rx="150" ry="90" fill="none" stroke="#4b7662" stroke-width="4"/><g fill="#aa5837"><circle cx="180" cy="100" r="6"/><circle cx="300" cy="100" r="6"/><circle cx="420" cy="100" r="6"/></g><g font-size="20" fill="#253c3b"><text x="174" y="133">F</text><text x="292" y="133">M</text><text x="414" y="133">F</text></g></svg>';
  if (t.diagram === "transit")
    return '<svg class="diagram" viewBox="0 0 600 240" role="img" aria-label="Vier getrennte schematische Helligkeitskurven über der Zeit: A unregelmäßig, B gleichmäßig wiederkehrende Einbrüche, C steigend, D konstant. Keine gemeinsame Helligkeitsskala."><g fill="none" stroke-width="3"><path stroke="#8e786d" d="M45 35 H100 l10 12 10 -22 10 10 H300 l10 15 10 -20 10 5 H570"/><path stroke="#28614f" d="M45 83 H110 l5 20 10 10 10 -10 5 -20 H270 l5 20 10 10 10 -10 5 -20 H430 l5 20 10 10 10 -10 5 -20 H570"/><path stroke="#8568a1" d="M45 167 L570 130"/><path stroke="#b17b4e" d="M45 201 H570"/></g><g font-size="16" fill="#253c3b"><text x="13" y="39">A</text><text x="13" y="87">B</text><text x="13" y="164">C</text><text x="13" y="205">D</text><text x="450" y="232">Zeit →</text></g></svg>';
  if (t.diagram === "rotation")
    return '<svg class="diagram" viewBox="0 0 600 220" role="img" aria-label="Schematische Umlaufgeschwindigkeit v über Abstand r: beobachtete Kurve außen flach; aus sichtbarer Masse erwartete Kurve fällt ab. Keine Zahlenskalen."><path d="M50 15 V180 H580" fill="none" stroke="#344a40" stroke-width="2"/><path d="M50 170 Q120 40 180 45 H565" fill="none" stroke="#28614f" stroke-width="4"/><path d="M50 170 Q120 40 180 45 Q320 125 565 153" fill="none" stroke="#b35441" stroke-width="4" stroke-dasharray="8 6"/><g font-size="15" fill="#253c3b"><text x="13" y="27">v</text><text x="555" y="204">r</text><text x="330" y="32">beobachtet</text><text x="325" y="145">nur sichtbare Masse</text></g></svg>';
  return "";
}
function task(r, i) {
  const t = sectors[r].tasks
    .slice(i * 2, i * 2 + 2)
    .find((t) => !state.solved.includes(t.taskId));
  if (!t) return rewardFragment(r, i);
  activeTask = { r, i, t };
  let interaction = "";
  if (t.type === "choice")
    interaction = `<div class="choices">${t.options.map((o, k) => `<button data-answer="${k}">${esc(o)}</button>`).join("")}</div>`;
  if (t.type === "number")
    interaction = `<label for="answer">Umlaufzeit in Jahren</label><input id="answer" inputmode="decimal" autocomplete="off" placeholder="z. B. 1,87"><button id="calc">Bordrechner: √(${t.taskId === "mars-period" ? "1,52" : "5,20"}³)</button><span id="calcOut" aria-live="polite"></span><div class="actions"><button id="check" class="primary">Wert prüfen</button></div>`;
  if (t.type === "sequence")
    interaction = `<div class="sequence">${t.items.map((o, k) => `<button data-seq="${k}">${esc(o)}</button>`).join("")}</div><p id="order" aria-live="polite">Noch keine Reihenfolge.</p><div class="actions"><button id="check" class="primary">Reihenfolge prüfen</button><button id="clear">Neu ordnen</button></div>`;
  modal(
    lore[r].stations[i],
    `<span class="pill">Datenprüfung ${state.solved.includes(sectors[r].tasks[i * 2].taskId) ? 2 : 1} / 2</span><h3>${t.question}</h3>${diagram(t)}${interaction}<div class="feedback" id="feedback" role="status">Erst besprechen, dann entscheiden.</div><div class="actions"><button id="hint">Hinweis</button><button id="readNote">Notiz erneut lesen</button></div><div id="noteArea"></div>`,
    "ARCHIV · DATEN WIEDERHERSTELLEN",
  );
  let picked = [],
    hintLevel = 0;
  $$("[data-answer]").forEach(
    (b) =>
      (b.onclick = () => checkTask(+b.dataset.answer === t.answer, r, i, t)),
  );
  $$("[data-seq]").forEach(
    (b) =>
      (b.onclick = () => {
        const k = +b.dataset.seq;
        if (!picked.includes(k)) {
          picked.push(k);
          b.disabled = true;
          $("#order").textContent = picked.map((n) => t.items[n]).join(" → ");
        }
      }),
  );
  if (t.type === "sequence") {
    $("#check").onclick = () =>
      checkTask(
        JSON.stringify(picked.map((n) => t.items[n])) ===
          JSON.stringify(t.answer),
        r,
        i,
        t,
      );
    $("#clear").onclick = () => {
      picked = [];
      $$("[data-seq]").forEach((b) => (b.disabled = false));
      $("#order").textContent = "Noch keine Reihenfolge.";
    };
  }
  if (t.type === "number") {
    $("#calc").onclick = () =>
      ($("#calcOut").textContent =
        " = " +
        Math.pow(t.taskId === "mars-period" ? 1.52 : 5.2, 1.5)
          .toFixed(4)
          .replace(".", ",") +
        " Jahre");
    $("#check").onclick = () => {
      const raw = $("#answer").value.trim().replace(",", ".");
      checkTask(
        /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw) &&
          Math.abs(Number(raw) - t.answer) <= t.tolerance,
        r,
        i,
        t,
      );
    };
    $("#answer").onkeydown = (e) => {
      if (e.key === "Enter") $("#check").click();
    };
  }
  $("#hint").onclick = () => {
    hintLevel++;
    state.hints++;
    save();
    $("#feedback").className = "feedback";
    $("#feedback").textContent =
      hintLevel === 1
        ? t.hint
        : "Lösungshilfe: " +
          (t.type === "choice"
            ? t.options[t.answer]
            : t.type === "number"
              ? String(t.answer).replace(".", ",") + " Jahre"
              : t.answer.join(" → ")) +
          ". Erklärt euch gegenseitig, warum das passt.";
  };
  $("#readNote").onclick = () =>
    ($("#noteArea").innerHTML =
      '<div class="note">' + lore[r].notes[i] + "</div>");
}
function checkTask(ok, r, i, t) {
  if (state.solved.includes(t.taskId)) return;
  if (!ok) {
    $("#feedback").className = "feedback bad";
    $("#feedback").textContent =
      "Die Meldung passt noch nicht zu den Belegen. " + t.hint;
    tone(false);
    return;
  }
  state.solved.push(t.taskId);
  save();
  tone();
  $("#feedback").className = "feedback ok";
  $("#feedback").textContent = "Gesichert. " + t.hint;
  $$("[data-answer],[data-seq],#check").forEach((b) => (b.disabled = true));
  const b = document.createElement("button");
  b.className = "primary";
  b.id = "next";
  b.textContent = stationDone(r, i)
    ? "Fundstück bergen"
    : "Zweite Meldung prüfen";
  b.onclick = () => (stationDone(r, i) ? rewardFragment(r, i) : task(r, i));
  $("#feedback").after(b);
  b.focus();
}
function rewardFragment(r, i) {
  modal(
    "Ein Fach springt auf",
    `<div class="scene-strip">${lore[r].glyph} · FUNDFACH</div><p>Unter dem reparierten Gerät liegt ein beschriftetes Fragment.</p><div class="item"><b>${lore[r].fragment[i]}</b><p>Gesichert im Rucksack. Ihr braucht es am Archivschloss dieses Raums.</p></div><p class="room-progress">${[0, 1, 2].filter((k) => stationDone(r, k)).length} / 3 Fundstücke geborgen</p><div class="actions"><button class="primary" id="backRoom">Weiter erkunden</button><button id="toLock">Zum Archivschloss</button></div>`,
  );
  $("#backRoom").onclick = () => {
    close();
    renderUI();
  };
  $("#toLock").onclick = () => lock(r);
  renderUI();
}
function lock(r) {
  const l = lore[r];
  if (state.cores.includes(r)) {
    modal(
      "Archivkern stabil",
      `<p>Die ${l.item} liegt bereits in eurem Rucksack. Sucht die anderen Werkzeuge oder geht zum Ausgangstor.</p><button id="lockBack">Zurück</button>`,
    );
    $("#lockBack").onclick = close;
    return;
  }
  if (![0, 1, 2].every((i) => stationDone(r, i))) {
    modal(
      "Das Schloss wartet auf Belege",
      `<p>Drei Fächer versorgen dieses Schloss. Bisher geöffnet: ${[0, 1, 2].filter((i) => stationDone(r, i)).length} / 3.</p><div class="note">${l.stations.map((n, i) => (stationDone(r, i) ? "✓ " : "□ ") + n).join("<br>")}</div><button id="lockBack">Weiter suchen</button>`,
    );
    $("#lockBack").onclick = close;
    return;
  }
  let controls = "";
  if (r === 0)
    controls = `<div class="sequence">${l.order.map((i) => `<button data-lock="${i}">${l.fragment[i].split(" · ")[0]}</button>`).join("")}</div><p id="lockOrder">Noch kein Plättchen eingesetzt.</p><button id="clearLock">Plättchen herausnehmen</button>`;
  if (r === 1)
    controls =
      '<svg class="diagram" viewBox="0 0 600 240" role="img" aria-label="Ellipse mit Brennpunkt links bei Position A, Mittelpunkt B und Außenpunkt C."><ellipse cx="280" cy="110" rx="150" ry="90" fill="none" stroke="#496e58" stroke-width="4"/><g fill="#b26a30" font-size="22"><circle cx="160" cy="110" r="7"/><text x="153" y="150">A</text><circle cx="280" cy="110" r="7"/><text x="272" y="150">B</text><circle cx="500" cy="110" r="7"/><text x="492" y="150">C</text></g></svg><div class="actions"><button data-lock="0">A · Brennpunkt</button><button data-lock="1">B · Mittelpunkt</button><button data-lock="2">C · außerhalb</button></div>';
  if (r === 2)
    controls =
      '<svg class="diagram" viewBox="0 0 600 150" role="img" aria-label="Helligkeit über Zeit: gleichartige Einbrüche an Tag 2, Tag 6 und Tag 10."><path d="M40 30 H100 l6 40 14 10 14 -10 6 -40 H275 l6 40 14 10 14 -10 6 -40 H450 l6 40 14 10 14 -10 6 -40 H570" fill="none" stroke="#28614f" stroke-width="4"/><g font-size="18" fill="#253c3b"><text x="102" y="117">2</text><text x="277" y="117">6</text><text x="452" y="117">10</text><text x="510" y="140">Tag</text></g></svg><label for="lockNumber">Intervall in Tagen</label><input id="lockNumber" inputmode="numeric"><button id="lockCheck" class="primary">Sender einstellen</button>';
  if (r === 3)
    controls =
      '<div class="choices"><button data-lock="0" aria-pressed="false">Fotografie der sichtbaren Sterne</button><button data-lock="1" aria-pressed="false">Stärkere Gravitationslinsen als aus sichtbarer Masse erwartet</button><button data-lock="2" aria-pressed="false">Außensterne schneller als aus sichtbarer Masse erwartet</button></div><div class="actions"><button id="lockCheck" class="primary">Messspuren überlagern</button></div>';
  if (r === 4)
    controls =
      '<div class="choices"><button data-lock="0">EHT: Schatten vor leuchtendem Plasma</button><button data-lock="1">Hawking-Strahlung eines astrophysikalischen Schwarzen Lochs</button><button data-lock="2">Singularität mit unendlicher Dichte</button></div>';
  modal(
    "Das " + l.short + "-Schloss",
    `<span class="pill">KOMBINATION · 3 FUNDSTÜCKE</span><h3>${l.lock}</h3><div class="note">${l.fragment.join("<br>")}</div>${controls}<div id="feedback" class="feedback" role="status">Benutzt die gesicherten Hinweise.</div><div class="actions"><button id="lockHint">Ein Tipp von ${l.person.split(" · ")[0]}</button></div>`,
  );
  let picked = [];
  const wrong = () => {
    $("#feedback").className = "feedback bad";
    $("#feedback").textContent =
      "Noch nicht. Die Fundstücke passen anders zusammen. Der Tipp hilft beim nächsten Versuch.";
    tone(false);
  };
  $$("[data-lock]").forEach(
    (b) =>
      (b.onclick = () => {
        const n = +b.dataset.lock;
        if (r === 0) {
          picked.push(n);
          b.disabled = true;
          $("#lockOrder").textContent = picked
            .map((k) => l.fragment[k].split(" · ")[0])
            .join(" → ");
          if (picked.length === 3) {
            if (JSON.stringify(picked) === JSON.stringify(l.solution)) core(r);
            else wrong();
          }
        } else if (r === 3) {
          picked = picked.includes(n)
            ? picked.filter((x) => x !== n)
            : [...picked, n];
          b.classList.toggle("chosen", picked.includes(n));
          b.setAttribute("aria-pressed", String(picked.includes(n)));
        } else n === 0 ? core(r) : wrong();
      }),
  );
  if (r === 0)
    $("#clearLock").onclick = () => {
      picked = [];
      $$("[data-lock]").forEach((b) => (b.disabled = false));
      $("#lockOrder").textContent = "Noch kein Plättchen eingesetzt.";
    };
  if (r === 2)
    $("#lockCheck").onclick = () =>
      /^4(?:[.,]0+)?$/.test($("#lockNumber").value.trim()) ? core(r) : wrong();
  if (r === 3)
    $("#lockCheck").onclick = () =>
      picked.length === 2 && picked.includes(1) && picked.includes(2)
        ? core(r)
        : wrong();
  $("#lockHint").onclick = () => {
    state.hints++;
    save();
    $("#feedback").textContent = [
      "Daten zuerst: Tycho → Kepler → Newton.",
      "Nicht die Mitte: Setzt die Sonne in einen Brennpunkt, also A.",
      "Eine Umlaufzeit ist der Abstand benachbarter Einbrüche: 6 − 2 = 4 Tage.",
      "Die beiden gravitativen Messungen ergänzen sich: Lichtablenkung und Sternbewegung.",
      "Das EHT-Bild ist eine Beobachtung. Hawking-Strahlung und Singularität gehören nicht in dieses Fach.",
    ][r];
  };
}
function core(r) {
  if (!state.cores.includes(r)) state.cores.push(r);
  save();
  tone();
  renderUI();
  modal(
    "Werkzeug geborgen!",
    `<div class="scene-strip">${lore[r].glyph} · ${lore[r].glyph}</div><div class="item"><span class="glyph">${lore[r].glyph}</span><b>${lore[r].item}</b><p>Auf der Rückseite ist eine Ziffer eingeritzt: <b class="code-line">${lore[r].digit}</b></p></div><p>${["Die Himmelsmodelle sind wieder in ihrer Zeit verankert.", "Die Planetenmaschine läuft wieder. Das erste Licht fällt durch die Linse.", "Ein sauberes Signal ersetzt die voreilige Lebensmeldung.", "Unsichtbar ist nicht wirkungslos. Die Massenkarte leuchtet auf.", "AION kann wieder zwischen Beobachtung und Vorhersage unterscheiden."][r]}</p><p><b>${state.cores.length} / 5 Werkzeuge.</b> ${state.cores.length === 5 ? "Das Ausgangstor ist jetzt erreichbar." : "Die anderen Gebäude könnt ihr frei wählen."}</p><button id="coreBack" class="primary">Zurück zum Campus</button>`,
  );
  $("#coreBack").onclick = () => {
    close();
    leave();
  };
}
function bag() {
  modal(
    "Euer Rucksack",
    `<p>Werkzeuge öffnen das Ausgangstor. Fundstücke helfen an den Raumschlössern.</p><div class="inventory">${lore.map((l, r) => `<section class="item"><span class="glyph">${l.glyph}</span><b>${state.cores.includes(r) ? l.item : "Noch nicht geborgen"}</b>${state.cores.includes(r) ? `<p>Gravur: <b>${l.digit}</b></p>` : ""}<p>${l.stations.map((_, i) => (stationDone(r, i) ? esc(l.fragment[i]) : "□ Unentdecktes Fundstück")).join("<br>")}</p></section>`).join("")}</div><div class="actions"><button id="bagClose">Weiter erkunden</button></div>`,
  );
  $("#bagClose").onclick = close;
}
function journal(back = close) {
  modal(
    "Forschungsjournal",
    `<p>Alle Grundlagen sind von Anfang an lesbar. Ihr müsst kein fremdes Referat auswendig kennen.</p>${lore.map((l) => `<details><summary>${l.short}</summary>${l.notes.map((n) => `<p>${n}</p>`).join("")}</details>`).join("")}<details><summary>Drake-Formel & kosmologische Zeitleiste</summary><p>N = R★ · fₚ · nₑ · fₗ · fᵢ · f꜀ · L. Sternentstehungsrate × Planetenanteil × geeignete Planeten je System × Lebensanteil × Intelligenzanteil × Kommunikationsanteil × Dauer der Kommunikation. Besonders die letzten Faktoren sind unsicher.</p><p>Frühes heißes Universum → Bildung leichter Atomkerne → nach etwa 380 000 Jahren freie Ausbreitung der heute gemessenen Hintergrundstrahlung → Sterne und Galaxien → heute. Inflation ist eine Hypothese für eine sehr frühe Phase. Das Universum ist etwa 13,8 Milliarden Jahre alt.</p></details><details><summary>Quellen & Modellgrenzen</summary><p>Inhaltlicher Rahmen: EVA-Arbeitsmappe „Unser Platz im Universum“, acht Referatsthemen. Die Spielgeschichte ist erfunden; alle Illustrationen und Diagramme sind eigene schematische Darstellungen.</p><p><a href="https://www.leifiphysik.de/astronomie/planetensystem/geschichte/heliozentrisches-weltsystem" target="_blank" rel="noopener">LEIFI: Heliozentrisches Weltsystem</a><br><a href="https://science.nasa.gov/universe/black-holes/anatomy/" target="_blank" rel="noopener">NASA: Black Hole Anatomy</a><br><a href="https://science.nasa.gov/dark-matter/" target="_blank" rel="noopener">NASA: Dark Matter</a></p><p>Links sind optional, nicht zum Lösen erforderlich. Kepler-Rechnungen verwenden das Näherungsmodell für Planeten um die Sonne. Dunkle Materie ist nicht Dunkle Energie. Kompakte dunkle Objekte erklären nicht beliebig die gesamte Dunkle Materie; ein pauschales „alle ausgeschlossen“ wäre zu stark.</p></details><div class="actions"><button id="journalBack" class="primary">Zurück</button></div>`,
  );
  $("#journalBack").onclick = back;
}
function gate() {
  if (state.escaped) return ending();
  if (state.cores.length < 5) {
    modal(
      "Das versiegelte Nordtor",
      `<p>Hinter der Tür wartet der letzte Datenzug. Über fünf leeren Sockeln steht eine Nachricht:</p><div class="note">„Lies die Sterne. Fange das Sonnenlicht. Höre die fremde Welt. Wiege das Unsichtbare. Verankere die Zeit.“</div><p>Ihr habt ${state.cores.length} / 5 Werkzeuge. Die Gebäude können in jeder Reihenfolge erkundet werden.</p><button id="gateBack">Weiter suchen</button>`,
    );
    $("#gateBack").onclick = close;
    return;
  }
  modal(
    "Die letzte Kombination",
    `<div class="scene-strip">✦ · · · · ·</div><p>Das Tor besitzt fünf Sockel. Die Inschrift verrät ihre Reihenfolge – nicht die Reihenfolge eurer Besuche.</p><div class="note">„<b>Lies die Sterne.</b> Fange das <b>Sonnenlicht.</b> Höre die <b>fremde Welt.</b> Wiege das <b>Unsichtbare.</b> Verankere die <b>Zeit.</b>“</div><p>Setzt die passenden Werkzeuge nacheinander ein. Übertragt danach ihre eingravierten Ziffern in das Schloss.</p><div class="sequence">${[3, 0, 4, 2, 1].map((r) => `<button data-tool="${r}">${lore[r].glyph} ${lore[r].item} · ${lore[r].digit}</button>`).join("")}</div><p id="sockets" class="code-line">□ □ □ □ □</p><button id="clearTools">Werkzeuge herausnehmen</button><label for="gateCode">Fünfstelliger Türcode</label><input id="gateCode" maxlength="5" inputmode="numeric" autocomplete="off"><button id="openGate" class="primary">Tor entriegeln</button><div id="feedback" class="feedback" role="status">Alle Hinweise liegen vor euch.</div><button id="gateHint">AION um einen Tipp bitten</button>`,
  );
  let selected = [];
  $$("[data-tool]").forEach(
    (b) =>
      (b.onclick = () => {
        selected.push(+b.dataset.tool);
        b.disabled = true;
        $("#sockets").textContent = selected
          .map((r) => lore[r].glyph)
          .concat(Array(5 - selected.length).fill("□"))
          .join(" ");
      }),
  );
  $("#clearTools").onclick = () => {
    selected = [];
    $$("[data-tool]").forEach((b) => (b.disabled = false));
    $("#sockets").textContent = "□ □ □ □ □";
  };
  $("#openGate").onclick = () => {
    if (
      selected.join(",") === "0,1,2,3,4" &&
      $("#gateCode").value.trim() === lore.map((l) => l.digit).join("")
    ) {
      state.escaped = true;
      save();
      tone();
      renderUI();
      ending();
    } else {
      $("#feedback").className = "feedback bad";
      $("#feedback").textContent =
        "Das Tor bleibt zu. Prüft zuerst die Reihenfolge der Werkzeuge, dann deren Ziffern.";
      tone(false);
    }
  };
  $("#gateHint").onclick = () => {
    state.hints++;
    save();
    $("#feedback").textContent =
      "Sternkarte → Sonnenlinse → Signalchip → Massenkarte → Zeitanker. Lest die Ziffern in genau dieser Reihenfolge.";
  };
}
function ending() {
  modal(
    "Der letzte Zug wartet auf euch.",
    `<div class="scene-strip">✦ ARCHIV GERETTET ✦</div><div class="end-art">🚂</div><h3>Die Verriegelung löst sich. AION sendet wieder.</h3><p>„Ich dachte, Wissen bedeutet, jede Antwort zu kennen“, knistert es aus dem Lautsprecher. „Ihr habt mir etwas Besseres gezeigt: Belege prüfen. Modelle vergleichen. Unsicherheit aushalten.“</p><div class="note"><b>5 Werkzeuge · 30 Datenprüfungen · 5 Raumschlösser · 1 Ausgang</b><br>Aktive Spielzeit: ${Math.floor(state.seconds / 60)} Minuten · Hinweise: ${state.hints}<br>Hinweise sind gute Teamarbeit, kein Punktabzug.</div><p><b>Eine letzte Frage an euer Team:</b> Welche Aussage würdet ihr nach dieser Reise vorsichtiger formulieren als zuvor?</p><div class="actions"><button id="endCampus">Campus weiter erkunden</button><button id="bonus" class="primary">Optional: Funkmeldungen prüfen</button><button id="export">Teamprotokoll speichern</button></div>`,
  );
  $("#endCampus").onclick = () => {
    close();
    state.room = -1;
    state.player = { x: 15, y: 5 };
    save();
    renderUI();
  };
  $("#bonus").onclick = bonusMenu;
  $("#export").onclick = exportLog;
}
function bonusMenu() {
  modal(
    "Fünf optionale Funkmeldungen",
    `<p>Kein neues Spezialwissen. Wendet eure Grundlagen an und besprecht die Erklärung. Bereits geprüfte Meldungen bleiben markiert.</p><div class="choices">${bonusTasks.map((t, i) => `<button data-bonus="${i}">${state.bonus.includes(i) ? "✓" : "□"} ${["Reststrahlung", "Expansion", "Drake-Gleichung", "Aufzuglabor", "Kosmologisches Prinzip"][i]}</button>`).join("")}</div>`,
  );
  $$("[data-bonus]").forEach(
    (b) => (b.onclick = () => bonus(+b.dataset.bonus)),
  );
}
function bonus(i) {
  const t = bonusTasks[i];
  modal(
    "Funkmeldung " + (i + 1),
    `<h3>${t.question}</h3><div class="choices">${t.options.map((o, k) => `<button data-banswer="${k}">${o}</button>`).join("")}</div><div id="feedback" class="feedback" role="status">Besprecht eure Entscheidung.</div><button id="bonusHint">Hinweis</button>`,
  );
  $$("[data-banswer]").forEach(
    (b) =>
      (b.onclick = () => {
        if (+b.dataset.banswer !== t.answer) {
          $("#feedback").textContent = t.hint;
          return;
        }
        if (!state.bonus.includes(i)) state.bonus.push(i);
        save();
        $("#feedback").className = "feedback ok";
        $("#feedback").innerHTML =
          "<b>Passend.</b> " +
          t.hint +
          '<p>Erklärt euch gegenseitig, warum die anderen Aussagen nicht passen.</p><button id="bonusBack">Zur Funkübersicht</button>';
        $("#bonusBack").onclick = bonusMenu;
        $$("[data-banswer]").forEach((x) => (x.disabled = true));
      }),
  );
  $("#bonusHint").onclick = () => ($("#feedback").textContent = t.hint);
}
function exportLog() {
  const text = [
    "AION – Teamprotokoll",
    "Archiv gerettet: " + (state.escaped ? "ja" : "nein"),
    "Aktive Minuten: " + Math.floor(state.seconds / 60),
    "Hinweise: " + state.hints,
    ...lore.map(
      (l, i) =>
        (state.cores.includes(i) ? "✓ " : "□ ") + l.short + " – " + l.item,
    ),
    "Optionale Funkmeldungen: " + state.bonus.length + "/5",
    "Gesprächsimpuls: Welche Aussage würdet ihr jetzt vorsichtiger formulieren?",
  ].join("\n");
  const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "AION-Teamprotokoll.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$("#journal").onclick = () => journal();
$("#bag").onclick = bag;
$("#sound").onclick = () => {
  state.sound = !state.sound;
  save();
  renderUI();
  tone();
};
$("#menu").onclick = () => {
  modal(
    "Pause am Campus",
    '<div class="choices"><button id="menuHelp">Steuerung & Spielidee</button><button id="menuExport">Teamprotokoll speichern</button><button id="menuReset">Neu beginnen</button><button id="menuBack">Weiter spielen</button></div>',
  );
  $("#menuHelp").onclick = help;
  $("#menuReset").onclick = newGame;
  $("#menuExport").onclick = exportLog;
  $("#menuBack").onclick = close;
};
// Tile world: hand-drawn pixel geometry; no external assets or Nintendo sprites.
const canvas = $("#gameCanvas"),
  ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const rect = (x, y, w, h, c) => {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
};
function tree(x, y) {
  rect(x + 6, y + 18, 5, 10, "#72583f");
  rect(x + 1, y + 7, 16, 15, "#28583f");
  rect(x - 2, y + 10, 22, 8, "#28583f");
  rect(x + 2, y + 3, 14, 15, "#3c7850");
  rect(x + 5, y, 8, 14, "#4c8c54");
  rect(x + 4, y + 5, 4, 4, "#75a35c");
}
function building(r) {
  const l = lore[r],
    x = l.door[0] * 16 - 36,
    y = l.door[1] * 16 - 51;
  rect(x + 3, y + 10, 77, 46, "#446343");
  rect(x, y + 7, 72, 46, "#f1e7b6");
  rect(x, y + 37, 72, 16, "#cfbf8e");
  rect(x - 5, y, 82, 23, "#394d46");
  rect(x - 3, y - 3, 78, 23, l.roof);
  for (let k = 0; k < 4; k++) rect(x - 3, y + k * 5, 78, 1, "#ffffff30");
  for (let k = 0; k < 6; k++) rect(x + k * 13, y - 3, 1, 23, "#243f4340");
  rect(x + 8, y + 27, 14, 14, "#355865");
  rect(x + 10, y + 29, 10, 8, "#95c7c7");
  rect(x + 50, y + 27, 14, 14, "#355865");
  rect(x + 52, y + 29, 10, 8, "#95c7c7");
  rect(x + 28, y + 29, 17, 24, "#4a5146");
  rect(x + 31, y + 31, 11, 22, state.cores.includes(r) ? "#e5c965" : "#38565b");
  rect(x + 41, y + 41, 2, 2, "#e4c477");
  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  rect(x + 4, y + 15, 64, 12, "#fff4cd");
  ctx.fillStyle = "#344a40";
  ctx.fillText(l.short.toUpperCase(), x + 36, y + 23);
  ctx.textAlign = "left";
}
function sprite(x, y, walking = false) {
  const yy = y + (walking && Math.floor(walkTime * 10) % 2 ? 1 : 0);
  rect(x - 5, y + 4, 13, 4, "#36534566");
  rect(x - 4, yy - 6, 9, 10, "#314b57");
  rect(x - 5, yy - 5, 3, 7, "#e7be8d");
  rect(x + 5, yy - 5, 3, 7, "#e7be8d");
  rect(x - 3, yy + 3, 3, 5, "#253c47");
  rect(x + 2, yy + 3, 3, 5, "#253c47");
  rect(x - 3, yy - 15, 10, 9, "#f1cba0");
  rect(x - 4, yy - 18, 11, 5, "#546fa1");
  rect(x - 6, yy - 14, 14, 3, "#718fba");
  rect(x + 4, yy - 11, 2, 2, "#253c3b");
  rect(x - 3, yy - 5, 5, 7, "#dda868");
}
function drawWorld() {
  rect(0, 0, 480, 352, "#8ab669");
  for (let y = 0; y < 22; y++)
    for (let x = 0; x < 30; x++) {
      if ((x * 13 + y * 7) % 9 === 0) {
        rect(x * 16 + 3, y * 16 + 7, 2, 3, "#689b55");
        rect(x * 16 + 7, y * 16 + 5, 2, 4, "#a5c779");
      }
    }
  if (state.room < 0) {
    for (const l of lore) {
      rect(
        l.door[0] * 16 - 8,
        l.door[1] * 16,
        32,
        Math.max(16, (11 - l.door[1]) * 16),
        "#dece97",
      );
      const min = Math.min(l.door[1], 11) * 16;
      rect(
        l.door[0] * 16 - 8,
        min,
        32,
        Math.abs(l.door[1] - 11) * 16 + 20,
        "#dece97",
      );
      rect(
        Math.min(l.door[0], 15) * 16 - 8,
        170,
        Math.abs(l.door[0] - 15) * 16 + 32,
        28,
        "#dece97",
      );
    }
    rect(228, 64, 32, 258, "#dece97");
    rect(194, 156, 94, 52, "#dece97");
    for (let x = 0; x < 30; x += 2) {
      tree(x * 16, 15);
      tree(x * 16, 323);
    }
    for (let y = 3; y < 20; y += 2) {
      tree(2, y * 16);
      tree(458, y * 16);
    }
    rect(320, 256, 64, 40, "#416f83");
    rect(324, 260, 56, 32, "#79b7be");
    for (let i = 0; i < 6; i++)
      rect(327 + (i % 3) * 17, 265 + Math.floor(i / 3) * 14, 11, 2, "#acdcda");
    lore.forEach((_, r) => building(r));
    rect(203, 50, 74, 16, "#839992");
    rect(209, 65, 10, 24, "#577169");
    rect(263, 65, 10, 24, "#577169");
    rect(223, 65, 36, 22, state.escaped ? "#f4d884" : "#314c52");
    if (!state.escaped)
      for (let x = 226; x < 257; x += 6) rect(x, 65, 2, 22, "#9db6a2");
    ctx.font = "bold 7px monospace";
    ctx.fillStyle = "#fff4ce";
    ctx.fillText("NORDTOR", 221, 61);
    rect(200, 164, 14, 18, "#35565b");
    rect(202, 166, 10, 8, "#aed6a0");
    rect(204, 176, 6, 2, "#e5bd64");
    for (let i = 0; i < 16; i++) {
      const x = 44 + ((i * 53) % 392),
        y = 110 + ((i * 31) % 210);
      if (!blocked(Math.floor(x / 16), Math.floor(y / 16))) {
        rect(x, y, 3, 3, i % 2 ? "#f0ce79" : "#f4e7b9");
        rect(x + 1, y + 3, 1, 4, "#466f48");
      }
    }
  } else {
    const l = lore[state.room];
    rect(0, 0, 480, 352, "#253f4b");
    rect(24, 45, 432, 287, "#c6bd91");
    for (let y = 3; y < 21; y++)
      for (let x = 2; x < 28; x++)
        rect(x * 16, y * 16, 15, 15, (x + y) % 2 ? "#ddd0a1" : "#d3c697");
    rect(24, 38, 432, 26, "#75968a");
    rect(24, 63, 432, 7, "#456b61");
    for (let x = 44; x < 445; x += 80) {
      rect(x, 42, 37, 19, "#294857");
      rect(x + 3, 44, 31, 12, "#a4d0cb");
      rect(x + 18, 44, 2, 13, "#668f86");
    }
    [7, 15, 23].forEach((x, i) => {
      rect(x * 16 - 29, 102, 59, 30, "#657061");
      rect(x * 16 - 31, 97, 62, 25, "#9f8660");
      rect(x * 16 - 24, 82, 27, 25, "#314b52");
      rect(
        x * 16 - 21,
        85,
        21,
        14,
        stationDone(state.room, i) ? "#c0dc87" : "#78ada9",
      );
      rect(x * 16 - 18, 89, 13, 2, "#e8e7b3");
      rect(x * 16 + 8, 99, 14, 9, "#f4e8be");
      rect(x * 16 + 11, 101, 8, 1, "#a48d65");
      ctx.font = "bold 8px monospace";
      ctx.fillStyle = "#314b45";
      ctx.fillText(String(i + 1), x * 16 - 2, 145);
    });
    rect(212, 193, 56, 35, "#526a68");
    rect(216, 185, 48, 29, l.roof);
    rect(
      223,
      191,
      34,
      18,
      state.cores.includes(state.room) ? "#eacf71" : "#334d55",
    );
    rect(238, 202, 4, 7, "#f5dd86");
    rect(197, 240, 86, 32, "#869d77");
    rect(203, 246, 74, 20, "#adb48a");
    rect(224, 321, 32, 14, "#315452");
    for (let i = 0; i < 3; i++) {
      rect(42, 190 + i * 30, 39, 20, "#8c7458");
      for (let k = 0; k < 5; k++)
        rect(
          45 + k * 6,
          191 + i * 30,
          4,
          16,
          ["#b9534b", "#5d888d", "#dcc684"][k % 3],
        );
    }
    tree(421, 187);
    ctx.fillStyle = "#fff4cd";
    ctx.font = "bold 8px monospace";
    ctx.fillText("ARCHIVSCHLOSS", 204, 180);
    ctx.fillText("CAMPUS ↓", 216, 347);
  }
  sprite(
    state.player.x * 16 + 8,
    state.player.y * 16 + 8,
    keys.size > 0 || route.length > 0,
  );
  const o = nearest();
  if (o) {
    rect(state.player.x * 16 - 6, state.player.y * 16 - 31, 33, 11, "#fff8d7");
    ctx.fillStyle = "#294744";
    ctx.font = "bold 7px monospace";
    ctx.fillText("[E] / A", state.player.x * 16 - 3, state.player.y * 16 - 23);
  }
}
function blocked(x, y) {
  if (x < 1 || x > 28 || y < 3 || y > 20) return true;
  if (state.room < 0) {
    if (x >= 20 && x <= 23 && y >= 16 && y <= 18) return true;
    return lore.some(
      (l) =>
        x >= l.door[0] - 2 &&
        x <= l.door[0] + 2 &&
        y >= l.door[1] - 3 &&
        y < l.door[1],
    );
  }
  return (
    (y >= 5 && y <= 6 && [7, 15, 23].some((a) => Math.abs(x - a) <= 2)) ||
    (x >= 13 && x <= 16 && y >= 12 && y <= 13) ||
    (x >= 12 && x <= 17 && y >= 15 && y <= 16) ||
    (x <= 5 && y >= 11 && y <= 16) ||
    (x >= 26 && y >= 11 && y <= 14)
  );
}
function nearest() {
  return objects()
    .map((o) => ({
      ...o,
      d: Math.hypot(state.player.x - o.x, state.player.y - o.y),
    }))
    .filter((o) => o.d < 2.1)
    .sort((a, b) => a.d - b.d)[0];
}
function interact() {
  if (!state.started || $("#modal").open) return;
  const o = nearest();
  o ? o.action() : toast("Gehe näher an ein Gerät oder nutze die Objektliste.");
}
function pathTo(tx, ty) {
  const sx = Math.round(state.player.x),
    sy = Math.round(state.player.y),
    q = [[sx, sy]],
    parents = new Map([[sx + "," + sy, null]]);
  let dest = null;
  while (q.length) {
    const [x, y] = q.shift();
    if (x === tx && y === ty) {
      dest = [x, y];
      break;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        k = nx + "," + ny;
      if (!parents.has(k) && !blocked(nx, ny)) {
        parents.set(k, [x, y]);
        q.push([nx, ny]);
      }
    }
  }
  if (!dest) return [];
  const p = [];
  while (dest) {
    p.unshift({ x: dest[0], y: dest[1] });
    dest = parents.get(dest.join(","));
  }
  return p.slice(1);
}
canvas.addEventListener("pointerdown", (e) => {
  if ($("#modal").open || !state.started) return;
  const b = canvas.getBoundingClientRect(),
    x = ((e.clientX - b.left) / b.width) * 30,
    y = ((e.clientY - b.top) / b.height) * 22;
  const target = objects().find((o) => Math.hypot(o.x - x, o.y - y) < 2.6);
  let tx = Math.floor(x),
    ty = Math.floor(y);
  if (target) {
    tx = target.x;
    ty = target.y;
    if (blocked(tx, ty)) ty++;
  }
  route = pathTo(tx, ty);
  if (!route.length) {
    if (target && Math.hypot(state.player.x - tx, state.player.y - ty) < 2.1)
      target.action();
    else
      toast(
        "Dieser Weg ist versperrt. Tippe auf einen freien Weg oder nutze die Objektliste.",
      );
  } else route.at(-1).action = target?.action;
  canvas.focus();
});
const keyDir = {
  ArrowUp: [0, -1],
  w: [0, -1],
  ArrowDown: [0, 1],
  s: [0, 1],
  ArrowLeft: [-1, 0],
  a: [-1, 0],
  ArrowRight: [1, 0],
  d: [1, 0],
};
window.addEventListener("keydown", (e) => {
  if ($("#modal").open || !state.started) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (
    keyDir[k] &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
  ) {
    e.preventDefault();
    keys.add(k);
    route = [];
  }
  if (
    ["e", "Enter", " "].includes(k) &&
    !["BUTTON", "A", "INPUT", "TEXTAREA"].includes(e.target.tagName)
  ) {
    e.preventDefault();
    interact();
  }
});
window.addEventListener("keyup", (e) =>
  keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key),
);
window.addEventListener("blur", () => {
  keys.clear();
  save();
});
document.addEventListener("visibilitychange", () => {
  keys.clear();
  last = 0;
  if (document.hidden) save();
});
$$("[data-dir]").forEach((b) => {
  const key = {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  }[b.dataset.dir];
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    keys.add(key);
    route = [];
  };
  b.onpointerup =
    b.onpointercancel =
    b.onlostpointercapture =
      () => keys.delete(key);
});
$("#interact").onclick = interact;
let saveTick = 0;
function loop(now) {
  const dt = Math.min((now - last) / 1000 || 0, 0.05);
  last = now;
  if (state.started && !document.hidden) {
    if (!state.escaped) {
      state.seconds += dt;
      saveTick += dt;
      if (saveTick > 10) {
        saveTick = 0;
        save();
      }
    }
    if (!$("#modal").open) {
      walkTime += dt;
      let dx = 0,
        dy = 0;
      for (const k of keys) {
        dx += keyDir[k]?.[0] || 0;
        dy += keyDir[k]?.[1] || 0;
      }
      if (route.length) {
        const p = route[0],
          dist = Math.hypot(p.x - state.player.x, p.y - state.player.y);
        if (dist < 0.09) {
          state.player = { x: p.x, y: p.y };
          route.shift();
          if (p.action) {
            save();
            p.action();
          }
        } else {
          dx = (p.x - state.player.x) / dist;
          dy = (p.y - state.player.y) / dist;
        }
      }
      const norm = Math.hypot(dx, dy);
      if (norm) {
        const nx = state.player.x + (dx / norm) * dt * 5,
          ny = state.player.y + (dy / norm) * dt * 5;
        if (!blocked(Math.round(nx), Math.round(state.player.y)))
          state.player.x = nx;
        if (!blocked(Math.round(state.player.x), Math.round(ny)))
          state.player.y = ny;
      }
    }
  }
  $("#clock").textContent =
    String(Math.floor(state.seconds / 60)).padStart(2, "0") +
    ":" +
    String(Math.floor(state.seconds % 60)).padStart(2, "0");
  drawWorld();
  requestAnimationFrame(loop);
}
$(".world").appendChild($("#touchPad"));
load();
renderUI();
intro();
requestAnimationFrame(loop);
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
// Read-only diagnostics: tests still traverse every actual interaction.
window.__AION_TEST__ = Object.freeze({
  sectors,
  bonusTasks,
  lore,
  getState: () => JSON.parse(JSON.stringify(state)),
  blocked,
  pathTo,
});
