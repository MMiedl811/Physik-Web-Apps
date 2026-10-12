# Schrittweise Designumstellung

Stand: 12. Oktober 2026. Ziel: Die Apps der sichtbaren Front Page nach `DESIGN.md` gestalten und auf Desktop sowie iPad gut bedienbar halten. Modelle, Inhalte, fachliche Farben und App-Links bleiben erhalten, sofern der aktuelle Auftrag nichts anderes verlangt.

## Vorgehen und Zuständigkeit

Schrittweise eine App oder ein kleines Paket gemäß aktuellem Auftrag bearbeiten. Matthias beauftragt den nächsten Umbau und entscheidet über Veröffentlichung; Codex setzt ihn um, prüft ihn und aktualisiert diese Datei am Ende des Auftrags, auch bei offenen Problemen. Ein Eintrag in dieser Liste ist keine automatische Arbeits- oder Releasefreigabe.

`DESIGN.md` enthält die Gestaltungsregeln. **Diese Datei ist die zentrale Buchführung für Fortschritt und Prüfstand.** Erinnerungen enthalten nur einen Verweis hierher, keine zweite Statusliste. Vor jeder Fortsetzung aktuellen Git- und Veröffentlichungsstand prüfen. Prüfungen nach späteren Änderungen erneut bewerten.

Nächster Schritt: Bei einem neuen Umbauauftrag eine sichtbare App mit „Offen“ auswählen. Zuerst aktuelle Frontpage, Git-Status und diese Tabelle abgleichen; ausgeblendete Apps nicht automatisch aufnehmen. Das Leistungslabor ist lokal umgestellt und noch nicht veröffentlicht.

## Prüfstand der Designumstellung

„Offen“ bedeutet: noch nicht auf die neue Designsprache umgestellt. „Nicht geprüft“ bezieht sich ausschließlich auf diese Umstellung, nicht auf frühere fachliche oder technische Prüfungen. „Veröffentlicht“ bezeichnet das neue Design, nicht die bereits bestehende App.

| App | Umbau | Prüfung des neuen Designs | Neues Design veröffentlicht |
| --- | --- | --- | --- |
| [Energie-Runner](energie-runner/) | Offen | Nicht geprüft | Nein |
| [Freier Fall in Zeitlupe](freier-fall-energie/) | Offen | Nicht geprüft | Nein |
| [Kreisbewegungs-Labor](kreisbewegungs-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Leistungslabor: Treppe & Heben](mechanische-leistung/index.html) | Lokal umgestellt (12.10.2026) | Chromium/WebKit mit Touch, beide Versuche, Desktop/iPad/schmale Fenster, Textvergrößerung; Details unten | Nein |
| [Newtons Kanonenkugel](newtons-kanonenkugel/index.html) | Offen | Nicht geprüft | Nein |
| [Waagrechter und schräger Wurf](waagrechter%20Wurf/) | Offen | Nicht geprüft | Nein |
| [Kraft führt zu einer Kreisbewegung](zentripetalkraft-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Geschwindigkeitsänderung](v_aenderung/) | Offen | Nicht geprüft | Nein |
| [Vektor-Labor](vektor-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Drei-Finger-Quiz](drei-finger-quiz/index.html) | Offen | Nicht geprüft | Nein |
| [Leiterschleife im Magnetfeld](leiterschleife-magnetfeld/index.html) | Offen (älteres Design im Quelltext) | Nicht geprüft | Nein |
| [Induktion am bewegten Leiterstab](induktion-leiterstab/index.html) | Offen (älteres Design im Quelltext) | Nicht geprüft | Nein |
| [Magnetische Felder](magnetische-felder/) | Neue Designsprache im lokalen Quelltext vorhanden | In diesem Auftrag nicht geprüft; vor einer Fertigmeldung separat prüfen | Nicht bestätigt |
| [Feldvektor-Werkstatt](feldvektor-werkstatt/) | Offen | Nicht geprüft | Nein |
| [Elektrische Felder](elektrische-felder/index.html) | Gesamte Oberfläche nach `DESIGN.md` angepasst (07.10.2026) | Chromium: alle Modi, Desktop/iPad-Formate, Zoom und Regression erfolgreich; Details unten | Ja; `481cc64`, Pages bestätigt (07.10.2026) |
| [Kondensator-Pendel](kondensator-pendel/) | Offen | Nicht geprüft | Nein |
| [Quanten-Labor](energiestufenmodell/) | Offen | Nicht geprüft | Nein |

