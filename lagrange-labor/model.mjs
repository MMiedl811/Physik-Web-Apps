// Circular restricted three-body model. Unit distance: Sun–Earth separation;
// unit time: 1/angular frequency. Origin: barycentre, Earth on positive x axis.
export const GM_SUN = 1.32712440041279419e20;
export const GM_EARTH = 3.98600435507e14;
export const AU = 1.495978707e11;
export const MU = GM_EARTH / (GM_SUN + GM_EARTH);
export const OMEGA = Math.sqrt((GM_SUN + GM_EARTH) / AU ** 3);
export const MASS = 1000; // same illustrative test mass for every force comparison
export function acceleration([x, y], mu = MU) {
  const rs = Math.hypot(x + mu, y), re = Math.hypot(x - 1 + mu, y);
  const sun = [-(1-mu)*(x+mu)/rs**3, -(1-mu)*y/rs**3];
  const earth = [-mu*(x-1+mu)/re**3, -mu*y/re**3];
  return {sun, earth, total: sun.map((v,i) => v+earth[i])};
}
function root(lo, hi, mu) {
  const f = x => acceleration([x,0],mu).total[0] + x;
  let fl = f(lo);
  if (fl*f(hi)>0) throw new Error('Root not bracketed');
  for (let i=0;i<100;i++) {
    const mid=(lo+hi)/2, fm=f(mid);
    if (fl*fm<=0) hi=mid; else {lo=mid;fl=fm;}
  }
  return (lo+hi)/2;
}
export function points(mu = MU) {
  return {
    L1:[root(-mu+1e-7,1-mu-1e-7,mu),0],
    L2:[root(1-mu+1e-7,2,mu),0],
    L3:[root(-2,-mu-1e-7,mu),0],
    L4:[.5-mu,Math.sqrt(3)/2], L5:[.5-mu,-Math.sqrt(3)/2]
  };
}
export const POINTS = points();
export function sample(id, includeEarth = true) {
  return samplePosition(POINTS[id], includeEarth);
}

export function sampleAlongAxis(side, distanceEarth, includeEarth = true) {
  const x = 1 - MU + side * distanceEarth / AU;
  return samplePosition([x, 0], includeEarth);
}

function samplePosition(position, includeEarth) {
  const a=acceleration(position);
  const scale=MASS*(GM_SUN+GM_EARTH)/AU**2;
  const sun=a.sun.map(v=>v*scale), earth=a.earth.map(v=>includeEarth?v*scale:0);
  return {position, sun, earth, total:sun.map((v,i)=>v+earth[i]),
    required:position.map(v=>-v*scale),
    distanceEarth:Math.hypot(position[0]-1+MU,position[1])*AU};
}
