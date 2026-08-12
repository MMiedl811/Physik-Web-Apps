# Lokal eingebundene Drittbibliotheken

Die Anwendungen müssen ohne CDN und ohne Netzwerkzugriff funktionieren. Jede Bibliothek wird deshalb in einer festen Version lokal gespeichert.

## Chart.js 4.5.1

- Datei: `chart.js-4.5.1.umd.min.js`
- Upstream: https://github.com/chartjs/Chart.js
- Paket: https://www.npmjs.com/package/chart.js/v/4.5.1
- Lizenz: MIT, siehe `chart.js-4.5.1.LICENSE.md`
- SHA-256: `48444a82d4edcb5bec0f1965faacdde18d9c17db3063d042abada2f705c9f54a`
- Verwendet in: `fadenpendel-energie/index.html`
- Zweck: optionales Energie-Zeit-Diagramm; das physikalische Modell bleibt vollständig in der App.

## Bestehender Altbestand

`p5-1.9.0.min.js` war bereits vor dieser Dokumentation vorhanden. Seine Verwendung und Lizenzierung wird in einer separaten Bestandsprüfung behandelt.

## JSXGraph 1.13.1

- Dateien: `jsxgraph-1.13.1.min.js`, `jsxgraph-1.13.1.css`
- Upstream: https://github.com/jsxgraph/jsxgraph
- Paket: https://www.npmjs.com/package/jsxgraph/v/1.13.1
- Gewählte Lizenz: MIT, siehe `jsxgraph-1.13.1.LICENSE.md`
- JavaScript: 1.022.812 Byte (gzip 256.846 Byte), SHA-256 `7fec1a559b830d34ec673b2a7a5517778ea3840810d5c7199f47717addc15e67`
- CSS: 4.767 Byte (gzip 1.616 Byte), SHA-256 `c35832b173df9689bbc2ba7a50d708717e956badf5faf5c90b0a020b69bbfcce`
- Verwendet in: `vektor-labor/index.html` ausschließlich als umschaltbarer Pilot für die erste Geschwindigkeitsaufgabe.
- Zweck: Vergleich von Touch-Geometrie, Rasterfang und responsiver Vektorkonstruktion; die fachliche Auswertung bleibt in der App.