## Bereits vorhandene Ergebnisse

- **Front Page (`index.html`):** neues Design geprüft und veröffentlicht am 6. Oktober 2026, Commit `05a15b7`. Chromium und WebKit: Desktop, 1024 × 768, 820 × 1180 und schmale Fenster; Navigation, 48-px-Touchflächen, Textkontraste, 200 % Textvergrößerung, JS-Syntax und Browserfehler geprüft. Remote-SHA, erfolgreicher Pages-Lauf und identischer Live-Inhalt wurden im Releaseauftrag bestätigt. Kein Test auf einem echten iPad.
- **Fadenpendel (`fadenpendel-energie/index.html`):** lokaler Designversuch, von Matthias als passende Richtung bestätigt. Chromium: Desktop und beide iPad-Formate visuell geprüft; Start/Pause, Tempo, Reibung, Diagramme, Reset, Tiefpunkt und Nullniveau bedient; keine Browser-/Requestfehler, keine externen Laufzeit-Requests, kein horizontaler Überlauf; sichtbare Controls mindestens 48 px. Nicht veröffentlicht, kein echter iPad-Test. Gehört nicht zu den 14 Katalog-Apps dieses Vorhabens.

## Nachweis pro Paket

Nach `DESIGN.md` und dem Projekt-Workflow prüfen: Desktop und beide iPad-Formate tatsächlich ansehen, relevante Zustände und Controls bedienen, Touchflächen und Überlauf prüfen, Front Page → App → Front Page testen, Browser-/Assetfehler sowie passende bestehende Tests und `git diff --check` prüfen. Fachmodell und Farbcodierung bewahren. Nur tatsächlich ausgeführte Prüfungen eintragen; Emulation von echtem iPad-Test unterscheiden.

In der Tabelle je App kurz Datum, Ergebnis und verbleibende Einschränkungen ergänzen. Bei Veröffentlichung Commit und separat bestätigten Pages-Stand vermerken; bei Verzögerung „gepusht, Pages noch nicht bestätigt“. Umfangreiche Ausgaben gehören nicht in diese Datei.

## Lokale Arbeit und Veröffentlichung

Es gibt bereits unveröffentlichte App-Änderungen, unter anderem im Commit `ce3449c`, sowie den lokalen Fadenpendel-Versuch. Vor jedem Release den aktuellen Diff prüfen und ausschließlich das beauftragte Paket veröffentlichen. Historische Ausgangsliste: 14 Apps am GitHub-Stand `05a15b7`. Am 12.10.2026 enthält die lokale Frontpage 17 sichtbare App-Links; die Tabelle erfasst diese 17 Apps. Neu erfasste Einträge bestätigen keine früheren Prüfungen oder Veröffentlichungen.

Matthias hat die Anpassung und Veröffentlichung von Workflow-Skill, `PLAN.md` und dem `AGENTS.md`-Verweis ausdrücklich freigegeben. Dieser Dokumentationsrelease enthält keine App-Änderungen. Künftige Veröffentlichungsfreigaben ergeben sich aus dem jeweiligen aktuellen Auftrag.

## Elektrische Felder: Einzel- und Gesamtfeld (7. Oktober 2026)

