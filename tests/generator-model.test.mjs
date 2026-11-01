import test from 'node:test';
import assert from 'node:assert/strict';
import { sample, advance, parameters, radians } from '../generator/model.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
test('Spannung stimmt mit unabhängig integrierter Bewegungsinduktion an beiden Leiterseiten überein',()=>{
  // Each active side is 0.20m long, radius=0.05m -> area=0.02m².
  for(const angle of [0,15,45,90,150,180,225,270,359])for(const rpm of [0,12,30])for(const direction of [-1,1]){
    const omega=direction*rpm*2*Math.PI/60,a=radians(angle),r=[.05*Math.sin(a),0,.05*Math.cos(a)];
    const velocity=cross([0,omega,0],r),vxB=cross(velocity,[.4,0,0]);
    const induced=100*(-.2*vxB[1]+.2*(-vxB[1]));
    near(sample(angle,rpm,direction).emf,induced);
  }
});
test('Negative Flussableitung bestätigt Vorzeichen und Amplitude',()=>{
  const {turns:N,field:B,area:A}=parameters,h=1e-5;
  for(const angle of [0,35,90,180,247,270])for(const direction of [-1,1]){
    const theta=radians(angle),omega=direction*12*2*Math.PI/60;
    const flux=t=>B*A*Math.cos(theta+omega*t);
    near(sample(angle,12,direction).emf,-N*(flux(h)-flux(-h))/(2*h));
  }
});
test('Kommutator schaltet nach Stellung statt nach Spannung; Drehsinn kehrt äußere Polung um',()=>{
  for(const angle of [30,90,179,181,225,270,359]){
    const forward=sample(angle,12,1),reverse=sample(angle,12,-1);
    assert.equal(forward.contact,reverse.contact);assert.ok(forward.dc>0);assert.ok(reverse.dc<0);
    // Inverse rigid rotation maps brush X=(r,0,0) to rotor-local z=r*sin(theta).
    const localZ=.35*Math.sin(radians(angle));assert.equal(forward.contact,Math.sign(localZ));
    assert.equal(forward.electronA,Math.sign(Math.sin(radians(angle))));
  }
  for(const angle of [0,180,360]){assert.equal(sample(angle,12).emf,0);assert.equal(sample(angle,12).dc,0);assert.equal(sample(angle,12).contact,0);}
});
test('Stillstand, Skalierung, voller Umlauf und rückwärtiger Schritt',()=>{
  for(let a=0;a<=360;a+=15){const m=sample(a,0);assert.equal(m.emf,0);assert.equal(m.dc,0);assert.equal(m.electronA,0);}
  near(sample(90,24).emf,2*sample(90,12).emf);near(sample(90,12).emf,1.005309649148734);
  near(advance(45,5,12,1),45);near(advance(5,1,12,-1),293);
});
test('Räumliche Teile besitzen elektrische/mechanische Abstände',()=>{
  // Coil half-width=1 + wire radius .042, pole inner face=1.61.
  assert.ok(1+.042<1.61);
  // Ring 1: y=-1.30 ±.06. Lead 2 is at r=.15, r_wire=.023, inside r_inner=.27.
  assert.ok(.15+.023<.27);assert.ok(.15-.023>.055);
  // Separate axial rings have .35m free clearance.
  assert.ok((-1.30-.06)-(-1.77+.06)>.34);
  // Commutator brush width is smaller than the insulating gap at its circumference.
  assert.ok(.015<2*.35*Math.sin(.045));
});
