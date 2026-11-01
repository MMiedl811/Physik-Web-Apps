// Ideal generator, fixed B and A; positive contour: side A down, side B up.
export const TAU = 2 * Math.PI;
export const defaults = { angle: 45, rpm: 12, direction: 1, kind: 'ac', explanation: 'lorentz', carrier: null };
export const parameters = { turns: 100, field: .4, area: .02 };
export const radians = degrees => degrees * Math.PI / 180;
export const wrap = degrees => ((degrees % 360) + 360) % 360;
export function sample(angle, rpm, direction = 1, p = parameters) {
  const theta = radians(angle), omega = direction * rpm * TAU / 60;
  const sine = Math.abs(Math.sin(theta)) < 1e-12 ? 0 : Math.sin(theta);
  const cosine = Math.abs(Math.cos(theta)) < 1e-12 ? 0 : Math.cos(theta);
  const linkage = p.turns * p.field * p.area * cosine;
  const emf = p.turns * p.field * p.area * omega * sine || 0;
  // The mechanical contacts depend on POSITION, not the sign of the voltage.
  const contact = sine === 0 ? 0 : Math.sign(sine);
  return { theta, omega, sine, cosine, linkage, emf, dc: contact * emf || 0,
    contact, peak: p.turns * p.field * p.area * Math.abs(omega),
    electronA: Math.sign(omega * sine) || 0, normal: [cosine, 0, -sine],
    sideA: [sine, 0, cosine], velocityA: [omega * cosine, 0, -omega * sine] };
}
export function advance(angle, seconds, rpm, direction) {
  return wrap(angle + seconds * rpm * 6 * direction);
}
// Magnetic force q(v×B): carrier choice changes force, never terminal voltage.
export function carrierForceA(m, carrier) {
  return carrier === 'positive' ? -m.electronA || 0 : carrier === 'electrons' ? m.electronA : 0;
}
