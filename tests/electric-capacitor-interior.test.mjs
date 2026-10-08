import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8875';
const browser=await chromium.launch();
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/elektrische-felder/');await page.getByRole('button',{name:'Untersuchung starten'}).click();
 await page.locator('[data-preset="capacitor"]').click();assert.equal(await page.locator('#lengthSlider,#fringeToggle').count(),0);
 for(const mode of ['#fieldModeBtn','#motionModeBtn','#superpositionModeBtn']){
  await page.locator(mode).click();assert.ok(await page.locator('#capacitorNote').isVisible());assert.doesNotMatch(await page.locator('#toolHelp').textContent(),/außerhalb/);assert.match(await page.locator('#capacitorNote').textContent(),/unendlich großen Platten/);
  const report=await page.evaluate(()=>{const l=__electricFieldLab,rows=[];for(const gap of [.6,.8,1.85,3]){
   l.setPlates(gap,1.8);const length=l.getState().plateLength,E=l.fieldAt(0,0).ex;
   for(const x of [-.49*gap,0,.49*gap])for(const y of [-100,-2,0,2,100]){const f=l.fieldAt(x,y),cs=l.fieldContributionsAt(x,y);rows.push({gap,length,E,f,cs});}
  }return rows;});
  for(const r of report){assert.equal(r.length,4.4);assert.equal(r.f.ex,r.E);assert.equal(r.f.ey,0);assert.equal(r.f.mag,r.E);assert.equal(r.cs[0].ey,0);assert.equal(r.cs[1].ey,0);assert.equal(r.cs[0].ex,r.E/2);assert.equal(r.cs[1].ex,r.E/2);}
 }
 // Pointer placements, keyboard shifts and narrowing the gap keep classroom measurements inside.
 await page.locator('#fieldModeBtn').click();await page.locator('#plateTools [data-cap-tool="probe"]:visible').click();
 const canvas=page.locator('#fieldCanvas');await canvas.click({position:{x:20,y:100}});let s=await page.evaluate(()=>__electricFieldLab.getState());assert.ok(Math.abs(s.probe.x)<s.gap/2);
 await canvas.focus();await page.keyboard.press('p');for(let i=0;i<10;i++)await page.keyboard.press('ArrowLeft');s=await page.evaluate(()=>__electricFieldLab.getState());assert.ok(Math.abs(s.probe.x)<s.gap/2);
 await page.locator('#gapSlider').fill('0.6');s=await page.evaluate(()=>__electricFieldLab.getState());assert.ok(Math.abs(s.probe.x)<s.gap/2);assert.equal(s.field.ey,0);assert.ok(s.field.mag>0);
 for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180},{width:390,height:844}]){
  await page.setViewportSize(size);await page.evaluate(()=>__electricFieldLab.setPlates(1.85));await page.screenshot({path:`/tmp/electric-interior-${size.width}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await page.locator('#superpositionModeBtn').click();await page.locator('.stage-card').screenshot({path:'/tmp/electric-interior-vectors.png'});
 await page.locator('#resetBtn').click();assert.equal(await page.locator('#capacitorNote').isVisible(),false);await page.locator('[data-preset="capacitor"]').click();assert.ok(await page.locator('#capacitorNote').isVisible());
 assert.deepEqual(errors,[]);console.log('Ideal interior OK: exact homogeneity at 180 samples across 3 modes, constant length, horizontal equal contributions, visible model note, pointer/keyboard/gap constraints, reset and 4 viewports.');
}finally{await browser.close();}
