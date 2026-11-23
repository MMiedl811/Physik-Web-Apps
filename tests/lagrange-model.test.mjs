import test from 'node:test';
import assert from 'node:assert/strict';
import {MU,AU,OMEGA,POINTS,points,acceleration,sample,sampleAlongAxis} from '../lagrange-labor/model.mjs';
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('Lagen: unabhängige Hill-Näherung, L3-Reihe und bekannte 1,5-Mio.-km-Skala',()=>{
 const hill=Math.cbrt(MU/3);
 for(const id of ['L1','L2']){const d=Math.abs(POINTS[id][0]-1+MU);assert.ok(Math.abs(d/hill-1)<.004);assert.ok(d*AU/1e9>1.48&&d*AU/1e9<1.52);}
 near(POINTS.L3[0],-1-5*MU/12,1e-10);
 assert.ok(2*Math.PI/OMEGA/86400>365&&2*Math.PI/OMEGA/86400<366);
});
test('L4/L5: exakte gleichseitige Geometrie und Spiegelung',()=>{
 for(const id of ['L4','L5']){const[x,y]=POINTS[id];near(Math.hypot(x+MU,y),1);near(Math.hypot(x-1+MU,y),1);}
 near(POINTS.L4[0],POINTS.L5[0]);near(POINTS.L4[1],-POINTS.L5[1]);
 assert.ok(27*MU*(1-MU)<1,'Routh-Kriterium für lineare Stabilität erfüllt');
});
test('Kräfterichtung und quantitative Bilanz; Sonnenvergleich an L1 und L2',()=>{
 for(const id of Object.keys(POINTS)){const m=sample(id);m.total.forEach((v,i)=>near(v,m.required[i],1e-12));assert.ok(Math.hypot(...m.total)>0);}
 assert.ok(sample('L1').earth[0]>0);assert.ok(sample('L2').earth[0]<0);
 assert.ok(Math.abs(sample('L1',false).total[0])>Math.abs(sample('L1').required[0]));
 assert.ok(Math.abs(sample('L2',false).total[0])<Math.abs(sample('L2').required[0]));
 for(const id of ['L1','L2'])assert.deepEqual(sample(id,false).earth,[0,0]);
});
test('Grenzfälle: gleiche Massen und verschwundener Erdbeitrag',()=>{
 const p=points(.5);near(p.L1[0],0);near(p.L2[0],-p.L3[0]);
 const a=acceleration([2,0],0);near(a.total[0],-.25);near(a.total[1],0);
});
test('Unabhängige inertiale Bahnprüfung: Newton-Integration mit umlaufenden Primärkörpern',()=>{
 // Separate Newtonian equations, no call to the model acceleration. Dimensionless time.
 function derivative(t,[x,y,vx,vy]){
  const c=Math.cos(t),s=Math.sin(t);let ax=0,ay=0;
  for(const[m,r]of [[1-MU,-MU],[MU,1-MU]]){
   const dx=r*c-x,dy=r*s-y,d=Math.hypot(dx,dy);ax+=m*dx/d**3;ay+=m*dy/d**3;
  }return[vx,vy,ax,ay];
 }
 const add=(a,b,k)=>a.map((v,i)=>v+k*b[i]);
 for(const [id,[x,y]]of Object.entries(POINTS)){
  let state=[x,y,-y,x],t=0;const dt=.0002;
  for(let n=0;n<1000;n++){
   const a=derivative(t,state),b=derivative(t+dt/2,add(state,a,dt/2)),c=derivative(t+dt/2,add(state,b,dt/2)),d=derivative(t+dt,add(state,c,dt));
   state=state.map((v,i)=>v+dt*(a[i]+2*b[i]+2*c[i]+d[i])/6);t+=dt;
  }
  near(state[0],x*Math.cos(t)-y*Math.sin(t),2e-11);near(state[1],x*Math.sin(t)+y*Math.cos(t),2e-11);
  assert.ok(Number.isFinite(state[0]),id);
 }
});

test('Abstandsregler: unabhängiger SI-Kräftevergleich auf beiden Seiten der Erde', () => {
 const solarGM = 1.3271244004e20, earthGM = 3.986004355e14;
 for (const side of [-1, 1]) {
  for (const distance of [0.9e9, 2.4e9]) {
   const expectedSun = -1000 * solarGM / (AU + side * distance) ** 2;
   const expectedEarth = -side * 1000 * earthGM / distance ** 2;
   const measure = sampleAlongAxis(side, distance);
   near(measure.sun[0], expectedSun, 1e-8);
   near(measure.earth[0], expectedEarth, 1e-8);
   near(measure.total[0], expectedSun + expectedEarth, 1e-8);
   near(measure.distanceEarth, distance, 1e-4);
  }
  const residual = distance => {
   const measure = sampleAlongAxis(side, distance);
   return measure.required[0] - measure.total[0];
  };
  assert.equal(Math.sign(residual(0.9e9)), side);
  assert.equal(Math.sign(residual(2.4e9)), -side);
 }
});
