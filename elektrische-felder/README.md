# Elektrische Felder – Darstellungen und Bewegung

## Änderungen vom 27.09.2026

- Hintergrundwahl: keine Färbung, Feldstärke E oder Potential φ; die beiden Farbkarten werden einzeln angezeigt.
- Feste Skalen: Feldstärke 0–300 V/m (logarithmisch komprimiert), Potential −80 bis +80 V (vorzeichentreue asinh-Skala). Endfarben umfassen größere Beträge. Die Skalen ändern sich weder mit der Quellladung noch mit dem Bildausschnitt.
- Äquipotentiallinien: Werte von −100 bis +100 V in gleichen Schritten von 5 V; unabhängig von der Hintergrundwahl. Beschriftet wird eine Auswahl, um Überlagerungen zu vermeiden.
- Alle Karten und Konturen verwenden `fieldAt`. Für Punktladungen gilt φ → 0 im Unendlichen; beim symmetrischen Plattenpaar liegt φ = 0 in der Mittelebene. Die Sonde zeigt φ zusätzlich zu E.
- Konturen werden mit Marching Squares, einer Entscheidung für Sattelzellen, verfeinerten Kantenschnittpunkten und adaptiv verfeinerten Segmenten berechnet. Der unmittelbare Quellbereich wird ausgespart. Die Ergebnisse werden bis zur nächsten Quellen- oder Größenänderung zwischengespeichert.
- Die Definition der Probeladung macht die idealisierte fehlende Rückwirkung und die Unterscheidung von Bahn und Feldlinie sichtbar. Die bestehende Bewegungsgleichung und SI-Umrechnung bleiben erhalten.
- Beim Verlassen des Ausschnitts bleibt die Aufprallgeschwindigkeit leer. Das Erreichen des Ausschlussbereichs einer Punktquelle wird gesondert benannt.
- Der Zeitraffer verwendet die vollständige vergangene Zeit des sichtbaren Tabs. Die kleinen Integrationsschritte begrenzen weiterhin die numerischen Zeitschritte. Hintergrundzeit wird nicht nachgeholt.

## Prüfungen

`tests/electric-overlays.test.mjs` prüft unter anderem analytische Kreisradien, Konturwerte, Orthogonalität, E = −∇φ, die Nullpotentialebene, vollständige Feldaufhebung, feste Farbskalen, Reset, Ausschnittende und Plattenaufprall sowie den Zeitraffer bei unregelmäßigen Bildabständen. Browserprüfungen und Screenshots umfassen 1440×900, 1024×768 und 820×1180.

Die bestehende Suite `electric-si-motion.test.mjs` prüft Bewegungs- und Energievergleiche; `electric-app-unified.test.mjs` prüft die drei Modi und den bisherigen App-Einstieg. Die Quellcodeprüfungen `electric-test-charge-mode.test.mjs` und `electric-superposition-mode.test.mjs` ergänzen diese Tests.

Die Browsertests verwenden `ELECTRIC_URL` für eine lokale HTTP-Vorschau. Der neue Test lädt Playwright über die normale Node-Modulauflösung; bei einer vorhandenen externen Installation kann `NODE_PATH` gesetzt werden. Es wurden keine Laufzeitabhängigkeiten der App hinzugefügt.

## Korrektur vom 28.09.2026: idealer Plattenkondensator

Das bisherige endliche Streifenmodell wurde für das Kondensator-Preset durch unendlich ausgedehnte ideale Platten ohne Randfelder ersetzt, in allen drei Modi gemeinsam:

- Jede Platte liefert σ/(2ε₀) senkrecht zur Oberfläche. Innen addieren sich die Beiträge zu E = σ/ε₀, außen heben sie sich auf. E ist unabhängig von y und bei konstantem σ auch vom Plattenabstand.
- Bei Plattenpositionen ±d/2: φ = −Ex im Inneren, außerhalb konstant auf dem jeweiligen Randwert. Die Mittelebene bleibt bei φ = 0; U = Ed. Auf der idealisierten Fläche wird der Feldmittelwert verwendet; Messungen unmittelbar an der Quelle sind ausgeschlossen.
- Feldlinien sind gerade und gleichabständig, Äquipotentiallinien parallel zu den Platten. Die Richtungspfeile auf den Feldlinien sind statisch und bewegen sich nicht. Die Vektorbeiträge werden zur Lesbarkeit parallel versetzt und beschriftet.
- Der bisherige Längenregler heißt „Gezeigter Abschnitt“ und ändert nur die Darstellung; gestrichelte Fortsetzungen verdeutlichen die unendliche Ausdehnung. Plattenkontakte gelten auch jenseits des durchgezogen gezeichneten Abschnitts.
- Das entspricht dem Schulmodell eines homogenen Feldes, nicht der Berechnung realer Randfelder. Fachlicher Bezug: [LEIFIphysik](https://www.leifiphysik.de/elektrizitaetslehre/ladungen-elektrisches-feld/grundwissen/homogenes-elektrisches-feld).

Die Regressionstests wurden auf dieses Modell angepasst. `electric-ideal-capacitor.test.mjs` prüft zusätzlich die einzelnen Plattenbeiträge, Außenfeldaufhebung, E = −∇φ, U = Ed, Homogenität bei verschiedenen Geometrien und σ, Konturen sowie einen Aufprall außerhalb des durchgezeichneten Abschnitts. Die Veröffentlichung wurde am 28.09.2026 von Matthias freigegeben.
