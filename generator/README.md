# Generator · Klasse 10

Echtes, frei drehbares 3D-Funktionsmodell nach fachlicher Orientierung an LEIFIphysik. Schleifringe und Kommutator sind umschaltbar. Standarderklärung: Lorentzkraft und Ladungstrennung; alternativ magnetischer Fluss durch die Spulenfläche. Die Wahl der Darstellung verändert weder Spulenstellung noch Drehzahl.

## Start

Vom Projektordner mit einem lokalen HTTP-Server ausliefern, beispielsweise `python3 -m http.server 8897`, und `/generator/` öffnen. ES-Module benötigen HTTP. Alle Laufzeitdateien liegen lokal; es wird kein CDN benötigt. Ein Offline-Neuladen einer gehosteten Seite wird nicht durch einen Service Worker angeboten.

## Umsetzung

- `model.mjs`: einheitliches Generator- und Kontaktmodell.
- `scene.mjs`: eigene WebGL-Geometrie, gemeinsame Rotorgruppe, separate ruhende Bürsten; Kamera per Ziehen, Tastatur und festen Ansichten.
- `app.mjs`: Steuerung, Spannungsdiagramm, SVG-Anschlussdetail und gekennzeichneter Fallback ohne WebGL.
- `index.html`, `style.css`: Oberfläche; Rückweg zur Übersicht und zu den Nutzungshinweisen.
- `ASSETS.md`, `vendor/three/LICENSE`: Herkunft, Modellannahmen und Drittanbieterrechte.

## Prüfstand am 1. November 2026

- `node --test tests/generator-model.test.mjs`: 5/5 bestanden. Unabhängiges v×B-Linienintegral an beiden Leiterseiten, negative zeitliche Flussableitung, Kontaktbelegung bei Drehsinnwechsel, Stillstand und Drehzahlskalierung, geometrische Abstandsbedingungen.
- `tests/generator-browser.test.mjs` mit vorhandenem Playwright: Chromium und WebKit jeweils mit Touch-Kontext, 1440×1000, 1024×768, 820×1180, 600×900, 390×844 und 720×500. Alle Prüfungen bestanden. 720×500 dient als Layoutäquivalent zu 200 % Zoom eines 1440×1000-Fensters; zusätzlich vergrößerte vererbte Schrift getestet.
- Beide Generatorarten und beide Erklärungen; 0°/90°/180°/270°; vier Kameraansichten, Kamera per Tastatur und Ziehen, Start/Pause/Schritt, Reset, Drehsinnwechsel und 0 U/min geprüft. Keine Browserfehler, fehlgeschlagenen oder externen Laufzeitrequests.
- Übersicht → App → Übersicht/Nutzungshinweis bestanden. Alle HTML-IDs eindeutig, lokale Links vorhanden, JS-Syntax und Whitespace des eigenen Patches geprüft. Neue Katalogkarte additiv; Anzahl auf 21 angepasst.
- WebGL-Ausfall in beiden Browsern simuliert: SVG-Fallback und Untersuchung funktionsfähig. Neue Browserkontexte mit gesperrten nichtlokalen Requests: 3D und Animation funktionsfähig. Dies belegt lokalen Betrieb ohne Internet; keine Behauptung eines gehosteten Offline-Caches.
- Screenshots der vier Moduskombinationen und Kameraansichten erstellt; Sichtkontrolle insbesondere beider iPad-Formate in beiden Browsern sowie Desktop und schmalem Fenster. Kontaktansicht nach Bereinigung erneut geprüft; 3D-Beschriftungen anschließend vergrößert und nochmals visuell kontrolliert.

Kein Test auf echter iPad-Hardware. Vorgeschriebene Drehzahl und nahezu unbelastete Spannungsmessung; Lastbremsung und Verluste bleiben außerhalb des Modells. Veröffentlichung durch Matthias am 1. November 2026 mit „Push“ freigegeben. Remote-Commit und Pages-Status werden nach dem Push separat kontrolliert.

## Pflichtauswahl ergänzt

Vor dem Start erscheint eine nicht vorausgewählte Entscheidung zwischen technischen Stromrichtungen mit positiven Modellträgern und Elektronen. Kraftpfeile in 3D und SVG, Legende und Erklärung folgen der Wahl. Spulenstellung und Spannungen bleiben beim Wechsel erhalten. Reset behält die Wahl; Neuladen fragt erneut. Tastaturfokus bleibt im Dialog, Escape überspringt die Entscheidung nicht.

