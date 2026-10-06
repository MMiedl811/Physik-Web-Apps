# Designsprache von Physik-Web-Apps

Stand: 6. Oktober 2026. Von Matthias gewählte Richtung: Apple-inspiriert, hell, ruhig und gut mit dem Finger bedienbar. Gilt für neue Apps und ausdrücklich beauftragte Designänderungen. Diese Datei ist eine Arbeitsanweisung für die Umsetzung; sie lädt kein CSS und verändert bestehende Apps nicht automatisch.

## 1. Ziel und Herkunft

Lerninhalt und Simulation stehen im Mittelpunkt. Die Oberfläche hilft, Bedienelemente, Zustand und Ergebnis unmittelbar zu erkennen. Übersichtliche Gruppen und großzügige Touchflächen haben Vorrang vor maximaler Informationsdichte. Wichtiges soll auf einem iPad möglichst gleichzeitig sichtbar sein.

Inspiration: [Apple-Analyse bei getdesign.md](https://getdesign.md/apple/design-md) und [zugehörige DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md). Die fremde Analyse ist unabhängig, keine offizielle Apple-Vorgabe. Beliebtheit auf GitHub ersetzt keine Bedienprüfung. Diese Datei legt die eigenen Projektentscheidungen fest; spätere Änderungen der externen Vorlage ändern sie nicht automatisch.

Aus der Referenz übernehmen wir die ruhige helle Grundgestaltung, Systemtypografie, eine blaue Bedienfarbe, zurückhaltende Flächentrennung und abgerundete Aktionen. Unsere Lernapps erhalten eigene Regeln für Touch, Simulationen, fachliche Farben, Statusanzeigen und Fehlerzustände. Große Produktbilder, Werbeabschnitte, kleinteilige Shop-Navigation und proprietäre Schriftdateien werden nicht benötigt.

## 2. Farben und Rollen

Farben im CSS als semantische Variablen definieren. Dieselbe Rolle verwendet innerhalb einer App denselben Wert.

| Rolle / CSS-Variable | Wert | Einsatz |
| --- | --- | --- |
| `--paper` | `#f5f5f7` | Seitenhintergrund und neutrale Gruppen |
| `--surface` | `#ffffff` | Karten, Eingaben, Arbeitsbereiche |
| `--ink` | `#1d1d1f` | Haupttext und Überschriften |
| `--muted` | `#626269` | Erläuterungen und nachrangige Beschriftungen |
| `--action` | `#0066cc` | Bedienaktionen, Links, ausgewählte Tabs, Fokus |
| `--action-pressed` | `#0055aa` | Gedrückte blaue Aktion |
| `--surface-soft` | `#eaf3ff` | Hellblaue Auswahl- und Rückmeldungsfläche |
| `--line` | `#dedee3` | Dezente, dekorative Trennlinien |
| Status: Text / Fläche / Rand | `#784500` / `#fff4df` / `#edc784` | Hinweis „In Testphase“ |
| Fehlertext / Fläche | `#a22f2f` / `#fff0ed` | Verständliche Fehlermeldung |

Blau bezeichnet eine Bedienhandlung; weder eine Überschrift noch ein rein dekoratives Element muss blau sein. Fachliche Farben sind davon getrennt: bestehende Codierungen für Energie, Ladung, Felder, Kräfte und Kurven bewahren. Legenden verwenden dieselben Farben wie die Darstellung. Zusätzlich Text, Linienart, Schraffur oder Symbole einsetzen, wenn eine Unterscheidung wichtig ist. Kein Zustand darf ausschließlich an Farbe erkennbar sein.

Für neue Farbkombinationen Kontrast prüfen: normaler Text mindestens 4,5:1, großer Text mindestens 3:1; notwendige Umrisse und grafische Zustandsmerkmale mindestens 3:1 gegen die angrenzende Fläche. `--line` ist bewusst dezent und reicht allein nicht als notwendiges Erkennungsmerkmal einer Eingabe oder Auswahl. Dunkle Simulationsflächen nur verwenden, wenn sie fachlich helfen; Text und Bedienfarben dafür gesondert prüfen. Kein automatischer Dark Mode ohne Auftrag.

## 3. Schrift und Zahlen

Schriftstapel: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. Keine externen Font-Requests; keine separate SF-Pro-Datei einbinden.

| Textrolle | Größe | Gewicht | Zeilenhöhe |
| --- | --- | --- | --- |
| Titel der Front Page | fließend 34–56 px | 600 | 1,1 |
| App-Titel | fließend 24–32 px | 600 | 1,15–1,25 |
| Abschnittstitel | 24–32 px | 600 | 1,2 |
| Kartentitel / Paneltitel | 17–18 px | 600 | 1,3 |
| Haupttext / Bedienbeschriftung | 16–17 px | 400 / 600 | 1,45–1,6 |
| Ergänzende Beschriftung | 14–15 px | 400–500 | mindestens 1,4 |
| Kurze Statusmarke | mindestens 12 px | 500–600 | 1,5 |

Wichtige Simulationswerte und Diagrammachsen möglichst nicht unter 14 px setzen; bei Platzmangel Layout anpassen. Titel dürfen leicht enger laufen (`letter-spacing: -.025em` bis `-.035em`), Fließtext bleibt normal. Keine Serifenschrift als zusätzliche Überschriftenfamilie. Zahlen in Messwertfeldern mit `font-variant-numeric: tabular-nums`; Dezimalkomma, Einheiten und fachlich konsistente Genauigkeit verwenden. Text muss bei Zoom vollständig zugänglich bleiben.

## 4. Abstände, Formen und Tiefe

Abstandsleiter: 4, 8, 12, 16, 20, 24, 32, 40 und 48 px. Kleine Abstände verbinden Beschriftung und zugehörige Eingabe; größere trennen Funktionsgruppen. Typische Karteninnenabstände: 20–24 px; kompakte Simulationspanels: 12–16 px; Rasterabstände: 12–16 px; Abstand zwischen Themenbereichen: 32–40 px.

Seiteninhalt maximal etwa 1160–1180 px breit, zentriert. Seitenränder auf schmalen Geräten 16 px, sonst 20–24 px; Safe Areas berücksichtigen. Keine großen Leerräume, die Simulation oder wichtige Controls aus dem Sichtbereich drücken.

Rundungen: 8–12 px für kleine Eingaben, 16–20 px für Arbeitsbereiche und Katalogkarten, bis 24 px für einen großen zusammengehörigen App-Container. Buttons und Segmentgruppen dürfen pillenförmig sein (`999px`). Eine Rundung ist kein Hinweis auf eine größere tatsächliche Trefferfläche.

Flächenfarben und klare Gruppierung erzeugen Hierarchie. Karten standardmäßig ohne Schatten. Ein sehr dezenter Schatten ist bei einer ausgewählten Segmentfläche oder einem Dialog möglich, wenn er deren Funktion klärt. Keine dekorativen Hintergrundgradienten, Glasflächen oder schwebenden Kartenstapel. Fachliche Verläufe, Schraffuren und vorhandene räumliche Darstellungen dürfen erhalten bleiben.

## 5. Komponenten und Zustände

- **Primäre Aktion:** blaue Fläche, weißer Text, klare Beschriftung wie „Start“. Pro Funktionsgruppe eine erkennbare Hauptaktion.
- **Sekundäre Aktion:** helle Fläche, dunkler oder blauer Text, dezenter Rand. Gleiche Mindestgröße wie primäre Aktionen.
- **Segmentgruppe:** neutraler gemeinsamer Hintergrund; Auswahl mit weißer oder blauer Fläche und zusätzlichem sichtbaren Merkmal. `aria-pressed` oder passende Tab-Semantik aktuell halten. Lange Beschriftungen dürfen umbrechen; Controls nie kleiner skalieren, um sie einzupassen.
- **Katalogkarte:** weiße Fläche, dezenter Rand, Titel, Klasse, ausgeschriebener Status, kurze Beschreibung. Ganze Karte als einzelner Link; keine verschachtelten Buttons. „Öffnen →“ als dauerhafter Hinweis auf die Aktion.
- **Navigation:** sichtbare, mindestens 48 px hohe Links. Themenlinks dürfen in mehrere Zeilen umbrechen. Keine wichtige Funktion nur in einem Hover-Menü anbieten. Zurück zur Übersicht bleibt leicht erreichbar.
- **Messwerte und Diagramme:** Zahlen, Einheiten und Legenden gut lesbar. Physikalische Farben unverändert und fachlich konsistent. Diagramme erhalten Platz für Achsen, Legenden und Hinweise; keine abgeschnittenen Beschriftungen.
- **Eingaben und Regler:** sichtbares Label, Einheit und aktueller Wert. Eingaben mindestens 48 px hoch. Slider mindestens 48 px hohe berührbare Zone; ein kleiner Griff allein genügt nicht.
- **Aufklappbare Erklärungen:** mindestens 48 px hohe Zusammenfassungszeile; offener Zustand erkennbar. Nur Zusatzwissen einklappen, das nicht zum Verständnis der aktuellen Darstellung notwendig ist.
- **Dialog / Einstieg:** helle Karte, lesbarer Text, klare Schließen-/Weiteraktion. Im kleinen Fenster intern scrollbar; Tastaturfokus, Escape und Rückkehr zur auslösenden Aktion passend behandeln.

Alle interaktiven Komponenten brauchen Normal-, Auswahl-/Aktiv-, Gedrückt-, Fokus- und gegebenenfalls Deaktiviert-Zustände. Tastaturfokus: sichtbarer 3-px-Ring in `--action` mit 3–4 px Abstand. Auf Touch einen kurzen sichtbaren Druckzustand bieten, ohne Layoutverschiebung. Hover ist nur eine zusätzliche Rückmeldung auf Geräten mit Maus. Deaktivierte Controls sind semantisch deaktiviert und erklären nötigenfalls den Grund; geringe Deckkraft darf nicht die einzige Erklärung sein. Fehler nahe der betreffenden Eingabe verständlich benennen, Fortschritt und Ladezustände bei Bedarf kenntlich machen.

## 6. iPad, schmale Fenster und Barrierefreiheit

Primäre Touchflächen mindestens **48 × 48 CSS-px**, einschließlich einer gegebenenfalls anklickbaren Labelzone. Zwischen benachbarten Controls in der Regel mindestens 8 px. Auch Icon-Buttons und Reset/Zurück erfüllen das Ziel.

An verfügbarer Fensterbreite orientieren, nicht an einem Gerätenamen. Front Page: drei Spalten bei mehr als 1000 px, zwei bei 601–1000 px, eine bis 600 px. Karten und Text passen sich an; nichts horizontal abschneiden. In Apps Simulation und zentrale Steuerung bei etwa 820 px Breite möglichst nebeneinander erhalten, sofern beide lesbar bleiben; bei geringerer Breite sinnvoll stapeln. Keine feste Höhe mit verstecktem Overflow für die gesamte Seite. Zusatztexte dürfen nach unten scrollen.

Hochformat, Querformat und schmale Mehrfensteransichten unterstützen. `viewport-fit=cover` und Safe-Area-Innenabstände verwenden, Browserzoom erlauben. Keine globale Scrollsperre oder `touch-action: none` auf der Seite. Auf Canvas nur die Fläche von der Browsergeste ausnehmen, die eine direkte Interaktion benötigt; außerhalb muss normales Scrollen funktionieren.

Für ziehbare Objekte großzügige Trefferzonen vorsehen, Pointer Capture und Abbruch behandeln. Wo eine präzise Geste nötig ist, eine verständliche alternative Bedienung ermöglichen, etwa numerische Eingabe oder Tastatur. Keine reine Hover-Erklärung. Native Links, Buttons, Labels und Details bevorzugen, Icon-Aktionen benennen. Logische Überschriften und Fokusreihenfolge erhalten. Ausgewählte Zustände sowohl visuell als auch semantisch ausweisen.

Animationen dienen der Rückmeldung oder Physik. UI-Übergänge kurz halten (etwa 100–180 ms), keine dekorativen Dauerschleifen. `prefers-reduced-motion` für dekorative UI-Bewegungen beachten; fachlich nötige Animationen besitzen Start/Pause. Blinkende Rückmeldungen vermeiden.

## 7. Inhalte, Assets und Umsetzung

Vanilla HTML/CSS/JavaScript und lokale Laufzeit-Assets. Kein Framework, Font-Service, CDN oder Bildpaket allein für diesen Stil einführen. Designänderungen app-lokal beginnen; gemeinsame Styles erst bei einem gesonderten Auftrag verändern.

Bilder nur für einen konkreten Lern- oder Orientierungszweck. Bestehende notwendige Medien lokal erhalten, Seitenverhältnis bewahren, passende Alternativtexte und bei Bedarf responsive Größen verwenden. Die Front Page benötigt keine Produktfotos. Keine Apple-Logos, Markenbehauptungen, privaten Pfade oder externen Analysewerkzeuge in die Oberfläche aufnehmen.

App-Pfade, Themen, Klassenstufen und Status erhalten, sofern kein inhaltlicher Auftrag vorliegt. App-Zahl muss der sichtbaren Anzahl entsprechen. Offline-Aussagen nur mit dem tatsächlich geprüften Nutzungsweg begründen; lokale Assets allein garantieren kein Offline-Neuladen einer gehosteten Seite.

## 8. Anwendung und Prüfungen

Vor der Umsetzung diese Datei und die betroffene App lesen. Nur benötigte Rollen in lokale CSS-Variablen übernehmen; keine ungenutzte Komponentenbibliothek anlegen. Bei Konflikten gelten der aktuelle Auftrag und die Projektregeln. Bestehende Fachfarben oder Modelle nicht aufgrund der Designvorlage ändern.

Nach relevanten Designänderungen:

1. Desktop, 1024 × 768 und 820 × 1180 rendern und tatsächlich ansehen; zusätzlich schmale Fenster bzw. 200 % Zoom prüfen.
2. Überlauf, abgeschnittenen Text, Touchflächen, Fokus und Zustandsunterscheidung kontrollieren; nicht nur den Ausgangszustand prüfen.
3. Relevante Controls mit echten Browseraktionen bedienen; Front Page → App → Front Page prüfen.
4. Browserfehler, fehlende lokale Assets, externe Laufzeit-Requests, HTML-IDs und JS-Syntax prüfen; `git diff --check` ausführen.
5. Viewport-Emulation ausdrücklich von Tests auf einem echten iPad unterscheiden. Veröffentlichung getrennt von lokalem Testen nachweisen.

## 9. Freigegebene Richtung und aktueller Umfang

Matthias hat den Apple-inspirierten Fadenpendel-Versuch als gelungene Richtung bestätigt. Der Versuch bleibt lokal. Am 6. Oktober 2026 wurde die Anwendung der Designsprache auf die Front Page einschließlich dieser Dokumentation und des Verweises in `AGENTS.md` zur Veröffentlichung beauftragt. Weitere Apps werden erst mit eigenem Auftrag angepasst. Der bestehende Workflow-Skill regelt Release und Prüfnachweise.