- **Umfang:** ausschließlich neue Feldlinienansichten, zugehörige Bediengruppe und Erklärung. Zwei unabhängige Checkboxen mit mindestens 48-px-Touchflächen, sichtbarem Fokus und Linienmustern nach `DESIGN.md`. Standard/Reset: nur Gesamtfeld. Auswahl bleibt bei Voreinstellungs- und Moduswechsel erhalten. Die übrige App wurde nicht auf das neue Design umgestellt.
- **Darstellung:** analytische radiale Einzelfeldlinien bei Punktladungen, versetzte horizontale Einzelbeiträge beider idealer Platten; gestrichelt in vorhandenen Quellenfarben. Bestehende Gesamtfeldlinien bleiben durchgezogen und grün. Messwerte, Potential, Äquipotentiallinien und Bewegung beruhen weiterhin auf dem Gesamtfeld; Pfeile sind statisch.
- **Neue Prüfung:** `tests/electric-field-views.test.mjs` erfolgreich. Vier Schalterkombinationen mit unterschiedlichen Canvas-Bildern; analytische Quellenrichtungen und radiale Übereinstimmung bei Einzelladungen; Plattenbeiträge innen/außen; unveränderte Feld-/Potentialwerte und deterministische Bewegung; Reset, Moduspersistenz, Tastatur/Fokus, Touchflächen, Navigation und lokale Laufzeit-Assets.
- **Regression:** `electric-ideal-capacitor.test.mjs` erfolgreich (450 Modellpunkte, Außenfeld, Potentialgradient, Kollision); `electric-overlays.test.mjs` erfolgreich (Potential/Äquipotentiallinien, Bewegung und Reset); `electric-superposition-mode.test.mjs` erfolgreich. HTML-IDs, Inline-JS-Syntax und `git diff --check` erfolgreich.
- **Visuell angesehen:** Chromium 1440×900, 1024×768 und 820×1180, Standard sowie Dipol/Kondensator mit beiden Ebenen; zusätzlich 390×844, 720×450 als Layoutäquivalent zu 200 % Desktopzoom sowie separat verdoppelte Textgrößen der neuen Anzeigegruppe. Keine horizontalen Überläufe; ein langer Textumbruch bei vergrößerter Schrift wurde korrigiert. Kein Test auf einem echten iPad und keine vollständige Designprüfung der übrigen App.
- **Veröffentlichung:** nach ausdrücklicher Freigabe veröffentlicht. App und neuer Test: Commit `2fbab80`; Remote-SHA bestätigt, live ausgelieferte App-Datei am 07.10.2026 bytegleich geprüft; `electric-field-views.test.mjs` auch auf der öffentlichen Pages-App erfolgreich. Release aus separatem Checkout des aktuellen Remote-Stands; fremde lokale Änderungen und unveröffentlichte Commits nicht mit veröffentlicht. Keine offenen Punkte im beauftragten Umfang.


## Elektrische Felder: vollständige UI-Umstellung (7. Oktober 2026)

- **Auftrag:** gesamte App-Oberfläche nach `DESIGN.md` gestalten und veröffentlichen. Andere Apps, Front Page und gemeinsame Assets nicht verändert.
- **Umbau:** helle semantische Flächen, Systemschrift, blaue Bedienaktionen, konsistente Überschriften/Abstände, sichtbare Übersichtsnavigation und mindestens 48-px-Bedienflächen. Aufbauwerkzeuge neben der Simulation ab 820 px; Auswertung darunter, Darstellungs- und Modellparameter als eigene Gruppen. Schmale Fenster stapeln. Legendeneinträge außerhalb des Canvas, Messwerte ohne Abschneiden, größere Canvas-Beschriftungen. Alte Scrollsperren und komprimierte Moduslayouts entfernt.
- **Zustände:** aktive Voreinstellungen, Werkzeuge und Vorzeichen zusätzlich mit `aria-pressed`; sichtbarer Tastaturfokus und Druckzustände. Einstieg app-lokal gestaltet; Escape und Start führen den Fokus auf den aktiven Modus zurück. Punkt-P-Werkzeug beim Kondensator sichtbar. Physikalische Farben, statische Pfeile, Feld- und Bewegungsmodell bleiben erhalten.
- **Darstellungspräzision:** das neue Canvas-Format deckte im bestehenden Regressionstest einen Fehler sehr kurzer Äquipotentialsegmente auf. Schnittpunkte werden mit 20 statt 12 Bisektionsschritten bestimmt; Feldberechnung und Konturwerte unverändert. Danach alle Konturprüfungen erfolgreich.
- **Prüfungen:** `electric-ui.test.mjs`, `electric-field-views.test.mjs`, `electric-ideal-capacitor.test.mjs`, `electric-overlays.test.mjs` und `electric-superposition-mode.test.mjs` erfolgreich. Echte Browseraktionen für Modi, Vorzeichen, Start/Pause, Reset, Checkboxen, Tastaturtabs, Einstieg, Erklärung und Navigation; keine Browser-/Requestfehler, ausschließlich lokale Laufzeit-Assets. HTML-IDs eindeutig, Inline-JS-Syntax und `git diff --check` erfolgreich. Neue Textkontraste ≥ 4,5:1; Eingabeumrisse ≥ 3:1.
- **Visuell:** Chromium 1440×900, 1024×768, 820×1180 und 390×844 angesehen; alle drei Modi, Potential-/Konturansicht sowie Einstieg. Zusätzlich 720×450 als Layoutäquivalent von 200 % Desktopzoom und verdoppelte UI-Schrift geprüft/angesehen; lange Buttonwörter umbrechen ohne Überlappung. Keine horizontalen Überläufe; keine globale Scrollsperre nach Einstieg. Kein echter iPad-Hardwaretest.
- **Veröffentlichung:** ausdrücklich freigegeben und veröffentlicht: App/Test/UI-Dokumentation im Commit `481cc64`; Remote-SHA bestätigt. Live-App-Datei am 07.10.2026 bytegleich zum Release; `electric-ui.test.mjs` auch auf der öffentlichen Pages-App erfolgreich. Separater Checkout bewahrt fremde lokale Änderungen und unveröffentlichte Commits. Keine offenen Punkte im beauftragten Umfang.


