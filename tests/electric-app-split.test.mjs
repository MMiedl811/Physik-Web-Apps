import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url);
const {chromium}=require('/Users/matthias/.cache/physik-tiktok-render/node_modules/playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8770';
const fieldHtml=readFileSync(new URL('../elektrische-felder/index.html',import.meta.url),'utf8');
const motionHtml=readFileSync(new URL('../probeladung-elektrisches-feld/index.html',import.meta.url),'utf8');
const landing=readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(fieldHtml,/data-app-variant="field"/);
assert.match(motionHtml,/data-app-variant="motion"/);
assert.doesNotMatch(motionHtml,/site-hold\.js/);
assert.match(landing,/href="elektrische-felder\/index\.html"/);
assert.match(landing,/href="probeladung-elektrisches-feld\/index\.html"/);

const browser=await chromium.launch();
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',error=>errors.push(error.message));

await page.goto(`${base}/elektrische-felder/`);
await page.getByRole('button',{name:'Untersuchung starten'}).click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'field');
assert.equal(await page.locator('.mode-tab:visible').count(),2);
assert.equal(await page.locator('#motionModeBtn').isVisible(),false);
await page.locator('[data-preset="capacitor"]').click();
await page.locator('#gapSlider').fill('2.4');
await page.locator('#gapSlider').dispatchEvent('input');
await page.evaluate(()=>__electricFieldLab.placeProbe(0,0));
assert.match(await page.locator('#fieldRead').innerText(),/V\/m/);
assert.equal(await page.locator('#plateControls').isVisible(),true);
await page.locator('#superpositionModeBtn').click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'superposition');
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().gap),2.4);
for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`/tmp/feldanalyse-${viewport.width}.png`,fullPage:true});
}

await page.setViewportSize({width:1440,height:900});
await page.goto(`${base}/probeladung-elektrisches-feld/`);
await page.getByRole('button',{name:'Untersuchung starten'}).click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'motion');
assert.equal(await page.locator('.mode-tabs').isVisible(),false);
assert.equal(await page.locator('#motionControls').isVisible(),true);
await page.locator('[data-preset="capacitor"]').click();
await page.locator('#gapSlider').fill('2.3');
await page.locator('#gapSlider').dispatchEvent('input');
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().gap),2.3);
await page.evaluate(()=>__electricFieldLab.placeTestCharge(0,0));
assert.equal(await page.locator('#motionBtn').isEnabled(),true);
await page.locator('#resetBtn').click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'motion');

for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`/tmp/probeladung-${viewport.width}.png`,fullPage:true});
}

assert.deepEqual(errors,[]);
console.log('electric app split OK: focused modes, shared capacitor spacing, V/m probe, reset, 3 viewports');
await browser.close();
