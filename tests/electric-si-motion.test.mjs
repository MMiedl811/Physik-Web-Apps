import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
const {chromium}=createRequire(import.meta.url)('/Users/matthias/.cache/physik-tiktok-render/node_modules/playwright');
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`${process.env.ELECTRIC_URL||'http://127.0.0.1:8870'}/elektrische-felder/`);
 await page.getByRole('button',{name:'Untersuchung starten'}).click();
 const result=await page.evaluate(()=>{
  const lab=__electricFieldLab;
  lab.setMode('motion');lab.setPreset('capacitor');lab.setPlates(.8,4.4);
  lab.setMotionParameters({sourceStrength:1,testChargeValue:1,testMass:1,timeScale:1});
  const E=lab.fieldAt(0,0).ex;
  const samples=[];
  for(const x of [-.32,0,.32])for(const y of [-.5,0,.5])samples.push(lab.fieldAt(x,y));
  const outside=lab.fieldAt(1,0);
  const lines=lab.traceLines();
  const gradients=[];
  for(const [x,y] of [[0,.2],[.2,2],[.8,2.5],[-1,.3]]){
   const h=1e-5,f=lab.fieldAt(x,y);
   gradients.push({ex:f.ex,ey:f.ey,gx:-(lab.fieldAt(x+h,y).p-lab.fieldAt(x-h,y).p)/(2*h),gy:-(lab.fieldAt(x,y+h).p-lab.fieldAt(x,y-h).p)/(2*h)});
  }
  function run(q,m,parts){lab.setMotionParameters({testChargeValue:q,testMass:m});lab.placeTestCharge(0,0);for(const dt of parts)lab.stepTestCharge(dt);return lab.getState().testCharge;}
  const normal=run(1,1,[10]),negative=run(-1,1,[10]),heavy=run(1,10,[10]),double=run(2,1,[10]),partition=run(1,1,Array(100).fill(.1));
  lab.setMotionParameters({testChargeValue:1,testMass:1});lab.placeTestCharge(0,0);lab.stepTestCharge(100);lab.stepTestCharge(100);const collision=lab.getState().testCharge;
  lab.setPreset('single');lab.setMotionParameters({testChargeValue:1,testMass:1});lab.placeTestCharge(.8,.2);
  function energy(){const t=lab.getState().testCharge;return .5*.001*(t.vx*t.vx+t.vy*t.vy)+1e-9*lab.fieldAt(t.x,t.y).p;}
  const energy0=energy();lab.stepTestCharge(100);const energy1=energy();
  // A source-free point does not erase existing velocity: deliberately remove the source through the UI's delete tool.
  lab.setMode('field');lab.setPreset('single');lab.setMode('motion');lab.placeTestCharge(.8,0);lab.stepTestCharge(10);
  return {E,samples,outside,lines,gradients,normal,negative,heavy,double,partition,collision,energy0,energy1};
 });
 for(const f of result.gradients){assert.ok(Math.abs(f.ex-f.gx)<1e-6);assert.ok(Math.abs(f.ey-f.gy)<1e-6);}
 const a=result.E*1e-6;
 assert.ok(Math.abs(result.E-8*8.9875517923*Math.atan(4.4/.8))<1e-10);
 for(const f of result.samples){assert.ok(Math.abs(f.mag/result.E-1)<.007);assert.ok(Math.abs(Math.atan2(f.ey,f.ex))<.009);}
 assert.ok(result.outside.mag>0);
 assert.ok(result.lines.some(line=>Math.max(...line.map(p=>p.y))-Math.min(...line.map(p=>p.y))>.1));
 assert.ok(Math.abs(result.normal.x-.5*a*100)<1e-8);
 assert.ok(Math.abs(result.normal.vx-a*10)<1e-8);
 assert.ok(Math.abs(result.normal.y)<1e-12);
 assert.ok(Math.abs(result.negative.x+result.normal.x)<1e-12);
 assert.ok(Math.abs(result.heavy.x-result.normal.x/10)<1e-8);
 assert.ok(Math.abs(result.double.x-2*result.normal.x)<1e-8);
 assert.ok(Math.abs(result.partition.x-result.normal.x)<1e-12);
 assert.equal(result.collision.phase,'finished');assert.ok(Math.abs(result.collision.x-.4)<1e-12);
 assert.ok(Math.abs(result.energy1/result.energy0-1)<1e-7);
 // Remove the field source while retaining the already moving probe.
 await page.locator('#fieldCanvas').focus();await page.keyboard.press('1');await page.keyboard.press('Delete');
 const coast=await page.evaluate(()=>{const lab=__electricFieldLab,before=lab.getState().testCharge;lab.stepTestCharge(10);return{before,after:lab.getState().testCharge,field:lab.fieldAt(before.x,before.y)};});
 assert.equal(coast.field.mag,0);assert.equal(coast.after.vx,coast.before.vx);
 assert.ok(Math.abs(coast.after.x-coast.before.x-coast.before.vx*10)<1e-12);
 await page.locator('#testMassInput').fill('1');await page.locator('#testMassInput').dispatchEvent('input');
 assert.equal(await page.evaluate(()=>__electricFieldLab.getState().testMass),1);
 await page.evaluate(()=>{__electricFieldLab.setPreset('capacitor');__electricFieldLab.placeTestCharge(0,0);});
 await page.locator('#motionBtn').click();await page.waitForTimeout(100);await page.locator('#motionBtn').click();
 const paused=await page.evaluate(()=>__electricFieldLab.getState());assert.equal(paused.motion,false);assert.equal(paused.testCharge.phase,'paused');
 await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>__electricFieldLab.getState().testCharge),paused.testCharge);
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(size);
  for(const mode of ['field','motion','superposition']){
   await page.evaluate(mode=>{__electricFieldLab.setMode(mode);__electricFieldLab.setPreset('capacitor');},mode);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:`${tmpdir()}/electric-si-${size.width}-${mode}.png`,fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);
 console.log('SI motion verified:',JSON.stringify({maxCoreDeviation:Math.max(...result.samples.map(f=>Math.abs(f.mag/result.E-1))),E:result.E,a,x10:result.normal.x,v10:result.normal.vx,relativeEnergyError:Math.abs(result.energy1/result.energy0-1),collision:result.collision.x}));
} finally {await browser.close();}