## Elektrische Felder: Randfeldversuch (8. Oktober 2026, ersetzt)

- **Historischer lokaler Versuch:** endliche 2D-Plattenstreifen mit Randfeldern, Umschalter und Längenregler wurden implementiert und fachlich sowie im Browser geprüft. Matthias hat anschließend ausdrücklich ein exakt homogenes Unterrichtsmodell verlangt. Der Randfeldversuch wurde vollständig durch die folgende Umsetzung ersetzt und nie veröffentlicht.
- **Beibehalten:** weißer Canvas nach `--surface`, neutrales Punktraster und flache Ladungssymbole in den bestehenden physikalischen Farben.

## Elektrische Felder: homogenes Unterrichtsmodell (8. Oktober 2026)

- **Auftrag und Umfang:** Kondensator ausschließlich als Idealfall unendlich ausgedehnter Platten darstellen. Exakt homogenes Innenfeld in allen drei Untersuchungsmodi; keine veränderbare Plattenlänge und keine Randeffekte. Andere Apps, Front Page und gemeinsame Assets bleiben unverändert.
- **Modell:** Jede Platte trägt innen denselben horizontalen Beitrag σ/(2ε₀) bei; ihre Summe ist überall E = σ/ε₀. Potential φ = −Ex und Bewegung nach m·a = qₚ·E verwenden dasselbe Idealmodell. Die beiden Beiträge und die Resultierende bleiben auch in „Vektoren addieren“ exakt parallel. Keine Mischung mit einem endlichen Randfeldmodell.
- **UI und Zeichenfläche:** sichtbarer Hinweis „Idealfall: homogenes Innenfeld“ in allen drei Modi; Erklärung und Werkzeughinweise nennen ausdrücklich den Innenraum. Platten ohne sichtbare Enden über die gesamte Zeichenhöhe; Feldansichten auf den Innenraum beschränkt. Sonde, Punkt P und manuell gesetzte Probeladung bleiben bei Zeiger-/Tastaturbedienung sowie beim Verkleinern des Abstands innen. Längenregler und Randfeldschalter entfernt. Weißer Canvas, neutrales Raster und flache Quellen erhalten.
- **Prüfungen:** `electric-capacitor-interior.test.mjs` erfolgreich: exakt gleiche Feldwerte an 180 Innenpunkten über alle drei Modi, gleiche horizontale Einzelbeiträge, feste Modellannahme ohne Längensteuerung, sichtbarer Hinweis, Zeiger-/Tastatur-/Abstandsbedienung, Reset und vier Fenstergrößen. `electric-ideal-capacitor.test.mjs` erfolgreich: 450 Modellpunkte, Außenfeldaufhebung, E = −∇φ, U = Ed, Plattenkontakt und drei Fenstergrößen. `electric-ui`, `electric-field-views`, `electric-overlays` und `electric-si-motion` erfolgreich; keine Browserfehler in diesen Prüfungen. Die Quellverträge `electric-superposition-mode` und `electric-test-charge-mode`, eindeutige HTML-IDs, Inline-JS-Syntax und `git diff --check` ebenfalls erfolgreich. Der bisherige Kondensatortest wurde an den entfernten Längenregler angepasst.
- **Visuell:** Chromium 1440×900, 1024×768 und 820×1180 sowie die Superpositionsansicht angesehen. Durchgehend parallele Feldlinien, gleichgerichtete Einzelpfeile, Hinweis lesbar und keine horizontalen Überläufe. Zusätzlich 390×844 im Browser geprüft. UI-Test umfasst 720×450 und vergrößerte Schrift. Kein echter iPad-Hardwaretest.
- **Bekannte Testgrenze:** `electric-app-unified.test.mjs` hat weiterhin eine veraltete Katalogerwartung „12 Apps“ und wurde in diesem Auftrag nicht geändert; Navigation und Assets werden separat durch den UI-Test geprüft.
- **Veröffentlichung:** nach ausdrücklicher Freigabe veröffentlicht: App und gezielte Tests im Commit `8f76f00`. Remote-SHA bestätigt; zugehöriger Pages-Workflow erfolgreich. Live-App am 08.10.2026 bytegleich zum Release geprüft; `electric-capacitor-interior.test.mjs` auch auf der öffentlichen App erfolgreich (180 Innenpunkte, alle Modi, Bedienung und vier Fenstergrößen). Release aus separatem Checkout; fremde lokale Änderungen und unveröffentlichte Commits nicht mit veröffentlicht. Keine offenen Punkte im beauftragten Umfang.

