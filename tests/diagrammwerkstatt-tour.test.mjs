import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const output='/tmp/diagrammwerkstatt-tour-qa';await mkdir(output,{recursive:true});
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{for(const [width,height] of [[1440,900],[1024,768],[820,1180],[390,844],[720,450]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8881/diagrammwerkstatt/');
  assert(await page.locator('#tour-welcome').isVisible());
  await page.locator('#tour-welcome-skip').click();await page.reload();assert(!(await page.locator('#tour-welcome').isVisible()));
  await page.locator('#example').click();await page.waitForTimeout(400);
  const before=await page.evaluate(()=>localStorage.getItem('physik-diagrammwerkstatt-diagram-v1'));
  await page.locator('#data-toggle').click();
  await page.locator('#help-tour').click();await page.locator('#tour-start').click();
  for(let step=1;step<=10;step++){
   await page.waitForTimeout(70);assert.equal(await page.locator('#tour-card').getAttribute('data-step'),String(step));
   const geometry=await page.evaluate(()=>{
    const c=document.querySelector('#tour-card'),s=document.querySelector('.tour-spotlight'),r=s.getBoundingClientRect(),b=c.getBoundingClientRect();
    const buttons=[...c.querySelectorAll('button')].map(e=>{const q=e.getBoundingClientRect();return q.width>=48&&q.height>=48&&q.top>=b.top&&q.bottom<=innerHeight;});
    return {shown:!s.hidden,height:r.height,width:r.width,noOverlap:r.bottom<=b.top,buttons,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   assert(geometry.shown&&geometry.height>15&&geometry.width>15&&geometry.noOverlap,JSON.stringify({name,width,step,geometry}));assert(geometry.buttons.every(Boolean),JSON.stringify({name,width,step,geometry}));assert(!geometry.overflow);
   if([1,5,7,10].includes(step))await page.screenshot({path:`${output}/${name}-${width}-step${step}.png`});
   if(step===2){await page.locator('#tour-back').click();assert.equal(await page.locator('#tour-card').getAttribute('data-step'),'1');await page.locator('#tour-next').click();}
   await page.locator('#tour-next').click();
  }
  assert(!(await page.locator('#tour-card').isVisible()));assert(await page.locator('#input-area').isHidden());
  assert.equal(await page.locator('details[open]').count(),0);
  assert.equal(await page.evaluate(()=>localStorage.getItem('physik-diagrammwerkstatt-diagram-v1')),before);
  await page.locator('#help-tour').click();await page.locator('#tour-start').click();await page.keyboard.press('Escape');assert(await page.locator('#tour-card').isHidden());
  await page.locator('#help-tour').click();await page.locator('#tour-start').click();await page.locator('#tour-skip').click();assert(await page.locator('#tour-card').isHidden());
  assert.deepEqual(errors,[]);console.log(`${name} ${width}×${height}: Tour, Highlight, Navigation, Abbruch, Persistenz und Datenerhalt bestanden`);await context.close();
 }}finally{await browser.close();}
}
