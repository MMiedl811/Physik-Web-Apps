import { fieldAt, WIRE_RADIUS } from './field-core.mjs';

export function singleFieldRadii(scale, count) {
  // Every isolated contribution uses the same circles, independent of other
  // conductors. Circles belonging to different contributions may overlap.
  // Geometric spacing represents the 1/r field outside the wire.
  const outer = 3.5;
  const symbolRadius = Math.max(2.5, WIRE_RADIUS * scale);
  const inner = Math.min(outer * 0.75, Math.max(outer / 1.85 ** (count - 1), (symbolRadius + 1.3) / scale));
  return Array.from({ length: count }, (_, i) => count === 1 ? outer : inner * (outer / inner) ** (i / (count - 1)));
}

function segmentDistance(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
  const t = length2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length2)) : 0;
  return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
}

// Markers are separate from the field model. Their complete footprint must
// leave neighbouring field lines and conductor symbols clear, at every zoom.
export function arrowMarkers(lines, wires, scale) {
  const markers = [], segments = new Map(), cell = 0.4;
  lines.forEach((line, lineIndex) => {
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1], b = line.points[i], segment = { a, b, lineIndex };
      for (let x = Math.floor(Math.min(a.x, b.x) / cell); x <= Math.floor(Math.max(a.x, b.x) / cell); x++) {
        for (let y = Math.floor(Math.min(a.y, b.y) / cell); y <= Math.floor(Math.max(a.y, b.y) / cell); y++) {
          const key = `${x},${y}`;
          if (!segments.has(key)) segments.set(key, []);
          segments.get(key).push(segment);
        }
      }
    }
  });
  const wireRadius = Math.max(2.5, WIRE_RADIUS * scale);
  const add = (p, lineIndex, size) => {
    if (Math.abs(p.x) > 10.3 || Math.abs(p.y) > 6.3) return false;
    if (wires.some(w => Math.hypot(p.x - w.x, p.y - w.y) * scale < wireRadius + size + 2)) return false;
    if (markers.some(m => Math.hypot(p.x - m.x, p.y - m.y) * scale < size + m.size + 12)) return false;
    const clearance = (size + 2) / scale;
    for (let x = Math.floor((p.x - clearance) / cell); x <= Math.floor((p.x + clearance) / cell); x++) {
      for (let y = Math.floor((p.y - clearance) / cell); y <= Math.floor((p.y + clearance) / cell); y++) {
        for (const segment of segments.get(`${x},${y}`) || []) if (segment.lineIndex !== lineIndex && segmentDistance(p, segment.a, segment.b) < clearance) return false;
      }
    }
    const f = fieldAt(p.x, p.y, wires);
    if (f.mag < 1e-8) return false;
    markers.push({ ...p, bx: f.bx, by: f.by, size, lineIndex });
    return true;
  };
  lines.forEach((line, index) => {
    if (line.local) {
      // Choose the clearest point of a small closed loop, rather than hiding
      // its only arrow under the conductor or putting it on another line.
      const candidates = line.points.filter((_, i) => i % 2 === 0).sort((a, b) => {
        const clearance = p => Math.min(...wires.map(w => Math.hypot(p.x - w.x, p.y - w.y)));
        return clearance(b) - clearance(a);
      });
      for (const size of [3, 2]) if (candidates.some(p => add(p, index, size))) break;
      return;
    }
    let distance = 0, next = 45 + (index % 4) * 23;
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1], b = line.points[i], length = Math.hypot(b.x - a.x, b.y - a.y) * scale;
      if (distance + length >= next) {
        const t = (next - distance) / length;
        const p = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
        if (add(p, index, 3.5)) next += 145; else next += 16;
      }
      distance += length;
    }
  });
  return markers;
}
