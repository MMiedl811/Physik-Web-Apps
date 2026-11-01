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
