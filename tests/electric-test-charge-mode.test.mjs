import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../elektrische-felder/index.html', import.meta.url), 'utf8');

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

console.log('electric test-charge mode source contract OK');
