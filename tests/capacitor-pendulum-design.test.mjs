import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,webkit}=createRequire(import.meta.url)('playwright');
const base=process.env.CAP_PENDULUM_URL||'http://127.0.0.1:8879';
for(const [name,engine] of Object.entries({chromium,webkit})){
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[1024,768],[820,1180],[600,900],[720,450],[390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:true}),errors=[],failed=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push(r.url()));
   page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());});
   await page.addInitScript(()=>{
    window.plateLabels={};const orig=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(t,x,y){if(/^(positive|negative) Platte$/.test(t))window.plateLabels[t]={x,y,width:this.measureText(t).width,canvas:this.canvas.clientWidth};return orig.apply(this,arguments);};
   });
   await page.goto(base+'/');await page.locator('a.card[href="kondensator-pendel/"]').click();
   await page.screenshot({path:`/tmp/cap-design-${name}-${width}-intro.png`,fullPage:true});
   await page.getByRole('button',{name:'Untersuchung starten'}).click();
   assert.equal(await page.locator('#playBtn').evaluate(e=>e===document.activeElement),true);
   await page.locator('#playBtn').click();assert.equal(await page.evaluate(()=>__capacitorPendulum.getState().playing),false);
   await page.locator('#resetBtn').click();
   const layout=async()=>{
    const r=await page.evaluate(()=>{
     const rect=e=>e.getBoundingClientRect(),visible=e=>e.getClientRects().length,ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
     return {overflow:document.documentElement.scrollWidth>innerWidth,small:[...document.querySelectorAll('button,select,input,summary,.home')].filter(visible).filter(e=>rect(e).width<48||rect(e).height<48).map(e=>e.id||e.className),duplicates:ids.filter((id,i)=>ids.indexOf(id)!==i),cols:getComputedStyle(document.querySelector('.layout')).gridTemplateColumns.split(' ').length,cards:document.querySelector('.layout').children.length};
    });
    assert.equal(r.overflow,false,JSON.stringify({name,width,r}));assert.deepEqual(r.small,[]);assert.deepEqual(r.duplicates,[]);assert.equal(r.cols,width>=820?2:1);assert.equal(r.cards,2);
    for(const l of Object.values(await page.evaluate(()=>window.plateLabels)))assert.ok(l.x-l.width/2>=0&&l.x+l.width/2<=l.canvas,JSON.stringify(l));
   };
   await layout();await page.screenshot({path:`/tmp/cap-design-${name}-${width}-ready.png`,fullPage:true});
   await page.locator('#speedSelect').selectOption('2');await page.locator('#stepBtn').click();
   assert.equal(await page.locator('#stepBtn').isDisabled(),true);
   await page.waitForFunction(()=>__capacitorPendulum.getState().step===1&&!__capacitorPendulum.getState().playing);
   assert.equal(await page.locator('#transferRead').textContent(),'1 / 20');
   await page.locator('#playBtn').click();assert.equal(await page.evaluate(()=>__capacitorPendulum.getState().playing),true);await page.locator('#playBtn').click();
   for(const n of ['10','20','40']){
    await page.locator('#packetSelect').selectOption(n);assert.equal(await page.evaluate(()=>__capacitorPendulum.getState().step),0);
    const values=await page.evaluate(()=>{const m=__capacitorPendulum;return Array.from({length:m.getState().N+1},(_,k)=>m.sampleAtStep(k));});
    for(const s of values){const fraction=s.k/Number(n);assert.ok(Math.abs(s.U-400*(1-fraction))<1e-8);assert.ok(Math.abs(s.stored-20e-6*(1-fraction)**2)<1e-15);assert.ok(Math.abs(s.stored+s.released-20e-6)<1e-15);}
    const end=await page.evaluate(()=>__capacitorPendulum.advanceTransfers(100));assert.ok(Math.abs(end.U)<1e-8);assert.equal(await page.evaluate(()=>__capacitorPendulum.getState().playing),false);assert.ok(Math.abs(end.rectSum-20e-6*(1+1/Number(n)))<1e-15);assert.equal(await page.locator('#stepBtn').isDisabled(),true);
    await layout();
   }
   await page.screenshot({path:`/tmp/cap-design-${name}-${width}-finished.png`,fullPage:true});
   await page.locator('#playBtn').click();assert.equal(await page.evaluate(()=>__capacitorPendulum.getState().step),0);await page.locator('#playBtn').click();
   await page.locator('summary').click();
   for(const [u,c] of [['1000','5'],['50','0.05']]){
    await page.locator('#uInput').fill(u);await page.locator('#uInput').press('Tab');await page.locator('#cInput').fill(c);await page.locator('#cInput').press('Tab');
    const s=await page.evaluate(()=>__capacitorPendulum.getState());assert.equal(s.U0,Number(u));assert.equal(s.CnF,Number(c));assert.ok(Math.abs(s.E0-.5*Number(c)*1e-9*Number(u)**2)<1e-15);await layout();
   }
   await page.locator('#resetBtn').click();await page.locator('#speedSelect').selectOption('0.5');assert.equal(await page.locator('#speedSelect').inputValue(),'0.5');
   await page.locator('#packetSelect').focus();assert.equal(await page.locator('#packetSelect').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
   await page.screenshot({path:`/tmp/cap-design-${name}-${width}-parameters.png`,fullPage:true});
   await page.addStyleTag({content:'body{font-size:32px}.heading p,.readout small,.model-badge,.motion-note,.packet-info,.field label,.diagram .lead,.graph-legend,.energy-box small,.observation{font-size:28px}.readout strong,.energy-box strong,.formula,.diagram h2{font-size:36px}.model-content{font-size:32px}'});await layout();
   await page.screenshot({path:`/tmp/cap-design-${name}-${width}-text.png`,fullPage:true});
   await page.locator('.home').click();assert.ok(page.url().endsWith('/index.html'));
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);await page.close();
  }
  console.log(`${name}: six viewports, controls, single step, discharge, analytical energy references, parameters, text zoom and navigation passed`);
 }finally{await browser.close();}
}
