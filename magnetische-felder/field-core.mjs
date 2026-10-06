export const DOMAIN = Object.freeze({ xmin: -10, xmax: 10, ymin: -6, ymax: 6 });
export const WIRE_RADIUS = 0.08;
export const MAX_WIRES = 64;
export const LINE_BOUNDS = Object.freeze({ xmin: -10.6, xmax: 10.6, ymin: -6.6, ymax: 6.6 });

// Relative units: equal current magnitude; +1 points out of the plane.
// Uniform current density inside a finite circular conductor gives B ∝ r.
export function fieldAt(x, y, wires) {
  let bx = 0, by = 0;
  for (const w of wires) {
    const dx = x - w.x, dy = y - w.y;
    const factor = w.sign / Math.max(dx * dx + dy * dy, WIRE_RADIUS ** 2);
    bx -= factor * dy;
    by += factor * dx;
  }
  return { bx, by, mag: Math.hypot(bx, by) };
}

// B = (∂ψ/∂y, -∂ψ/∂x). Every field line is an isoline of ψ.
// This C1 continuation matches the same finite-core field used above.
export function fluxAt(x, y, wires) {
  let flux = 0;
  for (const w of wires) {
    const r2 = (x - w.x) ** 2 + (y - w.y) ** 2;
    flux -= w.sign * (r2 >= WIRE_RADIUS ** 2 ? 0.5 * Math.log(r2) : Math.log(WIRE_RADIUS) + 0.5 * (r2 / WIRE_RADIUS ** 2 - 1));
  }
  return flux;
}

export function spule() {
  return [-2, 2].flatMap(y => Array.from({ length: 13 }, (_, i) => ({ x: i - 6, y, sign: y > 0 ? 1 : -1 })));
}

export function leiterpaar(entgegengesetzt = false) {
  return [{ x: -1, y: 0, sign: -1 }, { x: 1, y: 0, sign: entgegengesetzt ? 1 : -1 }];
}

function makeMesh(wires) {
  // Refine the common mesh near conductors and their cancellation points.
  // Transition cells share every edge vertex with their refined neighbour.
  const coarse = 0.05, factor = 4, step = coarse / factor;
  const cols = Math.round((LINE_BOUNDS.xmax - LINE_BOUNDS.xmin) / coarse), rows = Math.round((LINE_BOUNDS.ymax - LINE_BOUNDS.ymin) / coarse);
  const nx = cols * factor, ny = rows * factor, values = new Float64Array((nx + 1) * (ny + 1));
  values.fill(NaN);
  const refined = new Uint8Array(cols * rows), triangles = [], sampled = [], offsets = new Uint32Array(cols * rows + 1);
  const id = (x, y) => y * (nx + 1) + x;
  const sample = index => {
    if (Number.isNaN(values[index])) {
      values[index] = fluxAt(LINE_BOUNDS.xmin + (index % (nx + 1)) * step, LINE_BOUNDS.ymin + Math.floor(index / (nx + 1)) * step, wires);
      sampled.push(values[index]);
    }
    return index;
  };
  const triangle = (a, b, c) => triangles.push(sample(a), sample(b), sample(c));
  const fine = (x, y) => x >= 0 && x < cols && y >= 0 && y < rows && refined[y * cols + x];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = LINE_BOUNDS.xmin + (i + 0.5) * coarse, y = LINE_BOUNDS.ymin + (j + 0.5) * coarse;
    if (wires.some(w => Math.abs(w.x - x) < 0.7 && Math.abs(w.y - y) < 0.7)) refined[j * cols + i] = 1;
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    offsets[j * cols + i] = triangles.length;
    const x = i * factor, y = j * factor;
    if (fine(i, j)) {
      for (let dy = 0; dy < factor; dy++) for (let dx = 0; dx < factor; dx++) {
        const a = id(x + dx, y + dy), b = a + 1, d = a + nx + 1, c = d + 1;
        triangle(a, b, c); triangle(a, c, d);
      }
    } else if (fine(i - 1, j) || fine(i + 1, j) || fine(i, j - 1) || fine(i, j + 1)) {
      const edge = [id(x, y)];
      for (let k = 1; k < factor; k++) if (fine(i, j - 1)) edge.push(id(x + k, y));
      edge.push(id(x + factor, y));
      for (let k = 1; k < factor; k++) if (fine(i + 1, j)) edge.push(id(x + factor, y + k));
      edge.push(id(x + factor, y + factor));
      for (let k = 1; k < factor; k++) if (fine(i, j + 1)) edge.push(id(x + factor - k, y + factor));
      edge.push(id(x, y + factor));
      for (let k = 1; k < factor; k++) if (fine(i - 1, j)) edge.push(id(x, y + factor - k));
      const center = id(x + factor / 2, y + factor / 2);
      for (let k = 0; k < edge.length; k++) triangle(center, edge[k], edge[(k + 1) % edge.length]);
    } else {
      const a = id(x, y), b = id(x + factor, y), c = id(x + factor, y + factor), d = id(x, y + factor);
      triangle(a, b, c); triangle(a, c, d);
    }
  }
  offsets[cols * rows] = triangles.length;
  return { step, nx, ny, values, sampled, cols, rows, coarse, offsets, triangles: Uint32Array.from(triangles) };
}

