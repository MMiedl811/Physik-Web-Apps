# Lagrange-Punkte-Labor

Für Klasse 11 nach Gravitationsgesetz und Zentripetalkraft. In der Übersicht lassen sich L1 bis L5 im äußeren und mitrotierenden Bezugssystem erkunden. In der Kraftprobe verschiebt man einen gedachten Probekörper auf jeder Seite der Erde und vergleicht die Summe der vorzeichenbehafteten Gravitationskräfte mit der benötigten Zentripetalkraft. Der berechnete Punkt lässt sich zum Überprüfen gezielt einstellen.

Das kreisförmige eingeschränkte Dreikörpermodell verwendet baryzentrische Koordinaten und das Sonne-Erde-Massenverhältnis. L1–L3 werden per Bisektion der radialen Kraftbilanz bestimmt, L4/L5 analytisch. Die schematische Übersicht zeigt die Gleichgewichtslagen, die Kraftprobe untersucht separat einen frei wählbaren Ort auf der Achse. Der Sonnenvergleich lässt den Erdbeitrag aus der Bilanz weg. Das Labor berechnet keine freifliegenden Trajektorien. Die Kraftwerte beziehen sich auf dieselbe Testmasse von 1 000 kg.

Lokal über HTTP öffnen, zum Beispiel vom Projektverzeichnis mit `python3 -m http.server 8879`. Alle Laufzeitdateien liegen im Repository. Die Seite verwendet ES-Module und keinen Service Worker.

Prüfen mit `node --test tests/lagrange-model.test.mjs` und `node tests/lagrange-browser.test.mjs` (Playwright). Optional verweist `LAGRANGE_URL` beim Browsertest auf die veröffentlichte Frontpage.
