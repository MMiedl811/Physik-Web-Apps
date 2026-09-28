# Vektor-Labor

## Ergänzung vom 28.09.2026: elektrische Feldstärke

Ein viertes Thema ergänzt fünf Konstruktionsaufgaben: gleichgerichtete Plattenbeiträge im idealen Kondensator, entgegengesetzte Felder, senkrechte Felder, fehlender Feldbeitrag und ein Gegenfeld zur Aufhebung am Punkt P.

Alle Beiträge gelten am selben Feldort P. Das Blatt ist ein Vektordiagramm, keine räumliche Feldkarte. Verschobene Hilfspfeile sind geometrische Kopien und behaupten kein gleiches Feld an einem anderen Ort. Einheit: N/C, gleichwertig zu V/m. Die Aufgaben prüfen Anfangspunkt, Richtung, Betrag und Spitze. Bei der Aufhebungsaufgabe wird der von null verschiedene Gegenvektor gesucht; das resultierende Nullfeld besitzt keine Richtung.

Vorhandene Hilfspfeile, Maßstäbe, Lösungsschritte und Prüflogik werden wiederverwendet. E erhält dieselbe Vektornotation wie die bisherigen Größen. Der Themenwähler hat vier mindestens 48 px hohe Schaltflächen in zwei Zeilen. Veraltete Hilfspfeil-Hinweise verschwinden beim Aufgabenwechsel.

`tests/vector-electric.test.mjs` prüft unabhängige Sollvektoren, Komponentensummen, echte Zeichenaktionen für alle fünf Aufgaben, falsche Richtungen, Hilfspfeile, Lösungen und Rücksetzungen beim Wechsel. Die bisherigen drei Themen, lokale Assets und der Weg Übersicht → App → Übersicht werden mitgeprüft. Screenshots: 1440×900, 1024×768 und 820×1180 (Viewport-Emulation, keine echte iPad-Prüfung).

Aufruf mit lokalem HTTP-Server über `VECTOR_URL`; Playwright wird über die Node-Modulauflösung geladen (gegebenenfalls `NODE_PATH`). Keine zusätzlichen Laufzeitabhängigkeiten der App.


## Kurze Einführung und Quellladungen

- Eine app-eigene Einführung ersetzt den allgemeinen Startdialog: vier Schritte mit Markierung von Themenwahl, Hilfspfeilen, Zeichenblatt und Prüfbuttons. Überspringen und Escape sind möglich. Abschluss und Überspringen werden lokal im Browser gespeichert; über Hilfe ist die Einführung erneut erreichbar. Bei gesperrtem Speicher bleibt die App benutzbar. Es werden keine Daten übertragen.
- Alle sieben Feldstärke-Aufgaben zeigen eine unabhängige Lageskizze mit Quellen und P. Die fünf einfachen Skizzen sind schematisch; die neuen Koordinatenaufgaben haben einen eigenen Ortsmaßstab in cm. Ein Wechsel des Feldstärkemaßstabs verändert die Quellen nicht.
- Neue Aufgaben: Dipol mit Q₁(0|0), Q₂(6|0), P(3|4), Einzelbeträgen 2 V/m; zwei positive Quellen bei (0|0) und (8|2), P(5|6), Einzelbeträgen 4 und 8 V/m. Feldrichtungen werden aus den normierten Verbindungsvektoren und Vorzeichen berechnet, dann komponentenweise addiert. Ergebnisse: (−2,4|0) V/m und ungefähr (−2,24|9,47) V/m, Betrag 9,73 V/m.
- Bei den neuen Aufgaben werden zuerst „zur Quelle hin“ bzw. „von ihr weg“ gewählt und geprüft. Erst dann erscheinen die Vektoren für die grafische Addition. Die Lösung bleibt als Hilfe erreichbar. Die Prüfung akzeptiert geometrisch passende Rundungen einschließlich des nächsten halben Rasterkästchens.
- `tests/vector-tour-sources.test.mjs`: Einführung, Speicherung, Überspringen, Wiederholung, Fokus, Escape, fehlender Speicher, Vorzeichenprüfung, unabhängige analytische Referenzen, echte Zeichenaktionen, Rundungen, getrennte Maßstäbe und drei Viewports. Keine Änderung an gemeinsamen Laufzeit-Assets. Veröffentlichung am 28.09.2026 von Matthias freigegeben.
