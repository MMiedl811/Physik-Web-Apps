import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.POWER_LAB_URL||'http://127.0.0.1:8877';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const width of [1440,1024,820,600,720,390]){
   const page=await browser.newPage({viewport:{width,height:width===820?1180:width===1024?768:width===720?450:900},hasTouch:true});
   const errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.goto(base+'/');await page.locator('a.card[href="mechanische-leistung/index.html"]').click();
   await page.screenshot({path:`/tmp/power-${name}-${width}-intro.png`,fullPage:true});
   await page.getByRole('button',{name:'Untersuchung starten'}).click();
   await page.waitForTimeout(100);await page.locator('#play-button').click();
   assert.equal(await page.evaluate(()=>__powerLab.getStairState().playing),false);
   for(const mode of ['stairs','lifting']){
    await page.locator(`[data-tab="${mode}"]`).click();
    await page.locator('#reset-button').click();await page.locator('#play-button').click();
    await page.waitForTimeout(120);await page.locator('#play-button').click();
    if(mode==='stairs'){
     await page.locator('[data-speed="fast"]').click();
     assert.equal(await page.locator('[data-speed="fast"]').getAttribute('aria-pressed'),'true');
     const model=await page.evaluate(()=>{__stairPowerLab.reset();__stairPowerLab.setSpeed('fast');return __stairPowerLab.advance(100);});
     assert.equal(model.height,4.2);assert.equal(model.finished,true);assert.ok(Math.abs(model.energy-2678.13)<1e-8);
     await page.locator('#stair-energy-chart').focus();await page.keyboard.press('End');
    }else{
     await page.locator('#time-a').fill('5');await page.locator('#time-b').fill('1');
     assert.equal(await page.locator('#time-a-out').textContent(),'5,0 s');
     assert.equal(await page.locator('#lift-power-a').textContent(),'137 W');
     assert.equal(await page.locator('#lift-power-b').textContent(),'687 W');
     await page.locator('#play-button').click();await page.waitForTimeout(100);await page.locator('#play-button').click();
     await page.locator('#lifting-energy-chart').focus();await page.keyboard.press('End');
    }
    const report=await page.evaluate(()=>{
     const visible=e=>e.getClientRects().length,rect=e=>e.getBoundingClientRect();
     const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     return {overflow:document.documentElement.scrollWidth>innerWidth,duplicate:ids.filter((id,i)=>ids.indexOf(id)!==i),small:[...document.querySelectorAll('button,input,.home')].filter(visible).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id||e.className),cols:getComputedStyle(document.querySelector('[role="tabpanel"]:not([hidden]) .layout')).gridTemplateColumns.split(' ').length};
    });
    assert.equal(report.overflow,false,JSON.stringify({name,width,mode,report}));assert.deepEqual(report.small,[]);assert.deepEqual(report.duplicate,[]);assert.equal(report.cols,width>=820?2:1);
    await page.screenshot({path:`/tmp/power-${name}-${width}-${mode}.png`,fullPage:true});
    await page.locator('#reset-button').click();
    assert.equal(await page.evaluate(m=>m==='stairs'?__powerLab.getStairState().t:__powerLab.getLiftState().t,mode),0);
   }
   await page.locator('#formula-toggle').click();assert.equal(await page.locator('#model-panel').isVisible(),true);
   await page.addStyleTag({content:'body{font-size:32px} .heading p,.readout small,.scene-badge,.goal-badge,.control-note,.charts-head p,.legend,.chart-title,.inspection{font-size:28px}.learning-step,.model-box{font-size:30px}.readout strong,.formula{font-size:36px}'});
   const zoom=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,wide:[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,id:e.id,cls:e.className,right:e.getBoundingClientRect().right}))}));assert.equal(zoom.overflow,false,JSON.stringify({name,width,zoom}));
   await page.screenshot({path:`/tmp/power-${name}-${width}-text.png`,fullPage:true});
   await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
   await page.close();
  }
  console.log(`${name}: both modes, controls, model references, reset, navigation, 6 viewports and text zoom passed`);
 }finally{await browser.close();}
}
