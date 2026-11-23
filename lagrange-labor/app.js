import { sample } from './model.mjs';

const orbit = document.getElementById('orbit');
const play = document.getElementById('play');
const playLabel = document.getElementById('play-label');
const playIcon = document.getElementById('play-icon');
const line = document.getElementById('sun-earth-axis');
const earth = document.getElementById('earth-globe');
const sunLabel = document.getElementById('sun-label');
const earthLabel = document.getElementById('earth-label');
const l2Label = document.getElementById('l2-label');
const l2Markers = [document.getElementById('l2-halo'), document.getElementById('l2-marker')];

const { width, height } = orbit.viewBox.baseVal;
const centerX = width / 2;
const centerY = height / 2;
const earthRadius = 155;
const l2Radius = 199;
const playbackPeriodMs = 18000;

let phase = 0;
let previousFrame = null;
let animationFrame = null;
let displayScale = 1;

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
  for (const marker of l2Markers) {
    marker.setAttribute('cx', l2X);
    marker.setAttribute('cy', l2Y);
  }

  placeLabel(sunLabel, centerX, centerY + sunOffset);
  placeLabel(earthLabel, earthX + sin * labelOffset, earthY + cos * labelOffset + 5 / displayScale);
  placeLabel(l2Label, l2X - sin * labelOffset, l2Y - cos * labelOffset + 5 / displayScale);
}

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
draw();

const earthDistance = (sample('L2').distanceEarth / 1e9).toLocaleString('de-DE', {
  maximumFractionDigits: 2,
});
document.getElementById('distance').textContent = earthDistance + ' Millionen Kilometer';
