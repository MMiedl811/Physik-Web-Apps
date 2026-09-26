# Wellenoptik: Modell und Darstellung auseinanderhalten

Nur bei passenden Optikaufgaben lesen. Die importierten Hermes-Skills dokumentieren frühere Vorlieben für Elementarwellen und Einhüllenden. Daraus folgt keine allgemeine Vorgabe gegen Farbfelder, Zeigerdiagramme oder geometrische Hilfslinien. Bestehende Gestaltung bewahren, bis der Auftrag eine andere Darstellung erfordert.

## Fachliche Grenzen

- Geometrische Huygens-Konstruktion, phasenabhängige Wellensuperposition und Fernfeld-Intensitätsprofil erfüllen verschiedene Zwecke. Eine gezeichnete Einhüllende allein berechnet keine Interferenzminima. Eine schematische Animation darf neben einem quantitativen Profil stehen, muss aber entsprechend erklärt werden.
- Für einen gleichmäßig beleuchteten rechteckigen Einzelspalt im Fraunhofer-Fernfeld gilt I/I(0) = sinc²(β), β = πa sinθ/λ, sinc(0)=1. Dunkelstellen: a sinθ = mλ mit m ungleich 0 und |mλ/a| ≤ 1.
- Für zwei identische, gleich stark und kohärent beleuchtete Spalte: normiertes I = sinc²(πa sinθ/λ) cos²(πd sinθ/λ), d als Mittenabstand. d sinθ = mλ bezeichnet Maxima des Interferenzfaktors, nicht exakt alle Maxima des gesamten Produkts. Fehlende Ordnungen beachten.
- Wegdifferenzlinien zu einem Beobachtungspunkt sind als geometrische Hilfskonstruktion legitim. Im Fernfeld sind die Richtungen näherungsweise parallel. Nicht als tatsächlich gebündelte Lichtstrahlen oder als alleinige Beugungserklärung darstellen.
- Eine ungewichtete Summe weniger cos(kr−ωt)-Quellen ist kein universelles quantitatives Nahfeldmodell. Ausbreitung, Gewichtung, Diskretisierung und Näherung müssen zusammenpassen. Die Zahl sichtbarer Elementarwellen legt nicht die numerische Quadraturauflösung fest.

## Aussagekräftige Prüfungen

- Normierung am Zentrum, Symmetrie, analytische Nullstellen und mehrere Spalt-/Wellenlängenverhältnisse prüfen. Numerische Aperturintegration nur im passenden Fernfeld gegen sinc² vergleichen und Konvergenz mit verfeinerter Diskretisierung testen.
- Schirmkoordinate y und Winkel über die gewählte Geometrie konsistent verbinden, etwa θ = atan(y/L). Kleine-Winkel-Näherung nur im angegebenen Bereich verwenden.
- Kausaler Start, kontinuierliche Phase, Pause/Reset und Parameterwechsel getrennt vom stationären Profil prüfen. Bei Pixelberechnung Canvas-Buffer und CSS-Koordinaten/DPR unterscheiden.
- Im vereinfachten Zwei-Spalt-Photonenmodell mit vollständiger Welcher-Weg-Unterscheidbarkeit entfällt der Interferenzterm. Das Ergebnis ist die Summe der Einzelspaltintensitäten; bei identischen Spalten hat die normalisierte Form die Einzelspalthülle. Ereignisrate und Normierung nicht verwechseln. Treffer aus verschiedenen Parametern nicht unbemerkt vermischen. Dies ist kein universelles Modell jedes Detektors.

Fachliche Referenz: [OpenStax, Single-Slit Diffraction](https://openstax.org/books/university-physics-volume-3/pages/4-1-single-slit-diffraction), insbesondere die Wegdifferenzkonstruktion und Fernfeldannahme.
