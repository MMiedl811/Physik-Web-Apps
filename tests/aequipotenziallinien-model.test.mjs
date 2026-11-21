import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../aequipotenziallinien/model.js',import.meta.url),'utf8');
const {sample,makeGrid,contours}=runInNewContext(source+';({sample,makeGrid,contours})');
const plus={x:240,y:220,q:1}, minus={x:480,y:220,q:-1};
const circle=contours(makeGrid([plus]),27);
assert.equal(circle.length,1);
assert.deepEqual(circle[0][0],circle[0].at(-1));
for(const p of circle[0]) assert.ok(Math.abs(Math.hypot(p.x-plus.x,p.y-plus.y)-199.72)<0.1);
const dipole=[plus,minus];
const bisector=contours(makeGrid(dipole),0);
assert.equal(bisector.length,1);
assert.ok(bisector[0].every(p=>p.x===360));
const mid={x:360,y:220};
assert.equal(sample(mid,dipole,false).v,0);
assert.ok(sample(mid,dipole,false).ex>0);
const equal=[plus,{...minus,q:1}];
assert.equal(sample(mid,equal,false).ex,0);
assert.equal(contours(makeGrid(equal),120).length,2);
for(const x of [160,240,320,400,480,560]){
 const a=sample({x,y:60},[],true), b=sample({x:x+40,y:310},[],true);
 assert.equal(a.v-b.v,10);
}
console.log('Einzelladung, beide Zweiladungsfälle und Plattenmodell geprüft.');
const {stripPotential,stripSample,finitePlateGrid}=runInNewContext(source+';({stripPotential,stripSample,finitePlateGrid})');
for(const y of [40,100,220,365]){
  assert.ok(Math.abs(stripPotential(360,y))<1e-9);
  assert.ok(Math.abs(stripPotential(280,y)+stripPotential(440,y))<1e-8);
}
const centre=stripSample(mid), edge=stripSample({x:312,y:60});
assert.ok(Math.abs(centre.ex-1)<.04 && Math.abs(centre.ey)<1e-8);
assert.ok(Math.abs(edge.ey)>.2 && edge.ex>0);
assert.ok(Math.abs(stripPotential(300.01,124)-60)<.1);
const curves=contours(finitePlateGrid(),30);
assert.ok(curves.some(curve=>curve.some(p=>p.y<65) && curve.some(p=>p.y>220)));
const fieldLines=runInNewContext(source+';electricFieldLines');
for(const q of [1,-1]){
  const c={...plus,q}, lines=fieldLines([c],'charges');
  assert.equal(lines.length,12);
  for(const line of lines){
    const a=line[0], b=line.at(-1);
    assert.ok(q*(Math.hypot(b.x-c.x,b.y-c.y)-Math.hypot(a.x-c.x,a.y-c.y))>0);
    assert.ok(Math.abs((a.x-c.x)*(b.y-c.y)-(a.y-c.y)*(b.x-c.x))<1e-6);
  }
}
for(const [a,b] of fieldLines([],'ideal')) assert.ok(a.x===120 && b.x===600 && a.y===b.y);
