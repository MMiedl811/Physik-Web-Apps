import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.LOOP_URL||'http://127.0.0.1:8891';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(base+'/leiterschleife-magnetfeld/');
   await page.waitForFunction(()=>document.querySelector('#sceneMessage').hidden);
   assert.equal(await page.locator('#mainCanvas').isVisible(),true);
   async function layout(){
    const r=await page.evaluate(()=>{const b=e=>e.getBoundingClientRect(),ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return {overflow:document.documentElement.scrollWidth>innerWidth,dupes:ids.filter((id,i)=>ids.indexOf(id)!==i),small:[...document.querySelectorAll('button,input,a,summary')].filter(e=>e.getClientRects().length&&(!e.closest('details:not([open])')||e.tagName==='SUMMARY')).filter(e=>b(e).width<48||b(e).height<48).map(e=>e.id||e.textContent)}});
    assert.equal(r.overflow,false,JSON.stringify({name,width,r}));assert.deepEqual(r.dupes,[]);assert.deepEqual(r.small,[]);
   }
   await layout();
   for(const angle of [0,45,90,180,270,359]){
    await page.locator('#angle').fill(String(angle));
    assert.equal(await page.locator('#angleRead').textContent(),angle+'°');
    for(const view of ['space','front','top']){
     await page.locator(`[data-view="${view}"]`).click();
     assert.equal(await page.locator(`[data-view="${view}"]`).getAttribute('aria-pressed'),'true');
     assert.equal(await page.locator('#angle').inputValue(),String(angle));
     await layout();
     if([0,45,90].includes(angle)&&[1440,1024,820].includes(width))await page.screenshot({path:`/tmp/loop3d-${name}-${width}-${angle}-${view}.png`,fullPage:true});
    }
   }
   await page.locator('#angle').fill('45');
   await page.locator('#mainCanvas').focus();await page.keyboard.press('ArrowLeft');
   assert.equal(await page.locator('[data-view][aria-pressed=true]').count(),0);
   await page.keyboard.press('+');assert.equal(await page.locator('#angle').inputValue(),'45');
   await page.locator('#viewReset').click();assert.equal(await page.locator('[data-view=space]').getAttribute('aria-pressed'),'true');
   await page.locator('#mainCanvas').scrollIntoViewIfNeeded();
   const bounds=await page.locator('#mainCanvas').boundingBox(),before=await page.locator('#mainCanvas').screenshot();
   await page.mouse.move(bounds.x+bounds.width*.5,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.55,{steps:8});await page.mouse.up();
   assert.equal(await page.locator('[data-view][aria-pressed=true]').count(),0);assert.equal(await page.locator('#angle').inputValue(),'45');
   assert.notDeepEqual(await page.locator('#mainCanvas').screenshot(),before);
   await page.mouse.wheel(0,-100);assert.equal(await page.locator('#angle').inputValue(),'45');
   await page.locator('#viewReset').click();

   await page.locator('#dead').click();assert.equal(await page.locator('#angle').inputValue(),'90');assert.match(await page.locator('#effect').textContent(),/Totpunkt/);
   await page.locator('#current').click();assert.equal(await page.locator('#current').getAttribute('aria-pressed'),'false');assert.match(await page.locator('#effect').textContent(),/keine/);
   await page.locator('#current').click();await page.locator('#reset').click();
   await page.locator('#reverse').click();assert.match(await page.locator('#effect').textContent(),/rückwärts/);
   await page.locator('#reset').click();await page.locator('#step').click();assert.equal(await page.locator('#angle').inputValue(),'15');
   await page.locator('#run').click();await page.waitForFunction(()=>Number(document.querySelector('#angle').value)>15);await page.locator('#run').click();
   const paused=await page.locator('#angle').inputValue();await page.waitForTimeout(100);assert.equal(await page.locator('#angle').inputValue(),paused);
   await page.locator('#reset').click();assert.equal(await page.locator('#angle').inputValue(),'0');assert.equal(await page.locator('#current').getAttribute('aria-pressed'),'true');
   await page.locator('summary').click();await layout();
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
   console.log(name,width,'3D views / controls / layout passed');await page.close();
  }
  const page=await browser.newPage();
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args)}});
  await page.goto(base+'/leiterschleife-magnetfeld/');await page.waitForFunction(()=>document.querySelector('#mainCanvas').hidden);
  assert.match(await page.locator('#sceneMessage').textContent(),/nicht verfügbar/);assert.equal(await page.locator('#axisCanvas').isVisible(),true);
  await page.locator('#dead').click();assert.match(await page.locator('#effect').textContent(),/Totpunkt/);await page.locator('#current').click();assert.match(await page.locator('#effect').textContent(),/keine/);
  console.log(name,'WebGL unavailable fallback passed');await page.close();
 }finally{await browser.close();}
}
