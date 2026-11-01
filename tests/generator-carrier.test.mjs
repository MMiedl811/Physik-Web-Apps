import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.GENERATOR_URL||'http://127.0.0.1:8898';
for(const [name,engine] of Object.entries({chromium,webkit})){
  const b=await engine.launch();
  try{
    for(const [width,height] of [[1440,1000],[1024,768],[820,1180],[600,900],[390,844],[720,500]]){
      const p=await b.newPage({viewport:{width,height},hasTouch:true}),errors=[],external=[],failed=[];
      p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push(r.url()));p.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url());});
      await p.goto(base+'/generator/');
      await p.locator('#carrierDialog').waitFor({state:'visible'});
      assert.equal(await p.locator('[data-carrier][aria-pressed=true]').count(),0);
      assert.equal(await p.locator('.shell').getAttribute('inert'),'');
      await p.keyboard.press('Escape');await p.keyboard.press('Enter');assert.equal(await p.locator('#carrierDialog').isVisible(),true);
      // Focus cannot escape into the inert app; backward cycling stays in the dialog.
      for(let i=0;i<5;i++)await p.keyboard.press('Tab');
      assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#carrierDialog')),true);
      await p.waitForTimeout(180);
      if([1440,1024,820,390,720].includes(width))await p.locator('#carrierDialog').screenshot({path:`/tmp/generator-carrier-${name}-${width}-dialog.png`});
      await p.locator('[data-choose-carrier=positive]').click();
      await p.waitForFunction(()=>document.querySelector('#machine').hasAttribute('hidden'));
      assert.equal(await p.locator('#carrierDialog').isVisible(),false);
      assert.equal(await p.locator('[data-carrier=positive]').getAttribute('aria-pressed'),'true');
      for(const carrier of ['positive','electrons']){
        await p.locator(`[data-carrier=${carrier}]`).click();
        for(const kind of ['ac','dc'])for(const explanation of ['lorentz','flux']){
          await p.locator(`[data-kind=${kind}]`).click();await p.locator(`[data-explanation=${explanation}]`).click();
          for(const angle of [0,90,180,270]){
            await p.locator('#angle').fill(String(angle));
            const force=(angle%180===0?0:angle===90?1:-1)*(carrier==='positive'?-1:1)||0;
            assert.equal(Number(await p.locator('#scene').getAttribute('data-force-a')),force);
            assert.equal(Number(await p.locator('#machine').getAttribute('data-force-a')),force);
            const before=[await p.locator('#angle').inputValue(),await p.locator('#rpm').inputValue(),await p.locator('#coilU').textContent(),await p.locator('#outerU').textContent()];
            const other=carrier==='positive'?'electrons':'positive';
            await p.locator(`[data-carrier=${other}]`).click();
            assert.deepEqual([await p.locator('#angle').inputValue(),await p.locator('#rpm').inputValue(),await p.locator('#coilU').textContent(),await p.locator('#outerU').textContent()],before);
            assert.equal(Number(await p.locator('#scene').getAttribute('data-force-a')),-force||0);
            await p.locator(`[data-carrier=${carrier}]`).click();
          }
          if(explanation==='lorentz'){
            assert.match(await p.locator('#vectorLegend').textContent(),carrier==='positive'?/F₊.*positive Ladungsträger/:/Fₑ.*Elektronen/);
            assert.match(await p.locator('#positionText').textContent(),carrier==='positive'?/nach oben, an B nach unten/:/nach unten, an B nach oben/);
          }
          assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
          const small=await p.locator('button:visible').evaluateAll(es=>es.filter(e=>{const r=e.getBoundingClientRect();return r.width<47.9||r.height<47.9}).map(e=>e.textContent));assert.deepEqual(small,[]);
          if([1440,1024,820].includes(width))await p.locator('.controls').screenshot({path:`/tmp/generator-carrier-${name}-${width}-${carrier}-${kind}-${explanation}-controls.png`});
        }
        await p.locator('#reset').click();assert.equal(await p.locator(`[data-carrier=${carrier}]`).getAttribute('aria-pressed'),'true');assert.equal(await p.locator('#carrierDialog').isVisible(),false);
        await p.locator('#reverse').click();assert.equal(Number(await p.locator('#scene').getAttribute('data-force-a')),carrier==='positive'?1:-1);
        await p.locator('#rpm').fill('0');assert.equal(Number(await p.locator('#scene').getAttribute('data-force-a')),0);assert.equal(await p.locator('#coilU').textContent(),'0,00 V');
        await p.locator('#reset').click();await p.locator('#run').click();await p.waitForFunction(()=>document.querySelector('#angleRead').textContent!=='45°');
        await p.locator(`[data-carrier=${carrier==='positive'?'electrons':'positive'}]`).click();assert.equal(await p.locator('#run').textContent(),'Pause');await p.locator('#run').click();
        if([1024,820].includes(width))await p.screenshot({path:`/tmp/generator-carrier-${name}-${width}-${carrier}-full.png`,fullPage:true});
      }
      await p.reload();await p.locator('#carrierDialog').waitFor({state:'visible'});assert.equal(await p.locator('[data-carrier][aria-pressed=true]').count(),0);
      await p.locator('[data-choose-carrier=electrons]').click();assert.match(await p.locator('#carrierNote').textContent(),/Elektronenmodell/);
      assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
      console.log(name,width,'mandatory choice, both carriers, force signs, state preservation, reset and reload PASS');await p.close();
    }
  }finally{await b.close();}
}
