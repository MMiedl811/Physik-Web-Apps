import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {checkpointExplanation} from '../generator/checkpoints.mjs';
import {defaults} from '../generator/model.mjs';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.GENERATOR_URL||'http://127.0.0.1:8898';
assert.equal(defaults.showStopHelp,false);
for(const angle of [0,90,180,270]){
 const stopped=checkpointExplanation(angle,{...defaults,carrier:'electrons',rpm:0});
 assert.match(stopped.title,/Stillstand/);assert.match(stopped.mechanism,/null/);assert.doesNotMatch(stopped.mechanism,/maximal/);
}
for(const [name,engine]of Object.entries({chromium,webkit})){
 const b=await engine.launch();
 try{
  for(const [width,height]of [[1440,1000],[1024,768],[820,1180],[390,844],[720,500]]){
   const p=await b.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url())});
   await p.goto(base+'/generator/');await p.locator('[data-choose-carrier=electrons]').click();await p.waitForFunction(()=>document.querySelector('#scene').dataset.vectorAccents==='true');
   assert.equal(await p.locator('#showStopHelp').isChecked(),false);
   assert.equal(await p.locator('.apparatus [data-angle]').count(),0);
   assert.equal(await p.locator('.plot-surface [data-angle]').count(),4);
   for(const angle of [0,90,180,270]){
    await p.locator(`[data-angle="${angle}"]`).click();assert.equal(await p.locator('#angle').inputValue(),String(angle));assert.equal(await p.locator('#positionDialog').isVisible(),false);assert.equal(await p.locator('#run').textContent(),'Start');
    assert.equal(await p.locator(`[data-angle="${angle}"]`).getAttribute('aria-pressed'),'true');
    assert.equal(await p.locator('#coilU').textContent(),angle%180===0?'0,00 V':angle===90?'1,01 V':'-1,01 V');
   }
   // Tap the actual curve markers, including both 270° points on the two curves.
   for(const [angle,y] of [[0,128],[90,56],[180,128],[270,200]]){
    const bounds=await p.locator('#plot').boundingBox();
    await p.touchscreen.tap(bounds.x+(72+644*angle/360)/760*bounds.width,bounds.y+y/270*bounds.height);
    assert.equal(await p.locator('#angle').inputValue(),String(angle));assert.equal(await p.locator('#sceneAngle').textContent(),`θ = ${angle}°`);
    const hand=JSON.parse(await p.locator('#scene').getAttribute('data-hand-position'));assert.ok(Math.abs(hand[0]-.92*Math.sin(angle*Math.PI/180))<1e-8);
   }
   await p.locator('[data-kind=dc]').click();
   const curve=await p.locator('#plot').boundingBox();await p.touchscreen.tap(curve.x+(72+644*270/360)/760*curve.width,curve.y+56/270*curve.height);
   assert.equal(await p.locator('#angle').inputValue(),'270');assert.equal(await p.locator('#outerU').textContent(),'1,01 V');await p.locator('[data-kind=ac]').click();
   await p.locator('#showStopHelp').check();assert.equal(await p.locator('#positionDialog').isVisible(),false);
   for(const angle of [0,90,180,270]){
    await p.locator(`[data-angle="${angle}"]`).click();assert.equal(await p.locator('#positionDialog').isVisible(),true);assert.match(await p.locator('#positionTitle').textContent(),new RegExp(angle+'°'));
    assert.match(await p.locator('#positionMechanism').textContent(),angle%180===0?/parallel.*keine magnetische Lorentzkraft/:/senkrecht.*maximal/);
    await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'closePosition');
    await p.screenshot({path:`/tmp/generator-checkpoint-${name}-${width}-${angle}.png`});
    await p.keyboard.press('Escape');assert.equal(await p.locator('#positionDialog').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.dataset.angle),String(angle));
   }
   await p.locator('[data-explanation=flux]').click();await p.locator('[data-angle="90"]').click();assert.match(await p.locator('#positionMechanism').textContent(),/Fluss ist gerade null.*am schnellsten/);await p.locator('#closePosition').click();
   await p.locator('[data-kind=dc]').click();await p.locator('[data-angle="180"]').click();assert.match(await p.locator('#positionConnection').textContent(),/wechseln.*Spannung null/);await p.locator('#closePosition').click();
   await p.locator('#rpm').fill('0');await p.locator('[data-angle="90"]').click();assert.match(await p.locator('#positionTitle').textContent(),/Stillstand/);assert.equal(await p.locator('#coilU').textContent(),'0,00 V');await p.locator('#closePosition').click();
   await p.locator('#rpm').fill('30');await p.locator('#angle').fill('75');await p.locator('#run').click();await p.waitForFunction(()=>Number(document.querySelector('#angle').value)>95);assert.equal(await p.locator('#positionDialog').isVisible(),false);assert.equal(await p.locator('#run').textContent(),'Pause');
   await p.locator('[data-angle="0"]').click();assert.equal(await p.locator('#run').textContent(),'Start');await p.locator('#closePosition').click();await p.locator('#step').click();assert.equal(await p.locator('#positionDialog').isVisible(),false);
   await p.locator('#showStopHelp').uncheck();await p.locator('[data-angle="90"]').click();assert.equal(await p.locator('#positionDialog').isVisible(),false);
   await p.locator('[data-explanation=lorentz]').click();await p.locator('#showForce').check();await p.locator('#showField').check();await p.locator('[data-carrier=positive]').click();
   assert.equal(await p.locator('#vectorLegend math[aria-label="Vektor F +"]').count(),1);assert.equal(await p.locator('#vectorLegend math[aria-label="Vektor v"]').count(),1);assert.equal(await p.locator('#vectorLegend mover').count(),3);
   assert.equal(await p.locator('#scene').getAttribute('data-vector-accents'),'true');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const small=await p.locator('button:visible').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width<47.9||r.height<47.9}).map(e=>e.id||e.textContent));assert.deepEqual(small,[]);
   if([1440,1024,820].includes(width)){await p.locator('.apparatus').screenshot({path:`/tmp/generator-vector-${name}-${width}.png`});await p.locator('.plot-card').screenshot({path:`/tmp/generator-diagram-${name}-${width}.png`});}
   await p.locator('#reset').click();assert.equal(await p.locator('#showStopHelp').isChecked(),false);assert.equal(await p.locator('[data-carrier=positive]').getAttribute('aria-pressed'),'true');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);console.log(name,width,'voluntary explanations, exact jumps, pause/focus, stillstand and vector labels PASS');await p.close();
  }
  const p=await b.newPage();await p.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:get.call(this,t,...a)}});
  await p.goto(base+'/generator/');await p.locator('[data-choose-carrier=electrons]').click();await p.locator('#sceneMessage').waitFor();await p.locator('#showForce').check();await p.locator('#showField').check();
  assert.equal(await p.locator('#machine .vector-label[aria-label="Vektor F Elektron"]').count(),2);assert.equal(await p.locator('#machine .vector-label[aria-label="Vektor v"]').count(),1);assert.equal(await p.locator('#machine .vector-label[aria-label="Vektor B"]').count(),1);
  await p.locator('#showStopHelp').check();await p.locator('[data-angle="0"]').click();assert.match(await p.locator('#positionMechanism').textContent(),/keine magnetische Lorentzkraft/);await p.locator('#closePosition').click();await p.locator('#showStopHelp').uncheck();await p.locator('[data-angle="90"]').click();await p.screenshot({path:`/tmp/generator-vector-${name}-fallback.png`,fullPage:true});
  console.log(name,'SVG vectors and checkpoint fallback PASS');await p.close();
 }finally{await b.close()}
}
