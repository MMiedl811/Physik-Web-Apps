import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.VECTOR_URL||'http://127.0.0.1:8876';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/vektor-labor/');
 assert.equal(await page.locator('#tourDialog').isVisible(),true);assert.equal(await page.locator('.student-intro-overlay').count(),0);
 await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement.closest('#tourDialog')!==null));
 for(let i=0;i<4;i++){
  assert.match(await page.locator('#tourProgress').innerText(),new RegExp(`${i+1} von 4`,'i'));
  await page.screenshot({path:`${tmpdir()}/vector-tour-1440-${i}.png`,fullPage:false});
  await page.locator('#tourNext').click();
 }
 assert.equal(await page.locator('#tourDialog').isVisible(),false);
 await page.reload();assert.equal(await page.locator('#tourDialog').isVisible(),false);
 for(const size of [{width:1024,height:768},{width:820,height:1180}]){
  await page.setViewportSize(size);await page.locator('#helpBtn').click();await page.locator('#restartTour').click();
  for(let i=0;i<4;i++){
   const b=await page.locator('#tourCard').boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=size.width+1&&b.y+b.height<=size.height+1);
   await page.screenshot({path:`${tmpdir()}/vector-tour-${size.width}-${i}.png`});
   await page.locator('#tourNext').click();
  }
 }
 await page.locator('#helpBtn').click();await page.locator('#restartTour').click();await page.locator('#tourNext').click();await page.locator('#tourBack').click();assert.match(await page.locator('#tourProgress').innerText(),/1 von 4/i);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#tourDialog').isVisible(),false);
 await page.locator('[data-context="electric"]').click();
 await page.locator('#taskHeading').waitFor();
 assert.match(await page.locator('#modelNote').innerText(), /P ist nur der Beobachtungspunkt.*keine zusätzliche Ladung/);
 assert.match(await page.locator('#sceneExplanation').innerText(), /P ist der Feldort, keine positive oder negative Ladung/);
 assert.equal(await page.locator('#situation').isVisible(),true);
 for(let i=0;i<5;i++)await page.locator('#nextBtn').click();
 const expected=[[-2.4,0], [20/Math.sqrt(61)-4.8,24/Math.sqrt(61)+6.4]];
 for(let j=0;j<2;j++){
  for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){await page.setViewportSize(size);await page.screenshot({path:`${tmpdir()}/vector-source-directions-${j}-${size.width}.png`,fullPage:true});}
  assert.match(await page.locator('#feedback').innerText(),/Zuerst die Feldrichtungen/);
  assert.equal(await page.locator('#givenLayer [data-vector]').count(),0);assert.equal(await page.locator('#checkBtn').isEnabled(),false);assert.equal(await page.locator('#helperAddBtn').isEnabled(),false);
  await page.locator('#direction1').selectOption('toward');await page.locator('#direction2').selectOption('toward');await page.locator('#directionCheck').click();assert.match(await page.locator('#directionStatus').innerText(),/Noch nicht/);
  const before=await page.locator('#chargeScene').innerHTML();await page.locator('#scaleSelect').selectOption('5');assert.equal(await page.locator('#chargeScene').innerHTML(),before);await page.locator('#scaleSelect').selectOption('auto');
  await page.locator('#direction1').selectOption(j===0?'toward':'away');await page.locator('#direction2').selectOption('away');await page.locator('#directionCheck').click();assert.equal(await page.locator('#givenLayer [data-vector]').count(),2);
  const t=await page.evaluate(()=>__vectorLabTest.currentTask());assert.ok(Math.abs(t.target.vec.x-expected[j][0])<1e-10);assert.ok(Math.abs(t.target.vec.y-expected[j][1])<1e-10);
  await page.locator('#snapToggle').check();const rounded=await page.evaluate(()=>{const l=__vectorLabTest,t=l.currentTask(),step=l.getState().scale/2;return l.setUserArrow(t.target.start,{x:Math.round(t.target.vec.x/step)*step,y:Math.round(t.target.vec.y/step)*step});});assert.ok(rounded.start&&rounded.end&&rounded.direction&&rounded.magnitude,'nearest half-grid approximation must pass');
  const good=await page.evaluate(()=>{const l=__vectorLabTest,t=l.currentTask();return l.setUserArrow(t.target.start,t.target.vec);});assert.ok(good.start&&good.end&&good.direction&&good.magnitude);
  await page.locator('#clearBtn').click();await page.locator('#snapToggle').uncheck();
  const o=await page.locator('#axesLayer circle').evaluate(el=>({x:+el.getAttribute('cx'),y:+el.getAttribute('cy')})),scale=await page.evaluate(()=>__vectorLabTest.getState().scale);
  await page.locator('#stage').scrollIntoViewIfNeeded();const b=await page.locator('#stage').boundingBox();await page.mouse.move(b.x+o.x,b.y+o.y);await page.mouse.down();await page.mouse.move(b.x+o.x+t.target.vec.x/scale*50,b.y+o.y-t.target.vec.y/scale*50,{steps:10});await page.mouse.up();await page.locator('#checkBtn').click();assert.match(await page.locator('#feedback').innerText(),/Sauber konstruiert/);
  for(const size of [{width:1440,height:900},{width:1024,height:768},{width:820,height:1180}]){await page.setViewportSize(size);await page.screenshot({path:`${tmpdir()}/vector-source-${j}-${size.width}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await page.locator('#solutionBtn').click();for(let i=0;i<3;i++)await page.locator('#solutionNext').click();assert.match(await page.locator('#solutionText').innerText(),j===0?/2,4 V\/m/:/9,7 V\/m/);await page.locator('#solutionNext').click();
  await page.locator('#nextBtn').click();
 }
 await page.locator('[data-context="force"]').click();assert.equal(await page.locator('#situation').isVisible(),false);
 assert.deepEqual(errors,[]);
 // Skipping is remembered; unavailable browser storage does not prevent using the app.
 const skip=await browser.newPage();await skip.goto(base+'/vektor-labor/');await skip.locator('#tourSkip').click();await skip.reload();assert.equal(await skip.locator('#tourDialog').isVisible(),false);
 const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('disabled');}});});await blocked.goto(base+'/vektor-labor/');await blocked.locator('#tourSkip').click();assert.equal(await blocked.locator('#tourDialog').isVisible(),false);
 console.log('Tutorial and source tasks OK: four steps, skip, persistence, replay, Escape, no-storage fallback; independent geometry and field scales, directions, analytic vectors and pointer constructions; 3 viewports.');
}finally{await browser.close();}
