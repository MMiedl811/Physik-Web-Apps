import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {torque,step}=createRequire(import.meta.url)('../leiterschleife-magnetfeld/model.js');
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
test('Drehwirkung stimmt mit den beiden unabhängig berechneten Leiterkräften überein',()=>{
 for(const p of [-1,1])for(const angle of [0,.3,Math.PI/2,2,Math.PI,4,Math.PI*1.5]){
  const r=[-Math.cos(angle),0,Math.sin(angle)],opposite=r.map(v=>-v);
  const fa=cross([0,-p,0],[1,0,0]),fb=cross([0,p,0],[1,0,0]);
  const physical=cross(r,fa)[1]+cross(opposite,fb)[1];
  assert.ok(Math.abs(torque(angle,p)-1.5*physical)<1e-12);
 }
});
test('Strom aus und exakter Totpunkt erzeugen aus Ruhe keine Bewegung',()=>{
 assert.equal(torque(.3,1,false),0);
 assert.deepEqual(step({angle:.3,omega:0},1/120,1,false),{angle:.3,omega:0});
 const s=step({angle:Math.PI/2,omega:0},1,1,true);
 assert.ok(Math.abs(s.omega)<1e-12);
});
test('Reibung vermindert die mechanische und magnetische Energie; die Schleife schwingt über',()=>{
 let s={angle:0,omega:0},energy=.5*s.omega**2-3*Math.sin(s.angle),crossed=false;
 for(let i=0;i<3600;i++){
  s=step(s,1/120);const next=.5*s.omega**2-3*Math.sin(s.angle);
  assert.ok(next<=energy+1e-8);energy=next;crossed ||= s.angle>Math.PI/2;
 }
 assert.ok(crossed);assert.ok(Math.abs(s.angle-Math.PI/2)<1e-4);assert.ok(Math.abs(s.omega)<1e-4);
});
test('Verkleinerter Zeitschritt bestätigt den freien Lauf',()=>{
 function run(dt){let s={angle:0,omega:0};for(let i=0;i<Math.round(5/dt);i++)s=step(s,dt);return s}
 const a=run(1/120),b=run(1/240);assert.ok(Math.abs(a.angle-b.angle)<1e-7);assert.ok(Math.abs(a.omega-b.omega)<1e-7);
});
