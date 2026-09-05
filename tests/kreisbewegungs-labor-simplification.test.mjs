import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../kreisbewegungs-labor/index.html', import.meta.url), 'utf8');

assert.match(html, /Karussell von oben/);
assert.match(html, />P1</);
assert.match(html, />P2</);
assert.match(html, /id="velocityVectors"[^>]*type="checkbox"/);
assert.match(html, /id="accelerationVectors"[^>]*type="checkbox"/);
assert.doesNotMatch(html, /id="(?:velocityVectors|accelerationVectors)"[^>]*checked/);
assert.match(html, /Geschwindigkeitsvektoren anzeigen/);
assert.match(html, /Beschleunigungsvektoren anzeigen/);
assert.match(html, /Δφ/);
assert.match(html, /Startlinie/);
assert.match(html, /class="[^"]*start-marker/);
assert.doesNotMatch(html, /type="range"/);
assert.doesNotMatch(html, /id="radius"|id="period"|id="mass"/);
assert.doesNotMatch(html, /id="chart"|Zentripetalkraft|data-T=/);
assert.match(html, /Math\.min\(1,\s*state\.elapsed\s*\/\s*PERIOD\)/);
assert.match(html, /window\.__kreisLab/);
assert.match(html, /a2Len=Math\.min\(42,radialGap\*\.55\)/);
assert.match(html, /function vectorLabel\(/);
assert.match(html, /vectorLabel\(endX\+7,endY-7,base,sub,color\)/);
assert.doesNotMatch(html, /'v₁'|'v₂'|'a₁'|'a₂'/);

console.log('Kreisbewegungs-Labor simplification source contract OK');
