import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url);
const {chromium}=require('/Users/matthias/.cache/physik-tiktok-render/node_modules/playwright');
const base=process.env.ELECTRIC_URL||'http://127.0.0.1:8770';
const html=readFileSync(new URL('../elektrische-felder/index.html',import.meta.url),'utf8');
const redirect=readFileSync(new URL('../probeladung-elektrisches-feld/index.html',import.meta.url),'utf8');
const landing=readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.doesNotMatch(html,/data-app-variant=/);
assert.match(html,/id="fieldModeBtn"/);
assert.match(html,/id="motionModeBtn"/);
assert.match(html,/id="superpositionModeBtn"/);
assert.match(redirect,/\.\.\/elektrische-felder\/#probeladung/);
assert.match(landing,/href="elektrische-felder\/index\.html"/);
assert.doesNotMatch(landing,/href="probeladung-elektrisches-feld\/index\.html"/);
assert.match(landing,/12 Apps/);

const browser=await chromium.launch();
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',error=>errors.push(error.message));

await page.goto(`${base}/elektrische-felder/`);
await page.getByRole('button',{name:'Untersuchung starten'}).click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'field');
assert.equal(await page.locator('.mode-tab:visible').count(),3);

// Coulomb field: +1 nC at origin gives kQ/r² ≈ 8.99 V/m at 1 m.
await page.evaluate(()=>__electricFieldLab.setPreset('single'));
const point=await page.evaluate(()=>__electricFieldLab.fieldAt(1,0));
assert.ok(Math.abs(point.ex-8.9876)<0.03,`unexpected Coulomb field ${point.ex}`);
assert.ok(Math.abs(point.ey)<1e-10);
await page.evaluate(()=>__electricFieldLab.placeProbe(1,0));
assert.match(await page.locator('#fieldRead').innerText(),/8,98|8,99/);
assert.match(await page.locator('#fieldRead').innerText(),/V\/m/);

// Source strength uses one shared model in every tab.
await page.evaluate(()=>__electricFieldLab.setMotionParameters({sourceStrength:2}));
const doubled=await page.evaluate(()=>__electricFieldLab.fieldAt(1,0));
assert.ok(Math.abs(doubled.ex-2*point.ex)<1e-9);
assert.equal(await page.locator('#sourceStrengthInput').isVisible(),true);
await page.evaluate(()=>__electricFieldLab.setMotionParameters({sourceStrength:1}));

// Signs and superposition are physically consistent.
const fields=await page.evaluate(()=>{
  __electricFieldLab.setPreset('negative');
  const negative=__electricFieldLab.fieldAt(1,0);
  __electricFieldLab.setPreset('dipole');
  const dipoleCenter=__electricFieldLab.fieldAt(0,0);
  __electricFieldLab.setPreset('equal');
  const equalCenter=__electricFieldLab.fieldAt(0,0);
  return {negative,dipoleCenter,equalCenter};
});
assert.ok(fields.negative.ex<0);
assert.ok(fields.dipoleCenter.ex>0);
assert.ok(Math.abs(fields.dipoleCenter.ey)<1e-9);
assert.ok(fields.equalCenter.mag<1e-9);

// Superposition remains in physical V/m and preserves the same setup.
await page.locator('#superpositionModeBtn').click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'superposition');
assert.doesNotMatch(await page.locator('#superpositionText').innerText(),/Beispielmaßstab|rel\. E/);

// The capacitor spacing works inside the same app and all three modes.
await page.locator('[data-preset="capacitor"]').click();
const capacitor=await page.evaluate(()=>{
  __electricFieldLab.setPlates(1.2,3.2);
  const narrow=__electricFieldLab.fieldAt(0,0);
  __electricFieldLab.setPlates(2.4,3.2);
  const wide=__electricFieldLab.fieldAt(0,0);
  return {narrow,wide};
});
const expectedCenter=8*8.9875517923*Math.atan(3.2/1.2);
assert.ok(Math.abs(capacitor.narrow.ex-expectedCenter)/expectedCenter<0.003);
assert.ok(Math.abs(capacitor.narrow.ey)<1e-9);
assert.ok(capacitor.wide.mag<capacitor.narrow.mag);
await page.locator('#gapSlider').fill('2.4');
await page.locator('#gapSlider').dispatchEvent('input');
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().gap),2.4);
assert.equal(await page.locator('#plateControls').isVisible(),true);
await page.locator('#motionModeBtn').click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'motion');
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().gap),2.4);
assert.equal(await page.locator('#motionControls').isVisible(),true);
assert.match(await page.locator('#sourceStrengthLabel').innerText(),/Flächenladungsdichte/);
assert.match(await page.locator('#sourceStrengthOut').innerText(),/nC\/m²/);
await page.evaluate(()=>__electricFieldLab.placeTestCharge(0,0));
assert.equal(await page.locator('#motionBtn').isEnabled(),true);

// Positive and negative probes accelerate in opposite directions; larger mass reduces acceleration.
const motion=await page.evaluate(()=>{
  function run(q,m){
    __electricFieldLab.setPreset('single');
    __electricFieldLab.placeTestCharge(.8,0);
    __electricFieldLab.setMotionParameters({sourceStrength:1,testChargeValue:q,testMass:m});
    return __electricFieldLab.stepTestCharge(.08);
  }
  return {positive:run(1,1),negative:run(-1,1),light:run(1,.5),heavy:run(1,2)};
});
assert.ok(motion.positive.vx>0);
assert.ok(motion.negative.vx<0);
assert.ok(Math.abs(motion.light.vx)>Math.abs(motion.heavy.vx));

// Old deep links land directly in the corresponding tab.
await page.goto(`${base}/probeladung-elektrisches-feld/`);
await page.waitForURL(/elektrische-felder\/#probeladung$/);
if(await page.getByRole('button',{name:'Untersuchung starten'}).isVisible()) await page.getByRole('button',{name:'Untersuchung starten'}).click();
assert.equal(await page.evaluate(()=>__electricFieldLab.getState().mode),'motion');

for(const viewport of [{width:1440,height:900},{width:1024,height:768},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`/tmp/elektrische-felder-unified-${viewport.width}.png`,fullPage:true});
}

assert.deepEqual(errors,[]);
console.log('electric app unified OK: three modes, SI field model, shared capacitor controls, redirect, 3 viewports');
await browser.close();
