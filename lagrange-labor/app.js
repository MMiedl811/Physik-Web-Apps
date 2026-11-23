import { sample } from './model.mjs';

const orbit = document.getElementById('orbit');
const play = document.getElementById('play');
const playLabel = document.getElementById('play-label');
const playIcon = document.getElementById('play-icon');
const line = document.getElementById('sun-earth-axis');
const earth = document.getElementById('earth-globe');
const sunLabel = document.getElementById('sun-label');
const earthLabel = document.getElementById('earth-label');
const l2Halo = document.getElementById('l2-halo');
const forceLayer = document.getElementById('force-layer');
const orbitDescription = document.getElementById('orbit-desc');
const baseDescription = orbitDescription.textContent;
const forceToggle = document.getElementById('show-forces');

const { width, height } = orbit.viewBox.baseVal;
const centerX = width / 2;
const centerY = height / 2;
const earthRadius = 155;
const l2Radius = 199;
// All displayed radii are schematic. Force directions come from the model.
const points = [
  { id: 'l1', radius: 98, side: 1 },
  { id: 'l2', radius: l2Radius, side: -1 },
  { id: 'l3', radius: -155, side: -1 },
].map(point => {
  const { id } = point;
  const forces = sample(id.toUpperCase());
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  group.dataset.forcePoint = id;
  const stem = document.createElementNS(group.namespaceURI, 'line');
  stem.setAttribute('class', 'force-stem');
  group.append(stem);
  const rays = ['sun', 'earth'].map(body => {
    const path = document.createElementNS(group.namespaceURI, 'path');
    path.setAttribute('class', 'force-ray force-' + body);
    path.dataset.source = body;
    group.append(path);
    return { path, force: forces[body][0] };
  });
  const resultant = document.createElementNS(group.namespaceURI, 'path');
  resultant.setAttribute('class', 'force-ray force-resultant');
  resultant.dataset.source = 'resultant';
  group.append(resultant);
  forceLayer.append(group);
  return {
    ...point,
    marker: document.getElementById(id + '-marker'),
    label: document.getElementById(id + '-label'),
    group,
    stem,
    rays,
    resultant,
    toggle: document.getElementById('show-' + id),
    visible: id === 'l2',
  };
});
const strongestSun = Math.max(...points.map(point => Math.abs(point.rays[0].force)));
const playbackPeriodMs = 18000;

let phase = 0;
let previousFrame = null;
let animationFrame = null;
let displayScale = 1;
let showForces = false;

function placeLabel(label, x, y) {
  label.setAttribute('x', x);
  label.setAttribute('y', y);
}

function draw() {
  const cos = Math.cos(phase);
  const sin = Math.sin(phase);
  const earthX = centerX + earthRadius * cos;
  const earthY = centerY - earthRadius * sin;
  const l2X = centerX + l2Radius * cos;
  const l2Y = centerY - l2Radius * sin;
  const labelOffset = 34 / displayScale;
  const sunOffset = Math.max(57, 36 / displayScale);

  line.setAttribute('x2', l2X);
  line.setAttribute('y2', l2Y);
  earth.setAttribute('transform', `translate(${earthX} ${earthY}) rotate(${-phase * 180 / Math.PI})`);
  l2Halo.setAttribute('cx', l2X);
  l2Halo.setAttribute('cy', l2Y);
  const showL3 = points.find(point => point.id === 'l3').visible;
  line.setAttribute('x1', showL3 ? centerX - earthRadius * cos : centerX);
  line.setAttribute('y1', showL3 ? centerY + earthRadius * sin : centerY);
  placeLabel(sunLabel, centerX, centerY + sunOffset);
  placeLabel(earthLabel, earthX + sin * labelOffset, earthY + cos * labelOffset + 5 / displayScale);

  for (const point of points) {
    if (!point.visible) continue;
    const x = centerX + point.radius * cos;
    const y = centerY - point.radius * sin;
    point.marker.setAttribute('cx', x);
    point.marker.setAttribute('cy', y);
    const pointLabelOffset = showForces ? 49 / displayScale : labelOffset;
    placeLabel(point.label, x + point.side * sin * pointLabelOffset, y + point.side * cos * pointLabelOffset + 5 / displayScale);
    if (showForces) drawForces(point, x, y);
  }
}