Prüfungen: 6/6 Modelltests bestanden; `generator-carrier.test.mjs` und bestehende `generator-browser.test.mjs` in Chromium und WebKit mit Touch bei 1440×1000, 1024×768, 820×1180, 600×900, 390×844 und 720×500 bestanden. Beide Trägermodelle, Generatorarten und Erklärungen, unabhängige Kraftvorzeichen, Zustandswechsel, Reset/Neuladen, Stillstand, WebGL-Fallback und lokaler Betrieb ohne Internet geprüft. Screenshots von Dialog und beiden Betrachtungsweisen angesehen. Keine Prüfung auf echter iPad-Hardware.

## Vereinfachte Bedienung · 16. November 2026

- Start/Pause und Einzelschritt stehen groß direkt über den vier Ansichten, zusammen mit der aktuellen Winkelstellung.
- Lorentzkraft, Leiterbewegung und Magnetfeld sind unabhängig schaltbar. Zum Einstieg ist nur die Leiterbewegung eingeblendet. Die Auswahl betrifft Darstellung und Legende, nicht die berechnete Spannung. Reset stellt diese reduzierte Ansicht wieder her und behält die Ladungsträgerwahl.
- Nordpol rot, Südpol grün in 3D und SVG; die Pollegende ist in jeder Ansicht sichtbar. Anschlussbeschriftungen erscheinen nur bei der Kontaktbetrachtung; A/B nur mit den Kraftpfeilen.
- Das Anschlussdetail erscheint bei „Kontakte“. Eine kurze Erklärung nennt den Zweck der ruhenden Bürsten. Die Stellungsanzeige erklärt aktuelle Zuordnung, Polung und nächsten Kontaktwechsel; 0°/180° zeigen das Umschalten bei null Spulenspannung. Einzelschritt und Drehsinn funktionieren auch in dieser Ansicht. Ausgeblendete Pfeileinstellungen bleiben beim Zurückwechseln erhalten.
- Die verpflichtende Wahl zwischen positiven Modellträgern und Elektronen bleibt bestehen; beide Erklärungsperspektiven und alle vier Ansichten bleiben nutzbar.

Prüfung: `generator-simplification.test.mjs` in Chromium/WebKit mit Touch bei 1440×1000, 1024×768, 820×1180, 600×900, 390×844 und 720×500 bestanden. Letztere Größe entspricht dem Layout bei 200 % Zoom eines 1440×1000-Fensters. Getrennte Schalter, Tastatur, beide Träger, Start/Pause, Reset, spannungsneutrale Ansichtswechsel, Kontaktwechsel in beiden Drehsinnen und SVG-Fallback geprüft; Screenshots von reduzierter Ansicht, Kraftansicht, Flussansicht und Kontaktdetail visuell kontrolliert. 6/6 Modelltests bestanden. Keine Prüfung auf echter iPad-Hardware. Diese Überarbeitung ist lokal; noch kein neuer Commit/Push.

Zusätzlich die bestehende `generator-browser.test.mjs` auf derselben Größenmatrix in Chromium und WebKit bestanden: alle Generator-/Erklärungsmodi, vier Ansichten, Start/Pause/Schritt/Reset, Grenzstellungen, Tastatur/Zeigen, Rücknavigation, WebGL-Ausfall und lokaler Betrieb ohne Internet. Bestehende Trefferflächenprüfung berücksichtigt die 48-Pixel-Labelzone der neuen Checkboxen; der Trägertest schaltet die Kraftdarstellung vor seiner Richtungsprüfung gezielt ein.

## Hand an der Kurbel · 16. November 2026

Der mechanische Antrieb ist als echte 3D-Kurbel mit greifender, schematischer Hand sichtbar. Hand und Griff bleiben in jeder Stellung verbunden; die Hand läuft um die Achse, ohne starr mitzurotieren. Pause, Einzelschritt, Drehsinn und Reset folgen dem bestehenden Simulationszustand. Räumlich, vorne und von oben bleibt der Antrieb sichtbar; die Kontaktansicht konzentriert sich auf die Anschlüsse. Die Polbeschriftungen stehen auf den Polflächen, damit sie die Hand nicht verdecken.

