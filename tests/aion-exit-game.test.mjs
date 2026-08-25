import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../aion-exit-game/index.html', import.meta.url), 'utf8');
const must = [
  '<!DOCTYPE html>', 'AION', 'id="gameCanvas"', 'id="touchPad"',
  'weltbilder', 'kepler', 'exoplaneten', 'unsichtbar', 'horizont',
  'window.__AION_TEST__', 'assets/map.webp', 'assets/hero.png', 'assets/intro.webp',
  'localStorage', 'Experten-Funkruf', 'Vertiefungsmission'
];
for (const needle of must) assert.ok(html.includes(needle), `missing ${needle}`);
const sectorIds = [...html.matchAll(/id:\s*'(weltbilder|kepler|exoplaneten|unsichtbar|horizont)'/g)].map(m => m[1]);
assert.deepEqual([...new Set(sectorIds)], ['weltbilder','kepler','exoplaneten','unsichtbar','horizont']);
const taskIds = [...html.matchAll(/taskId:\s*'([^']+)'/g)].map(m => m[1]);
assert.ok(new Set(taskIds).size >= 12, 'at least 12 unique core tasks');
assert.equal(new Set(taskIds).size, taskIds.length, 'task IDs unique');
for (const asset of ['map.webp','hero.png','intro.webp']) {
  assert.ok(fs.statSync(new URL(`../aion-exit-game/assets/${asset}`, import.meta.url)).size > 10000, `${asset} non-empty`);
}
console.log(`AION contract OK: 5 sectors, ${taskIds.length} tasks, 3 generated assets.`);