## Elektrische Felder: iPad-Layoutkorrekturen (8. Oktober 2026)

- **Auftrag:** gemeldete Fehlplatzierungen in allen drei Ansichten auf iPad-Formaten prüfen und bestätigte UI-Fehler gezielt beheben. Keine Änderung am Feld-/Bewegungsmodell. Veröffentlichung anschließend von Matthias ausdrücklich freigegeben. Fremde lokale Änderungen bleiben unberührt.
- **Reproduziert und korrigiert:** leere dritte Einstellungsspalte im Bewegungs-/Superpositionsmodus; unnötig gestreckte Feldbild-Karte; Werkzeugbutton mit nur halber Zeilenbreite; versetzte Überschriften an der nativen Fieldset-Legende. Sichtbare Objektbeschriftungen bleiben im Canvas; außerhalb liegende Probeladungen erhalten keine abgeschnittene Symbol-/Textdarstellung, die physikalische Bahnspur bleibt erhalten. WebKit zeichnete den nativen Hintergrund-Select nur als schmalen Streifen innerhalb seiner gemessenen Touchfläche; app-lokales Erscheinungsbild und CSS-Auswahlpfeil korrigieren dies bei erhaltener nativer Auswahlfunktion.
- **Browserprüfung:** neuer `electric-ipad-layout.test.mjs` erfolgreich in Chromium und WebKit, jeweils Touch-Kontext, 1440×900, 1024×768, 820×1180, 600×900 (Mehrfensterbreite) und 720×450 (Layoutäquivalent zu 200 % Desktopzoom). Alle Modi, Start/Pause, echte Hintergrundauswahl, Randbeschriftungen und abgeschlossene Bewegung außerhalb des Ausschnitts, Überschriftenabstände, Kartenhöhe, volle Werkzeugbreite, mindestens 48-px-Touchflächen und horizontale Überläufe geprüft; keine Browser-/Requestfehler.
- **Visuell:** Screenshots beider iPad-Formate mit WebKit angesehen, einschließlich aller drei Modi und abgeschlossener Bewegung; Desktop-Bewegungsansicht mit Chromium angesehen. Hintergrundauswahl nach der WebKit-Korrektur erneut visuell kontrolliert. Keine Aussage über einen echten iPad-Hardwaretest oder Mobile-Safari-Systemdialoge.
- **Regression:** `electric-ui.test.mjs` erfolgreich, einschließlich vergrößerter Schrift und Navigation; `electric-capacitor-interior.test.mjs` erfolgreich mit 180 exakt homogenen Innenpunkten; `electric-si-motion.test.mjs` erfolgreich mit unveränderter SI-Bewegung und Energiebilanz. Eindeutige HTML-IDs, Inline-JS-Syntax und `git diff --check` erfolgreich.
- **Stand:** Veröffentlicht mit ausdrücklicher Freigabe: Commit `600f581`, Remote-SHA und erfolgreicher Pages-Workflow bestätigt. Live-App am 08.10.2026 bytegleich zum Release; neuer iPad-Layouttest auch öffentlich in Chromium und WebKit erfolgreich. Fremde lokale Arbeiten nicht mit veröffentlicht.

