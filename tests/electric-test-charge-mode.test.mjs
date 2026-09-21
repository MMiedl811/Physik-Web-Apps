import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../elektrische-felder/index.html', import.meta.url), 'utf8');
const landing = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

assert.match(html, /id="fieldModeBtn"/, 'separate field mode tab missing');
assert.match(html, /id="motionModeBtn"/, 'separate test-charge mode tab missing');
assert.match(html, /data-motion-only/, 'motion-only controls missing');
assert.match(html, /id="sourceStrengthInput"/, 'source-charge strength control missing');
assert.match(html, /id="testChargeInput"/, 'test-charge magnitude control missing');
assert.match(html, /id="testMassInput"/, 'test-mass control missing');
assert.match(html, /id="timeScaleInput"/, 'animation time-scale control missing');
assert.match(html, /function setMode\(mode\)/, 'mode state transition missing');
assert.match(html, /testChargeValue\s*\/\s*state\.testMass/, 'q/m acceleration ratio missing');
assert.doesNotMatch(html, /\.72\/\(1\+\.22\*f\.mag\)/, 'old nonlinear force saturation must be removed');
assert.match(html, /setMotionParameters/, 'deterministic motion parameter API missing');
assert.match(html, /id="plateControls" hidden/, 'shared plate controls missing');
assert.match(html, /id="gapSlider" type="range"/, 'capacitor-gap slider missing');
assert.doesNotMatch(html, /id="plateControls"[^>]*data-(?:field|motion|superposition)-only/, 'plate controls must remain available in every mode');
assert.match(html, /SOURCE_RADIUS=11/, 'field-charge radius should be about 30% smaller than the former 16 px');
assert.match(html, /function fieldStrengthText\(mag\)/, 'physical field-strength readout helper missing');
assert.match(html, /E = \$\{fmt\(mag,2\)\} V\/m/, 'probe must report electric field strength in V/m');
assert.doesNotMatch(html, /site-hold\.js/, 'electric-field lab must be public on GitHub Pages');
assert.match(landing, /href="elektrische-felder\/index\.html"/, 'electric-field lab missing from public landing page');

console.log('electric test-charge mode source contract OK');