`generator-hand-drive.test.mjs`: Chromium und WebKit mit Touch bei 1440×1000, 1024×768, 820×1180 und 390×844 bestanden. Griffbindung und Kreisbahn für 0°, 45°, 90°, 180°, 270° und 360°, feste Handorientierung, Modell-/Ansichtswechsel, Pause, Stillstand, Drehsinn und Reset geprüft. Ansichten und Grenzstellungen in beiden iPad-Formaten visuell kontrolliert. Keine Browserfehler, fehlgeschlagenen oder externen Requests. Bestehende 6/6 Modelltests bestanden. Keine Prüfung auf echter iPad-Hardware; weiterhin lokale Vorschau ohne neuen Push.

## Markante Stellungen und Vektornotation · 16. November 2026

Vier Sprungbuttons setzen die Spule exakt auf 0°, 90°, 180° oder 270° und pausieren die Drehung. „Erklärung beim Anspringen“ ist standardmäßig aus. Nur wenn diese freiwillige Option eingeschaltet ist, öffnet der bewusste Sprung eine kurze, schließbare Erklärung; Animation, Winkelregler und Einzelschritt lösen keine automatischen Unterbrechungen aus. Escape/Schließen führt den Fokus zum auslösenden Winkelbutton zurück. Reset schaltet die Option wieder aus und behält die Ladungsträgerwahl.

Die Erklärung berücksichtigt Lorentzkraft/Fluss, Schleifringe/Kommutator, Drehsinn und Stillstand. Sie bezieht sich auf den magnetischen Kraftanteil an den langen Leiterseiten; bei 0 U/min wird kein Maximum einer tatsächlich vorhandenen Kraft oder Spannung behauptet. F, v sowie B und n tragen Vektorpfeile: native MathML-Legende, prozedural gezeichnete Akzente auf den 3D-Beschriftungen und im SVG. Keine neue Renderbibliothek oder externe Schrift.

`generator-checkpoints.test.mjs` in Chromium und WebKit mit Touch bei 1440×1000, 1024×768, 820×1180, 390×844 und 720×500 bestanden: exakte Sprünge/Spannungswerte, Standard ohne Pop-up, freiwilliges Einschalten, Stillstand und Flussperspektive, Kommutatorhinweise, ununterbrochener Lauf bei eingeschalteter Option, Fokus/Tab/Escape, Reset, Vektornotation und SVG-Fallback. Screenshots der Erklärungen und Vektorbeschriftungen auf Desktop und beiden Tablet-Formaten angesehen. Bestehende 6/6 Modelltests bestanden. Keine Prüfung auf echter iPad-Hardware; weiterhin lokale Vorschau.

## Stellung direkt im Diagramm wählen · 16. November 2026

Die separaten Winkelbuttons über der 3D-Grafik sind durch markierte Punkte auf den Spannungskurven ersetzt. Klick oder Touch bei 0°, 90°, 180° bzw. 270° pausiert die Drehung und stellt oben synchron denselben Drehwinkel ein, einschließlich Handkurbel und Kontaktbelegung. Beide 270°-Punkte der Wechsel-/Gleichspannungskurven sind erreichbar. Native, mindestens 48 px breite Trefferzonen erlauben auch die Wahl über die Winkelbeschriftung sowie per Tastatur; sie bleiben beim Neuzeichnen des SVG im DOM und bewahren den Fokus. „Erklärung beim Anklicken“ steht direkt am Diagramm und bleibt freiwillig. Die Markierungen passen sich bei Größenänderungen an und bleiben mindestens 12 px groß.

`generator-checkpoints.test.mjs` in Chromium und WebKit mit Touch bei 1440×1000, 1024×768, 820×1180, 390×844 und 720×500 bestanden. Zusätzlich echte Touch-Tipps auf die Kurvenpunkte beider 270°-Werte geprüft und die aktualisierte Hand-/Spulenstellung numerisch kontrolliert. Erklärungen, Fokus, Stillstand, Reset, ununterbrochener Lauf und SVG-Fallback weiterhin bestanden. Diagramm auf Desktop, Tablet und schmalem Fenster visuell kontrolliert. Kein neuer Push.

## Veröffentlichung freigegeben · 16. November 2026

Matthias hat die zusammenhängende Überarbeitung (reduzierte Darstellung, Handkurbel, Vektornotation und freiwillige Erklärungen direkt im Diagramm) mit „Stelle online“ zur Veröffentlichung freigegeben. Die oben dokumentierten lokalen Prüfstände bleiben als Verlauf erhalten; Remote-SHA und erfolgreicher Pages-Stand werden im Abschluss separat kontrolliert.
