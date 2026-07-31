# Physik-Web-Apps

Interaktive, browserbasierte Physik-Anwendungen für den Unterricht. Die Apps sind vor allem für den Einsatz auf dem iPad ausgelegt und funktionieren ohne Installation direkt im Browser.

> [!IMPORTANT]
> **Status:** Die Anwendungen werden fortlaufend weiterentwickelt und vor dem Unterrichtseinsatz fachlich sowie technisch geprüft. Einzelne Apps können sich weiterhin verändern.

## Live-Ansicht

Die veröffentlichte Seite ist über die GitHub-Pages-Adresse dieses Repositories erreichbar.

## HTML-Dateien

| HTML-Datei | Kurzbeschreibung |
|---|---|
| [`index.html`](index.html) | Zentrale Landingpage im warmen Atelier-Stil mit direktem Zugang zu allen veröffentlichten Physik-Apps. |
| [`energie-runner/index.html`](energie-runner/index.html) | Spielbarer Energie-Runner für Klasse 9: chemische, kinetische, potenzielle und innere Energie werden beim Laufen, Springen, Sammeln und bei Kollisionen bilanziert. |
| [`freier-fall-energie/index.html`](freier-fall-energie/index.html) | Zeitlupen-Animation des freien Falls: Vergleich der Energieumwandlung ohne Luftwiderstand und mit realistischer Endgeschwindigkeit durch quadratischen Luftwiderstand. |
| [`mechanische-leistung/index.html`](mechanische-leistung/index.html) | Interaktives Treppen-Leistungslabor für Klasse 9: Während des Aufstiegs kann zwischen drei Tempi gewechselt und der Zusammenhang zwischen Höhenenergie, Leistung, Steigung im E-t-Diagramm und Fläche im P-t-Diagramm untersucht werden. |
| [`kondensator-pendel/index.html`](kondensator-pendel/index.html) | Klasse-12-Simulation eines leitfähigen Fadenpendels im getrennten Plattenkondensator: Ladungstransport, lineare Spannungsabnahme, Rechtecknäherung und Feldenergie als Fläche im \(U\)-\(Q\)-Diagramm. |
| [`Quizzes/index.html`](Quizzes/index.html) | Offlinefähiges Physik-Duell für Klasse 8 zur Mechanik mit 48 geprüften Fragen, zwölf Interaktionsformen, eingebetteten SVG-Diagrammen sowie Training, Zeitjagd, Drei-Leben- und Duellmodus. |
| [`magnetfeld-labor/index.html`](magnetfeld-labor/index.html) | Primär zweidimensionales Magnetfeld-Labor mit frei beweglichen Stab- und Hufeisenmagneten, Kompass, Magnetnadeln, Eisenfeilspänen, Feldlinien, qualitativer magnetischer Influenz und ergänzender 3D-Raumansicht. |
| [`schaltbild-werkstatt/index.html`](schaltbild-werkstatt/index.html) | Offline-Schaltbildgenerator für Reihen-, Parallel- und gemischte Schaltungen mit bis zu fünf Bauteilen, fachgerecht eingesetzten Messgeräten, optionalen Bauteilwerten sowie qualitativer Elektronen- und technischer Stromrichtung. |
| [`energiestufenmodell/index.html`](energiestufenmodell/index.html) | Quanten-Labor zu diskreten Energieniveaus, Anregung und Energieübertragung im Energiestufenmodell. |
| [`v_aenderung/index.html`](v_aenderung/index.html) | Eishockey-Simulation zur vektoriellen Addition von Anfangsgeschwindigkeit \(\vec v_A\) und Geschwindigkeitsänderung \(\Delta\vec v\) zur Endgeschwindigkeit \(\vec v_E\). |
| [`vektor-labor/index.html`](vektor-labor/index.html) | Maßstäbliches Konstruktionslabor für Geschwindigkeits-, Kraft- und Beschleunigungsvektoren mit kariertem Zeichenblatt, Übungsaufgaben, adaptivem Maßstab, Betragskontrolle und schrittweisen Lösungen. |
| [`impuls/index.html`](impuls/index.html) | Zweidimensionale Stoßsimulation zur Untersuchung von Impulsvektoren und Richtungsänderungen. |
| [`impulsdiagramm/index.html`](impulsdiagramm/index.html) | Generator für Stoß- und Impulsdiagramme mit grafischer Darstellung der beteiligten Größen. |
| [`diagramme/index.html`](diagramme/index.html) | Diagrammbastler zum Erstellen und Verknüpfen abschnittsweiser \(t\)-\(x\)-, \(t\)-\(v\)- und \(t\)-\(a\)-Diagramme. |
| [`diagramme/Physik-Diagrammbastler-Segmente-SplitDashboard.html`](diagramme/Physik-Diagrammbastler-Segmente-SplitDashboard.html) | Alternativer Dateieinstieg zum selben Diagrammbastler; beide Diagrammdateien werden bewusst synchron gehalten. |
| [`waagrechter Wurf/index.html`](waagrechter%20Wurf/index.html) | Simulation eines waagrecht abgeworfenen Rettungspakets zur Überlagerung horizontaler und vertikaler Bewegung. |
| [`schwingungen/index.html`](schwingungen/index.html) | Interaktive Gegenüberstellung von Federpendel und Fadenpendel mit Zeitverläufen und veränderbaren Parametern. |

## Quiz-Bereich

Der Ordner `Quizzes/` enthält den ersten Themenpiloten **Klasse 8 – Mechanik**. Die Quiz-Engine ist als eigenständige Offline-Datei aufgebaut; weitere geprüfte Themenpools können später auf derselben Bedienlogik aufbauen.

## Zielplattform

- primär iPad und aktuelle Desktop-Browser
- Touch- und Tastaturbedienung
- responsive Darstellung für Hoch- und Querformat
- keine Installation und keine Registrierung

## Technik und Konzept

Die Anwendungen basieren überwiegend auf nativem HTML5, CSS und JavaScript. Viele Apps sind als eigenständige HTML-Dateien aufgebaut und lassen sich dadurch unkompliziert über GitHub Pages veröffentlichen.

- **Didaktische Reduktion:** Konzentration auf klar erkennbare physikalische Zusammenhänge
- **Interaktivität:** Parameteränderungen und Rückmeldungen in Echtzeit
- **Visualisierung:** Diagramme, Vektoren und Animationen als zentrale Lernoberfläche
- **No-Install:** direkter Start im Browser

## Feedback und Fehlerberichte

Fehler, Darstellungsprobleme und Funktionswünsche können über den Reiter **Issues** dieses GitHub-Repositories gemeldet werden.

---

*Interaktive Physik-Anwendungen für den Unterricht.*
