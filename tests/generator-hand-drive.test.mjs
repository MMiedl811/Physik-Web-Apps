import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.GENERATOR_URL||'http://127.0.0.1:8898';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
for(const [name,engine]of Object.entries({chromium,webkit})){
 const b=await engine.launch();
 try{
  for(const [width,height]of [[1440,1000],[1024,768],[820,1180],[390,844]]){
   const p=await b.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url())});
   await p.goto(base+'/generator/');await p.locator('[data-choose-carrier=electrons]').click();await p.waitForFunction(()=>document.querySelector('#scene').dataset.handVisible==='true');
   const pose=()=>p.locator('#scene').evaluate(e=>({hand:JSON.parse(e.dataset.handPosition),grip:JSON.parse(e.dataset.gripPosition),rotation:JSON.parse(e.dataset.handRotation),visible:e.dataset.handVisible}));
   for(const angle of [0,45,90,180,270,360]){
    await p.locator('#angle').fill(String(angle));const s=await pose();
    const rad=angle*Math.PI/180;
    s.hand.forEach((v,i)=>near(v,s.grip[i]));near(s.hand[0],.92*Math.sin(rad));near(s.hand[1],1.885);near(s.hand[2],.92*Math.cos(rad));assert.deepEqual(s.rotation,[0,0,0]);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if([1024,820].includes(width)&&[0,90,180,270].includes(angle))await p.locator('#scene').screenshot({path:`/tmp/generator-hand-${name}-${width}-${angle}.png`});
   }
   await p.locator('#angle').fill('45');const before=await pose();await p.locator('#reverse').click();assert.deepEqual(await pose(),before);
   await p.locator('[data-carrier=positive]').click();assert.deepEqual(await pose(),before);await p.locator('[data-explanation=flux]').click();assert.deepEqual(await pose(),before);await p.locator('[data-kind=dc]').click();assert.deepEqual(await pose(),before);
   for(const view of ['space','front','top']){
    await p.locator(`[data-view=${view}]`).click();assert.equal((await pose()).visible,'true');
    if([1440,1024,820].includes(width))await p.locator('.apparatus').screenshot({path:`/tmp/generator-hand-${name}-${width}-${view}.png`});
   }
   await p.locator('[data-view=contacts]').click();assert.equal((await pose()).visible,'false');assert.equal(await p.locator('#driveNote').isVisible(),false);
   await p.locator('#step').click();assert.equal(await p.locator('#angle').inputValue(),'30');await p.locator('[data-view=space]').click();const after=await pose();near(after.hand[0],.46);assert.equal(after.visible,'true');
   await p.locator('#run').click();await p.waitForFunction(()=>Number(document.querySelector('#angle').value)<28);await p.locator('#run').click();const paused=await pose();await p.waitForTimeout(120);assert.deepEqual(await pose(),paused);
   await p.locator('#rpm').fill('0');await p.locator('#run').click();const stopped=await pose();await p.waitForTimeout(120);assert.deepEqual(await pose(),stopped);
   await p.locator('#reset').click();near((await pose()).hand[0],.92/Math.sqrt(2));assert.equal(await p.locator('#run').textContent(),'Start');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);console.log(name,width,'grip attachment, rigid crank, non-spinning hand, views, pause, reverse and reset PASS');await p.close();
  }
 }finally{await b.close()}
}