// The same triangular, piecewise-linear ψ is used for EVERY contour level.
// Different level sets cannot cross. Edge identities join entire curves,
// including their closing segment; no straight shortcut back to a seed.
function contours(mesh, levels, range = null) {
  const { nx, ny, step, values } = mesh;
  const point = id => ({ x: LINE_BOUNDS.xmin + (id % (nx + 1)) * step, y: LINE_BOUNDS.ymin + Math.floor(id / (nx + 1)) * step });
  const groups = levels.map(level => ({ level, nodes: new Map(), segments: [] }));
  const node = (group, a, b) => {
    const key = a < b ? `${a}:${b}` : `${b}:${a}`;
    if (!group.nodes.has(key)) {
      const p = point(a), q = point(b), t = (group.level - values[a]) / (values[b] - values[a]);
      group.nodes.set(key, { point: { x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) }, edges: [] });
    }
    return key;
  };
  const triangle = (a, b, c) => {
    const min = Math.min(values[a], values[b], values[c]), max = Math.max(values[a], values[b], values[c]);
    for (const group of groups) {
      if (group.level <= min || group.level >= max) continue;
      const crossings = [];
      for (const [u, v] of [[a, b], [b, c], [c, a]]) if ((values[u] < group.level) !== (values[v] < group.level)) crossings.push(node(group, u, v));
      if (crossings.length !== 2) continue;
      const index = group.segments.length;
      group.segments.push(crossings);
      for (const key of crossings) group.nodes.get(key).edges.push(index);
    }
  };
  const process = (start, end) => {
    for (let i = start; i < end; i += 3) triangle(mesh.triangles[i], mesh.triangles[i + 1], mesh.triangles[i + 2]);
  };
  if (range) {
    const imin = Math.max(0, Math.floor((range.xmin - LINE_BOUNDS.xmin) / mesh.coarse)), imax = Math.min(mesh.cols, Math.ceil((range.xmax - LINE_BOUNDS.xmin) / mesh.coarse));
    const jmin = Math.max(0, Math.floor((range.ymin - LINE_BOUNDS.ymin) / mesh.coarse)), jmax = Math.min(mesh.rows, Math.ceil((range.ymax - LINE_BOUNDS.ymin) / mesh.coarse));
    for (let j = jmin; j < jmax; j++) process(mesh.offsets[j * mesh.cols + imin], mesh.offsets[j * mesh.cols + imax]);
  } else process(0, mesh.triangles.length);
  const lines = [];
  for (const group of groups) {
    const used = new Set();
    // Start open curves at mesh-boundary endpoints, then collect closed loops.
    const starts = [...group.nodes.keys()].sort((a, b) => group.nodes.get(a).edges.length - group.nodes.get(b).edges.length);
    for (const start of starts) {
      if (group.nodes.get(start).edges.every(e => used.has(e))) continue;
      const points = [group.nodes.get(start).point]; let key = start, closed = false;
      while (true) {
        const edge = group.nodes.get(key).edges.find(e => !used.has(e));
        if (edge === undefined) break;
        used.add(edge);
        const [a, b] = group.segments[edge]; key = a === key ? b : a;
        points.push(group.nodes.get(key).point);
        if (key === start) { closed = true; break; }
      }
      if (points.length > 5) lines.push({ points, closed, level: group.level });
    }
  }
  return lines;
}

