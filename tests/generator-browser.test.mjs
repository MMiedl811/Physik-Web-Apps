import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.GENERATOR_URL||'http://127.0.0.1:8897';
const out=process.env.GENERATOR_SCREENSHOTS||'/tmp';
for(const [name,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch();
  try{
    for(const [width,height] of [[1440,1000],[1024,768],[820,1180],[600,900],[390,844],[720,500]]){
      const page=await browser.newPage({viewport:{width,height},hasTouch:true});
      const errors=[],failed=[],external=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
      page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
      await page.goto(base+'/generator/');
      await page.waitForFunction(()=>document.querySelector('#machine').hasAttribute('hidden')||!document.querySelector('#sceneMessage').hidden);
      assert.equal(await page.locator('#sceneMessage').isVisible(),false,'WebGL must work');
      assert.equal(await page.locator('#machine').isVisible(),false);
      async function layout(){
        const result=await page.evaluate(()=>{
          const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
          const bad=[...document.querySelectorAll('button,input,a,summary')].filter(e=>e.getClientRects().length&&(!e.closest('details:not([open])')||e.tagName==='SUMMARY')).filter(e=>{const b=e.getBoundingClientRect();return b.width<47.9||b.height<47.9}).map(e=>e.id||e.textContent);
          return {overflow:document.documentElement.scrollWidth>innerWidth,duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),bad};
        });
        assert.equal(result.overflow,false,JSON.stringify({name,width,result}));assert.deepEqual(result.duplicates,[]);assert.deepEqual(result.bad,[]);
      }
      await layout();
      for(const kind of ['ac','dc'])for(const explanation of ['lorentz','flux']){
        await page.locator(`[data-kind=${kind}]`).click();await page.locator(`[data-explanation=${explanation}]`).click();
        for(const angle of [0,90,180,270]){
          await page.locator('#angle').fill(String(angle));
          const inner=await page.locator('#coilU').textContent(),outer=await page.locator('#outerU').textContent();
          if(angle%180===0){assert.equal(inner,'0,00 V');assert.equal(outer,'0,00 V');}
          else {assert.equal(inner,angle===90?'1,01 V':'-1,01 V');assert.equal(outer,kind==='dc'?'1,01 V':inner);}
          await layout();
        }
        await page.locator('#angle').fill('45');
        for(const view of ['space','front','top','contacts']){
          await page.locator(`[data-view=${view}]`).click();assert.equal(await page.locator(`[data-view=${view}]`).getAttribute('aria-pressed'),'true');
          assert.equal(await page.locator('#angle').inputValue(),'45');
          if([1440,1024,820].includes(width))await page.locator('.apparatus').screenshot({path:`${out}/generator-${name}-${width}-${kind}-${explanation}-${view}.png`});
        }
        await page.locator('[data-view=space]').click();
        if([1440,1024,820].includes(width))await page.screenshot({path:`${out}/generator-${name}-${width}-${kind}-${explanation}-full.png`,fullPage:true});
      }
      await page.locator('#reverse').click();assert.equal(await page.locator('#outerU').textContent(),'-0,71 V');
      await page.locator('#scene').focus();await page.keyboard.press('ArrowRight');
      assert.equal(await page.locator('[data-view][aria-pressed=true]').count(),0);assert.equal(await page.locator('#angle').inputValue(),'45');
      await page.keyboard.press('+');
      await page.locator('[data-view=space]').click();await page.locator('#scene').scrollIntoViewIfNeeded();
      const bounds=await page.locator('#scene').boundingBox();
      await page.mouse.move(bounds.x+bounds.width*.4,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.6,bounds.y+bounds.height*.55,{steps:8});await page.mouse.up();
      assert.equal(await page.locator('[data-view][aria-pressed=true]').count(),0);assert.equal(await page.locator('#angle').inputValue(),'45');
      await page.locator('#reset').click();assert.equal(await page.locator('#angle').inputValue(),'45');
      assert.equal(await page.locator('[data-kind=ac]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-explanation=lorentz]').getAttribute('aria-pressed'),'true');
      await page.locator('#step').click();assert.equal(await page.locator('#angle').inputValue(),'60');
      await page.locator('#run').click();await page.waitForFunction(()=>Number(document.querySelector('#angle').value)>62);
      await page.locator('#run').click();const paused=await page.locator('#angle').inputValue();await page.waitForTimeout(150);assert.equal(await page.locator('#angle').inputValue(),paused);
      await page.locator('#rpm').fill('0');assert.equal(await page.locator('#outerU').textContent(),'0,00 V');assert.match(await page.locator('#positionText').textContent(),/Stillstand/);
      await page.locator('#run').click();const stopped=await page.locator('#angle').inputValue();await page.waitForTimeout(150);assert.equal(await page.locator('#angle').inputValue(),stopped);
      await page.locator('#reset').click();await page.locator('summary').click();await layout();
      // Zoom-equivalent: half desktop viewport plus 200% font scaling at the narrow layout.
      if(width===720){await page.addStyleTag({content:'body{font-size:200%}'});await layout();}
      await page.locator('header .back').click();await page.locator('a.card[href="generator/"]').click();await page.locator('footer a').click();assert.match(page.url(),/index.html#nutzung$/);
      assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
      console.log(name,width,'modes, views, limits, controls, navigation and layout PASS');await page.close();
    }
    const page=await browser.newPage();
    await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:get.call(this,type,...args);};});
    await page.goto(base+'/generator/');await page.waitForFunction(()=>!document.querySelector('#sceneMessage').hidden);
    assert.equal(await page.locator('#machine').isVisible(),true);await page.locator('[data-kind=dc]').click();await page.locator('[data-explanation=flux]').click();await page.locator('#angle').fill('270');assert.equal(await page.locator('#outerU').textContent(),'1,01 V');
    console.log(name,'WebGL unavailable fallback PASS');await page.close();
    // A fresh context with all non-local network access blocked proves local runtime use.
    const local=await browser.newContext();await local.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    const lp=await local.newPage();await lp.goto(base+'/generator/');await lp.waitForFunction(()=>document.querySelector('#machine').hasAttribute('hidden'));
    await lp.locator('#run').click();await lp.waitForFunction(()=>document.querySelector('#angleRead').textContent!=='45°');await local.close();console.log(name,'local runtime without internet PASS');
  }finally{await browser.close();}
}
