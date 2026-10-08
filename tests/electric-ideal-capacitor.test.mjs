import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(!r.url().startsWith(process.env.ELECTRIC_URL||'http://127.0.0.1:8875'))external.push(r.url());});
 await page.goto(`${process.env.ELECTRIC_URL||'http://127.0.0.1:8875'}/elektrische-felder/`);
 await page.getByRole('button',{name:'Untersuchung starten'}).click();
 await page.locator('[data-preset="capacitor"]').click();
 const result=await page.evaluate(()=>{
  const l=__electricFieldLab,rows=[];
  for(const gap of [.6,.8,3])for(const length of [1.8,4.4])for(const sigma of [.5,1,2]){
   l.setPlates(gap,length);l.setMotionParameters({sourceStrength:sigma});
   for(const x of [-gap,-gap*.49,0,gap*.49,gap])for(const y of [-3,-.9,0,.9,3]){
    const h=1e-5,f=l.fieldAt(x,y);rows.push({gap,length,sigma,x,y,f,c:l.fieldContributionsAt(x,y),gx:-(l.fieldAt(x+h,y).p-l.fieldAt(x-h,y).p)/(2*h),gy:-(l.fieldAt(x,y+h).p-l.fieldAt(x,y-h).p)/(2*h),voltage:l.fieldAt(-gap/2,0).p-l.fieldAt(gap/2,0).p});
   }
  }
  l.setPlates(.8,1.8);l.setMotionParameters({sourceStrength:1,testChargeValue:1,testMass:1});l.setMode('motion');l.placeTestCharge(0,1.5);
  l.stepTestCharge(100);const hit=l.getState().testCharge;
  return {rows,hit};
 });
 const close=(a,b,t=1e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
 for(const {gap,sigma,x,f,c,gx,gy,voltage} of result.rows){
  const E=sigma*1e-9/8.8541878128e-12,inside=Math.abs(x)<gap/2;
  close(f.ex,inside?E:0);assert.equal(f.ey,0);close(f.ex,gx);close(gy,0);close(voltage,E*gap);
  close(c[0].mag,E/2);close(c[1].mag,E/2);assert.equal(c[0].ey,0);assert.equal(c[1].ey,0);
  assert.equal(c[0].ex+c[1].ex,f.ex);assert.equal(c[0].p+c[1].p,f.p);
  close(f.p,-E*Math.max(-gap/2,Math.min(gap/2,x)));
 }
 assert.equal(result.hit.stopReason,'plate');close(result.hit.x,.4);close(result.hit.y,1.5);
 close(result.hit.finalSpeed,Math.sqrt(2*(1e-9/.001)*(1e-9/8.8541878128e-12)*.4));
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);
  await page.locator('#superpositionModeBtn').click();
  assert.equal(await page.locator('#lengthSlider').count(),0);
  await page.evaluate(()=>__electricFieldLab.placeProbe(-.23,.55));
  await page.screenshot({path:`${tmpdir()}/ideal-capacitor-${size.width}.png`,fullPage:true});
  await page.locator('#fieldModeBtn').click();await page.locator('#backgroundSelect').selectOption('potential');await page.locator('#equipotentialToggle').check();
  const contours=await page.evaluate(()=>__electricFieldLab.equipotentialDiagnostics());
  assert.ok(contours.length>0);
  for(const c of contours)for(const [a,b] of c.segments){close(a.x,b.x,1e-9);assert.ok(Math.abs(a.x)<.4);}
  await page.screenshot({path:`${tmpdir()}/ideal-capacitor-${size.width}-potential.png`,fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log(`Ideal capacitor OK: ${result.rows.length} samples; sheet contributions, exterior cancellation, E=-grad(phi), U=Ed, collision, 3 viewports.`);
}finally{await browser.close();}
