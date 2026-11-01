# Herkunft und Modell

Eigene HTML-/CSS-/JavaScript-Umsetzung, eigenes WebGL-Szenenmodell und prozedural erzeugte SVG-Grafiken. Keine extern geladenen Schriften, Bilder oder übernommenen LEIFI-/Fendt-Quelltexte. Der Skill `technische-erklaergrafiken` samt 3D- und Bewegungsreferenz wurde als Arbeitsanleitung genutzt; das Anatomy-Geometriekit ist nicht eingebunden.

Lokal eingebunden: Three.js 0.180.0/r180 mit OrbitControls, unverändert und am 1. November 2026 bytegleich mit den Originalen abgeglichen. Originaldateien: [build/](https://github.com/mrdoob/three.js/tree/r180/build) sowie [OrbitControls](https://github.com/mrdoob/three.js/blob/r180/examples/jsm/controls/OrbitControls.js). MIT, Copyright 2010–2025 Three.js Authors. Lizenz lokal in [vendor/three/LICENSE](vendor/three/LICENSE); Dateien und Prüfsummen im [zentralen Bibliotheksverzeichnis](../shared/vendor/README.md).

Fachliche Orientierung, am 1. November 2026 geprüft:

- [LEIFIphysik: Generator (Simulation von Walter Fendt)](https://www.leifiphysik.de/elektrizitaetslehre/induktion-generator-und-transformator/versuche/generator-simulation-von-walter-fendt): vereinfachte Spule, Wechsel-/Gleichspannungsgenerator, Schleifringe und Kommutator. Die dortige Erlaubnis für die Fendt-Simulation wird nicht auf dieses Projekt übertragen; die Simulation wurde nicht kopiert.
- [LEIFIphysik: Generator- und Motorprinzip](https://www.leifiphysik.de/elektrizitaetslehre/induktion-und-transformator/grundwissen/generator-und-motorprinzip): bewegte Ladungen und Lorentzkraft, Energieumwandlung.
- [LEIFIphysik: Induktion durch Änderung der Winkelweite](https://www.leifiphysik.de/elektrizitaetslehre/elektromagnetische-induktion/grundwissen/induktion-durch-aenderung-der-winkelweite): konstantes homogenes Feld, konstante Fläche, Änderung der Orientierung.

Die verlinkten fremden Texte, Abbildungen und Simulationen bleiben bei den jeweiligen Rechteinhabern. Es werden nur Links und eigene Erläuterungen eingebunden. Für eigene Appbestandteile gelten die zentralen [Nutzungshinweise](../index.html#nutzung).

## Fachlicher Vertrag

Vorgegebene Drehzahl, nahezu unbelastete Spannungsmessung. N=100, B=0,4 T, A=0,02 m²; das repräsentative Leiterbild zeigt eine Windung. Keine dynamische Last, Selbstinduktion oder Verluste. Pause ist eine eingefrorene Momentaufnahme bei der eingestellten Drehzahl; tatsächlicher Stillstand wird durch 0 U/min dargestellt.

Weltkoordinaten: B in +x; Drehachse +y. Leiterseite A liegt bei r=(sin θ,0,cos θ), ihre Geschwindigkeit ist ω(cos θ,0,−sin θ). Positive Spulenkontur: A abwärts, B aufwärts; n=(cos θ,0,−sin θ). Elektronenkraft an A ist nach +y für ω sin θ > 0. Spulenende 1 liegt am unteren Ende der Seite A, Ende 2 unten an B. U12=N B A ω sin θ. Schleifringe: X↔1, Y↔2. Kommutator: X↔1 für sin θ>0, X↔2 für sin θ<0. Bei θ=0°,180°,360° wird ideal bei U=0 umgeschaltet. Bei umgekehrtem Drehsinn kehrt sich auch die äußere Gleichspannung um.

Die Plus-/Minuszeichen an den Spulenenden zeigen die Polung der idealen Induktionsspannung, keine berechnete Oberflächenladungsverteilung. Zur Sichtbarkeit sind Magnetfeldpfeile, Spulenöffnungen und Kontaktlücken vereinfacht; insbesondere das Anschlussdetail zeigt separate Axialschnitte bei Schleifringen.

## Räumlicher Aufbau

Spule, isolierte Achse, Zuleitungen und Kontaktflächen sind starre Rotorbauteile. Bürsten, transparente Magnetpole und Sockel bleiben fest. Schleifringe liegen axial getrennt; die Zuleitung zum unteren Ring verläuft innerhalb der Öffnung des oberen Rings. Die Halbringe sind echte hohle Ringsektoren mit Isolationsspalt. Die Hauptansicht ist frei drehbar; Front-, Drauf- und Kontaktansicht verändern keinen Modellzustand. Bei fehlendem WebGL bleibt eine gekennzeichnete SVG-Funktionsskizze mit sämtlichen Controls verfügbar.

## Betrachtungswahl (Nachtrag)

Vor dem ersten Start wird ohne Vorauswahl verpflichtend zwischen technischen Stromrichtungen im Modell positiver Ladungsträger und Elektronen gewählt. Der spätere Wechsel verändert nur die Trägerbetrachtung: Kräfte gemäß q(v×B), Kraftbeschriftungen und Erklärung. Spannungen, Endpolung, Winkel, Drehzahl, Drehsinn und Kontaktbelegung bleiben unverändert. Bei positiven Trägern ist die magnetische Kraft gegenüber Elektronen umgekehrt. Die gerichtete Ladungsverschiebung ist von der gemeinsamen mechanischen Leiterbewegung zu unterscheiden; bei hochohmiger Messung wird kein dauerhafter Laststrom behauptet. Im Metall sind tatsächlich Elektronen beweglich; positive bewegliche Träger sind ein ausdrücklich bezeichnetes Modell. Reset behält die Wahl bei; Neuladen verlangt eine neue Entscheidung.
