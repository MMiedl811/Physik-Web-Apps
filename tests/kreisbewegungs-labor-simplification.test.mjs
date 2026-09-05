import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html = readFileSync(new URL('../kreisbewegungs-labor/index.html', import.meta.url), 'utf8');

assert.match(html, /Karussell von oben/);
assert.match(html, />P1</);
assert.match(html, />P2</);
assert.match(html, /id="vectors"[^>]*type="checkbox"/);
assert.doesNotMatch(html, /id="vectors"[^>]*checked/);
assert.match(html, /Geschwindigkeit und Beschleunigung/);
assert.match(html, /Δφ/);
assert.match(html, /Startlinie/);
assert.match(html, /class="[^"]*start-marker/);
assert.doesNotMatch(html, /type="range"/);
assert.doesNotMatch(html, /id="radius"|id="period"|id="mass"/);
assert.doesNotMatch(html, /id="chart"|Zentripetalkraft|data-T=/);
assert.match(html, /Math\.min\(1,\s*state\.elapsed\s*\/\s*PERIOD\)/);
assert.match(html, /window\.__kreisLab/);

console.log('Kreisbewegungs-Labor simplification source contract OK');
