import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.QUANTUM_URL||'http://127.0.0.1:8890';
for(const [name,engine] of Object.entries({chromium,webkit})) {
 const browser=await engine.launch();
 try {
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[390,844]]) {
   const p=await browser.newPage({viewport:{width,height},hasTouch:true});
   await p.goto(base+'/energiestufenmodell/');
   await p.getByRole('button',{name:'Untersuchung starten'}).click();
   const title=p.locator('#photon-title'),detail=p.locator('#photon-detail'),box=p.locator('#photon-readout');
   async function energy(value){await p.locator('#energy-input').fill(value);await p.locator('#btn-excite').click();}
   async function current(id){assert.equal(await p.locator('#level-status').textContent(),`Aktuell: ${id}`);assert.equal(await p.locator('.level-line.current').count(),1);assert.equal(await p.locator('.level-label.current').textContent(),id);}
   await energy('12.75');await current('E₃');assert.match(await title.textContent(),/aufgenommen · 12.75 eV/);assert.match(await detail.textContent(),/E₀ → E₃ · UV \(nicht sichtbar\)/);assert.ok(await box.evaluate(e=>e.classList.contains('is-nonvisible')));
   await p.locator('.relax-item').nth(1).click();await current('E₁');assert.match(await title.textContent(),/abgegeben · 2.55 eV/);assert.match(await detail.textContent(),/E₃ → E₁ · sichtbar/);assert.equal(await box.evaluate(e=>e.classList.contains('is-nonvisible')),false);assert.equal(await box.evaluate(e=>e.style.getPropertyValue('--photon-color')),'#22c55e');
   await p.locator('#btn-j').click();assert.match(await title.textContent(),/4.09 ×10⁻¹⁹ J/);await current('E₁');
   assert.equal(await p.locator('.arrow-contour').count(),1);
   assert.equal(await p.locator('#em-arrow-22c55e polygon').getAttribute('fill'),'#22c55e');
   await p.waitForTimeout(900);
   await p.screenshot({path:`/tmp/quantum-final-${name}-${width}-visible.png`,fullPage:true});
   await p.locator('#btn-ev').click();await p.locator('#btn-reset').click();await current('E₀');assert.match(await title.textContent(),/Energie macht/);assert.equal(await box.evaluate(e=>e.classList.contains('is-event')),false);
   await p.locator('#element-select').selectOption('Li');assert.match(await detail.textContent(),/passendes Photon/);
   await energy('4.80');await p.locator('.relax-item').first().click();assert.match(await detail.textContent(),/IR \(nicht sichtbar\)/);assert.equal(await box.evaluate(e=>e.style.getPropertyValue('--photon-color')),'#bdc5df');
   await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.relax-item').last().click();assert.equal(await box.locator('svg').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await p.locator('#electron').evaluate(e=>getComputedStyle(e).transitionProperty),'none');
   // Events update even when reduced motion suppresses the visual animation.
   assert.match(await title.textContent(),/abgegeben · 4.54 eV/);await current('E₀');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await p.waitForTimeout(150);
   await p.screenshot({path:`/tmp/quantum-final-${name}-${width}-uv.png`,fullPage:true});
   await p.close();
  }
  console.log(`${name}: photon readout, current level, VIS/IR/UV, units, reset, element switch and reduced motion passed`);
 } finally {await browser.close();}
}
