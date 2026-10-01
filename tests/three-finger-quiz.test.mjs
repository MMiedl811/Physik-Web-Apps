import test from 'node:test';import assert from 'node:assert/strict';import{createRequire}from'node:module';
const M=createRequire(import.meta.url)('../drei-finger-quiz/model.js');
test('Alle zwölf Aufgaben haben in der angegebenen Auswahl genau eine richtige Antwort',()=>{
 for(const t of M.tasks){const right=M.choices(t).filter(a=>M.correct(t,a));assert.deepEqual(right,[t[t.missing]])}
});
test('Unabhängige Richtungsfälle und negative Ladungen',()=>{
 const check=(s,wanted)=>assert.ok(M.force(s).every((x,i)=>Math.abs(x-wanted[i])<1e-12));
 check({v:'e',b:'in',q:1},[0,1,0]);
 check({v:'e',b:'in',q:-1},[0,-1,0]);
 check({v:'in',b:'s',q:-1},[1,0,0]);
 check({v:'e',b:'e',q:-1},[0,0,0]);
});
test('Bahnen haben die richtige Anfangstangente und konstante Kreisradien',()=>{
 for(const s of M.tasks){
  const dt=1e-5,a=M.position(s,dt),v=M.byId[s.v].vector;assert.ok(a.every((x,i)=>Math.abs(x/dt-v[i])<1e-4));
  if(s.f==='zero'){assert.deepEqual(M.position(s,2),[2,0,0]);continue}
  const center=M.force(s);for(const t of [.1,1,2,Math.PI*2]){const pos=M.position(s,t);assert.ok(Math.abs(Math.hypot(...pos.map((x,i)=>x-center[i]))-1)<1e-10)}
 }
});
test('Schüler-Kraftpfeile bestimmen die anfängliche Ablenkung; parallele Kräfte werden nicht animiert',()=>{
 const task=M.tasks[0];assert.equal(M.prediction(task,'e'),null);
 for(const id of ['n','s','in','out','zero']){const s=M.prediction(task,id),dt=.001,v=M.byId[s.v].vector,r=M.position(s,dt),acc=r.map((x,i)=>2*(x-dt*v[i])/dt**2);assert.ok(acc.every((x,i)=>Math.abs(x-M.byId[id].vector[i])<.002))}
});
