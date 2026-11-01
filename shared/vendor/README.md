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


## KaTeX 0.18.4

- Dateien: `katex-0.18.4/katex.min.js`, `katex-0.18.4/katex.min.css` und 20 lokale WOFF2-Schriften
- Upstream: https://github.com/KaTeX/KaTeX
- Paket: https://www.npmjs.com/package/katex/v/0.18.4
- Lizenz: MIT, siehe `katex-0.18.4/LICENSE.md`
- JavaScript: 272.179 Byte (gzip 75.762 Byte), SHA-256 `2ec5916941ef4383e0314eaabcc712301b06001d9fb68e08d751d2bae5a27a1a`
- CSS: 24.727 Byte (gzip 3.480 Byte), SHA-256 `180c2d77d434d7da51d6625c50a964d4fd6fdbdb9bc8796a0a016c30c49931fb`
- Schriften: 20 WOFF2-Dateien, zusammen 259.792 Byte
- Verwendet in: `v_aenderung/index.html` als umschaltbarer Formelsatz-Pilot.
- Zweck: sauberer Vergleich der Vektornotation in Überschrift, Beobachtungsaufträgen und zentraler Vektorgleichung; Canvas-Beschriftungen bleiben unverändert.

## Three.js 0.180.0 / r180 (Generator)

- App-lokal: `generator/vendor/three/{three.module.min.js,three.core.min.js,OrbitControls.js,LICENSE}`; keine CDN-Anfragen.
- Original: https://github.com/mrdoob/three.js/tree/r180; Moduldateien aus `build/`, OrbitControls aus `examples/jsm/controls/OrbitControls.js`.
- MIT, Copyright 2010–2025 Three.js Authors. Unveränderte Originaldateien inklusive Lizenz, am 1. November 2026 bytegleich mit dem Tag r180 abgeglichen. Keine Fremdschriften oder weiteren Assets.
- SHA-256: Modul `e2b5ee6bccd38fd6d8a2428546b83c5f2426d84b152ef82be8055556e3b40eb6`, Core `61ba0df005b05991361d040d8ff670e1aadfd0ce7aeebd1fdb0725957a8957de`, OrbitControls `b97879c748170baadeb3fb84cea1ffdf4674e283dc06042f34e2acb95a76042c`, LICENSE `bfe119ea4fd413f5f7ca3fcd63adb0c4a073ed39daa2fe7d3e6b769e21272601`.
- Zweck: echtes drehbares 3D-Funktionsmodell der Generator-App. Die Drittanbieterrechte gelten unabhängig von den Zustimmungsvorbehalten für eigene Projektbestandteile.
