import assert from 'node:assert/strict';
import { fieldAt, fieldLines, spule, leiterpaar, WIRE_RADIUS, fluxAt, LINE_BOUNDS } from '../magnetische-felder/field-core.mjs';
import { arrowMarkers, singleFieldRadii } from '../magnetische-felder/field-display.mjs';
const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} ≠ ${expected}`);
const out = [{ x: 0, y: 0, sign: 1 }];
for (let count = 1; count <= 10; count++) for (const scale of [14, 21, 24, 42]) {
  // The radius helper accepts no conductor arrangement: adding or moving a
  // neighbour must not shrink an isolated contribution to avoid overlap.
  const radii = singleFieldRadii(scale, count);
  assert.equal(radii.length, count, 'selected ring count for every conductor');
  assert.ok(radii.every(r => Number.isFinite(r) && r > WIRE_RADIUS));
  close(radii.at(-1), 3.5);
  for (let i = 1; i < radii.length; i++) assert.ok(radii[i] > radii[i - 1], 'distinct concentric rings');
}
// Independently expected directions by the right-hand rule.
for (const [x, y, bx, by] of [[1,0,0,1],[0,1,-1,0],[-1,0,0,-1],[0,-1,1,0]]) {
  const f = fieldAt(x, y, out); close(f.bx, bx); close(f.by, by);
  const reverse = fieldAt(x, y, [{ x: 0, y: 0, sign: -1 }]); close(reverse.bx, -bx); close(reverse.by, -by);
}
close(fieldAt(2, 0, out).mag, fieldAt(1, 0, out).mag / 2);
const samePair = leiterpaar(), oppositePair = leiterpaar(true);
assert.deepEqual(samePair, [{ x: -1, y: 0, sign: -1 }, { x: 1, y: 0, sign: -1 }]);
assert.deepEqual(oppositePair, [{ x: -1, y: 0, sign: -1 }, { x: 1, y: 0, sign: 1 }]);
close(fieldAt(0, 0, samePair).mag, 0);
close(fieldAt(0, 0, oppositePair).bx, 0);
close(fieldAt(0, 0, oppositePair).by, -2);
close(fieldAt(0, 0, []).mag, 0);
assert.ok(Number.isFinite(fieldAt(0, 0, out).mag));
close(fieldAt(WIRE_RADIUS / 2, 0, out).mag, fieldAt(WIRE_RADIUS, 0, out).mag / 2);
const wires = spule(), center = fieldAt(0, 0, wires);
assert.equal(wires.length, 26); assert.equal(new Set(wires.map(w => `${w.x},${w.y}`)).size, 26);
assert.ok(center.bx > 0); close(center.by, 0);
for (const x of [-2,-1,0,1,2]) for (const y of [-.5,0,.5]) {
  const f = fieldAt(x, y, wires);
  assert.ok(Math.abs(f.mag / center.mag - 1) < .03, 'central field varies by <3%');
  assert.ok(Math.abs(Math.atan2(f.by, f.bx)) < 2 * Math.PI / 180, 'central field within 2° of horizontal');
}
const reversed = wires.map(w => ({ ...w, sign: -w.sign }));
for (const [x,y] of [[0,0],[3,1],[8,4],[-4,-3]]) {
  const a = fieldAt(x,y,wires), b = fieldAt(x,y,reversed); close(a.bx,-b.bx); close(a.by,-b.by);
}
// Independent continuum comparison: two very long rows with unit spacing
// approach Bx = 2π in the interior and zero outside; not a copy of the wire sum.
const longRows = [-2,2].flatMap(y => Array.from({length:401},(_,i)=>({x:i-200,y,sign:y>0?1:-1})));
assert.ok(Math.abs(fieldAt(0,0,longRows).bx / (2*Math.PI) - 1) < .01);
assert.ok(fieldAt(0,6,longRows).mag < .01 * 2*Math.PI);
const circles = fieldLines(out);
assert.ok(circles.length > 5); assert.ok(circles.every(l => l.closed));
for (const line of circles) {
  const radius = Math.hypot(line.points[0].x, line.points[0].y);
  for (const p of line.points) assert.ok(Math.abs(Math.hypot(p.x,p.y) / radius - 1) < .001, 'single-wire lines are circles');
}
const coilLines = fieldLines(wires);
assert.ok(coilLines.some(l=>l.closed)); assert.deepEqual(fieldLines([]),[]);
for (const line of coilLines) {
  if (line.closed) assert.deepEqual(line.points[0],line.points.at(-1));
  for (let i=1;i<line.points.length;i++) {
    const a=line.points[i-1],b=line.points[i];
    assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));
    // Include the closing edge. Tangency is checked in the visible exterior;
    // the subpixel continuation through the conductor is hidden by its symbol.
    const dx=b.x-a.x,dy=b.y-a.y,f=fieldAt((a.x+b.x)/2,(a.y+b.y)/2,wires);
    if (f.mag>1e-6 && Math.hypot(dx,dy)>1e-8 && wires.every(w=>Math.hypot((a.x+b.x)/2-w.x,(a.y+b.y)/2-w.y)>WIRE_RADIUS)) {
      const cosine=(dx*f.bx+dy*f.by)/(Math.hypot(dx,dy)*f.mag);
      assert.ok(cosine > .99, `field line not tangent: ${cosine}`);
    }
  }
}
console.log('PASS: directions, 1/r, cancellation, finite core, 26-wire coil, central homogeneity, reversal, continuum limit, circular and tangent field lines.');

// Analytic stream-function gradients and divergence, including the core.
const h = 1e-5;
for (const [x,y] of [[0,0],[.01,.02],[.01,2.02],[3.4,1.3],[8,4],[-4,-3],[1.2,2.2]]) {
  const f = fieldAt(x,y,wires);
  close((fluxAt(x,y+h,wires)-fluxAt(x,y-h,wires))/(2*h), f.bx, 1e-6);
  close(-(fluxAt(x+h,y,wires)-fluxAt(x-h,y,wires))/(2*h), f.by, 1e-6);
  const divergence = (fieldAt(x+h,y,wires).bx-fieldAt(x-h,y,wires).bx + fieldAt(x,y+h,wires).by-fieldAt(x,y-h,wires).by)/(2*h);
  close(divergence,0,1e-6);
}
// Independent net flux through a closed rectangle: no sources/sinks even
// when the rectangle encloses current-carrying conductors.
let flux=0; const samples=2000, xmin=-7.5,xmax=7.5,ymin=-3.5,ymax=3.5;
for(let i=0;i<samples;i++){
  const x=xmin+(i+.5)*(xmax-xmin)/samples,y=ymin+(i+.5)*(ymax-ymin)/samples;
  flux += (fieldAt(x,ymax,wires).by-fieldAt(x,ymin,wires).by)*(xmax-xmin)/samples;
  flux += (fieldAt(xmax,y,wires).bx-fieldAt(xmin,y,wires).bx)*(ymax-ymin)/samples;
}
close(flux,0,1e-8);

function contains(line,p){let inside=false;for(let i=0,j=line.points.length-1;i<line.points.length;j=i++){
  const a=line.points[i],b=line.points[j];if((a.y>p.y)!=(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
}return inside;}
// Each of the 26 conductors has a closed local contour of the TOTAL field.
for(const w of wires) assert.ok(coilLines.some(l=>l.local&&l.closed&&contains(l,w)&&wires.filter(other=>contains(l,other)).length===1));
const boundary=p=>Math.min(Math.abs(p.x-LINE_BOUNDS.xmin),Math.abs(p.x-LINE_BOUNDS.xmax),Math.abs(p.y-LINE_BOUNDS.ymin),Math.abs(p.y-LINE_BOUNDS.ymax))<1e-7;
for(const l of coilLines) if(!l.closed){assert.ok(boundary(l.points[0]));assert.ok(boundary(l.points.at(-1)));}

// Regression for the red-marked bundles: crossings with x=0 in the interior
// must have nearly identical gaps, rather than close duplicate seed paths.
const crossings=[];
for(const l of coilLines)for(let i=1;i<l.points.length;i++){
  const a=l.points[i-1],b=l.points[i];if((a.x<0)!=(b.x<0)){
    const y=a.y+(b.y-a.y)*(-a.x)/(b.x-a.x);if(Math.abs(y)<1.1)crossings.push(y);
  }
}
crossings.sort((a,b)=>a-b); assert.ok(crossings.length>=4);
const gaps=crossings.slice(1).map((y,i)=>y-crossings[i]);
assert.ok(Math.min(...gaps)>.4);assert.ok(Math.max(...gaps)/Math.min(...gaps)<1.05);

const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
function intersects(a,b,c,d){return cross(a,b,c)*cross(a,b,d)<-1e-18&&cross(c,d,a)*cross(c,d,b)<-1e-18;}
function noCrossings(lines){
  const grid=new Map(),cell=.1;
  lines.forEach((l,lineIndex)=>{
    for(let i=1;i<l.points.length;i++){
      const a=l.points[i-1],b=l.points[i],segment={a,b,lineIndex,index:i},checked=new Set();
      for(let x=Math.floor(Math.min(a.x,b.x)/cell);x<=Math.floor(Math.max(a.x,b.x)/cell);x++)for(let y=Math.floor(Math.min(a.y,b.y)/cell);y<=Math.floor(Math.max(a.y,b.y)/cell);y++){
        const key=`${x},${y}`,others=grid.get(key)||[];
        for(const other of others){if(checked.has(other))continue;checked.add(other);
          if(other.lineIndex===lineIndex&&(Math.abs(other.index-i)<=1||(l.closed&&other.index===1&&i===l.points.length-1)))continue;
          assert.ok(!intersects(a,b,other.a,other.b),`crossing lines ${lineIndex}/${other.lineIndex}`);
        }
        others.push(segment);grid.set(key,others);
      }
    }
  });
}
noCrossings(coilLines);
for(const pair of [samePair, oppositePair]) {
  const pairLines = fieldLines(pair);
  noCrossings(pairLines);
  for(const w of pair) assert.ok(pairLines.some(l=>l.closed&&contains(l,w)&&pair.filter(other=>contains(l,other)).length===1), 'each pair conductor has its own closed loop');
}

function distance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
for(const scale of [14,21,24,42]){
  const markers=arrowMarkers(coilLines,wires,scale);assert.ok(markers.length>5);
  for(let i=0;i<markers.length;i++){
    const m=markers[i];
    for(const n of markers.slice(i+1))assert.ok(Math.hypot(m.x-n.x,m.y-n.y)*scale>=m.size+n.size+11.99,'overlapping arrows');
    for(let j=0;j<coilLines.length;j++)if(j!==m.lineIndex)for(let k=1;k<coilLines[j].points.length;k++)assert.ok(distance(m,coilLines[j].points[k-1],coilLines[j].points[k])*scale>=m.size+1.99,'arrow touches another line');
  }
}
console.log(`PASS: divergence/closed-surface flux, 26 local closed loops, boundary continuation, uniform interior spacing (${gaps.map(g=>g.toFixed(3)).join(', ')}), no self/other crossings, clear arrows at four display scales.`);
const dense=Array.from({length:64},(_,i)=>({x:i%16-8,y:Math.floor(i/16)-2,sign:i%2?1:-1}));
noCrossings(fieldLines(dense));
const flippedLines=fieldLines(reversed);
assert.equal(flippedLines.length,coilLines.length);
const signature=ls=>ls.map(l=>l.points.map(p=>`${p.x.toFixed(5)},${p.y.toFixed(5)}`).sort().join(';')).sort();
assert.deepEqual(signature(flippedLines),signature(coilLines),'reversal must preserve line geometry');
console.log('PASS: 64-source crossing regression and identical line geometry after reversing all currents.');
