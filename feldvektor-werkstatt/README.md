# Feldvektor-Werkstatt

Separates Autorenwerkzeug für statische Positionsdiagramme mit bis zu vier festen Punktquellen Q1–Q4 und einem frei verschiebbaren Feldort P. P ist keine Ladung. Koordinaten werden in cm eingegeben, Ladungsbeträge in pC oder nC. Startwert einer neuen Quelle: 10 pC = 1,0 · 10⁻¹¹ C.

Das Vakuummodell berechnet jeden Beitrag mit E_i = k Q_i (P − Q_i-Ort) / |P − Q_i-Ort|³ nach Umrechnung der Abstände in Meter. Vorzeichen bestimmen die Richtung. Die Resultierende ist die komponentenweise Summe. Beim Verschieben ändern sich Richtung und Betrag, die Quellladungen bleiben fest. Am Ort einer von null verschiedenen Punktladung ist das Feld nicht definiert. Eine Quelle mit Q = 0 trägt nichts bei. Ein Nullfeld hat keine Richtung. Orts- und Pfeilmaßstab sind getrennt; alle Feldpfeile nutzen denselben Maßstab.

Leeres Spielfeld, Einzelquelle, Dipol, vier Quellen und zwei Schulbuchvorlagen. Quellen hinzufügen/entfernen, Vorzeichen und Beträge ändern, Punkte ziehen, per Werkzeug setzen oder mit Pfeiltasten bewegen. Koordinateneingabe mit Komma/Punkt, Rückgängig, Einzelpfeile, Resultierende, Pfeilkette und Parallelogramm für zwei Beiträge, Verbindungen und Raster. PNG exportiert das sichtbare Diagramm mit Ladungswerten und Maßstabsangaben. JSON Version 2 speichert den Aufbau; alte Version-1-Dateien werden so umgerechnet, dass ihre vorgegebenen Feldbeträge am ursprünglichen P erhalten bleiben. Danach gelten feste Ladungen. Alle Assets sind lokal, keine Abhängigkeiten oder Animationen.

Schulbuchvorlagen: Dipol ergibt zunächst (−2,4|0) V/m. Die positiven Quellen ergeben etwa (−2,24|9,47) V/m, Betrag 9,73 V/m (grafisch gerundet 10 V/m). Diese Vorlagen verwenden aus den ursprünglichen Feldbeträgen berechnete Ladungen.

Prüfung: `tests/field-vector-workshop.test.mjs` prüft Coulombgesetz, Vorzeichen, Abstandsgesetz, vier Quellen und Nullfeld, Singularität, gemeinsame Pfeilmaßstäbe, echte Browserbedienung, Rückgängig, PNG und JSON Version 1/2 sowie Desktop- und Tabletansichten. Die Veröffentlichung der Überarbeitung vom 01.10.2026 ist von Matthias beauftragt.
