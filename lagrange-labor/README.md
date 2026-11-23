# Lagrange-Punkte-Labor

Die App visualisiert für Klasse 11, wie Erde und L2 gemeinsam um den fast zentral in der Sonne liegenden Schwerpunkt umlaufen. Die Ansicht lässt sich starten, pausieren und fortsetzen. L1 und L3 sind separat zuschaltbar. Der Schalter „Kräfte“ zeigt die Gravitationskräfte und ihre Resultierende an den sichtbaren Punkten. Zur besseren Lesbarkeit sind die schwächeren Erdbeiträge vergrößert. In der Grafik ist der resultierende Pfeil die Vektorsumme der beiden gezeigten Beiträge. Der Abstand Erde–L2 und die Körpergrößen sind für die Darstellung überzeichnet. Die Grafik zeigt den idealisierten Punkt L2. Weitere Einordnung und Quellen stehen in der aufklappbaren Erklärung.

Den dort genannten Abstand berechnet das kreisförmige eingeschränkte Dreikörpermodell (`model.mjs`). Die Bildschirmpositionen und die Wiedergabegeschwindigkeit dienen der schematischen Animation.

Lokal im Projektverzeichnis per `python3 -m http.server 8879` bereitstellen. Die Laufzeitdateien liegen lokal vor.

Prüfen mit `node --test tests/lagrange-model.test.mjs` und `node tests/lagrange-browser.test.mjs`. Beim Browsertest kann `LAGRANGE_URL` auf die veröffentlichte Frontpage verweisen.
