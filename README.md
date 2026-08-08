# Physik-Web-Apps

Interaktive, browserbasierte Physik-Anwendungen für den Unterricht (Klasse 8–12). Die Apps laufen direkt im Browser – primär ausgelegt für das iPad, ohne Installation und ohne Anmeldung.

> [!IMPORTANT]
> **Status:** Die Anwendungen werden fortlaufend weiterentwickelt und vor dem Unterrichtseinsatz fachlich sowie technisch geprüft. Einzelne Apps können sich noch verändern.

## Live-Ansicht

Die veröffentlichte Seite ist über die GitHub-Pages-Adresse dieses Repositories erreichbar:

- **Landingpage:** [`index.html`](index.html) – warmer Atelier-Stil, Suchfunktion, Themenbereiche und Klassenstufen.
- Einzelne Apps: direkt über die Karten auf der Landingpage oder die Links unten.

## Anwendungen nach Themenbereich

### Mechanik

| App | Klasse | Beschreibung |
|---|---|---|
| [Physik-Duell: Mechanik](Quizzes/index.html) | 8 | Quiz mit 48 geprüften Fragen, Diagrammen und Duellmodus. |
| [Geschwindigkeitsänderung](v_aenderung/index.html) | 8 | Eishockey-Simulation zur vektoriellen Addition von Anfangsgeschwindigkeit und Geschwindigkeitsänderung zur Endgeschwindigkeit. |
| [Energie-Runner](energie-runner/index.html) | 9 | Spielbarer Jump-and-Run: chemische, kinetische, potenzielle und innere Energie werden beim Laufen, Springen, Sammeln und bei Kollisionen bilanziert. |
| [Treppen-Leistungslabor](mechanische-leistung/index.html) | 9 | Höhenenergie, Leistung und P–t-Fläche beim Treppensteigen; drei wählbare Tempi. |
| [Freier Fall in Zeitlupe](freier-fall-energie/index.html) | 10 | Energieumwandlung im freien Fall mit und ohne Luftwiderstand (Endgeschwindigkeit). |
| [Richtungsänderung nach Stoß](impuls/index.html) | 10 | Zweidimensionale Stoßsimulation: Impuls als Vektor, Richtungsänderung und Schwerpunkt (bewegt sich mit konstanter Geschwindigkeit). |
| [Stoß- und Impulsdiagramme](impulsdiagramm/index.html) | 10 | Grafische Gegenüberstellung von Impuls und Energie nach Stößen. |
| [Bewegungsdiagramme](diagramme/index.html) | 10 | Abschnittsweise t–x-, t–v- und t–a-Diagramme lesen und verknüpfen. Ein zweiter, bewusst synchron gehaltener Einstieg: [`Physik-Diagrammbastler-Segmente-SplitDashboard.html`](diagramme/Physik-Diagrammbastler-Segmente-SplitDashboard.html). |
| [Waagrechter Abwurf auf Insel](waagrechter%20Wurf/index.html) | 10 | Waagrechter Abwurf und schräger Wurf (Abschusswinkel, Kanone) auf eine Insel; Überlagerung der Teilbewegungen. |
| [Schwingungen](schwingungen/index.html) | 11 | Federpendel und Fadenpendel im Vergleich mit Zeitverläufen und Energiebalken (Umwandlung E_kin ↔ E_pot sichtbar). |
| [Fadenpendel – Energieumwandlung](fadenpendel-energie/index.html) | 11 | Exakte Pendelgleichung (keine Kleinwinkelnäherung) mit Energiebalken und optionalem E(t)-Diagramm für E_kin, E_pot, E_inner und E_ges – mit und ohne Luftreibung. |
| [Vektor-Labor](vektor-labor/index.html) | 8–12 | Maßstäbliches Konstruktionslabor für Geschwindigkeits-, Kraft- und Beschleunigungsvektoren. |

### Wärmelehre

| App | Klasse | Beschreibung |
|---|---|---|
| [Energiebalken](energie-faesser/index.html) | 9 | Innere Energie als Energiebalken: Breite proportional zur Wärmekapazität C = m · c, Höhe zur Temperatur. Temperaturabhängiger (kinetischer) und potenzieller Anteil, phasenabhängige Wärmekapazität und Wärmeleitung zwischen zwei Körpern mit Energieerhaltung und sichtbaren, wandernden Energie-Päckchen. |

### Elektrodynamik

| App | Klasse | Beschreibung |
|---|---|---|
| [Schaltbild-Werkstatt](schaltbild-werkstatt/index.html) | 8 | Offline-Schaltbildgenerator für Reihen-, Parallel- und gemischte Schaltungen mit Messgeräten und Stromrichtung. |
| [Magnetfeld-Labor](magnetfeld-labor/index.html) *(in Arbeit)* | 10 | Stab- und Hufeisenmagnete, Kompass, Feldlinien und magnetische Influenz; ergänzende 3D-Raumansicht. |
| [Kondensator-Pendel](kondensator-pendel/index.html) | 12 | Ladungstransport im Plattenkondensator und Feldenergie als Fläche im U–Q-Diagramm. |

### Atomphysik

| App | Klasse | Beschreibung |
|---|---|---|
| [Quanten-Labor](energiestufenmodell/index.html) | 9 | Diskrete Energieniveaus, Anregung und Energieübertragung. |

## Zielplattform

- primär iPad und aktuelle Desktop-Browser
- Touch- und Tastaturbedienung
- responsive Darstellung für Hoch- und Querformat
- keine Installation, keine Registrierung, offline nutzbar

## Technik und Konzept

Die Anwendungen basieren überwiegend auf nativem HTML5, CSS und JavaScript. Viele Apps sind als eigenständige HTML-Dateien aufgebaut und werden über GitHub Pages veröffentlicht.

- **Didaktische Reduktion:** Konzentration auf klar erkennbare physikalische Zusammenhänge
- **Interaktivität:** Parameteränderungen und Rückmeldungen in Echtzeit
- **Visualisierung:** Diagramme, Vektoren und Animationen als zentrale Lernoberfläche
- **Bewährte Modellierung:** numerische Integration (z. B. Runge-Kutta 4) und Energie-Erhaltungs-Buchführung; bewährte Modellierungskniffe aus quelloffenen Simulationen (u. a. PhET, `github.com/phetsims/*`) werden übernommen, ohne die didaktische Eigenständigkeit aufzugeben
- **Modellgrenzen:** Vereinfachungen sind in den Apps transparent dokumentiert
- **No-Install:** direkter Start im Browser

## Feedback und Fehlerberichte

Fehler, Darstellungsprobleme und Funktionswünsche können über den Reiter **Issues** dieses GitHub-Repositories gemeldet werden.

---

*Interaktive Physik-Anwendungen für den Unterricht.*
