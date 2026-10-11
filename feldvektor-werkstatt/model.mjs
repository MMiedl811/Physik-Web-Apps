// Positions in cm, charges in C, electric fields in V/m. Vacuum point-charge model.
export const K = 8.9875517923e9;
export const DEFAULT_CHARGE = 1e-11;
const finite = (v, name, limit) => {
  if (!Number.isFinite(v) || Math.abs(v) > limit) throw new Error(`${name}: Wert außerhalb des erlaubten Bereichs.`);
};
export function validate(s) {
  if (!s || !Array.isArray(s.sources) || s.sources.length > 4) throw new Error('Höchstens vier Quellladungen sind möglich.');
  if (s.mode !== undefined && !['charges', 'given'].includes(s.mode)) throw new Error('Ungültiger Aufgabenmodus.');
  const ids = new Set();
  for (const q of s.sources) {
    if (![1, 2, 3, 4].includes(q.id) || ids.has(q.id)) throw new Error('Ungültige oder doppelte Ladungsnummer.');
    if (s.mode === 'given' && (!Number.isFinite(q.e) || q.e < 0 || q.e > 1e15)) throw new Error('Feldbetrag: 0 bis 10¹⁵ V/m eingeben.');
    ids.add(q.id); finite(q.x, 'x', 10000); finite(q.y, 'y', 10000); finite(q.q, 'Ladung', 1e-6);
  }
  if (!s.point || !s.view || !s.display) throw new Error('Unvollständiger Aufbau.');
  finite(s.point.x, 'P.x', 10000); finite(s.point.y, 'P.y', 10000);
  for (const key of ['xmin', 'xmax', 'ymin', 'ymax']) finite(s.view[key], 'Ansicht', 20000);
  if (s.view.xmax - s.view.xmin < .1 || s.view.ymax - s.view.ymin < .1) throw new Error('Die Achsengrenzen müssen mindestens 0,1 cm auseinanderliegen.');
  if (!Number.isFinite(s.scale) || s.scale < 1e-12 || s.scale > 1e15) throw new Error('Pfeilmaßstab: 10⁻¹² bis 10¹⁵ V/m je Rastereinheit eingeben.');
  if (typeof s.autoScale !== 'boolean') throw new Error('Ungültige Maßstabseinstellung.');
  for (const key of ['vectors', 'sum', 'construction', 'guides', 'grid']) if (typeof s.display[key] !== 'boolean') throw new Error('Ungültige Darstellungseinstellung.');
  if (!['chain', 'parallelogram'].includes(s.method)) throw new Error('Ungültige Additionsmethode.');
  return s;
}
export function solve(s) {
  const fields = s.sources.map(q => {
    const dx = (s.point.x - q.x) * .01, dy = (s.point.y - q.y) * .01, distance = Math.hypot(dx, dy);
    // A zero prescribed contribution or zero charge contributes nothing, even at P.
    // In given mode q encodes the source sign only; its magnitude is not used.
    if ((s.mode === 'given' ? q.e : q.q) === 0) return {id: q.id, x: 0, y: 0, mag: 0, distance};
    if (distance < 1e-12) throw new Error(`P liegt auf Q${q.id}: Dort ist das Feld einer Punktladung nicht definiert. P bitte verschieben.`);
    const factor = s.mode === 'given' ? (q.q < 0 ? -1 : 1) * q.e / distance : K * q.q / distance ** 3;
    const x = factor * dx, y = factor * dy;
    return {id: q.id, x, y, mag: Math.hypot(x, y), distance};
  });
  const res = fields.reduce((a, f) => ({x: a.x + f.x, y: a.y + f.y}), {x: 0, y: 0});
  const magnitude = Math.hypot(res.x, res.y), total = fields.reduce((a, f) => a + f.mag, 0);
  const zero = magnitude <= Math.max(1e-12, total * 1e-12);
  return {fields, res, magnitude, zero, angle: zero ? null : (Math.atan2(res.y, res.x) * 180 / Math.PI + 360) % 360};
}
export function defaultState() {
  return {mode: 'given', sources: [{id: 1, x: 0, y: 0, q: -DEFAULT_CHARGE, e: 2}, {id: 2, x: 6, y: 0, q: DEFAULT_CHARGE, e: 2}], point: {x: 3, y: 4}, view: {xmin: -2, xmax: 10, ymin: -2, ymax: 10}, scale: 10, autoScale: true, method: 'parallelogram', display: {vectors: true, sum: true, construction: true, guides: true, grid: true}};
}
export function importState(obj) {
  if (obj?.version === 2) return validate(structuredClone(obj.settings));
  // Old tasks prescribed E at P; preserve that task model.
  if (obj?.version === 1 && obj.settings) {
    const old = obj.settings, s = defaultState();
    for (const key of ['x1','y1','s1','e1','x2','y2','s2','e2','px','py','scale']) finite(old[key], 'Alte Datei', 10000);
    if (old.scale <= 0 || old.e1 < 0 || old.e2 < 0 || ![1,-1].includes(old.s1) || ![1,-1].includes(old.s2)) throw new Error('Ungültige alte Aufgabenwerte.');
    s.mode = 'given'; s.point = {x: old.px, y: old.py}; s.scale = old.scale; s.autoScale = false;
    s.sources = [1,2].map(id => {
      const x = old['x'+id], y = old['y'+id], r = Math.hypot(old.px-x, old.py-y) * .01;
      if (r < 1e-12) throw new Error('Alte Datei: P liegt auf einer Quelle.');
      return {id, x, y, q: old['s'+id] * DEFAULT_CHARGE, e: old['e'+id]};
    });
    for (const key of Object.keys(s.display)) s.display[key] = typeof old[key] === 'boolean' ? old[key] : true;
    return validate(s);
  }
  throw new Error('Die Datei ist kein gültiger Werkstatt-Aufbau (Version 1 oder 2).');
}

// Changing models preserves the field contributions at the current P.
export function changeMode(s, mode) {
  validate(s);
  if (!['charges', 'given'].includes(mode)) throw new Error('Ungültiger Aufgabenmodus.');
  const next = structuredClone(s);
  if ((s.mode || 'charges') === mode) return next;
  const fields = solve(s).fields;
  next.mode = mode;
  next.sources = next.sources.map((q, i) => {
    const f = fields[i], sign = q.q < 0 ? -1 : 1;
    return mode === 'given' ? {...q, e: f.mag, q: sign * DEFAULT_CHARGE} : {...q, q: sign * f.mag * f.distance ** 2 / K};
  });
  return validate(next);
}