function contains(line, p) {
  let inside = false;
  for (let i = 0, j = line.points.length - 1; i < line.points.length; j = i++) {
    const a = line.points[i], b = line.points[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function orient(line, wires) {
  // Line direction, arrow direction and source reversal share one convention.
  const index = Math.floor(line.points.length / 3), a = line.points[index], b = line.points[index + 1];
  const f = fieldAt((a.x + b.x) / 2, (a.y + b.y) / 2, wires);
  if ((b.x - a.x) * f.bx + (b.y - a.y) * f.by < 0) line.points.reverse();
  return line;
}

function singleWireLines(wire) {
  const lines = [];
  // Equal logarithmic steps encode B ∝ 1/r; exact circles have no seam drift.
  for (let radius = 0.34; radius < 16; radius *= 1.85) {
    const count = Math.max(96, Math.ceil(2 * Math.PI * radius / 0.05));
    const points = Array.from({ length: count }, (_, i) => {
      const angle = wire.sign * 2 * Math.PI * i / count;
      return { x: wire.x + radius * Math.cos(angle), y: wire.y + radius * Math.sin(angle) };
    });
    points.push(points[0]); lines.push({ points, closed: true, level: fluxAt(points[0].x, points[0].y, [wire]), local: radius < 0.5 });
  }
  return lines;
}

export function fieldLines(wires) {
  if (!wires.length) return [];
  if (wires.length === 1) return singleWireLines(wires[0]);
  const mesh = makeMesh(wires), strengths = [];
  for (let y = -5; y <= 5; y++) for (let x = -9; x <= 9; x++) {
    if (!wires.some(w => Math.hypot(w.x - x, w.y - y) < 0.6)) strengths.push(fieldAt(x, y, wires).mag);
  }
  strengths.sort((a, b) => a - b);
  // One flux interval for the whole view: homogeneous field → uniform spacing.
  const interval = Math.max(0.65, 0.65 * (strengths[Math.floor(strengths.length * 0.85)] || 0));
  let min = Infinity, max = -Infinity;
  for (const value of mesh.sampled) { min = Math.min(min, value); max = Math.max(max, value); }
  const levels = [];
  for (let k = Math.ceil(min / interval - 0.5); (k + 0.5) * interval < max; k++) levels.push((k + 0.5) * interval + 1e-9);
  const lines = contours(mesh, levels);
  // Thin-wire local loops need finer flux levels than the overview. Retain only
  // a closed component around exactly this conductor; never add its other,
  // possibly global components (the old source of bundles in the interior).
  for (const wire of wires) {
    const existing = lines.find(l => l.closed && contains(l, wire) && wires.filter(w => contains(l, w)).length === 1 && Math.max(...l.points.map(p => Math.hypot(p.x - wire.x, p.y - wire.y))) > 0.25);
    if (existing) { existing.local = true; continue; }
    const center = fluxAt(wire.x, wire.y, wires);
    const localLevels = [2.2, 2.05, 1.9, 1.75, 1.6, 1.45, 1.3, 1.15, 1.0].map(delta => center - wire.sign * delta + 1e-9);
    const candidates = contours(mesh, localLevels, { xmin: wire.x - 0.85, xmax: wire.x + 0.85, ymin: wire.y - 0.85, ymax: wire.y + 0.85 });
    for (const level of localLevels) {
      const loop = candidates.find(l => l.level === level && l.closed && contains(l, wire) && wires.filter(w => contains(l, w)).length === 1);
      if (loop && loop.points.every(p => fieldAt(p.x, p.y, wires).mag > 1.5)) { loop.local = true; lines.push(loop); break; }
    }
  }
  return lines.map(l => orient(l, wires));
}