## Verbindliche UI-Abschlussprüfung (8. Oktober 2026)

- **Auftrag:** wiederkehrende Fehler bei UI-Modernisierungen durch konkrete Projektregeln und Skill-Verweise abfangen. Keine zusätzlichen App-Änderungen. Veröffentlichung anschließend von Matthias ausdrücklich freigegeben.
- **Änderungen:** `DESIGN.md`, Abschnitt 8, verlangt Prüfung aller betroffenen Modi/Zustände, tatsächliche Screenshot-Sichtprüfung, Chromium und WebKit für iPad-relevante Änderungen sowie Korrektur und erneute Prüfung vor der Fertigmeldung. Ursachenliste umfasst ausgeblendete Grid-Kinder, Kartenstreckung, Werkzeugbreiten, Legendenausrichtung, native Controls und Canvas-Randtexte. Workflow und Review verweisen auf diese zentrale Regel; der reine Review bleibt lesend.
- **Prüfung:** vollständiger Dokumentationsdiff und interne Verweisziele geprüft; beide Skills mit `quick_validate.py` erfolgreich validiert; `git diff --check` erfolgreich. Kein zusätzlicher App-Browsertest für diese reine Anweisungsänderung erforderlich. Die vorherigen App-Prüfungen sind im vorangehenden Abschnitt dokumentiert.
- **Stand:** Design- und Skill-Regeln in Commit `600f581` veröffentlicht; alle drei GitHub-Dateien bytegleich zum geprüften Release bestätigt. Die Regeln verlangen konkrete Nachweise vor der Fertigmeldung; verbleibende Prüflücken müssen weiterhin benannt werden.

## Feldvektor-Werkstatt: Feldstärken in P als Standard (11. Oktober 2026)

- **Auftrag:** standardmäßig Einzelfeldbeträge E₁ bis E₄ in V/m am frei gesetzten P eingeben; Quellladungsbeträge in pC/nC als zweiter Modus. Veröffentlichung ausdrücklich freigegeben. Keine Freigabe zur Veröffentlichung des zusätzlich lokal vorhandenen Aufgabenmodus; dieser bleibt außerhalb des Releases.
- **Umsetzung:** Start mit zwei Quellen und E₁ = E₂ = 2 V/m, eindeutiger Moduswähler, feldbezogene Eingaben und Diagrammtexte. Beim Verschieben bleiben vorgegebene Beträge erhalten, Richtungen folgen Vorzeichen und Geometrie. Der Quellladungsmodus berechnet nach Coulomb. Wechsel erhält die Beiträge im aktuellen P und berechnet passende Quellladungen automatisch. Gewöhnliche Vorlagen behalten den gewählten Modus; JSON-Aufbauten behalten ihre gespeicherte Modellwahl, bisherige v2-Dateien ohne Modus bleiben Quellladungsaufbauten. SVG-Marker-IDs von neuen E-Eingabefeldern getrennt.
- **Prüfung:** `field-vector-default-mode.test.mjs` und angepasster bestehender `field-vector-workshop.test.mjs`: unabhängige Vektorsumme, Coulomb- und Abstandsreferenz, Konversion, echte P-Platzierung, Feldwerteingaben, Vorlagen, bis zu vier Quellen, JSON-Kompatibilität, PNG, Ziehen/Tastatur/Rückgängig. Chromium und WebKit mit Touch, Desktop 1440×900, 1024×768, 820×1180, 600×900 und 720×450 als Zoom-Layoutäquivalent. Keine Browser-/Requestfehler oder horizontalen Überläufe; sichtbare Eingaben/Buttons mindestens 48 px hoch.
- **Visuell:** Desktop sowie beide iPad-Formate mit Feldwerteingabe und Quellladungsmodus angesehen. Native Auswahldarstellung und Fokus app-lokal angepasst; Quellenbeschriftungen am Achsenrand unterhalb der Achsenwerte. Keine vollständige Designmigration oder echter iPad-Hardwaretest.
- **Veröffentlichung:** am 11.10.2026 nach ausdrücklicher Freigabe veröffentlicht: App und Tests in Commit `ea23d3a`; Remote-SHA und erfolgreicher Pages-Workflow bestätigt. Alle vier Laufzeitdateien live bytegleich zum geprüften Release. Neuer Standardmodus-Test auch auf der öffentlichen App in Chromium und WebKit erfolgreich. Andere lokale Arbeiten und der lokal vorhandene Aufgabenmodus nicht enthalten.

