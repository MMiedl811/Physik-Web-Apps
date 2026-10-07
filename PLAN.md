# Schrittweise Designumstellung

Stand: 6. Oktober 2026. Ziel: Die 14 Apps der veröffentlichten Front Page nach `DESIGN.md` gestalten und auf Desktop sowie iPad gut bedienbar halten. Modelle, Inhalte, fachliche Farben und App-Links bleiben erhalten, sofern der aktuelle Auftrag nichts anderes verlangt.

## Vorgehen und Zuständigkeit

In kleinen Paketen von zwei bis drei Apps arbeiten. Matthias beauftragt das nächste Paket und entscheidet über Veröffentlichung; Codex setzt es um, prüft es und aktualisiert diese Datei am Ende des Auftrags, auch bei offenen Problemen. Ein Eintrag in dieser Liste ist keine automatische Arbeits- oder Releasefreigabe.

`DESIGN.md` enthält die Gestaltungsregeln. **Diese Datei ist die zentrale Buchführung für Fortschritt und Prüfstand.** Erinnerungen enthalten nur einen Verweis hierher, keine zweite Statusliste. Vor jeder Fortsetzung aktuellen Git- und Veröffentlichungsstand prüfen. Prüfungen nach späteren Änderungen erneut bewerten.

Nächster Schritt: Im nächsten Umbauauftrag zwei Apps als erstes Paket auswählen; die Auswahl ist noch offen. Die Buchführung ist eingerichtet; Workflow-Skill und Plan werden mit ausdrücklicher Freigabe veröffentlicht. In diesem Auftrag wird keine weitere App umgebaut.

## Prüfstand der Designumstellung

„Offen“ bedeutet: noch nicht auf die neue Designsprache umgestellt. „Nicht geprüft“ bezieht sich ausschließlich auf diese Umstellung, nicht auf frühere fachliche oder technische Prüfungen. „Veröffentlicht“ bezeichnet das neue Design, nicht die bereits bestehende App.

| App | Umbau | Prüfung des neuen Designs | Neues Design veröffentlicht |
| --- | --- | --- | --- |
| [Energie-Runner](energie-runner/) | Offen | Nicht geprüft | Nein |
| [Freier Fall in Zeitlupe](freier-fall-energie/) | Offen | Nicht geprüft | Nein |
| [Kreisbewegungs-Labor](kreisbewegungs-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Leistungslabor: Treppe & Heben](mechanische-leistung/index.html) | Offen | Nicht geprüft | Nein |
| [Newtons Kanonenkugel](newtons-kanonenkugel/index.html) | Offen | Nicht geprüft | Nein |
| [Waagrechter und schräger Wurf](waagrechter%20Wurf/) | Offen | Nicht geprüft | Nein |
| [Kraft führt zu einer Kreisbewegung](zentripetalkraft-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Geschwindigkeitsänderung](v_aenderung/) | Offen | Nicht geprüft | Nein |
| [Vektor-Labor](vektor-labor/index.html) | Offen | Nicht geprüft | Nein |
| [Drei-Finger-Quiz](drei-finger-quiz/index.html) | Offen | Nicht geprüft | Nein |
| [Feldvektor-Werkstatt](feldvektor-werkstatt/) | Offen | Nicht geprüft | Nein |
| [Elektrische Felder](elektrische-felder/index.html) | Gesamte Oberfläche nach `DESIGN.md` angepasst (07.10.2026) | Chromium: alle Modi, Desktop/iPad-Formate, Zoom und Regression erfolgreich; Details unten | UI-Release freigegeben; Veröffentlichung läuft |
| [Kondensator-Pendel](kondensator-pendel/) | Offen | Nicht geprüft | Nein |
| [Quanten-Labor](energiestufenmodell/) | Offen | Nicht geprüft | Nein |

## Bereits vorhandene Ergebnisse

- **Front Page (`index.html`):** neues Design geprüft und veröffentlicht am 6. Oktober 2026, Commit `05a15b7`. Chromium und WebKit: Desktop, 1024 × 768, 820 × 1180 und schmale Fenster; Navigation, 48-px-Touchflächen, Textkontraste, 200 % Textvergrößerung, JS-Syntax und Browserfehler geprüft. Remote-SHA, erfolgreicher Pages-Lauf und identischer Live-Inhalt wurden im Releaseauftrag bestätigt. Kein Test auf einem echten iPad.
- **Fadenpendel (`fadenpendel-energie/index.html`):** lokaler Designversuch, von Matthias als passende Richtung bestätigt. Chromium: Desktop und beide iPad-Formate visuell geprüft; Start/Pause, Tempo, Reibung, Diagramme, Reset, Tiefpunkt und Nullniveau bedient; keine Browser-/Requestfehler, keine externen Laufzeit-Requests, kein horizontaler Überlauf; sichtbare Controls mindestens 48 px. Nicht veröffentlicht, kein echter iPad-Test. Gehört nicht zu den 14 Katalog-Apps dieses Vorhabens.

## Nachweis pro Paket

Nach `DESIGN.md` und dem Projekt-Workflow prüfen: Desktop und beide iPad-Formate tatsächlich ansehen, relevante Zustände und Controls bedienen, Touchflächen und Überlauf prüfen, Front Page → App → Front Page testen, Browser-/Assetfehler sowie passende bestehende Tests und `git diff --check` prüfen. Fachmodell und Farbcodierung bewahren. Nur tatsächlich ausgeführte Prüfungen eintragen; Emulation von echtem iPad-Test unterscheiden.

In der Tabelle je App kurz Datum, Ergebnis und verbleibende Einschränkungen ergänzen. Bei Veröffentlichung Commit und separat bestätigten Pages-Stand vermerken; bei Verzögerung „gepusht, Pages noch nicht bestätigt“. Umfangreiche Ausgaben gehören nicht in diese Datei.

## Lokale Arbeit und Veröffentlichung

Es gibt bereits unveröffentlichte App-Änderungen, unter anderem im Commit `ce3449c`, sowie den lokalen Fadenpendel-Versuch. Vor jedem Release den aktuellen Diff prüfen und ausschließlich das beauftragte Paket veröffentlichen. Die lokale Übersicht enthält zwei zusätzliche Einträge; die hier erfassten 14 Apps entsprechen dem GitHub-Stand `05a15b7`.

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
- **Veröffentlichung:** ausdrücklich freigegeben, Release wird nach Push durch Remote-SHA und Vergleich der ausgelieferten Pages-Datei bestätigt. Separater Checkout bewahrt fremde lokale Änderungen und unveröffentlichte Commits.
