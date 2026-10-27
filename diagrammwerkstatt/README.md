# Diagrammwerkstatt und ZABMA-Versuchsprotokoll

Zwei allgemeine Methodenwerkzeuge für den Physikunterricht ab Klasse 8:

- `/diagrammwerkstatt/`: Messwerttabelle links, Diagramm und Auswertungswerkzeuge rechts. PNG-Export und einseitige A4-Druckvorlage.
- `/zabma-protokoll/`: zusätzlich Ziel, Aufbau, Beschreibung, Metadaten und eigene Auswertung. Zweiseitige A4-Druckvorlage mit Platz für Aufbauskizze und handschriftliche Ergänzungen.

Beide Einstiege verwenden dieselben lokalen JavaScript- und CSS-Dateien. Kein Buildschritt, keine externen Laufzeit-Assets; ein HTTP-Server ist für ES-Module erforderlich. Die HTML-Einstiege setzen `data-mode="diagram"` beziehungsweise `data-mode="protocol"`. Die Tour ist überspringbar und jederzeit erneut aufrufbar.

## Daten und Modell

Die Varianten speichern ihren Stand getrennt im Browser. Der frühere kombinierte Prototypstand bleibt dem vollständigen Protokoll zugeordnet. JSON-Projektdateien sind zwischen den Varianten austauschbar; Protokollfelder werden auch beim Öffnen in der Diagrammvariante bewahrt. Zusätzliches Speichern als Projektdatei schützt vor gelöschtem Browserspeicher.

Originaldaten werden bei Achsenumformungen bewahrt. Die zusätzlichen Tabellenwerte und das Diagramm zeigen die umgeformten Koordinaten. Symmetrisch eingegebene Unsicherheitsintervalle werden vollständig transformiert und können asymmetrisch werden; Polstellen und Definitionslücken werden erklärt. Einheiten sind frei eingegebener Text, ohne automatische Einheitenumrechnung.

Die Ausgleichsgerade minimiert die Summe der quadrierten vertikalen Abweichungen in den angezeigten Koordinaten. Alle gültigen Punkte sind gleich gewichtet; Unsicherheiten gehen nicht in die Anpassung ein. Keine automatische statistische Parameterunsicherheit oder Bewertung des physikalischen Modells. Die glatte Verbindung ist eine formtreue kubische Hermite-Interpolation durch nach x sortierte Messpunkte, keine Ausgleichskurve.

Referenz: [NIST, Least Squares](https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm). Die ZABMA-Struktur folgt dem vom Nutzer bereitgestellten Methodenbild: Ziel, Aufbau, Beschreibung, Messergebnisse, Auswertung.

## PDF-Druckvorlage

Der PDF-Button öffnet den Browser-Druckdialog; dort „Als PDF sichern“ wählen. A4 hochkant, 10 mm Rand, 11 pt Calibri mit lokalen Ersatzschriften (Carlito/Arial), Überschriften 13 pt fett. Eine lokale Calibri-Installation wird nicht vorausgesetzt und die Schrift nicht mitgeliefert.

Vor dem Druck wird die Vorlage auf Überlauf geprüft. Mehr als 28 Messungen oder zu lange Inhalte erfordern eine Kürzung; es werden keine Messungen stillschweigend entfernt. Die Tabelle enthält Originalwerte mit Originaleinheiten, das Diagramm die gewählte Achsenumformung. Eingeschaltete numerische Auswertungen und Hinweise stehen beim Diagramm. Die exakten Unsicherheiten bleiben in der Projektdatei; Fehlerbalken erscheinen im Diagramm.

## Prüfungen

- `node tests/diagrammwerkstatt-model.test.mjs`: Parsing, unabhängige OLS-Referenzen und Optimalität, Ursprungsgerade, Grenzfälle, Intervallabbildung, Linearisierung, Interpolation, Dateivalidierung.
- `node tests/diagrammwerkstatt-browser.test.mjs`: bestehende Werkzeug-, Eingabe-, Datei- und Layoutregressionen.
- `node tests/diagrammwerkstatt-tour.test.mjs`: Tour-Navigation und Hervorhebungen in der Diagrammvariante.
- `node tests/diagrammwerkstatt-versions.test.mjs`: beide Einstiege, getrennte Speicherung, vollständige Tour, Navigation, Druck-DOM und Überlaufwarnung; PDF-Dateien in Chromium als Prüfausgabe.

Browsertests verwenden Playwright über `NODE_PATH`, einen HTTP-Server auf Port 8881 und Chromium/WebKit mit Touch-Kontext. `DIAGRAM_URL` überschreibt in Funktions- und Variantensuite die Basis-URL. Emulation ersetzt keinen echten iPad-Hardwaretest. Bereits geladene Werkzeuge benötigen keine Netzwerkverbindung; ein Offline-Neuladen gehosteter Seiten wird nicht garantiert.

Release und konkrete Prüfresultate sind im Eintrag vom 27.10.2026 in `PLAN.md` dokumentiert.
