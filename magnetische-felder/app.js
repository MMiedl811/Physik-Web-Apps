import { DOMAIN, WIRE_RADIUS, MAX_WIRES, fieldAt, fieldLines, spule, leiterpaar } from './field-core.mjs';
import { arrowMarkers, singleFieldRadii } from './field-display.mjs';
const $ = id => document.getElementById(id);
const canvas = $('field'), ctx = canvas.getContext('2d');
const state = { wires: [], tool: 'out', selected: null, single: false, total: true, rings: 5, cursor: { x: 0, y: 0 } };
let nextId = 1, lines = [], dirty = true, frame = null, drag = null, geometry;
const colors = { total: '#006b73', single: '#617981', ink: '#1d1d1f', action: '#0066cc' };
const selected = () => state.wires.find(w => w.id === state.selected);
const message = text => { $('status').textContent = text; };
const bounded = p => ({ x: Math.max(DOMAIN.xmin, Math.min(DOMAIN.xmax, Math.round(p.x))), y: Math.max(DOMAIN.ymin, Math.min(DOMAIN.ymax, Math.round(p.y))) });
const occupied = (p, except = null) => state.wires.find(w => w.id !== except && w.x === p.x && w.y === p.y);
function updateControls() {
  const w = selected();
  $('count').textContent = `${state.wires.length} / ${MAX_WIRES} Leiter`;
  $('selectedInfo').textContent = w ? `(${w.x} | ${w.y}) · ${w.sign > 0 ? '• Aus der Ebene' : '× In die Ebene'}` : 'Wähle einen Leiter auf dem Raster.';
  $('reverse').disabled = $('remove').disabled = !w;
  $('displayState').textContent = state.single && state.total ? 'Einzelfelder + Gesamtfeld' : state.single ? 'Einzelfelder' : state.total ? 'Gesamtfeld' : 'Felder ausgeblendet';
  $('rings').value = String(state.rings);
  document.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === state.tool)));
  $('toolHelp').textContent = state.tool === 'move' ? 'Tippe auf einen Leiter, um ihn auszuwählen. Ziehe ihn auf einen freien Rasterpunkt.' : 'Rasterpunkt: setzen. Leiter: auswählen.';
}
function refresh(changed = false) {
  dirty ||= changed;
  updateControls();
  if (frame === null) frame = requestAnimationFrame(() => { frame = null; draw(); });
}
function pixel(p) { return { x: geometry.cx + p.x * geometry.scale, y: geometry.cy - p.y * geometry.scale }; }
function pointer(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left - geometry.cx) / geometry.scale, y: -(e.clientY - r.top - geometry.cy) / geometry.scale };
}
function arrow(p, tangent, color, size = 6) {
  const mag = Math.hypot(tangent.x, tangent.y);
  if (mag < 1e-9) return;
  const x = tangent.x / mag, y = -tangent.y / mag, q = pixel(p);
  ctx.beginPath(); ctx.moveTo(q.x + x * size, q.y + y * size);
  ctx.lineTo(q.x - x * size + y * size * 0.6, q.y - y * size - x * size * 0.6);
  ctx.lineTo(q.x - x * size - y * size * 0.6, q.y - y * size + x * size * 0.6);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function drawGrid() {
  ctx.lineWidth = 1; ctx.strokeStyle = '#e4e4e8';
  for (let x = -10; x <= 10; x++) { const a = pixel({ x, y: -6 }), b = pixel({ x, y: 6 }); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  for (let y = -6; y <= 6; y++) { const a = pixel({ x: -10, y }), b = pixel({ x: 10, y }); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  ctx.strokeStyle = '#81818a'; ctx.beginPath();
  let a = pixel({ x: -10, y: 0 }), b = pixel({ x: 10, y: 0 }); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  a = pixel({ x: 0, y: -6 }); b = pixel({ x: 0, y: 6 }); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.font = '14px system-ui'; ctx.fillStyle = '#626269'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let x = -10; x <= 10; x += 2) { const p = pixel({ x, y: -6 }); ctx.fillText(String(x).replace('-', '−'), p.x, p.y + 7); }
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let y = -6; y <= 6; y += 2) { const p = pixel({ x: -10, y }); ctx.fillText(String(y).replace('-', '−'), p.x - 8, p.y); }
  ctx.textAlign = 'left'; let q = pixel({ x: 10, y: 0 }); ctx.fillText('x', q.x + 9, q.y);
  q = pixel({ x: 0, y: 6 }); ctx.fillText('y', q.x + 8, q.y - 12);
}
function drawSingles() {
  ctx.strokeStyle = colors.single; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  for (const w of state.wires) {
    const center = pixel(w);
    const radii = singleFieldRadii(geometry.scale, state.rings);
    // Thin crowded rings without merging their strokes into a filled annulus.
    ctx.lineWidth = radii.length > 1 ? Math.min(1, (radii[1] - radii[0]) * geometry.scale * 0.7) : 1;
    for (const radius of radii) {
      ctx.beginPath(); ctx.arc(center.x, center.y, radius * geometry.scale, 0, Math.PI * 2); ctx.stroke();
      if (radius === radii.at(-1) && radius * geometry.scale > 8) {
        const gap = radii.length > 1 ? (radius - radii.at(-2)) * geometry.scale : Infinity;
        const size = Math.min(2.5, gap * 0.8);
        if (size < 1) continue;
        const angle = Math.PI / 4, p = { x: w.x + radius * Math.cos(angle), y: w.y + radius * Math.sin(angle) };
        arrow(p, { x: -w.sign * Math.sin(angle), y: w.sign * Math.cos(angle) }, colors.single, size);
      }
    }
  }
  ctx.setLineDash([]);
}
function drawTotal() {
  ctx.strokeStyle = colors.total; ctx.lineWidth = 1.4;
  for (const line of lines) {
    ctx.beginPath();
    line.points.forEach((p, i) => { const q = pixel(p); if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); });
    ctx.stroke();
  }
  for (const marker of arrowMarkers(lines, state.wires, geometry.scale)) arrow(marker, { x: marker.bx, y: marker.by }, colors.total, marker.size);
}
function draw() {
  const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(r.width * dpr) || canvas.height !== Math.round(r.height * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  geometry = { cx: r.width / 2 + 6, cy: r.height / 2 - 4, scale: Math.min((r.width - 64) / 20, (r.height - 64) / 12) };
  ctx.clearRect(0, 0, r.width, r.height); drawGrid();
  if (dirty && state.total) { lines = fieldLines(state.wires); dirty = false; }
  ctx.save(); const a = pixel({ x: -10.5, y: 6.5 });
  ctx.beginPath(); ctx.rect(a.x, a.y, 21 * geometry.scale, 13 * geometry.scale); ctx.clip();
  if (state.single) drawSingles();
  if (state.total) drawTotal();
  ctx.restore();
  for (const w of state.wires) {
    const q = pixel(w), radius = Math.max(2.5, WIRE_RADIUS * geometry.scale);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = w.id === state.selected ? colors.action : colors.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(q.x, q.y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (w.id === state.selected) { ctx.strokeStyle = colors.action; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, radius + 5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = colors.ink;
    if (w.sign > 0) { ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1, radius * 0.34), 0, Math.PI * 2); ctx.fill(); }
    else { const arm = Math.max(1.5, radius * 0.55); ctx.strokeStyle = colors.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(q.x - arm, q.y - arm); ctx.lineTo(q.x + arm, q.y + arm); ctx.moveTo(q.x - arm, q.y + arm); ctx.lineTo(q.x + arm, q.y - arm); ctx.stroke(); }
  }
  if (document.activeElement === canvas) { const q = pixel(state.cursor); ctx.strokeStyle = colors.action; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.strokeRect(q.x - 13, q.y - 13, 26, 26); ctx.setLineDash([]); }
}
function activate(p) {
  state.cursor = p;
  const w = occupied(p);
  if (w) { state.selected = w.id; message(`Leiter (${w.x} | ${w.y}) ausgewählt.`); refresh(); return; }
  if (state.tool === 'move') { state.selected = null; message('Wähle einen Leiter, um ihn zu verschieben.'); refresh(); return; }
  if (state.wires.length >= MAX_WIRES) { message('Maximal 64 Leiter. Lösche einen Leiter, um einen neuen zu setzen.'); return; }
  const wire = { ...p, sign: state.tool === 'out' ? 1 : -1, id: nextId++ };
  state.wires.push(wire); state.selected = wire.id;
  message(`Leiter (${p.x} | ${p.y}) gesetzt: Strom ${wire.sign > 0 ? 'aus der' : 'in die'} Ebene.`); refresh(true);
}
function moveWire(w, p) {
  if (occupied(p, w.id)) { message('Dieser Rasterpunkt ist belegt.'); return false; }
  if (w.x === p.x && w.y === p.y) return false;
  w.x = p.x; w.y = p.y; state.cursor = p; refresh(true); return true;
}
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag || !geometry) return;
  const raw = pointer(e);
  if (Math.abs(raw.x) > 10.5 || Math.abs(raw.y) > 6.5) return;
  canvas.focus({ preventScroll: true });
  const p = bounded(raw);
  if (state.tool === 'move') {
    const w = state.wires.reduce((best, w) => {
      const distance = Math.hypot(w.x - raw.x, w.y - raw.y) * geometry.scale;
      return distance <= 24 && (!best || distance < best.distance) ? { w, distance } : best;
    }, null)?.w;
    if (w) { state.selected = w.id; state.cursor = { x: w.x, y: w.y }; drag = { id: w.id, pointerId: e.pointerId, origin: { x: w.x, y: w.y }, offset: { x: w.x - raw.x, y: w.y - raw.y } }; canvas.setPointerCapture(e.pointerId); message(`Leiter (${w.x} | ${w.y}) ausgewählt.`); refresh(); }
    else activate(p);
  } else activate(p);
});
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.pointerId !== e.pointerId) return;
  const w = selected(), p = pointer(e);
  if (w) moveWire(w, bounded({ x: p.x + drag.offset.x, y: p.y + drag.offset.y }));
});
function release(e) {
  if (!drag || drag.pointerId !== e.pointerId) return;
  const w = selected();
  if (e.type === 'pointercancel' && w) { Object.assign(w, drag.origin); state.cursor = { ...drag.origin }; refresh(true); message('Verschieben abgebrochen.'); }
  else if (w) message(`Leiter bei (${w.x} | ${w.y}).`);
  const id = drag.pointerId; drag = null;
  if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
}
canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', e => { if (drag?.pointerId === e.pointerId) release(e); });
function remove() {
  const w = selected(); if (!w) return;
  state.wires = state.wires.filter(item => item.id !== w.id); state.selected = null;
  message(`Leiter (${w.x} | ${w.y}) gelöscht.`); refresh(true);
}
canvas.addEventListener('keydown', e => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.preventDefault(); const w = state.tool === 'move' ? selected() : null, base = w || state.cursor;
    const p = bounded({ x: base.x + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0), y: base.y + (e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0) });
    if (w) { if (moveWire(w, p)) message(`Leiter bei (${p.x} | ${p.y}).`); }
    else { state.cursor = p; message(`Rastercursor (${p.x} | ${p.y}).`); refresh(); }
  } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(state.cursor); }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(); }
  else if (e.key === 'Escape') { state.selected = null; message('Auswahl aufgehoben.'); refresh(); }
});
canvas.addEventListener('focus', () => refresh()); canvas.addEventListener('blur', () => refresh());
document.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => { state.tool = b.dataset.tool; refresh(); }));
$('single').addEventListener('change', e => { state.single = e.target.checked; refresh(); });
$('total').addEventListener('change', e => { state.total = e.target.checked; refresh(); });
$('rings').addEventListener('change', e => { state.rings = Number(e.target.value); refresh(); });
$('reverse').addEventListener('click', () => { const w = selected(); if (w) { w.sign *= -1; message(`Stromrichtung bei (${w.x} | ${w.y}) umgekehrt.`); refresh(true); } });
$('remove').addEventListener('click', remove);
function loadExample(wires, text) {
  state.wires = wires.map(w => ({ ...w, id: nextId++ })); state.selected = null;
  message(text); refresh(true);
}
$('coil').addEventListener('click', () => loadExample(spule(), 'Spulenbeispiel: oben •, unten ×. Im mittleren Innenbereich zeigt das Gesamtfeld nach rechts.'));
$('pairSame').addEventListener('click', () => loadExample(leiterpaar(), 'Zwei Leiter: beide ×, Strom in die Ebene. Genau in der Mitte heben sich die Felder auf.'));
$('pairOpposite').addEventListener('click', () => loadExample(leiterpaar(true), 'Zwei Leiter: links ×, rechts •. Zwischen ihnen verstärken sich die Felder; in der Mitte zeigt das Gesamtfeld nach unten.'));
$('clear').addEventListener('click', () => { state.wires = []; state.selected = null; message('Raster geleert. Die Feldanzeigen bleiben wie gewählt.'); refresh(true); });
new ResizeObserver(() => refresh()).observe(canvas.parentElement);
window.magneticFieldLab = Object.freeze({ getState: () => structuredClone(state) });
refresh();