function drawForces(point, x, y) {
  point.group.setAttribute('transform', `translate(${x} ${y}) rotate(${-phase * 180 / Math.PI})`);
  const [sun, earth] = point.rays;
  const sunLength = Math.min(54, 40 / displayScale) * Math.abs(sun.force) / strongestSun;
  // Expand the small Earth contribution so that it stays visible at every width.
  const earthLength = Math.max(5 / displayScale, sunLength * Math.cbrt(Math.abs(earth.force / sun.force)));
  const sunEnd = Math.sign(sun.force) * sunLength;
  const earthEnd = Math.sign(earth.force) * earthLength;
  const rays = [
    [sun.path, sunEnd],
    [earth.path, earthEnd],
    [point.resultant, sunEnd + earthEnd],
  ];
  const firstOffset = 10;
  const spacing = 11;
  point.stem.setAttribute('y2', point.side * (firstOffset + 2 * spacing) / displayScale);
  // The staggered arrows keep their directions and share a reference line.
  rays.forEach(([path, end], index) => {
    const offset = point.side * (firstOffset + index * spacing) / displayScale;
    const head = Math.min(8, 6 / displayScale, Math.abs(end) * .6);
    const wing = end - Math.sign(end) * head;
    path.setAttribute('d', `M0 ${offset}H${end} M${wing} ${offset - head / 2}L${end} ${offset}L${wing} ${offset + head / 2}`);
  });
}

function toggleLayers() {
  forceLayer.toggleAttribute('hidden', !showForces);
  document.getElementById('force-key').hidden = !showForces;
  forceToggle.setAttribute('aria-pressed', String(showForces));
  const descriptions = [baseDescription];
  for (const point of points) {
    point.group.toggleAttribute('hidden', !point.visible);
    if (!point.toggle) continue;
    document.getElementById(point.id + '-point').toggleAttribute('hidden', !point.visible);
    point.toggle.setAttribute('aria-pressed', String(point.visible));
    if (point.visible) {
      descriptions.push(point.id === 'l1' ? 'L1 liegt zwischen Sonne und Erde.' : 'L3 liegt jenseits der Sonne, gegenüber der Erde.');
    }
  }
  document.getElementById('l1-path').toggleAttribute('hidden', !points[0].visible);
  if (showForces) {
    descriptions.push('Die Kraftpfeile zeigen die Anziehung durch Sonne und Erde sowie ihre Resultierende. Die schwächere Erdanziehung ist zur Lesbarkeit vergrößert.');
    descriptions.push('Bei L2 zeigen beide Kräfte zur Sonne.');
    if (points[0].visible) descriptions.push('Bei L1 wirken beide Kräfte in entgegengesetzte Richtungen.');
    if (points[2].visible) descriptions.push('Bei L3 zeigen beide Kräfte zur Erde hin.');
  }
  orbitDescription.textContent = descriptions.join(' ');
  draw();
}

for (const point of points) {
  point.toggle?.addEventListener('click', () => {
    point.visible = !point.visible;
    toggleLayers();
  });
}
forceToggle.addEventListener('click', () => {
  showForces = !showForces;
  toggleLayers();
});

function tick(time) {
  if (previousFrame !== null) {
    const elapsed = Math.min(time - previousFrame, 100);
    phase = (phase + elapsed * 2 * Math.PI / playbackPeriodMs) % (2 * Math.PI);
    draw();
  }
  previousFrame = time;
  animationFrame = requestAnimationFrame(tick);
}

play.addEventListener('click', () => {
  if (animationFrame === null) {
    animationFrame = requestAnimationFrame(tick);
    playLabel.textContent = 'Pause';
    playIcon.textContent = '❚❚';
    play.setAttribute('aria-label', 'Umlauf pausieren');
  } else {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    previousFrame = null;
    playLabel.textContent = 'Weiter';
    playIcon.textContent = '▶';
    play.setAttribute('aria-label', 'Umlauf fortsetzen');
  }
});

const resize = new ResizeObserver(() => {
  const box = orbit.getBoundingClientRect();
  displayScale = Math.min(box.width / width, box.height / height);
  if (displayScale <= 0) return;
  orbit.style.setProperty('--body-font-size', Math.max(15 / displayScale, 16) + 'px');
  draw();
});
resize.observe(orbit);
toggleLayers();

const earthDistance = (sample('L2').distanceEarth / 1e9).toLocaleString('de-DE', {
  maximumFractionDigits: 2,
});
document.getElementById('distance').textContent = earthDistance + ' Millionen Kilometer';