## Leistungslabor: Designumstellung (12. Oktober 2026)

- **Auftrag:** eine sichtbare App auswählen und nach `DESIGN.md` modernisieren; Fortschritt für neue Sessions dokumentieren. Gewählt: Leistungslabor mit Treppenlauf und Gewichtheben. Veröffentlichung im Folgeauftrag ausdrücklich freigegeben (12.10.2026).
- **Umbau:** app-lokale helle Flächen, Systemschrift, blaue Aktionen, sichtbare Übersichtsnavigation, Auswahl-/Druck-/Fokuszustände, mindestens 48-px-Controls, größere Messwerte und Canvas-Achsen. Simulation und Diagramme ab 820 px nebeneinander, darunter gestapelt. Einstieg und Formelerklärung ebenfalls angepasst. Statusanzeigen oberhalb der Szene verdecken keine Figuren; Hubhöhenbeschriftung oberhalb der Personen platziert. Lange Texte umbrechen auch bei vergrößerter Schrift. Fachmodell, Szenen und physikalische Farben bewahrt; Diagrammzeiger an die größeren Achsenränder angepasst.
- **Prüfung:** `tests/power-lab-design.test.mjs` erfolgreich in Chromium und WebKit mit Touch-Kontext: 1440×900, 1024×768, 820×1180, 600×900, 720×450 als 200-%-Zoom-Layoutäquivalent und 390×900; beide Modi, Start/Pause, Tempoauswahl, Zeitregler an Extremwerten, Diagrammprüfung per Tastatur, Reset, Formeln, Einstieg und Übersicht → App → Übersicht. Zusätzlich verdoppelte UI-Textgrößen; kein horizontaler Überlauf, keine zu kleinen Controls, doppelten IDs, Browser-/Assetfehler oder externen Laufzeit-Requests. Unabhängige Zahlenreferenzen: Treppen-Zielenergie 2678,13 J, Hebeleistungen bei 5 s/1 s gerundet 137 W/687 W. Physikfunktionen im Quelltext mit dem Ausgangsstand verglichen und unverändert. Inline-JS-Syntax und `git diff --check` erfolgreich.
- **Visuell:** Screenshots beider Modi in Chromium und WebKit auf Desktop und beiden iPad-Formaten sowie schmale Fenster und vergrößerte Schrift angesehen. Emulation, kein echter iPad-Hardwaretest. Lokale HTTP-Nutzung mit ausschließlich lokalen Assets geprüft; Offline-Neuladen einer gehosteten Seite nicht geprüft.
- **Stand:** Lokal und im isolierten Release-Checkout geprüft; Veröffentlichung ausdrücklich freigegeben, Pages-Bestätigung folgt. Geändert: `mechanische-leistung/index.html`, neuer gezielter UI-Test und diese Fortschrittsdatei. `AGENTS.md` verweist bereits auf die zentrale Liste und bleibt unverändert. Andere vorhandene lokale Änderungen und unveröffentlichte Commits nicht übernommen.
