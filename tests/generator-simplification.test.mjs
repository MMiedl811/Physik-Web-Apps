import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.GENERATOR_URL||'http://127.0.0.1:8898';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height]of [[1440,1000],[1024,768],[820,1180],[600,900],[390,844],[720,500]]){
   const p=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url())});
   await p.goto(base+'/generator/');await p.locator('#carrierDialog').waitFor();
   assert.equal(await p.locator('[data-carrier][aria-pressed=true]').count(),0);await p.keyboard.press('Escape');assert.equal(await p.locator('#carrierDialog').isVisible(),true);
   await p.locator('[data-choose-carrier=electrons]').click();await p.waitForFunction(()=>document.querySelector('#scene').dataset.motionVisible);
   const snapshot=async()=>[await p.locator('#angle').inputValue(),await p.locator('#rpm').inputValue(),await p.locator('#coilU').textContent(),await p.locator('#outerU').textContent()];
   const start=await snapshot();
   const visible=()=>p.locator('#scene').evaluate(e=>({force:e.dataset.forceVisible,motion:e.dataset.motionVisible,field:e.dataset.fieldVisible,poles:e.dataset.polesVisible}));
   assert.deepEqual(await visible(),{force:'false',motion:'true',field:'false',poles:'true'});
   assert.equal(await p.locator('#contactDetail').isVisible(),false);
   const rects=await p.locator('.apparatus').evaluate(e=>{const box=s=>{const r=e.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};return {run:box('#run'),step:box('#step'),canvas:box('#scene'),views:box('.view-controls')}});
   assert.ok(rects.run.bottom<=rects.canvas.top&&rects.step.bottom<=rects.canvas.top);assert.ok(rects.run.height>=56);
   async function layout(){const r=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,input,a,summary')].filter(e=>e.getClientRects().length&&(!e.closest('details:not([open])')||e.tagName==='SUMMARY')).filter(e=>{const r=(e.type==='checkbox'?e.closest('label'):e).getBoundingClientRect();return r.width<47.9||r.height<47.9}).map(e=>e.id||e.textContent)}));assert.equal(r.overflow,false);assert.deepEqual(r.small,[]);}
   await layout();await p.screenshot({path:`/tmp/generator-simplified-${name}-${width}-default.png`,fullPage:true});
   for(const [id,key]of [['showMotion','motion'],['showForce','force'],['showField','field']]){
    await p.locator('#'+id).uncheck();assert.equal((await visible())[key],'false');await p.locator('#'+id).check();assert.equal((await visible())[key],'true');assert.deepEqual(await snapshot(),start);
   }
   await p.locator('#showForce').focus();await p.keyboard.press('Space');assert.equal((await visible()).force,'false');await p.keyboard.press('Space');assert.equal((await visible()).force,'true');
   for(const carrier of ['positive','electrons']){
    await p.locator(`[data-carrier=${carrier}]`).click();assert.equal(await p.locator('#scene').getAttribute('data-force-a'),carrier==='positive'?'-1':'1');assert.deepEqual(await snapshot(),start);
   }
   await p.locator('[data-explanation=flux]').click();assert.equal((await visible()).force,'true');assert.equal((await visible()).field,'true');await layout();
   if([1440,1024,820].includes(width))await p.screenshot({path:`/tmp/generator-simplified-${name}-${width}-flux.png`,fullPage:true});
   await p.locator('[data-explanation=lorentz]').click();await p.locator('#showMotion').uncheck();await p.locator('#showField').uncheck();
   if([1440,1024,820].includes(width))await p.screenshot({path:`/tmp/generator-simplified-${name}-${width}-force-only.png`,fullPage:true});
   for(const view of ['front','top','contacts','space']){await p.locator(`[data-view=${view}]`).click();assert.deepEqual(await snapshot(),start);assert.equal((await visible()).poles,'true');assert.equal(await p.locator('.pole-key').isVisible(),true);await layout();}
   await p.locator('[data-view=contacts]').click();assert.equal(await p.locator('#contactDetail').isVisible(),true);assert.equal(await p.locator('.overlays').isVisible(),false);assert.match(await p.locator('#contactPhase').textContent(),/bleiben diese Verbindungen gleich/);
   await p.locator('[data-kind=dc]').click();await p.locator('#angle').fill('165');assert.match(await p.locator('#contactPhase').textContent(),/In 15°/);
   await p.locator('#step').click();assert.equal(await p.locator('#angle').inputValue(),'180');assert.equal(await p.locator('#outerU').textContent(),'0,00 V');assert.match(await p.locator('#contactPhase').textContent(),/wechseln gerade/);
   await p.locator('#step').click();assert.match(await p.locator('#contactPhase').textContent(),/X ↔ 2, Y ↔ 1/);assert.ok((await p.locator('#outerU').textContent()).startsWith('0,'));
   await p.locator('#reverse').click();assert.match(await p.locator('#contactPhase').textContent(),/In 15°/);
   if([1440,1024,820].includes(width))await p.screenshot({path:`/tmp/generator-simplified-${name}-${width}-contacts.png`,fullPage:true});
   await p.locator('#reset').click();assert.deepEqual(await visible(),{force:'false',motion:'true',field:'false',poles:'true'});assert.equal(await p.locator('#contactDetail').isVisible(),false);
   await p.locator('#run').click();await p.waitForFunction(()=>document.querySelector('#angleRead').textContent!=='45°');await p.locator('#showField').check();assert.equal(await p.locator('#run').textContent(),'Pause');await p.locator('#run').click();const paused=await p.locator('#angle').inputValue();await p.waitForTimeout(80);assert.equal(await p.locator('#angle').inputValue(),paused);
   await p.locator('#rpm').fill('0');await p.locator('#showForce').check();assert.equal((await visible()).force,'false');assert.equal((await visible()).motion,'false');await layout();
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);console.log(name,width,'toggles, poles, transport, contact phases and state preservation PASS');await p.close();
  }
  const p=await browser.newPage();await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
  await p.goto(base+'/generator/');await p.locator('[data-choose-carrier=positive]').click();await p.locator('#sceneMessage').waitFor();
  await p.locator('#showMotion').uncheck();await p.locator('#showForce').check();assert.match(await p.locator('#machine').textContent(),/F₊/);assert.equal(await p.locator('#machine .vector-label[aria-label="Vektor B"]').count(),0);
  await p.locator('#showField').check();assert.equal(await p.locator('#machine .vector-label[aria-label="Vektor B"]').count(),1);await p.locator('[data-view=contacts]').click();assert.equal(await p.locator('#contactDetail').isVisible(),true);
  console.log(name,'SVG fallback toggles and contacts PASS');await p.close();
 }finally{await browser.close()}
}
