import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.INDUCTION_URL||'http://127.0.0.1:8898';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
  page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))errors.push(r.url())});
  await page.addInitScript(()=>{let t=0,frames=[];Object.defineProperty(performance,'now',{value:()=>t});window.requestAnimationFrame=f=>frames.push(f);window.advance=s=>{for(let n=0;n<s*20;n++){t+=50;const f=frames;frames=[];f.forEach(fn=>fn(t))}}});
  await page.goto(base+'/induktion-leiterstab/');
  const dialog=page.locator('#carrierDialog');
  assert.ok(await dialog.evaluate(e=>e.open));
  assert.equal(await page.locator('.carrier-switch [aria-pressed=true]').count(),0);
  assert.ok(await page.locator('#slow').isDisabled());
  assert.equal(await page.evaluate(()=>document.activeElement.id),'choiceTitle');
  await page.keyboard.press('Escape');assert.ok(await dialog.evaluate(e=>e.open));
  const layout=async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(await page.locator('button').evaluateAll(es=>es.filter(e=>e.getClientRects().length).filter(e=>{const b=e.getBoundingClientRect();return b.width<48||b.height<48}).map(e=>e.id)),[])};
  await layout();await page.screenshot({path:`/tmp/induction-${name}-${width}-choice.png`,fullPage:true});
  for(const choice of ['positive','electrons']){
   if(choice==='positive')await page.locator('#choosePositive').click();else await page.locator('#electronMode').click();
   assert.ok(!await dialog.evaluate(e=>e.open));
   await page.locator('#reset').click();await page.locator('#slow').click();await page.evaluate(()=>advance(4));
   assert.equal(await page.locator('#meterRead').innerText(),'0,20 V');
   assert.equal(await page.locator('#elecWord').innerText(),'gleich groß');
   const dirs=await page.evaluate(()=>['magLine','elecLine'].map(id=>{const e=document.getElementById(id);return Math.sign(Number(e.getAttribute('y2'))-Number(e.getAttribute('y1')))}));
   // v points right, B into screen: v × B points up; electron force points down.
   assert.deepEqual(dirs,choice==='positive'?[-1,1]:[1,-1]);
   assert.equal(await page.locator('#carriers text').first().textContent(),choice==='positive'?'+':'−');
   const before=await page.locator('#meterRead').innerText(),x=await page.locator('#rodGroup').getAttribute('transform');
   await page.locator(choice==='positive'?'#electronMode':'#positiveMode').click();
   assert.equal(await page.locator('#meterRead').innerText(),before);assert.equal(await page.locator('#rodGroup').getAttribute('transform'),x);
   await page.locator(choice==='positive'?'#positiveMode':'#electronMode').click();
   await layout();await page.screenshot({path:`/tmp/induction-${name}-${width}-${choice}.png`,fullPage:true});
   await page.locator('#fast').click();await page.evaluate(()=>advance(3));assert.equal(await page.locator('#meterRead').innerText(),'0,40 V');
   await page.locator('#stop').click();await page.evaluate(()=>advance(5));assert.equal(await page.locator('#meterRead').innerText(),'0,00 V');
   await page.locator('#reset').click();assert.equal(await page.locator(choice==='positive'?'#positiveMode':'#electronMode').getAttribute('aria-pressed'),'true');
   await page.locator('#fast').click();await page.evaluate(()=>advance(10));assert.equal(await page.locator('#stop').getAttribute('aria-pressed'),'true');await page.locator('#fast').click();assert.match(await page.locator('#rodGroup').getAttribute('transform'),/360/);
  }
  await page.locator('summary').click();await layout();
  await page.addStyleTag({content:'body{font-size:32px}h1{font-size:48px}button,.carrier-note,.status,.readout,details p{font-size:28px!important}'});await layout();
  await page.screenshot({path:`/tmp/induction-${name}-${width}-zoom.png`,fullPage:true});
  await page.reload();assert.ok(await dialog.evaluate(e=>e.open));assert.equal(await page.locator('.carrier-switch [aria-pressed=true]').count(),0);await page.locator('#chooseElectrons').click();assert.equal(await page.locator('#electronMode').getAttribute('aria-pressed'),'true');
  const ids=await page.locator('[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,ids.length);
  await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));assert.deepEqual(errors,[]);
  await page.close();console.log(`${name} ${width}×${height}: carrier choice, forces, voltage, switching, stop/reset/end, layout, navigation OK`);
 }}finally{await browser.close()}
}
